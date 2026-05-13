import Foundation
import Capacitor
import StoreKit

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier   = "StoreKitPlugin"
    public let jsName       = "StoreKitPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        .init(#selector(getProducts)),
        .init(#selector(purchaseProduct)),
        .init(#selector(restorePurchases)),
        .init(#selector(getSubscriptionStatus)),
    ]

    // MARK: — getProducts

    @objc func getProducts(_ call: CAPPluginCall) {
        guard let rawArray = call.options["productIds"] as? [Any] else {
            CAPPluginCallReject(call, "productIds array required")
            return
        }
        let rawIds = rawArray.compactMap { $0 as? String }
        guard !rawIds.isEmpty else {
            CAPPluginCallReject(call, "productIds array required")
            return
        }
        Task {
            do {
                let products = try await Product.products(for: Set(rawIds))
                var result: [[String: Any]] = []
                for p in products {
                    var entry: [String: Any] = [
                        "id":           p.id,
                        "displayName":  p.displayName,
                        "description":  p.description,
                        "displayPrice": p.displayPrice,
                        "price":        "\(p.price)",
                        "type":         p.type == .autoRenewable ? "autoRenewable" : "nonRenewable",
                    ]
                    if let sub = p.subscription {
                        entry["subscriptionPeriodValue"] = sub.subscriptionPeriod.value
                        entry["subscriptionPeriodUnit"]  = "\(sub.subscriptionPeriod.unit)"
                    }
                    result.append(entry)
                }
                let snapshot = result
                DispatchQueue.main.async { call.resolve(["products": snapshot]) }
            } catch {
                let msg = "Failed to load products: \(error.localizedDescription)"
                DispatchQueue.main.async { CAPPluginCallReject(call, msg) }
            }
        }
    }

    // MARK: — purchaseProduct

    @objc func purchaseProduct(_ call: CAPPluginCall) {
        guard let productId = call.options["productId"] as? String else {
            CAPPluginCallReject(call, "productId required")
            return
        }
        let appAccountTokenString = call.options["appAccountToken"] as? String

        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    DispatchQueue.main.async { CAPPluginCallReject(call, "Product not found: \(productId)") }
                    return
                }

                var opts: Set<Product.PurchaseOption> = []
                if let tokenStr = appAccountTokenString,
                   let uuid = UUID(uuidString: tokenStr) {
                    opts.insert(.appAccountToken(uuid))
                }

                let purchaseResult = try await product.purchase(options: opts)

                switch purchaseResult {
                case .success(let verification):
                    switch verification {
                    case .verified(let transaction):
                        await transaction.finish()
                        var payload: [String: Any] = [
                            "status":                "purchased",
                            "transactionId":         "\(transaction.id)",
                            "originalTransactionId": "\(transaction.originalID)",
                            "productId":             transaction.productID,
                            "purchaseDate":          ISO8601DateFormatter().string(from: transaction.purchaseDate),
                            "jwsRepresentation":     verification.jwsRepresentation,
                        ]
                        if let exp = transaction.expirationDate {
                            payload["expirationDate"] = ISO8601DateFormatter().string(from: exp)
                        }
                        DispatchQueue.main.async { call.resolve(payload) }
                    case .unverified(_, let err):
                        let msg = "Transaction verification failed: \(err.localizedDescription)"
                        DispatchQueue.main.async { CAPPluginCallReject(call, msg) }
                    }
                case .userCancelled:
                    DispatchQueue.main.async { CAPPluginCallReject(call, "USER_CANCELLED") }
                case .pending:
                    DispatchQueue.main.async { call.resolve(["status": "pending"]) }
                @unknown default:
                    DispatchQueue.main.async { CAPPluginCallReject(call, "Unknown purchase result") }
                }
            } catch {
                let msg = "Purchase failed: \(error.localizedDescription)"
                DispatchQueue.main.async { CAPPluginCallReject(call, msg) }
            }
        }
    }

    // MARK: — restorePurchases

    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            var restored: [[String: Any]] = []
            for await result in Transaction.currentEntitlements {
                if case .verified(let tx) = result, tx.revocationDate == nil {
                    var entry: [String: Any] = [
                        "transactionId":         "\(tx.id)",
                        "originalTransactionId": "\(tx.originalID)",
                        "productId":             tx.productID,
                        "purchaseDate":          ISO8601DateFormatter().string(from: tx.purchaseDate),
                        "status":                "restored",
                    ]
                    if let exp = tx.expirationDate {
                        entry["expirationDate"] = ISO8601DateFormatter().string(from: exp)
                    }
                    restored.append(entry)
                }
            }
            let snapshot = restored
            DispatchQueue.main.async { call.resolve(["transactions": snapshot]) }
        }
    }

    // MARK: — getSubscriptionStatus

    @objc func getSubscriptionStatus(_ call: CAPPluginCall) {
        guard let productId = call.options["productId"] as? String else {
            CAPPluginCallReject(call, "productId required")
            return
        }
        Task {
            var found         = false
            var expiration: String? = nil
            for await result in Transaction.currentEntitlements {
                if case .verified(let tx) = result,
                   tx.productID == productId,
                   tx.revocationDate == nil {
                    found      = true
                    expiration = tx.expirationDate.map { ISO8601DateFormatter().string(from: $0) }
                }
            }
            let isActive  = found
            let expiresAt = expiration
            DispatchQueue.main.async {
                var payload: [String: Any] = ["isActive": isActive]
                if let exp = expiresAt { payload["expirationDate"] = exp }
                call.resolve(payload)
            }
        }
    }
}
