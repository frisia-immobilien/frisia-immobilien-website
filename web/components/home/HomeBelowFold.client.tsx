"use client";

import {
  ClosingCta,
  FaqBlock,
  RegionalMarktBlock,
  Section9plus1,
  WhyFrisiaBlock,
  WarumEigentuemerBeauftragenBlock,
} from "@/components/home/HomeSections";

export default function HomeBelowFold() {
  return (
    <>
      <Section9plus1 />
      <WarumEigentuemerBeauftragenBlock />
      <WhyFrisiaBlock />
      <RegionalMarktBlock />
      <FaqBlock />
      <ClosingCta />
    </>
  );
}
