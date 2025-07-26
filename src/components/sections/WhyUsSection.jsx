import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import teamImage from "@/assets/images/team.jpg"; // Örnek görsel yolu

const features = [
  "Expert guidance since 2019",
  "Affordable, no hidden fees",
  "Fast, hassle-free setup",
];

export default function WhyUsSection() {
  return (
    <section id="why-us" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 gap-12 place-items-center">
        <div className="lg:order-2">
          <img
            src={teamImage}
            alt="Our Team"
            className="rounded-lg shadow-lg"
          />
        </div>
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold">
            Built from Experience, For{" "}
            <span className="text-primary">Global Ambition.</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            GoFormed was born from a clear mission: to dismantle the barriers
            for international entrepreneurs. We transformed our own struggles
            with complex bureaucracy into a streamlined, elegant platform.
          </p>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex justify-center lg:justify-start items-center gap-3"
              >
                <FaCheckCircle className="text-primary h-5 w-5" />
                <span className="text-lg">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
