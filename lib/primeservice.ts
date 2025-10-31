import * as db from "./primerepo.ts";
import * as ossl from "./openssl_checkprime.ts";
export class PrimeService {
    static async isPrime(
        to_check: number,
        use_db: boolean = true,
    ): Promise<boolean> {
        if (to_check <= 1) return false;
        if (use_db) {
            if (await db.contained_in_consecutives(to_check)) {
                return true;
            }
            if (await db.contained_in_alones(to_check)) {
                return true;
            }
        }
        // some code to find if false
        const root = Math.floor(Math.sqrt(to_check));
        const gen = PrimeService.prime_list_gen(root);
        // consuming it ensures consecutives up to root
        for await (const _p of gen) {
            // if (n % p === 0) {
            //     return false;
            // }
        }
        // now it is clear, we are prime:
        const is_prime = await ossl.isPrime(to_check);
        if (!is_prime) {
            return false;
        }
        // store it:
        if (use_db) {
            await db.ensure_alone(to_check);
        }
        return true;
    }
    /**
     * serves the first from database and then generates the rest
     * @param upperbound the upper bound for the prime numbers to generate
     * @return AsyncGenerator<number, undefined>
     */
    static async *prime_list_gen(
        upperbound: number,
    ): AsyncGenerator<number, undefined> {
        let mylist = await db.consecutives_greater(1) as number[]; // will be up to config.max_primes_in_memory
        let yieldval = mylist.shift();
        if (yieldval === undefined) {
            throw new Error(
                "even first consecutives_greater returned empty list",
            );
        }
        let last_yielded;
        //     `starting to yield from db ... my upperbound: ${upperbound}`,
        while (true) {
            // console.log(`yielding from cache: ${yieldval}`);
            yield yieldval;
            last_yielded = yieldval;
            if (last_yielded >= upperbound) {
                // console.log("reached upperbound, stopping");
                return;
            }
            if (mylist.length === 0) { // so empty
                // console.log("fetching new page from db ...");
                mylist = await db.consecutives_greater(last_yielded);
                yieldval = mylist.shift();
                if (!yieldval) {
                    // console.log(
                    //     "breaking: consecutives_greater returned empty list",
                    // );
                    break;
                }
            } else { // list still not empty
                yieldval = mylist.shift()!;
            }
            if (yieldval > upperbound) {
                // console.log("reached upperbound, stopping");
                return;
            }
        }
        console.log("db sucked out, i will generate primes here ...");
        // so ... last_yielded is the last prime we yielded
        // I have given what I could from the database, so here we
        // are creating the new ones.
        yieldval = last_yielded;
        while (yieldval < upperbound) {
            yieldval += 2;
            if (!await this.isPrime(yieldval, false)) continue;
            // I have a new prime, but:
            if (yieldval > upperbound) return;
            yield yieldval;
            db.ensure_consecutive(yieldval);
            // console.log(
            //     `yielded and saved to db: ${yieldval}, (upperbound: ${upperbound})`,
            // );
        }
        return;
    }
    static async *primes_db_gen(): AsyncGenerator<number, undefined> {
        let mylist = await db.consecutives_greater(1) as number[]; // will be up to config.max_primes_in_memory
        let yieldval = mylist.shift();
        if (yieldval === undefined) {
            throw new Error(
                "even first consecutives_greater returned empty list",
            );
        }
        let last_yielded;
        while (true) {
            // console.log(`yielding from cache: ${yieldval}`);
            yield yieldval;
            last_yielded = yieldval;
            if (mylist.length === 0) { // so empty
                mylist = await db.consecutives_greater(last_yielded);
                yieldval = mylist.shift();
                if (!yieldval) {
                    break;
                }
            } else { // list still not empty
                yieldval = mylist.shift()!;
            }
        }
        console.log("db sucked out, returning ...");
        return;
    }
}
