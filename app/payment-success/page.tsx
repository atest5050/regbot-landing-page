'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Download, AlertTriangle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFormTemplate } from '@/lib/formTemplates';
import { generateFormPdf } from '@/lib/generateFormPdf';

interface StoredFormPayload {
  formId: string;
  formData: Record<string, string>;
  location: string;
}

type PageStatus = 'verifying' | 'downloading' | 'done' | 'error';

function PaymentSuccessContent() {
  const params = useSearchParams();
  const formKey = params.get('form_key');
  const sessionId = params.get('session_id');

  const [status, setStatus] = useState<PageStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');
  const [payload, setPayload] = useState<StoredFormPayload | null>(null);

  useEffect(() => {
    if (!formKey || !sessionId) {
      setErrorMessage('Invalid payment link. Please return to RegBot and try again.');
      setStatus('error');
      return;
    }

    const run = async () => {
      // 1 — Verify the Stripe payment server-side
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const data = await res.json();
        if (!data.paid) {
          setErrorMessage('Payment could not be confirmed. Please contact support or try again.');
          setStatus('error');
          return;
        }
      } catch {
        setErrorMessage('Could not verify your payment. Please check your connection and try again.');
        setStatus('error');
        return;
      }

      // 2 — Load form data from localStorage
      const stored = localStorage.getItem(`regbot_form_${formKey}`);
      if (!stored) {
        setErrorMessage(
          'Your form data could not be found. This can happen if you used a different browser or device. Please return to RegBot and complete the form again — your payment has been recorded.',
        );
        setStatus('error');
        return;
      }

      let parsed: StoredFormPayload;
      try {
        parsed = JSON.parse(stored);
      } catch {
        setErrorMessage('Form data was corrupted. Please return to RegBot and try again.');
        setStatus('error');
        return;
      }

      const template = getFormTemplate(parsed.formId);
      if (!template) {
        setErrorMessage('Form template not found. Please contact support.');
        setStatus('error');
        return;
      }

      setTemplateName(template.name);
      setSubmitUrl(template.submitUrl);
      setPayload(parsed);
      setStatus('downloading');

      // 3 — Generate and auto-download PDF
      try {
        await generateFormPdf(template, parsed.formData, parsed.location);
      } catch {
        // Download failed but we can still let them retry
      }

      // 4 — Clean up localStorage
      localStorage.removeItem(`regbot_form_${formKey}`);
      setStatus('done');
    };

    run();
  }, [formKey, sessionId]);

  const handleRetryDownload = async () => {
    if (!payload) return;
    const template = getFormTemplate(payload.formId);
    if (!template) return;
    await generateFormPdf(template, payload.formData, payload.location);
  };

  // ── Verifying ──────────────────────────────────────────────────────────────
  if (status === 'verifying' || status === 'downloading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full text-center shadow-sm">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="font-semibold text-slate-800 text-lg mb-1">
            {status === 'verifying' ? 'Verifying payment...' : 'Generating your PDF...'}
          </p>
          <p className="text-sm text-slate-500">
            {status === 'verifying'
              ? 'Confirming your payment with Stripe.'
              : 'Your completed form is being prepared for download.'}
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
        <div className="bg-white rounded-2xl border border-red-200 p-10 max-w-md w-full text-center shadow-sm">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="font-semibold text-slate-800 text-lg mb-2">Something went wrong</p>
          <p className="text-sm text-slate-600 mb-6">{errorMessage}</p>
          <Button variant="outline" onClick={() => (window.location.href = '/chat')}>
            Return to RegBot
          </Button>
        </div>
      </div>
    );
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full shadow-sm">
        <div className="text-center mb-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="font-semibold text-slate-900 text-xl mb-1">Payment confirmed</p>
          <p className="text-sm text-slate-500">
            Your completed <strong>{templateName}</strong> PDF has been downloaded to your device.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
          <p className="font-medium text-slate-700">What to do next:</p>
          <ol className="space-y-1.5 text-slate-600 list-decimal list-inside">
            <li>Open the downloaded PDF and review all your answers.</li>
            <li>Gather the required supporting documents listed in the PDF.</li>
            <li>Submit to the official government portal using the link below.</li>
            <li>Pay the government filing fee directly to the agency.</li>
          </ol>
        </div>

        <div className="flex flex-col gap-2">
          {submitUrl && (
            <Button asChild>
              <a href={submitUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Submit to Official Portal
              </a>
            </Button>
          )}
          <Button variant="outline" onClick={handleRetryDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF Again
          </Button>
          <Button variant="ghost" onClick={() => (window.location.href = '/chat')}>
            Return to RegBot
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
