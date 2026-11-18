import ExpensesView from "@/components/homeowner/ExpensesView";

export const metadata = { title: "Expenses | SiteProof" };

export default async function Page({ params }) {
    const { id } = await params;
    return <ExpensesView id={id} />;
}