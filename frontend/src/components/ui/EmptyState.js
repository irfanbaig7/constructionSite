import { card } from "@/lib/styles";

export default function EmptyState({ text }) {
    return <div className={`rounded-2xl p-8 text-center text-sm ${card}`}>{text}</div>;
}