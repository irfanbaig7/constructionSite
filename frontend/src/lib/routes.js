export const ROUTES = {
    home: "/",
    login: "/login",
    signup: "/signup",
    contractorDashboard: "/contractor/dashboard",
    homeownerDashboard: "/homeowner/dashboard",
};

export function dashboardFor(role) {
    return role === "homeowner" ? ROUTES.homeownerDashboard : ROUTES.contractorDashboard;
}