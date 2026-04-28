import Foundation
import WebKit

// vUnified-20260428-final-ship-lock-v284 — GPS fallback fix; CORS deployed to Vercel.
// Start Free button calls onComplete("free") identically to Pro/Business.
// Parent NativeApp handler writes all flags + window.location.replace("/chat/") after gesture resolves.
// No bridge navigation, no evaluateJavaScript nav, no gesture-unwind race, no SIGKILL 9.

// vUnified-20260414-national-expansion-v235 — public required for ObjC-bridged protocol.
public class RegPulseMessageHandler: NSObject, WKScriptMessageHandler {

    public func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "regpulse",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }
        NSLog("[v284][RegPulse] bridge '\(action)' — no-op (onComplete path handles navigation)")
    }
}
