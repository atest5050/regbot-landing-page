#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Declare the @objc dynamic selector that exists in the Capacitor binary.
// This translation unit can import Capacitor.h fully, so the category compiles.
@interface CAPPluginCall (StoreKitReject)
- (void)reject:(NSString *)message
              :(NSString * _Nullable)code
              :(NSError * _Nullable)error
              :(NSDictionary * _Nullable)data;
@end

// C helper callable from Swift — bridging header forward-declares this.
void CAPPluginCallReject(CAPPluginCall *call, NSString *message) {
    [call reject:message :nil :nil :nil];
}

CAP_PLUGIN(StoreKitPlugin, "StoreKitPlugin",
    CAP_PLUGIN_METHOD(getProducts,           CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(purchaseProduct,       CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(restorePurchases,      CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getSubscriptionStatus, CAPPluginReturnPromise);
)
