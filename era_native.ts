import { assertFalse } from "@std/assert";
import * as db from "./lib/erarepo_sqlite.ts";
import { isPrime } from "./lib/openssl_checkprime.ts";

const sieve_size = 1_000_000;
const display_count = 10;

const ensuringtook = "Ensuring numbers took";
const crossingouttook = "Crossing out took";
console.time(ensuringtook);

dbstats();
db.ensure_numbers(sieve_size);
console.timeEnd(ensuringtook);
dbstats();

const limit: number = db.biggest_number_in_db()!;

console.time(crossingouttook);
Deno.stdout.writeSync(
    new TextEncoder().encode("each dot is a crossing operation: "),
);
const dot = new TextEncoder().encode(".");
for (
    let p = db.smallest_number_in_db();
    p && p * p < limit;
    p = db.prime_after(p)
) {
    const _deleted = db.delete_multiples_of(p);
    Deno.stdout.writeSync(dot);
    //console.log(`deleted ${deleted} multiples of ${p}`);
}
Deno.stdout.writeSync(new TextEncoder().encode("\n"));
console.timeEnd(crossingouttook);

console.log(
    `Last ${display_count} primes (throws if an intermediate is prime according to openssl):`,
);
let last = Number.MAX_SAFE_INTEGER - 1;
for (const n of db.last_n_primes(display_count)) {
    for (let x = last + 1; x < n; x++) {
        assertFalse(
            isPrime(x),
            `Error: ${x} is prime (openssl), but missing in db!`,
        );
    }
    console.log(`   ${n} (openssl: ${isPrime(n) ? "prime" : "not prime"})`);
    last = n;
}
dbstats();
function dbstats() {
    console.log(
        `Database: MIN: ${db.smallest_number_in_db()}, MAX: ${db.biggest_number_in_db()}, TOTAL: ${db.total_count_in_db()}`,
    );
}
