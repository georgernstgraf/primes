import { PrismaClient } from "./eratosthenes_prisma/client.ts";
import { config } from "./config.ts";
export const prisma = new PrismaClient(/* { log: ["query"] } */);
// import * as node_sqlite from "node:sqlite3";

const eratosthenes_limit = config.eratosthenes_limit;

await prisma.$connect();
await prisma.$queryRaw`PRAGMA journal_mode = WAL;`;
await prisma.$queryRaw`PRAGMA synchronous = NORMAL;`;

export async function smallest_number_in_db(): Promise<bigint> {
    const result = await prisma.numbers.findFirst({
        orderBy: {
            id: "asc",
        },
    });
    if (result === null) {
        return 1n;
    }
    return result.id;
}
export async function biggest_number_in_db(): Promise<bigint | null> {
    const result = await prisma.numbers.findFirst({
        orderBy: {
            id: "desc",
        },
    });
    if (result === null) {
        return null;
    }
    return result.id;
}
export async function total_count_in_db(): Promise<number> {
    const result = await prisma.numbers.count();
    return result;
}
/**
 * @returns all numbers, not sorted
 */
export async function all_numbers(): Promise<bigint[]> {
    const results = await prisma.numbers.findMany();
    return results.map((r) => r.id);
}
export async function prime_after(number: bigint): Promise<bigint> {
    const result = await prisma.numbers.findFirst({
        where: {
            id: {
                gt: number,
            },
        },
        orderBy: {
            id: "asc",
        },
    });
    if (result === null) {
        return -1n;
    }
    return result.id;
}
export async function delete_multiples_of(p: bigint) {
    // we know:
    // - p is prime

    // - all numbers < p are prime
    // - no multiples of all numbers < p are in db

    // - all numbers p .. (p² -1) are prime
    // - p * p is not prime
    // - p * (prime after p) is not prime

    // - for getting faster we would need to:
    // - - delete p * p
    // - - delete p * (nextprime p)
    // - - delete p * (nextprime nextprime p)
    // - - delete p * (nextprime nextprime nextprimep)
    // - until p * last_next_prime >= biggest
    // - this is cool if p² is bigger than limit
    // - if not

    // so here we delete the first efficiently (it is guaranteed to be in db)
    const upperbound = (await biggest_number_in_db())! / p;
    const deleted_fast = await prisma.$executeRaw`
        DELETE FROM numbers
        WHERE id IN (
            SELECT id * ${p}
            FROM numbers
            WHERE id >= ${p}
                AND id <= ${p * upperbound}
        );
    `;

    return deleted_fast;
}
export async function ensure_numbers() {
    while (!await biggest_number_in_db()) {
        console.log(`repo: DB empty, inserting initial number 2`);
        await prisma.numbers.create({
            data: {
                id: 2n,
            },
        });
    }
    const current_biggest = (await biggest_number_in_db())!;
    if (current_biggest >= eratosthenes_limit) {
        console.log(
            `DB already has numbers up to ${current_biggest}, no need to add more.`,
        );
        return;
    }
    console.log(
        `repo: Ensuring numbers up to ${eratosthenes_limit}, current biggest is ${current_biggest}`,
    );
    const start = (await biggest_number_in_db())! + 1n;
    return await prisma.$executeRaw`
        WITH RECURSIVE series(n) AS (
            SELECT ${start} AS n
            UNION ALL
            SELECT n + 1 FROM series WHERE n < ${eratosthenes_limit}
        )
        INSERT INTO numbers (id)
        SELECT n FROM series;`;
}
