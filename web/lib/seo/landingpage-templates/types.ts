import type { SeoPageType } from "@/lib/types/leadgen";

export type LandingTemplate = {
  pageType: SeoPageType;
  prefix: string;
  label: string;
  h1: (location: string) => string;
  title: (location: string) => string;
  description: (location: string) => string;
  intro: (location: string) => string;
  text1: (location: string) => string;
  text2: (location: string) => string;
  faq: (location: string) => Array<{ question: string; answer: string }>;
};
