import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is this real legal advice?",
    a: "No — and we'll always tell you that upfront. RegBot gives you research, context, and actionable next steps, but always recommends verifying with your local government office or a licensed attorney for high-stakes decisions. We cite our sources so you can check everything yourself.",
  },
  {
    q: "How does RegBot know my local regulations?",
    a: "We combine AI with a regularly maintained database of city, county, and state regulations across the US. Every answer shows you the source — specific laws, ordinances, and official program pages — so you can verify directly.",
  },
  {
    q: "What kinds of businesses does RegBot support?",
    a: "Home-based businesses, cottage food and food trucks, Etsy and handmade sellers, freelancers and consultants, retail, and service businesses. Coverage is expanding weekly.",
  },
  {
    q: "Can I use RegBot on my phone?",
    a: "Yes. RegBot is fully mobile-optimized. Use it in line at the permit office, on a job site, or anywhere the compliance questions come up.",
  },
  {
    q: "What if my city isn't covered yet?",
    a: "Enter your location and RegBot will give you state-level guidance and flag what needs local verification. We add new jurisdictions every week — and you can request yours.",
  },
  {
    q: "How is this different from just asking ChatGPT?",
    a: "RegBot is purpose-built for compliance: it knows which questions to ask, understands jurisdictional differences, links to primary sources, and is explicitly designed not to hallucinate legal advice. ChatGPT is general — RegBot is specialized.",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Questions? Answered.
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Everything you need to know before you start.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map(({ q, a }, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-base">{q}</AccordionTrigger>
              <AccordionContent>{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
