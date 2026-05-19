import type { Metadata } from "next";

import LeadResultPage, { buildLeadResultMetadata } from "@/app/bewertung/[token]/page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageParams = {
  token: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { token } = await params;
  return buildLeadResultMetadata(`/bewertung-ergebnis/${token}`);
}

export default function Page(props: { params: Promise<PageParams> }) {
  return (
    <>
      <style>{'footer[data-site-footer="true"]{display:none!important;}'}</style>
      <LeadResultPage {...props} />
    </>
  );
}
