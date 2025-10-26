import { PrismaClient } from "./prisma-db/client.ts";
import { max_primes_in_memory } from "./config.ts";
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

/**
 * Retrieves a list of consecutive IDs starting from a specified number.
 *
 * @param greater - The starting number from which to retrieve consecutive IDs.
 * @returns A promise that resolves to an array of consecutive IDs, or an empty array if no results are found.
 */
export async function consecutives_greater(
    greater: number,
): Promise<[number]> {
    return (await prisma.consecutive.findMany({
        where: { id: { gt: greater } },
        orderBy: { id: "asc" },
        take: max_primes_in_memory,
    })).map((r) => r.id) as [number];
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
 * Get the next (or same) consecutive prime id at or above a given upper bound.
 *
 * @param {number} upperbound - Minimum id to search from (inclusive).
 * @returns {Promise<number|null>} The matching id if found; otherwise null.
 */
export async function next_or_same_consecutive(upperbound: number) {
    const high_consecutive = await prisma.consecutive.findFirst({
        where: { id: { gte: upperbound } },
        orderBy: { id: "asc" },
    });
    return high_consecutive !== null ? high_consecutive.id : null;
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
    delete_alone: boolean = false,
): Promise<void> {
    const ishere = await prisma.consecutive.findUnique({
        where: { id: i },
    });
    ishere
        ? console.log(
            `ensure_consecutive called for ${i}, already here: ${
                ishere !== null
            }`,
        )
        : null;
    console.log(`db storing consecutive prime ${i}`);
    await Promise.all([
        prisma.consecutive.upsert({
            where: { id: i },
            update: {},
            create: { id: i },
        }),
        delete_alone
            ? prisma.alone.delete({ where: { id: i } })
            : Promise.resolve(),
    ]);
}
export async function ensure_alone(i: number): Promise<void> {
    // console.log(`db storing lonesome prime ${i}`);
    await prisma.alone.create({
        data: { id: i },
    });
}
/**
 * Fetch all ids from the `alone` table as a Set for fast lookup.
 *
 * @returns {Promise<Set<number>>} A set of all `alone` ids.
 */
export async function all_alones(): Promise<Set<number>> {
    const rows = await prisma.alone.findMany({
        select: { id: true },
    });
    return new Set((rows ?? []).map((a) => a.id));
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
