import { PrismaClient } from "../prisma-db/client.ts";
import { config } from "./config.ts";
// const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });
const prisma = new PrismaClient();

await Promise.all([
    prisma.consecutive.upsert({
        where: { id: 2 },
        update: {},
        create: { id: 2 },
    }),
    prisma.consecutive.upsert({
        where: { id: 3 },
        update: {},
        create: { id: 3 },
    }),
]);

class State {
    cg_cache: Map<number, [number]> = new Map();
    get_cg_cache(
        greater: number,
    ): [number] | undefined {
        return this.cg_cache.get(greater);
    }
    set_cg_cache(
        greater: number,
        precious: [number],
    ): void {
        if (precious.length as number !== config.max_primes_in_memory) return;
        this.cg_cache.set(greater, precious);
    }
}
const state = new State();
/**
 * gets a "Page" of Primes from the database, ideally cached
 *
 * @param greater - The starting number from which to retrieve consecutive IDs.
 */
export async function consecutives_greater(
    greater: number,
): Promise<[number]> {
    // console.log(`db fetching consecutives greater than ${greater}`);
    const cached = state.get_cg_cache(greater);
    if (cached) {
        return [...cached];
    }
    const precious = (await prisma.consecutive.findMany({
        where: { id: { gt: greater } },
        orderBy: { id: "asc" },
        take: config.max_primes_in_memory,
    })).map((r) => r.id) as [number];
    state.set_cg_cache(greater, precious);
    return [...precious];
}
/**
 * Check whether a number exists in the set of consecutive primes.
 *
 * @param {number} n - The prime candidate to look up.
 * @returns {Promise<boolean>} Resolves to true if the id exists in `consecutive`; otherwise false.
 */
export async function contained_in_consecutives(n: number) {
    const res = await prisma.consecutive.findUnique({
        where: { id: n },
    });
    return res !== null;
}
/**
 * Returns the highest consecutive prime id stored.
 *
 * @returns {Promise<number|null>} The maximum id present in the `consecutive` table, or null if none exist.
 */
export async function last_consecutive(): Promise<number> {
    const last_consecutive = await prisma.consecutive.findFirst({
        orderBy: { id: "desc" },
    });
    return last_consecutive!.id;
}

/**
 * Mark a given id as consecutive and remove it from the `alone` set.
 *
 * Executes the create and delete in parallel.
 *
 * @param {number} i - The id to mark as consecutive.
 * @returns {Promise<void>} Resolves when both operations complete.
 */
export async function ensure_consecutive(
    i: number,
): Promise<void> {
    await prisma.consecutive.create({
        data: { id: i },
    });
    await prisma.alone.deleteMany({
        where: { id: { lte: i } },
    });
}
export async function consecutives_count(): Promise<number> {
    const count = await prisma.consecutive.count();
    return count;
}
export async function ensure_alone(i: number): Promise<void> {
    // console.log(`db storing lonesome prime ${i}`);
    await prisma.alone.create({
        data: { id: i },
    });
}
/**
 * Check whether a number exists in the set of alone primes.
 *
 * @param {number} n - The prime candidate to look up.
 * @returns {Promise<boolean>} Resolves to true if the id exists in `alone`; otherwise false.
 */
export async function contained_in_alones(n: number) {
    const res = await prisma.alone.findUnique({
        where: { id: n },
    });
    return res !== null;
}
export async function alone_count(): Promise<number> {
    const count = await prisma.alone.count();
    return count;
}
export async function biggest_alone(): Promise<number | null> {
    const biggest_alone = await prisma.alone.findFirst({
        orderBy: { id: "desc" },
    });
    return biggest_alone ? biggest_alone.id : null;
}
export async function smallest_alone(): Promise<number | null> {
    const smallest_alone = await prisma.alone.findFirst({
        orderBy: { id: "asc" },
    });
    return smallest_alone ? smallest_alone.id : null;
}
