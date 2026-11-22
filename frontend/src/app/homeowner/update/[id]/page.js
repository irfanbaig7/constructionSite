import UpdateDetailView from "@/components/homeowner/UpdateDetailView";

export const instant = false;
export const metadata = { title: "Daily Update | SiteProof" };

export default async function Page({ params }) {
    const { id } = await params;
    return <UpdateDetailView updateId={id} />;
}