import { isPrime as ossl_isprime } from "./lib/openssl_checkprime.ts";
import { PrimeService } from "./lib/primeservice.ts";

async function main() {
    let counter = 0;
    let lastprime = 2;
    for await (const prime of PrimeService.primes_db_gen()) {
        counter += 1;
        for (let n = lastprime + 1; n < prime; n += 2) {
            if (ossl_isprime(n)) {
                throw new Error(
                    `Discrepancy found: ${n} is not prime in DB but prime according to OpenSSL!`,
                );
            }
        }
        if (!ossl_isprime(prime)) {
            throw new Error(
                `Discrepancy found: ${prime} is prime in DB but not according to OpenSSL!`,
            );
        }
        lastprime = prime;
        if (counter % 1000 === 0) {
            console.log(`Tested ${counter} primes so far...`);
        }
    }
}

await main();
