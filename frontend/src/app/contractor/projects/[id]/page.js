import ProjectDetailsView from "@/components/projects/ProjectDetailsView";

export const instant = false;
export const metadata = { title: "Project | SiteProof" };

export default async function ProjectPage({ params }) {
    const { id } = await params;
    return <ProjectDetailsView id={id} />;
}