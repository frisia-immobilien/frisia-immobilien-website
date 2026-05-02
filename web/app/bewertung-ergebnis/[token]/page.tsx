import LeadResultPage, { metadata } from "@/app/bewertung/[token]/page";

export { metadata };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageParams = {
  token: string;
};

export default function Page(props: { params: Promise<PageParams> }) {
  return (
    <>
      <style>{'footer[data-site-footer="true"]{display:none!important;}'}</style>
      <LeadResultPage {...props} />
    </>
  );
}
