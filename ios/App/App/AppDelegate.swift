import UIKit
import Capacitor
import WebKit

// vUnified-20260428-final-ship-lock-v284 — GPS fallback fix; CORS deployed to Vercel.
// Root cause of SIGKILL 9 confirmed: UILongPressGestureRecognizer fired during WKWebView gesture unwind,
// tearing down the web content process. Fix: gesture removed entirely.
// Navigation path: React onPointerDown/onClick/onTouchEnd → bridge postMessage({action:"navigate"})
// → RegPulseMessageHandler calls evaluateJavaScript(window.location.replace) on the WKWebView.
// This fires from the WKScriptMessage callback — clean JS event loop, no gesture unwind race.

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate, WKNavigationDelegate {

    var window: UIWindow?

    private var regPulseHandler: RegPulseMessageHandler?
    private var bridgeSetupComplete = false
    private weak var originalNavigationDelegate: WKNavigationDelegate?
    private weak var bridgedWebView: WKWebView?

    // MARK: — Application lifecycle

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        AppDelegate.swizzleCapVCSystemGestures()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) {
            self.setupRegPulseBridge()
        }
        return true
    }

    // MARK: — Bridge setup

    private func setupRegPulseBridge() {
        guard !bridgeSetupComplete else { return }

        guard let rootVC = window?.rootViewController,
              let capVC = findCAPBridgeViewController(from: rootVC),
              let webView = capVC.webView else {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                self.setupRegPulseBridge()
            }
            return
        }

        bridgedWebView = webView

        let handler = RegPulseMessageHandler()
        regPulseHandler = handler
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "regpulse")
        webView.configuration.userContentController.add(handler, name: "regpulse")

        originalNavigationDelegate = webView.navigationDelegate
        webView.navigationDelegate = self

        webView.allowsBackForwardNavigationGestures = false
        webView.scrollView.bounces = false
        webView.scrollView.alwaysBounceVertical = false
        // vUnified-20260428-final-ship-lock: .never prevents WKWebView from automatically
        // adding a top content inset equal to the status-bar height. The CSS layer controls
        // safe areas via env(safe-area-inset-*) exclusively — no native duplication.
        webView.scrollView.contentInsetAdjustmentBehavior = .never

        bridgeSetupComplete = true
        NSLog("[v284][RegPulse] Bridge setup complete — WKScriptMessageHandler registered (no native gesture)")

        capVC.setNeedsUpdateOfHomeIndicatorAutoHidden()
    }

    private func findCAPBridgeViewController(from vc: UIViewController) -> CAPBridgeViewController? {
        if let cap = vc as? CAPBridgeViewController { return cap }
        for child in vc.children {
            if let found = findCAPBridgeViewController(from: child) { return found }
        }
        if let presented = vc.presentedViewController {
            return findCAPBridgeViewController(from: presented)
        }
        return nil
    }

    // MARK: — WKNavigationDelegate (forwards to Capacitor's delegate chain)

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        originalNavigationDelegate?.webView?(webView, didFinish: navigation)
    }

    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        originalNavigationDelegate?.webView?(webView, didStartProvisionalNavigation: navigation)
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        let url = webView.url?.absoluteString ?? "nil"
        NSLog("[v284][RegPulse] didFail — url='\(url)' error='\(error)'")
        originalNavigationDelegate?.webView?(webView, didFail: navigation, withError: error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        let url = webView.url?.absoluteString ?? "nil"
        NSLog("[v284][RegPulse] didFailProvisionalNavigation — url='\(url)' error='\(error)'")
        originalNavigationDelegate?.webView?(webView, didFailProvisionalNavigation: navigation, withError: error)
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        if let original = originalNavigationDelegate {
            original.webView?(webView, decidePolicyFor: navigationAction, decisionHandler: decisionHandler)
                ?? decisionHandler(.allow)
        } else {
            decisionHandler(.allow)
        }
    }

    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationResponse: WKNavigationResponse,
        decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void
    ) {
        if let original = originalNavigationDelegate {
            original.webView?(webView, decidePolicyFor: navigationResponse, decisionHandler: decisionHandler)
                ?? decisionHandler(.allow)
        } else {
            decisionHandler(.allow)
        }
    }

    func webView(
        _ webView: WKWebView,
        didReceive challenge: URLAuthenticationChallenge,
        completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void
    ) {
        if let original = originalNavigationDelegate {
            original.webView?(webView, didReceive: challenge, completionHandler: completionHandler)
                ?? completionHandler(.performDefaultHandling, nil)
        } else {
            completionHandler(.performDefaultHandling, nil)
        }
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        originalNavigationDelegate?.webViewWebContentProcessDidTerminate?(webView)
    }

    // MARK: — System gesture deferral (retained — prevents Control Center interference)

    private static var _swizzleDone = false

    static func swizzleCapVCSystemGestures() {
        guard !_swizzleDone else { return }
        _swizzleDone = true

        let cls: AnyClass = CAPBridgeViewController.self

        if let orig = class_getInstanceMethod(cls, #selector(getter: UIViewController.prefersHomeIndicatorAutoHidden)),
           let swiz = class_getInstanceMethod(cls, #selector(CAPBridgeViewController.rp_prefersHomeIndicatorAutoHidden)) {
            method_exchangeImplementations(orig, swiz)
        }

        if let orig = class_getInstanceMethod(cls, #selector(getter: UIViewController.preferredScreenEdgesDeferringSystemGestures)),
           let swiz = class_getInstanceMethod(cls, #selector(CAPBridgeViewController.rp_preferredScreenEdgesDeferringSystemGestures)) {
            method_exchangeImplementations(orig, swiz)
        }
    }

    // MARK: — Standard Capacitor AppDelegate methods

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(
        _ app: UIApplication,
        open url: URL,
        options: [UIApplication.OpenURLOptionsKey: Any] = [:]
    ) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    // vUnified-20260414-national-expansion-v94 — Universal Links.
    func application(
        _ application: UIApplication,
        continue userActivity: NSUserActivity,
        restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
    ) -> Bool {
        guard let url = userActivity.webpageURL else { return false }
        return ApplicationDelegateProxy.shared.application(application, open: url, options: [:])
    }
}

// vUnified-20260414-national-expansion-v269 — swizzle retained for system gesture deferral.
// Applies prefersHomeIndicatorAutoHidden + preferredScreenEdgesDeferringSystemGestures
// to CAPBridgeViewController so iOS never routes edge swipes to Control Center mid-session.
extension CAPBridgeViewController {
    @objc func rp_prefersHomeIndicatorAutoHidden() -> Bool { return true }
    @objc func rp_preferredScreenEdgesDeferringSystemGestures() -> UIRectEdge { return .all }
}
