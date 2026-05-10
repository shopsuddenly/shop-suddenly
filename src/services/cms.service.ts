import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { HomeConfig, PageSection, FooterConfig, PageContent } from "@/types/cms";

const HOME_DOC_PATH = "content/home";

// Replicates the current Hardcoded Home Page exactly
export const DEFAULT_HOMEPAGE_SECTIONS: PageSection[] = [
    {
        id: 'hero-1',
        type: 'HERO',
        isEnabled: true,
        slides: [
            {
                id: 'slide-1',
                image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2000&q=80",
                title: "The Winter Edit",
                subtitle: "Discover the new collection",
                ctaText: "Shop Collection",
                ctaLink: "/shop"
            }
        ]
    },
    {
        id: 'brand-1',
        type: 'BRAND',
        isEnabled: true,
        heading: "Made for those who",
        subheading: "stand still yet stand out",
        description: "We believe in the power of simplicity. Our collections are designed for the modern individual who values quality over quantity, and timeless style over fleeting trends."
    },
    {
        id: 'categories-1',
        type: 'CATEGORY_STRIP',
        isEnabled: true
    },
    {
        id: 'slider-new',
        type: 'PRODUCT_SLIDER',
        isEnabled: true,
        title: "New Arrivals",
        subtitle: "Discover the latest additions to our collection",
        count: 6,
        filterType: "NEW_ARRIVALS"
    },
    {
        id: 'banner-winter',
        type: 'PROMO_BANNER',
        isEnabled: true,
        title: "The Winter Edit",
        subtitle: "Campaign 2024",
        ctaText: "Explore Collection",
        ctaLink: "/shop?filter=winter",
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
        layout: "STANDARD"
    },
    {
        id: 'slider-street',
        type: 'PRODUCT_SLIDER',
        isEnabled: true,
        title: "Street Essentials",
        subtitle: "Urban luxury for everyday",
        count: 6,
        filterType: "STREETWEAR"
    },
    {
        id: 'banner-minimal',
        type: 'PROMO_BANNER',
        isEnabled: true,
        title: "Minimal Premium",
        subtitle: "The Essentials",
        ctaText: "Shop Now",
        ctaLink: "/shop?category=essentials",
        image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
        layout: "REVERSE"
    },
    {
        id: 'slider-winter',
        type: 'PRODUCT_SLIDER',
        isEnabled: true,
        title: "Winter Collection",
        subtitle: "Warmth meets sophistication",
        count: 6,
        filterType: "WINTER"
    },
    {
        id: 'lookbook-1',
        type: 'LOOKBOOK',
        isEnabled: true,
        title: "The Lookbook",
        subtitle: "Editorial moments from our latest campaign",
        images: [
            "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
            "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
            "https://images.unsplash.com/photo-1475180098004-ca77a66827be?w=600&q=80"
        ]
    },
    {
        id: 'marquee-1',
        type: 'MARQUEE',
        isEnabled: true,
        text: "Effortlessly Bold • Suddenly • "
    },
    {
        id: 'seo-about',
        type: 'BRAND', // Reusing BRAND type for SEO text block
        isEnabled: true,
        heading: "About Suddenly",
        subheading: "Redefining Online Shopping in India",
        description: "Suddenly is India's premier online fashion destination for the modern, smart shopper. We curate high-quality street essentials, premium winter wear, and minimal aesthetics that speak volumes. Our mission is to make luxury accessible and shopping effortless for the lazy genius. Explore our latest collections today and experience the future of smart retail."
    }
];

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
    newsletter: {
        heading: "Join Us",
        subheading: "Subscribe for updates"
    },
    brandColumn: {
        heading: "Suddenly",
        description: "",
        socials: []
    },
    linkColumns: [
        {
            id: 'customer-care',
            title: 'Customer Care',
            links: [
                { label: 'Shipping Policy', url: '/shipping' },
                { label: 'Size Guide', url: '/size-guide' },
                { label: 'FAQs', url: '/faqs' },
                { label: 'Contact', url: '/contact' }
            ]
        },
        {
            id: 'company',
            title: 'Company',
            links: [
                { label: 'About Us', url: '/about' },
                { label: 'Sustainability', url: '/sustainability' },
                { label: 'Careers', url: '/careers' }
            ]
        },
        {
            id: 'legal',
            title: 'Legal & Privacy',
            links: [
                { label: 'Privacy Policy', url: '/privacy' },
                { label: 'Terms of Service', url: '/terms' },
                { label: 'Cookie Policy', url: '/cookies' }
            ]
        }
    ],
    bottomBar: {
        copyrightText: `© ${new Date().getFullYear()} Suddenly. All rights reserved.`
    }
};

export const CMSService = {
    async getHomeConfig(): Promise<HomeConfig> {
        try {
            const docRef = doc(db, HOME_DOC_PATH);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as HomeConfig;
            } else {
                // Return default config if no CMS data exists yet
                console.log("⚠️ No CMS config found, using default layout.");
                return { sections: DEFAULT_HOMEPAGE_SECTIONS, footer: DEFAULT_FOOTER_CONFIG };
            }
        } catch (error) {
            console.error("Error fetching home config:", error);
            // Fallback to default in case of error
            return { sections: DEFAULT_HOMEPAGE_SECTIONS, footer: DEFAULT_FOOTER_CONFIG };
        }
    },

    async updateHomeConfig(config: Partial<HomeConfig>): Promise<void> {
        try {
            await setDoc(doc(db, HOME_DOC_PATH), config, { merge: true });
        } catch (error) {
            console.error("Error updating home config:", error);
            throw error;
        }
    },

    async getPage(slug: string): Promise<PageContent | null> {
        try {
            const docRef = doc(db, "pages", slug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data() as PageContent;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching page ${slug}:`, error);
            return null;
        }
    },

    async savePage(slug: string, data: Partial<PageContent>): Promise<void> {
        try {
            const docRef = doc(db, "pages", slug);
            await setDoc(docRef, { ...data, id: slug, lastUpdated: new Date().toISOString() }, { merge: true });
        } catch (error) {
            console.error(`Error saving page ${slug}:`, error);
            throw error;
        }
    }
};
