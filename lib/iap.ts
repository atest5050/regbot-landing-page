// lib/iap.ts — StoreKit 2 IAP wrapper for Capacitor iOS.
//
// On native iOS: delegates to StoreKitPlugin (Swift, StoreKit 2).
// On web:        all purchase methods throw; callers should gate on isIAPAvailable().
//
// Product IDs must be created in App Store Connect under the same bundle ID
// (com.regpulse.app) before they can be purchased.

import { registerPlugin } from '@capacitor/core';
import { isCapacitorNative } from '@/lib/notifications';

// ── Plugin interface ──────────────────────────────────────────────────────────

export interface IAPProduct {
  id:                      string;
  displayName:             string;
  description:             string;
  displayPrice:            string;
  price:                   string;
  type:                    'autoRenewable' | 'nonRenewable';
  subscriptionPeriodUnit?: string;
  subscriptionPeriodValue?: number;
}

export interface IAPPurchaseResult {
  status:                'purchased' | 'pending';
  transactionId:         string;
  originalTransactionId: string;
  productId:             string;
  purchaseDate:          string;
  expirationDate?:       string;
  jwsRepresentation:     string;
}

export interface IAPTransaction {
  transactionId:         string;
  originalTransactionId: string;
  productId:             string;
  purchaseDate:          string;
  expirationDate?:       string;
  status:                'restored';
}

interface StoreKitPluginInterface {
  getProducts(opts: { productIds: string[] }): Promise<{ products: IAPProduct[] }>;
  purchaseProduct(opts: { productId: string; appAccountToken?: string }): Promise<IAPPurchaseResult>;
  restorePurchases(): Promise<{ transactions: IAPTransaction[] }>;
  getSubscriptionStatus(opts: { productId: string }): Promise<{ isActive: boolean; expirationDate?: string }>;
}

const notAvailable = (name: string) => () => {
  throw new Error(`StoreKit.${name} is only available on native iOS`);
};

const StoreKitPlugin = registerPlugin<StoreKitPluginInterface>('StoreKitPlugin', {
  web: () => ({
    getProducts:           notAvailable('getProducts') as StoreKitPluginInterface['getProducts'],
    purchaseProduct:       notAvailable('purchaseProduct') as StoreKitPluginInterface['purchaseProduct'],
    restorePurchases:      notAvailable('restorePurchases') as StoreKitPluginInterface['restorePurchases'],
    getSubscriptionStatus: notAvailable('getSubscriptionStatus') as StoreKitPluginInterface['getSubscriptionStatus'],
  }),
});

// ── Constants ─────────────────────────────────────────────────────────────────

export const PRO_PRODUCT_ID = 'com.regpulse.app.pro_monthly';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// ── Public API ────────────────────────────────────────────────────────────────

/** True only on native iOS — the only platform where StoreKit is available. */
export function isIAPAvailable(): boolean {
  if (!isCapacitorNative()) return false;
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  const platform = cap?.getPlatform?.() ?? cap?.platform ?? '';
  return platform === 'ios' || !!(window as any).webkit?.messageHandlers;
}

/**
 * Fetches the current App Store price for the Pro subscription.
 * Returns null if the product is not found or IAP is unavailable.
 */
export async function getProProduct(): Promise<IAPProduct | null> {
  if (!isIAPAvailable()) return null;
  try {
    const { products } = await StoreKitPlugin.getProducts({ productIds: [PRO_PRODUCT_ID] });
    return products[0] ?? null;
  } catch {
    return null;
  }
}

/** Result of a purchase or restore attempt. */
export interface IAPResult {
  ok:             boolean;
  isPro?:         boolean;
  cancelled?:     boolean;
  pending?:       boolean;
  error?:         string;
}

/**
 * Initiates a StoreKit 2 purchase for the Pro subscription.
 * On success, sends the signed transaction to /api/iap/verify to update is_pro.
 *
 * @param userId      Supabase user UUID — used as appAccountToken to link purchase to account.
 * @param accessToken Supabase JWT for the /api/iap/verify call.
 */
export async function purchaseProSubscription(
  userId: string,
  accessToken: string,
): Promise<IAPResult> {
  if (!isIAPAvailable()) return { ok: false, error: 'IAP not available' };

  try {
    const result = await StoreKitPlugin.purchaseProduct({
      productId:       PRO_PRODUCT_ID,
      appAccountToken: userId,
    });

    if (result.status === 'pending') {
      return { ok: false, pending: true };
    }

    // Verify on server and update is_pro
    const verifyRes = await fetch(`${API_BASE}/api/iap/verify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body:    JSON.stringify({
        jwsRepresentation: result.jwsRepresentation,
        transactionId:     result.transactionId,
        productId:         result.productId,
      }),
    });

    const verifyData = await verifyRes.json() as { ok: boolean; isPro?: boolean; error?: string };
    if (!verifyData.ok) {
      return { ok: false, error: verifyData.error ?? 'Server verification failed' };
    }

    return { ok: true, isPro: verifyData.isPro === true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === 'USER_CANCELLED') return { ok: false, cancelled: true };
    return { ok: false, error: msg };
  }
}

/**
 * Restores any existing Pro subscription purchases.
 * Useful after reinstall or sign-in on a new device.
 */
export async function restoreProPurchases(accessToken: string): Promise<IAPResult> {
  if (!isIAPAvailable()) return { ok: false, error: 'IAP not available' };

  try {
    const { transactions } = await StoreKitPlugin.restorePurchases();
    const proTx = transactions.find(tx => tx.productId === PRO_PRODUCT_ID);
    if (!proTx) return { ok: true, isPro: false };

    const verifyRes = await fetch(`${API_BASE}/api/iap/verify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body:    JSON.stringify({
        transactionId: proTx.transactionId,
        productId:     proTx.productId,
      }),
    });

    const verifyData = await verifyRes.json() as { ok: boolean; isPro?: boolean };
    return { ok: verifyData.ok, isPro: verifyData.isPro === true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Checks the current subscription status directly from StoreKit
 * without a network call. Good for fast UI state on app resume.
 */
export async function checkLocalSubscriptionStatus(): Promise<boolean> {
  if (!isIAPAvailable()) return false;
  try {
    const { isActive } = await StoreKitPlugin.getSubscriptionStatus({ productId: PRO_PRODUCT_ID });
    return isActive;
  } catch {
    return false;
  }
}
