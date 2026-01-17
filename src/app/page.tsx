import {
  MarketingLayout,
  HeroSection,
  FeaturesSection,
  PricingSection,
  CTASection,
} from "~/components/marketing";

export default function Home() {
  return (
    <MarketingLayout>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
    </MarketingLayout>
  );
}
