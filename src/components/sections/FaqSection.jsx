// src/components/sections/FaqSection.jsx

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "Who is GoFormed for?",
    answer:
      "GoFormed is for non-UK residents who want to form a UK limited company. Our clients are typically e-commerce sellers, agency owners, consultants, coaches, and other online entrepreneurs from around the world.",
  },
  {
    question: "How long does it take to form my company?",
    answer:
      "Company registration with Companies House is typically completed within 24-48 hours. The entire process, including setting up your registered office address and digital mail service, is designed to be as fast as possible.",
  },
  {
    question: "Can I open a UK business bank account?",
    answer:
      "Yes. While we do not provide bank accounts directly, we provide guidance and introductions to several UK banking partners who offer accounts for non-resident directors. The final decision always rests with the bank.",
  },
  {
    question: "Do I need to visit the UK?",
    answer:
      "No, the entire process is 100% remote. You can start and manage your UK company from anywhere in the world without ever needing to visit the UK.",
  },
  {
    question: "What documents do I need to provide?",
    answer:
      "You will need to provide proof of identity (e.g., a valid passport) and proof of address (e.g., a recent utility bill or bank statement) for the company director(s) and shareholder(s).",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="w-full py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-muted-foreground mt-4 mb-12">
            Find answers to the most common questions about forming and managing
            your UK company.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="w-full max-w-3xl mx-auto"
        >
          {faqData.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
