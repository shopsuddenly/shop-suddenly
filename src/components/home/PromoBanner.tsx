import Link from "next/link";
import Image from "next/image";

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
    <section className="section-padding">
      <div className="luxury-container">
        <div className={`grid lg:grid-cols-2 gap-8 lg:gap-0 ${reverse ? "lg:flex-row-reverse" : ""}`}>
          {/* Image */}
          <div className={`relative aspect-[4/5] lg:aspect-auto overflow-hidden ${reverse ? "lg:order-2" : ""}`}>
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>

          {/* Content */}
          <div className={`flex items-center ${reverse ? "lg:order-1 lg:pr-16" : "lg:pl-16"}`}>
            <div className="max-w-lg">
              {subtitle && (
                <p className="font-sans text-xs uppercase tracking-luxury text-primary mb-6">
                  {subtitle}
                </p>
              )}
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-[0.95] mb-8">
                {title}
              </h2>
              <Link href={link} className="btn-luxury-outline inline-block">
                {cta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
