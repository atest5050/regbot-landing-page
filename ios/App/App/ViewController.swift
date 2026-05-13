import Foundation
import WebKit
import AuthenticationServices

// vUnified-20260428-final-ship-lock-v285 — GPS fallback fix; CORS deployed to Vercel.
// Start Free button calls onComplete("free") identically to Pro/Business.
// Parent NativeApp handler writes all flags + window.location.replace("/chat/") after gesture resolves.
// No bridge navigation, no evaluateJavaScript nav, no gesture-unwind race, no SIGKILL 9.

// vUnified-20260414-national-expansion-v235 — public required for ObjC-bridged protocol.
// v286: Added oauthOpen action — uses ASWebAuthenticationSession instead of SFSafariViewController
// for OAuth flows. SFSafariViewController does not reliably call application(_:open:url:options:)
// for custom URL scheme redirects when the app is already in the foreground.
// ASWebAuthenticationSession is specifically designed for OAuth and properly handles the
// regpulse:// callback scheme, returning the full callback URL to the JS completion handler.
public class RegPulseMessageHandler: NSObject, WKScriptMessageHandler, ASWebAuthenticationPresentationContextProviding {

    private weak var appDelegate: AppDelegate?
    private var authSession: ASWebAuthenticationSession?

    init(appDelegate: AppDelegate) {
        self.appDelegate = appDelegate
        super.init()
    }

    public func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "regpulse",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }

        if action == "log", let message = body["message"] as? String {
            NSLog("[v286][JS] %@", message)
            return
        }

        if action == "oauthOpen", let urlString = body["url"] as? String, let url = URL(string: urlString) {
            NSLog("[v286][RegPulse] oauthOpen — starting ASWebAuthenticationSession for \(url.host ?? "?")")
            openOAuthSession(url: url, webView: message.webView)
            return
        }

        if action == "openUrl", let urlString = body["url"] as? String, let url = URL(string: urlString) {
            NSLog("[v286][RegPulse] openUrl — calling UIApplication.open for \(url.host ?? "?")")
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                UIApplication.shared.open(url, options: [:]) { success in
                    NSLog("[v286][RegPulse] openUrl — UIApplication.open result=\(success)")
                }
            }
            return
        }

        NSLog("[v285][RegPulse] bridge '\(action)' — no-op (onComplete path handles navigation)")
    }

    private func openOAuthSession(url: URL, webView: WKWebView?) {
        authSession = ASWebAuthenticationSession(url: url, callbackURLScheme: "regpulse") { [weak self, weak webView] callbackURL, error in
            DispatchQueue.main.async {
                if let callbackURL = callbackURL {
                    let urlStr = callbackURL.absoluteString
                        .replacingOccurrences(of: "\\", with: "\\\\")
                        .replacingOccurrences(of: "'", with: "\\'")
                    NSLog("[v286][RegPulse] ASWebAuthenticationSession callback: \(urlStr)")
                    NSLog("[v286][RegPulse] webView nil=\(webView == nil) — scheduling evaluateJS in 0.8s")
                    let capturedUrlStr = urlStr
                    let capturedWebView = webView
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                        let js = """
                        (function(){
                          if(typeof window.__rpOAuthCallback!=='function') return 'not_found';
                          var intent=null;
                          try { intent=sessionStorage.getItem('rp_oauth_intent_checkout'); } catch(e){}
                          window.__rpOAuthCallback('\(capturedUrlStr)');
                          return 'called|intent='+intent;
                        })()
                        """
                        capturedWebView?.evaluateJavaScript(js) { result, error in
                            NSLog("[v286][RegPulse] evaluateJS result=\(result ?? "nil" as Any) error=\(error?.localizedDescription ?? "none")")
                        }
                    }
                } else if let err = error as? ASWebAuthenticationSessionError, err.code == .canceledLogin {
                    NSLog("[v286][RegPulse] ASWebAuthenticationSession cancelled by user")
                    webView?.evaluateJavaScript(
                        "window.__rpOAuthCallback && window.__rpOAuthCallback(null, 'cancelled');",
                        completionHandler: nil
                    )
                } else {
                    NSLog("[v286][RegPulse] ASWebAuthenticationSession error: \(error?.localizedDescription ?? "unknown")")
                    webView?.evaluateJavaScript(
                        "window.__rpOAuthCallback && window.__rpOAuthCallback(null, 'error');",
                        completionHandler: nil
                    )
                }
            }
        }
        authSession?.presentationContextProvider = self
        authSession?.prefersEphemeralWebBrowserSession = true
        authSession?.start()
    }

    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return appDelegate?.window ?? UIWindow()
    }
}
