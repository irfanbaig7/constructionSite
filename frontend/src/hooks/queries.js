"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjects, getProjectDetails, getOwnerProjectDetails, getUpdate } from "@/services/projectService";
import { getWorkers } from "@/services/workerService";
import { getDashboardData } from "@/services/dashboardService";
import { getDashboardStats } from "@/lib/dashboardStats";
import { getOwnerMaterials, getMaterialRequests } from "@/services/materialService";
import { getPaymentRequests } from "@/services/paymentService";
import { getEntries } from "@/services/ledgerService";

export const useProjects = () => useQuery({ queryKey: ["projects"], queryFn: getProjects });
export const useWorkers = () => useQuery({ queryKey: ["workers"], queryFn: getWorkers });
export const useProjectDetails = (id) => useQuery({ queryKey: ["project", id], queryFn: () => getProjectDetails(id) });
export const useOwnerProjectDetails = (id) =>
    useQuery({ queryKey: ["owner-project", id], queryFn: () => getOwnerProjectDetails(id), enabled: !!id });
export const useUpdate = (id) => useQuery({ queryKey: ["update", id], queryFn: () => getUpdate(id) });
export const useDashboard = () =>
    useQuery({ queryKey: ["dashboard"], queryFn: async () => getDashboardStats(await getDashboardData()) });

export const useOwnerBundle = (id) =>
    useQuery({
        queryKey: ["owner", id],
        enabled: !!id,
        queryFn: async () => {
            const [d, e, m, r, pr] = await Promise.all([
                getOwnerProjectDetails(id),
                getEntries(id),
                getOwnerMaterials(id),
                getMaterialRequests(id),
                getPaymentRequests(id),
            ]);
            return { d, e, m, r, pr };
        },
    });

export const useOwnerLedger = (id) =>
    useQuery({
        queryKey: ["ledger", id],
        queryFn: async () => {
            const [d, entries] = await Promise.all([getOwnerProjectDetails(id), getEntries(id)]);
            return d && { ...d, entries };
        },
    });
