import { assertFalse } from "@std/assert";
import * as db from "./lib/erarepo_sqlite.ts";
import { isPrime } from "./lib/openssl_checkprime.ts";

const sieve_size = Deno.args[0]
    ? Math.floor(parseFloat(Deno.args[0]))
    : 1_000_000;
if (!sieve_size) {
    throw new Error(`Error parsing sieve_size from '${Deno.args[0]}'`);
}
const display_count = 10;

const crossingouttook = "Crossing out took";
const backuptook = "Backup took";

dbstats();
db.ensure_numbers(sieve_size);
dbstats();

const limit: number = db.biggest_number_in_db()!;

console.time(crossingouttook);
const te = new TextEncoder();
Deno.stdout.writeSync(
    te.encode("crossing:"),
);
for (
    let p = db.smallest_number_in_db();
    p && p * p < limit;
    p = db.prime_after(p)
) {
    Deno.stdout.writeSync(te.encode(` ${p}`));
    const _deleted = db.delete_multiples_of(p);
    //console.log(`deleted ${deleted} multiples of ${p}`);
}
Deno.stdout.writeSync(te.encode("\n"));
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

console.log("backing up ...");
console.time(backuptook);
db.backup_db(`eranative_backup_${sieve_size}.db`);
console.timeEnd(backuptook);

function dbstats() {
    console.log(
        `Database: MIN: ${db.smallest_number_in_db()}, MAX: ${db.biggest_number_in_db()}, TOTAL: ${db.total_count_in_db()}`,
    );
}
