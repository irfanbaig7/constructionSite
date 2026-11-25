import { expect, test } from "@playwright/test";

const widths = [320, 375, 390, 768, 1024, 1440];
const project = {
    id: "fixture", name: "Demo House", owner: "Demo Owner", location: "Demo location",
    budget: 1000, received: 100, progress: 25, status: "in_progress",
    startDate: "2026-01-01", expectedEnd: "2026-12-30", milestones: [{ name: "Foundation", status: "active" }],
};

async function fitsViewport(page) {
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
}

for (const width of widths) {
    test(`public pages fit at ${width}px in both themes`, async ({ page }, info) => {
        await page.setViewportSize({ width, height: 900 });
        const pageErrors = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        await page.goto("/");
        for (const theme of ["dark", "light"]) {
            await page.evaluate((value) => localStorage.setItem("theme", value), theme);
            for (const [route, heading] of [["/", /build smart/i], ["/login", /welcome back/i], ["/signup", /create your account/i]]) {
                await page.goto(route);
                await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
                if (theme === "light") await expect(page.locator("html")).toHaveClass(/\blight\b/);
                else await expect(page.locator("html")).not.toHaveClass(/\blight\b/);
                await fitsViewport(page);
                if (width === 390 || width === 1440)
                    await page.screenshot({ path: info.outputPath(`${route.slice(1) || "landing"}-${theme}.png`), fullPage: true });
            }
        }
        expect(pageErrors).toEqual([]);
    });
}

for (const role of ["contractor", "homeowner"]) {
    test(`${role} dashboard and logo route on mobile and desktop`, async ({ page }, info) => {
        const user = { id: "fixture", role, name: "Demo User", email: "demo@example.test" };
        const secondProject = { ...project, id: "fixture-two", name: "Second Demo House" };
        const pageErrors = [];
        page.on("pageerror", (error) => pageErrors.push(error.message));
        await page.route("**/api/**", async (route) => {
            const path = new URL(route.request().url()).pathname;
            let json = [];
            if (path.endsWith("/auth/me")) json = { user };
            if (path === "/api/projects") json = role === "homeowner" ? [project, secondProject] : [project];
            if (path === "/api/projects/fixture") json = { project, payments: [] };
            if (path === "/api/projects/fixture-two") json = { project: secondProject, payments: [] };
            if (path.endsWith("/updates")) json = [{
                id: "fixture-update", at: "2026-11-25T12:30:00.000Z", summary: "Foundation demo update", workers: 2,
                photos: [], materials: [], deliveries: [],
            }];
            return route.fulfill({ json, headers: {
                "Access-Control-Allow-Origin": "http://localhost:3187",
                "Access-Control-Allow-Credentials": "true",
            } });
        });
        const title = role === "homeowner" ? /your project, at a glance/i : /welcome back/i;
        for (const width of [390, 1440]) {
            await page.setViewportSize({ width, height: 900 });
            await page.goto(`/${role}/dashboard`);
            await expect(page.getByRole("heading", { name: title }).first()).toBeVisible();
            if (role === "homeowner") {
                await expect(page.getByText("Foundation demo update")).toBeVisible();
                const order = await page.locator("main").evaluate((main) => [...main.querySelectorAll("section[id]")].map((section) => section.id));
                expect(order.slice(0, 3)).toEqual(["updates", "actions", "overview"]);
            }
            await fitsViewport(page);
            await page.screenshot({ path: info.outputPath(`dashboard-${width}.png`), fullPage: true });
            if (role === "homeowner") {
                await page.getByRole("combobox", { name: "Viewing project" }).selectOption("fixture-two");
                await expect(page.getByRole("heading", { name: "Second Demo House" })).toBeVisible();
            }
            if (role === "contractor" && width === 390) await page.getByRole("button", { name: "Open menu" }).click();
            await page.getByRole("link", { name: /siteproof/i }).click();
            await expect(page).toHaveURL(new RegExp(`/${role}/dashboard$`));
        }
        expect(pageErrors).toEqual([]);
    });
}
