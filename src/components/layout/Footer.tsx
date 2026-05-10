"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Twitter, Facebook, Youtube, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CMSService, DEFAULT_FOOTER_CONFIG } from "@/services/cms.service";
import { NewsletterService } from "@/services/newsletter.service";
import { FooterConfig } from "@/types/cms";
import { toast } from "sonner";

const SOCIAL_ICONS: Record<string, any> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
};

export function Footer() {
  const pathname = usePathname();
  const [config, setConfig] = React.useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchConfig = async () => {
      try {
        const homeConfig = await CMSService.getHomeConfig();
        if (homeConfig.footer) {
          setConfig(homeConfig.footer);
        }
      } catch (error) {
        console.error("Failed to load footer config:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await NewsletterService.subscribe(email, "footer");
      if (result.success) {
        toast.success(result.message);
        setEmail("");
      } else {
        toast.info(result.message);
      }
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-secondary/30 border-t border-border mt-auto">
      <div className="container py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand & Newsletter */}
          <div className="space-y-8 lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-display font-bold tracking-tighter uppercase">SUDDENLY</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              {config.brandColumn?.description || "Redefining minimalism through premium sustainable essentials. Designed for the modern life."}
            </p>
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                {config.newsletter.heading || "Join Us"}
              </p>
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <Input 
                    placeholder="Your email" 
                    className="bg-background h-12 rounded-xl border-border/50 focus:ring-primary" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                <Button type="submit" size="icon" className="h-12 w-12 rounded-xl shrink-0" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </div>

          {/* Dynamic Link Columns */}
          {config.linkColumns?.map((col) => (
            <div key={col.id}>
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-foreground">{col.title}</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                {col.links?.map((link, idx) => (
                  <li key={idx}>
                    <Link href={link.url} className="hover:text-primary transition-colors flex items-center group">
                      <span className="w-0 group-hover:w-2 h-px bg-primary mr-0 group-hover:mr-2 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social & Contact */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-[0.2em] mb-8 text-foreground">Follow Us</h4>
            <div className="flex space-x-3 mb-10">
              {config.brandColumn?.socials?.map((social, index) => {
                const Icon = SOCIAL_ICONS[social.platform.toLowerCase()] || Instagram;
                return (
                  <Button key={index} variant="ghost" size="icon" className="rounded-xl bg-background border border-border/50 shadow-sm hover:border-primary/50 hover:bg-secondary transition-all" asChild>
                    <a href={social.url} target="_blank" rel="noopener noreferrer">
                      <Icon className="w-4 h-4" />
                    </a>
                  </Button>
                );
              }) || (
                 <div className="text-xs text-muted-foreground">No socials configured</div>
              )}
            </div>
            
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/50">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Customer Support</p>
                <p className="text-sm font-medium">support@suddenly.com</p>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground font-medium">
            © {new Date().getFullYear()} SUDDENLY STORE. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center space-x-8">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary cursor-pointer transition-colors">English (IN)</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary cursor-pointer transition-colors">INR (₹)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
