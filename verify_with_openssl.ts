import { isPrime } from "./lib/openssl_checkprime.ts";
import { PrimeService } from "./lib/primeservice.ts";

async function main() {
    let counter = 0;
    for await (const prime of PrimeService.primes_db_gen()) {
        counter += 1;
        const opensslResult = isPrime(prime);
        if (!opensslResult) {
            console.error(
                `Discrepancy found: ${prime} is prime in DB but not according to OpenSSL!`,
            );
        }
        if (counter % 1000 === 0) {
            console.log(`Tested ${counter} primes so far...`);
        }
    }
}

await main();
