import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Counter({ to, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView && ref.current) {
      const element = ref.current;
      const controls = animate(0, to, {
        duration: 2.5,
        ease: "circOut",
        onUpdate(value) {
          element.textContent = String(Math.round(value));
        },
        onComplete() {
          element.textContent += suffix;
        },
      });
      return () => controls.stop();
    }
  }, [isInView, to, suffix]);

  return <span ref={ref}>0</span>;
}

const stats = [
  { value: 2900, suffix: "+", label: "Companies formed" },
  { value: 150, suffix: "+", label: "Countries Served" },
  { value: 98, suffix: "%", label: "Success Rate" },
  { value: 24, suffix: "/7", label: "Support Available" },
];

const testimonials = [
  {
    quote:
      "The entire process was shockingly simple. I had my UK company and bank account ready in less than a week, all from my home in Nigeria. A true game-changer!",
    author: "Adewale Adebayo",
    location: "Lagos, Nigeria",
  },
  {
    quote:
      "As a freelancer, getting access to Stripe was my biggest challenge. This service made it possible. Their support team is fantastic.",
    author: "Fatima Khan",
    location: "Karachi, Pakistan",
  },
  {
    quote:
      "I was quoted thousands by local consultants. This platform offered a clear, affordable path. Highly recommended for any international entrepreneur.",
    author: "Marco Rossi",
    location: "Milan, Italy",
  },
  {
    quote:
      "From start to finish, the experience was seamless. The team's expertise and dedication to our success was evident in every interaction.",
    author: "Lisa Park",
    location: "Sydney, Australia",
  },
  {
    quote:
      "Exceptional results and outstanding customer service. They went above and beyond to ensure our project was a complete success.",
    author: "James Wilson",
    location: "Berlin, Germany",
  },
];

export default function SocialProofSection() {
  const carouselRef = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(
        carouselRef.current.scrollWidth - carouselRef.current.offsetWidth
      );
    }
  }, []);

  return (
    <section className="w-full py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <h3 className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                <Counter to={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="text-lg text-muted-foreground mt-1 font-sans">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Trusted by <span className="text-gradient">Founders</span> Worldwide
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-muted-foreground mt-4 font-sans">
            Hear what our clients have to say about their experience.
          </p>
        </div>

        {/* --- YENİ YATAY KAYDIRMALI KARUSEL YAPISI --- */}
        <motion.div
          ref={carouselRef}
          className="cursor-grab overflow-hidden"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div
            drag="x" // Yatayda sürüklemeyi etkinleştir
            dragConstraints={{ right: 0, left: -width }} // Sürükleme sınırlarını ayarla
            className="flex gap-6 pb-4" // Kartlar arasında boşluk bırak
          >
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.author}
                className="min-w-[80%] md:min-w-[40%] lg:min-w-[30%]" // Kartların genişliğini ayarla
              >
                <Card className="h-full bg-muted/50 flex flex-col">
                  {/* CardContent artık flex-1'e ihtiyaç duymuyor çünkü kartın yüksekliği içeriğe göre belirleniyor */}
                  <CardContent className="pt-8">
                    <blockquote className="italic font-sans text-base leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                  </CardContent>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {testimonial.author}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-sans">
                      {testimonial.location}
                    </p>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
