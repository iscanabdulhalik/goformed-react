import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CtaSection() {
  return (
    <section id="cta" className="bg-muted/50 py-16 my-24 sm:my-32">
      <div className="container text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Ready to Start Your Journey?
        </h2>
        <p className="text-xl text-muted-foreground mt-4 mb-8 max-w-3xl mx-auto">
          Stop letting borders limit your ambition. Join a new generation of
          global entrepreneurs and get the legal and financial tools you need to
          succeed.
        </p>
        <Button asChild size="lg">
          <Link to="/register">Start My Business</Link>
        </Button>
      </div>
    </section>
  );
}
