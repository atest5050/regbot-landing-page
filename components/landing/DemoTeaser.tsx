// Changes summary:
// - Replaced Shield icons in the mock chat UI with RegPulseIcon.
// - Chat header icon: RegPulseIcon at 36px inside the frosted circle.
// - Bot message avatar: RegPulseIcon at 30px, dark navy ring replaces blue circle.
import { CheckSquare, Square, ExternalLink } from "lucide-react";
import { RegPulseIcon, RegPulseLogoFull } from "@/components/RegPulseLogo";

export default function DemoTeaser() {
  return (
    <section id="demo" className="py-20 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Just ask. RegPulse figures out the rest.
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Set your location once. Then chat like you&apos;re texting the one
            person in city hall who actually wants to help you.
          </p>
        </div>

        {/* Mock chat UI */}
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center gap-3 bg-[#0b1628] px-6 py-4 border-b border-cyan-900/30">
              <RegPulseLogoFull shieldSize={36} layout="beside" className="text-white" />
              <div className="ml-auto flex flex-col items-end gap-0.5">
                <p className="text-xs text-slate-400">Portland, OR · Home Food Business</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-cyan-400/80">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-slate-50 p-6 space-y-5">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-sm rounded-2xl rounded-tr-sm bg-blue-600 px-5 py-3.5 text-sm text-white shadow-sm">
                  Can I sell homemade jam at my front door in Portland, OR?
                </div>
              </div>

              {/* Bot message */}
              <div className="flex items-start gap-3">
                <RegPulseIcon size={30} className="shrink-0" />
                <div className="flex-1 rounded-2xl rounded-tl-sm bg-white border border-slate-200 px-5 py-4 shadow-sm space-y-4">
                  <p className="text-sm text-slate-800 leading-relaxed">
                    <span className="font-medium text-emerald-600">Yes — with a few conditions.</span>{" "}
                    Under Oregon&apos;s Cottage Food Law, you can sell jam and other
                    shelf-stable products directly to consumers without a commercial
                    kitchen license, as long as your gross annual sales stay under
                    the state limit.
                  </p>

                  {/* Checklist */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Your Checklist
                    </p>
                    {[
                      { done: true, text: 'Oregon Cottage Food Operator registration ($50/year via ODA)' },
                      { done: true, text: 'Labels with your name, address, and "Made in a Home Kitchen" statement' },
                      { done: false, text: 'City of Portland Home Occupation Permit (if operating from a residential address)' },
                    ].map(({ done, text }) => (
                      <div key={text} className="flex items-start gap-2.5">
                        {done ? (
                          <CheckSquare className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-300 mt-0.5 shrink-0" />
                        )}
                        <span className={`text-xs leading-relaxed ${done ? "text-slate-700" : "text-slate-500"}`}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Sources */}
                  <div className="flex flex-wrap gap-2">
                    {["Oregon ORS 616.695", "ODA Cottage Food Program", "Portland Zoning Code Title 33"].map(
                      (source) => (
                        <span
                          key={source}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {source}
                        </span>
                      )
                    )}
                  </div>

                  {/* Disclaimer */}
                  <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-3">
                    This is informational, not legal advice. Verify directly with
                    the Oregon Department of Agriculture before operating.
                  </p>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center gap-3">
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-400">
                Ask about your business regulations…
              </div>
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                →
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Mock demo — actual answers are sourced from official databases
          </p>
        </div>
      </div>
    </section>
  );
}
