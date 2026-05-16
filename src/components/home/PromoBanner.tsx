import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface PromoBannerProps {
  title: string;
  subtitle?: string;
  cta: string;
  link: string;
  image: string;
  reverse?: boolean;
}

export function PromoBanner({
  title,
  subtitle,
  cta,
  link,
  image,
  reverse = false,
}: PromoBannerProps) {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <div
          className={`grid lg:grid-cols-2 gap-0 overflow-hidden rounded-[2.5rem] bg-secondary/40 border border-border shadow-soft-lg ${reverse ? "lg:flex-row-reverse" : ""}`}
        >
          {/* Image */}
          <div
            className={`relative aspect-[4/5] lg:aspect-auto min-h-[360px] overflow-hidden ${reverse ? "lg:order-2" : ""}`}
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
            />
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent" />
          </div>

          {/* Content */}
          <div
            className={`flex items-center p-10 md:p-16 ${reverse ? "lg:order-1" : ""}`}
          >
            <div className="max-w-lg">
              {subtitle && (
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-6 block">
                  {subtitle}
                </span>
              )}
              <h2 className="text-display-sm md:text-display-md tracking-tighter leading-[1.1] mb-8 font-bold">
                {title}
              </h2>
              <Link
                href={link}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-soft"
              >
                {cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
