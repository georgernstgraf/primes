import * as db from "./lib/era_numberrepo.ts";

console.log(
    `Database: MIN: ${await db.smallest_number_in_db()}, MAX: ${await db
        .biggest_number_in_db()}, TOTAL: ${await db.total_count_in_db()}`,
);

await db.ensure_numbers();
const limit: bigint = (await db.biggest_number_in_db())!;

for (
    let p = await db.smallest_number_in_db();
    p * p < limit;
    p = await db.prime_after(p)
) {
    const msg = `   multiples of ${p}`;
    console.time(msg);
    const deleted = await db.delete_multiples_of(p);
    console.log(`deleted ${deleted} multiples of ${p}`);
    console.timeEnd(msg);
}
