
"use client";

// <DataState query={useQuery result}>{(data) => ...}</DataState>
export default function DataState({ query, notFound = "Not found.", children }) {
    if (query.isPending) return <p className="py-8 text-center text-sm">Loading...</p>;
    if (query.isError)
        return (
            <div className="space-y-3 py-8 text-center text-sm">
                <p>{query.error.message}</p>
                <button type="button" onClick={() => query.refetch()} className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600">
                    Try Again
                </button>
            </div>
        );
    if (query.data == null) return <p className="py-8 text-center text-sm">{notFound}</p>;
    return children(query.data);
}
