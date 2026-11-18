// Sidebar menu for each role. To add a new page to the sidebar, add one line here.
export const navigation = {
    contractor: [
        { label: "Dashboard", href: "/contractor/dashboard", icon: "📊" },
        { label: "My Projects", href: "/contractor/projects", icon: "🏗️" },
        { label: "Workers", href: "/contractor/workers", icon: "👷" },
        { label: "Settings", href: "/contractor/settings", icon: "⚙️" },
    ],
    homeowner: [
        { label: "Home", href: "/homeowner/dashboard", icon: "🏠" },
        { label: "Notifications", href: "/homeowner/notifications", icon: "🔔" },
        { label: "Profile", href: "/homeowner/profile", icon: "👤" },
    ],
};