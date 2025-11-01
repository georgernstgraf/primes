import { isPrime as ossl_isprime } from "./lib/openssl_checkprime.ts";
import * as db from "./lib/era_numberrepo.ts";

console.log(
    `Database: MIN: ${await db.smallest_number_in_db()}, MAX: ${await db
        .biggest_number_in_db()}, TOTAL: ${await db.total_count_in_db()}`,
);

async function main() {
    let counter = 0;
    for (const prime of await db.all_numbers()) {
        if (!ossl_isprime(prime)) {
            throw new Error(
                `Discrepancy found: ${prime} is prime in DB but not according to OpenSSL!`,
            );
        }
        counter += 1;
        if (counter % 5000 === 0) {
            console.log(`Tested ${counter} primes so far...`);
        }
    }
}

await main();
