"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import type { Order, AssemblyTask } from "@/lib/types";

/**
 * Provides O(1) indexed lookups for orders, tasks, and assemblers.
 *
 * Replaces the O(N) `.find()` / `.filter()` calls scattered across pages
 * with pre-built Map indexes that are recomputed only when the underlying
 * store arrays change.
 */
export function useIndexedData() {
    const orders = useStore((s) => s.orders);
    const tasks = useStore((s) => s.tasks);

    /** O(1) order lookup by ID */
    const ordersById = useMemo(() => {
        const map = new Map<string, Order>();
        for (const o of orders) {
            map.set(o.id, o);
        }
        return map;
    }, [orders]);

    /** Tasks grouped by orderId — O(1) lookup per order */
    const tasksByOrderId = useMemo(() => {
        const map = new Map<string, AssemblyTask[]>();
        for (const t of tasks) {
            const key = t.orderId;
            const list = map.get(key);
            if (list) {
                list.push(t);
            } else {
                map.set(key, [t]);
            }
        }
        return map;
    }, [tasks]);

    /**
     * Tasks grouped by assembler ID — O(1) lookup per assembler.
     *
     * A single task can appear under multiple assembler IDs
     * (multi-person jobs), so we iterate tasks once and bucket
     * into each assigned assembler.
     */
    const tasksByAssemblerId = useMemo(() => {
        const map = new Map<string, AssemblyTask[]>();
        for (const t of tasks) {
            for (const asmId of t.assignedAssemblerIds ?? []) {
                const list = map.get(asmId);
                if (list) {
                    list.push(t);
                } else {
                    map.set(asmId, [t]);
                }
            }
        }
        return map;
    }, [tasks]);

    return { ordersById, tasksByOrderId, tasksByAssemblerId };
}
