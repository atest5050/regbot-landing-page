#import <Foundation/Foundation.h>

// Forward-declare only — no Capacitor.h import here to avoid ObjC overloads
// that conflict with Swift's getString/getArray resolution.
@class CAPPluginCall;

// C wrapper implemented in StoreKitPlugin.m (which CAN import Capacitor.h).
// Swift sees this as: CAPPluginCallReject(_ call: CAPPluginCall!, _ message: String!)
void CAPPluginCallReject(CAPPluginCall *call, NSString *message);
