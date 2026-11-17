// Dummy data keyed by project id. Replaced by backend data later (only the services change).
// stock = quantity currently available on site, minStock = alert level.
function at(daysAgo, hour, minute) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
}

export const projectDetails = {
    p1: {
        payments: [
            { id: "pay1", label: "Advance", date: "2026-08-20", amount: 300000 },
            { id: "pay2", label: "1st installment (Foundation)", date: "2026-09-25", amount: 400000 },
            { id: "pay3", label: "2nd installment (Ground floor)", date: "2026-10-30", amount: 300000 },
        ],
        expenses: [
            { id: "e1", category: "Labour", title: "Weekly wages (12 workers)", date: "2026-11-15", amount: 84000 },
            { id: "e2", category: "Material", title: "Cement, 50 bags", date: "2026-11-16", amount: 17500 },
            { id: "e3", category: "Material", title: "Steel rods, 400 kg", date: "2026-11-12", amount: 25000 },
            { id: "e4", category: "Tools & Equipment", title: "JCB rental, 2 days", date: "2026-11-14", amount: 8000 },
            { id: "e5", category: "Transport", title: "Sand delivery", date: "2026-11-10", amount: 6000 },
            { id: "e6", category: "Other", title: "Site tea and water", date: "2026-11-09", amount: 1500 },
            { id: "e7", category: "Labour", title: "Monthly wages (October)", date: "2026-10-31", amount: 260000 },
            { id: "e8", category: "Labour", title: "Monthly wages (September)", date: "2026-09-30", amount: 240000 },
            { id: "e9", category: "Material", title: "Cement, 800 bags", date: "2026-10-05", amount: 280000 },
        ],
        materials: [
            { name: "Cement", unit: "bags", used: 1200, target: 1600, stock: 40, minStock: 100 },
            { name: "Bricks", unit: "pcs", used: 32000, target: 45000, stock: 3500, minStock: 2000 },
            { name: "Steel", unit: "tons", used: 8.5, target: 12, stock: 1.2, minStock: 1 },
            { name: "Sand", unit: "tons", used: 40, target: 60, stock: 6, minStock: 5 },
        ],
        updates: [
            { id: "u1", at: at(0, 18, 20), summary: "Column shuttering completed for first floor.", photos: 2, materials: ["Cement 50 bags", "Steel 400 kg"], workers: 14 },
            { id: "u2", at: at(1, 19, 45), summary: "Brickwork finished on ground floor east wall.", photos: 3, materials: ["Bricks 800 pcs", "Cement 40 bags"], workers: 12 },
            { id: "u3", at: at(3, 17, 30), summary: "Slab curing check and site cleaning.", photos: 1, materials: [], workers: 6 },
        ],
    },
    p2: {
        payments: [{ id: "pay4", label: "Advance", date: "2026-10-01", amount: 440000 }],
        expenses: [
            { id: "e10", category: "Labour", title: "Weekly wages (8 workers)", date: "2026-11-14", amount: 60000 },
            { id: "e11", category: "Material", title: "Cement, 100 bags", date: "2026-11-08", amount: 35000 },
            { id: "e12", category: "Tools & Equipment", title: "JCB rental, 3 days", date: "2026-10-12", amount: 12000 },
            { id: "e13", category: "Transport", title: "Material transport", date: "2026-10-20", amount: 5000 },
        ],
        materials: [
            { name: "Cement", unit: "bags", used: 300, target: 2000, stock: 120, minStock: 100 },
            { name: "Bricks", unit: "pcs", used: 6000, target: 60000, stock: 15000, minStock: 5000 },
            { name: "Steel", unit: "tons", used: 2, target: 18, stock: 4, minStock: 2 },
            { name: "Sand", unit: "tons", used: 10, target: 90, stock: 25, minStock: 10 },
        ],
        updates: [
            { id: "u4", at: at(2, 17, 10), summary: "Ground floor wall layout marked.", photos: 2, materials: ["Cement 30 bags"], workers: 8 },
        ],
    },
    p3: {
        payments: [
            { id: "pay5", label: "Advance", date: "2026-07-01", amount: 50000 },
            { id: "pay6", label: "Final payment", date: "2026-10-30", amount: 40000 },
        ],
        expenses: [
            { id: "e14", category: "Labour", title: "Total wages", date: "2026-10-28", amount: 30000 },
            { id: "e15", category: "Material", title: "Tiles and cement", date: "2026-08-10", amount: 25000 },
            { id: "e16", category: "Tools & Equipment", title: "Tool rental", date: "2026-07-15", amount: 5000 },
        ],
        materials: [
            { name: "Cement", unit: "bags", used: 40, target: 40, stock: 0, minStock: 0 },
            { name: "Bricks", unit: "pcs", used: 1500, target: 1500, stock: 0, minStock: 0 },
        ],
        updates: [],
    },
};