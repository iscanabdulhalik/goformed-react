import React from "react";
import businessmanImage from "@/assets/images/businessman.png";

export default function AboutSection() {
  return (
    <section id="about" className="w-full py-24 sm:py-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-muted/50 border rounded-lg py-12 px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center justify-items-center">
            <div className="space-y-6 text-center md:text-left max-w-lg">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Get to Know <br />
                <span className="text-primary">GoFormed</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                We are dedicated to helping entrepreneurs from all over the
                world to establish and grow their businesses in the UK.
              </p>
              <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-8 pt-4">
                <div className="text-center md:text-left">
                  <h3 className="text-4xl font-bold text-primary">2900+</h3>
                  <p className="text-muted-foreground">Companies formed</p>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-4xl font-bold text-primary">150+</h3>
                  <p className="text-muted-foreground">Countries served</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center md:justify-end w-full">
              <img
                src={businessmanImage}
                alt="About us - Professional businessman"
                className="w-full max-w-sm lg:max-w-md h-auto object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
