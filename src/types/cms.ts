export type SectionType =
    | 'HERO'
    | 'BRAND'
    | 'CATEGORY_STRIP'
    | 'PRODUCT_SLIDER'
    | 'PROMO_BANNER'
    | 'LOOKBOOK'
    | 'MARQUEE'
    | 'TRUST_BADGES';

export interface BaseSection {
    id: string;
    type: SectionType;
    isEnabled: boolean;
}

export interface HeroSection extends BaseSection {
    type: 'HERO';
    slides: {
        id: string;
        image: string; // Used if type is 'image' or as poster
        videoUrl?: string; // Used if type is 'video'
        type?: 'image' | 'video';
        title: string;
        subtitle: string;
        ctaText: string;
        ctaLink: string;
    }[];
}

export interface BrandSection extends BaseSection {
    type: 'BRAND';
    heading: string;
    subheading: string;
    description: string;
}

export interface CategoryStripSection extends BaseSection {
    type: 'CATEGORY_STRIP';
    categories?: {
        name: string;
        image: string;
        link: string;
    }[];
}

export interface ProductSliderSection extends BaseSection {
    type: 'PRODUCT_SLIDER';
    title: string;
    subtitle: string;
    count: number;
    // 'filterValue' could be a specific category ID or "trending" tag, simplistic for now
    filterType: 'NEW_ARRIVALS' | 'STREETWEAR' | 'WINTER' | 'ESSENTIALS';
}

export interface PromoBannerSection extends BaseSection {
    type: 'PROMO_BANNER';
    title: string;
    subtitle: string;
    image: string;
    ctaText: string;
    ctaLink: string;
    layout: 'STANDARD' | 'REVERSE';
}

export interface LookbookSection extends BaseSection {
    type: 'LOOKBOOK';
    title: string;
    subtitle: string;
    images: string[];
}

export interface MarqueeSection extends BaseSection {
    type: 'MARQUEE';
    text: string;
}

export interface TrustBadgesSection extends BaseSection {
    type: 'TRUST_BADGES';
}

export type PageSection =
    | HeroSection
    | BrandSection
    | CategoryStripSection
    | ProductSliderSection
    | PromoBannerSection
    | LookbookSection
    | MarqueeSection
    | TrustBadgesSection;

export interface CountdownConfig {
    isEnabled: boolean;
    targetDate: string; // ISO String
    title: string;
    subheading: string;
    backgroundImage?: string;
    // Subscription Settings
    showSubscribe?: boolean;
    subscribeTitle?: string;
    subscribeMessage?: string;
    subscribeButtonText?: string;
}

export interface FooterLink {
    label: string;
    url: string;
}

export interface FooterColumn {
    id: string;
    title: string;
    links: FooterLink[];
}

export interface FooterConfig {
    newsletter: {
        heading: string;
        subheading: string;
    };
    brandColumn: {
        heading: string; // e.g. "Suddenly"
        description: string;
        socials: { platform: 'instagram' | 'twitter' | 'facebook' | 'youtube'; url: string }[];
    };
    linkColumns: FooterColumn[];
    bottomBar: {
        copyrightText: string;
    };
}

export interface PageContent {
    id: string; // The slug, e.g., 'about'
    title: string;
    content: string; // HTML content
    lastUpdated: string; // ISO date string
}

export interface HomeConfig {
    sections: PageSection[];
    countdown?: CountdownConfig;
    footer?: FooterConfig;
}
