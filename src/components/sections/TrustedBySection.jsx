import React from "react";
import StripeLogo from "@/assets/logos/stripe.svg";
import WiseLogo from "@/assets/logos/wise.svg";
import MercuryLogo from "@/assets/logos/mercury.svg";
import AwsLogo from "@/assets/logos/aws.svg";
import DeelLogo from "@/assets/logos/deel.svg";
import RevolutLogo from "@/assets/logos/revolut.svg";
import XeroLogo from "@/assets/logos/xero.svg";
import SlackLogo from "@/assets/logos/slack.svg";

const partners = [
  { name: "Stripe", logo: StripeLogo },
  { name: "Wise", logo: WiseLogo },
  { name: "Mercury", logo: MercuryLogo },
  { name: "AWS", logo: AwsLogo },
  { name: "Deel", logo: DeelLogo },
  { name: "Revolut", logo: RevolutLogo },
  { name: "Xero", logo: XeroLogo },
  { name: "Slack", logo: SlackLogo },
];

export default function TrustedBySection() {
  return (
    <section className="w-full py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h4 className="text-center text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-10">
          Integrated with the tools you love and trust
        </h4>
        <div
          className="w-full overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          <div className="flex w-[200%] animate-scroll-left">
            {/* Orijinal logo listesi */}
            <ul className="flex items-center w-1/2 [&_li]:mx-9">
              {partners.map((partner) => (
                <li key={partner.name}>
                  <img
                    src={partner.logo}
                    alt={`${partner.name} Logo`}
                    className="h-8 sm:h-10 lg:h-12 w-auto grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-110"
                  />
                </li>
              ))}
            </ul>

            {/* Klonlanmış logo listesi */}
            <ul
              className="flex items-center w-1/2 [&_li]:mx-6"
              aria-hidden="true"
            >
              {partners.map((partner) => (
                <li key={partner.name + "-clone"}>
                  <img
                    src={partner.logo}
                    alt={`${partner.name} Logo`}
                    className="h-8 sm:h-10 lg:h-12 w-auto grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100 hover:scale-110"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
