import UpdatesHistoryView from "@/components/homeowner/UpdatesHistoryView";

export const metadata = { title: "Daily Updates | SiteProof" };

export default async function UpdatesHistoryPage({ params }) {
    const { id } = await params;
    return <UpdatesHistoryView projectId={id} />;
}
