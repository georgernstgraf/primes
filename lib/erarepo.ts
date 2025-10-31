import { PrismaClient } from "./eratosthenes_prisma/client.ts";

export const db = new PrismaClient();

const biggest_number = 4_000_000_000;

await db.$connect();

await db.$queryRaw`PRAGMA journal_mode = WAL;`;
await db.$queryRaw`PRAGMA synchronous = NORMAL;`;

export async function biggest_number_in_db(): Promise<number> {
    const result = await db.numbers.findFirst({
        orderBy: {
            id: "desc",
        },
    });
    if (result === null) {
        return 1;
    }
    return result.id;
}
export async function total_count_in_db(): Promise<number> {
    const result = await db.numbers.count();
    return result;
}
export async function ensure_numbers() {
    const current_biggest = await biggest_number_in_db();
    if (current_biggest >= biggest_number) {
        console.log(
            `DB already has numbers up to ${current_biggest}, no need to add more.`,
        );
        return;
    }
    console.log(
        `Ensuring numbers up to ${biggest_number}, current biggest is ${current_biggest}`,
    );
    const batch_size = 1000000;
    for (
        let start = current_biggest + 1;
        start <= biggest_number;
        start += batch_size
    ) {
        const end = Math.min(start + batch_size - 1, biggest_number);
        const to_insert = [];
        for (let n = start; n <= end; n++) {
            to_insert.push({ id: n });
        }
        console.log(`Inserting numbers from ${start} to ${end} ...`);
        await db.numbers.createMany({
            data: to_insert.map((x) => ({ id: x.id, isprime: true })),
        });
    }
}
await ensure_numbers();
