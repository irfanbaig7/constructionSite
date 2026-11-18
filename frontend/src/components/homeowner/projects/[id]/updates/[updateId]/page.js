import UpdateDetailView from "@/components/homeowner/UpdateDetailView";

export const metadata = { title: "Daily Update | SiteProof" };

export default async function Page({ params }) {
    const { id, updateId } = await params;
    return <UpdateDetailView id={id} updateId={updateId} />;
}