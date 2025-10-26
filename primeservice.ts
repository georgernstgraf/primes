import * as db from "./primerepo.ts";
class PrimeService {
    async isPrime(n: number): Promise<boolean> {
        if (n <= 1) return false;
        if (await db.contained_in_consecutives(n)) {
            return true;
        }
        if (await db.contained_in_alones(n)) {
            return true;
        }
        // some code to find if false
        const root = Math.floor(Math.sqrt(n));
        const gen = this.prime_list_gen(root);
        for await (const p of gen) {
            if (n % p === 0) {
                return false;
            }
        }
        // now it is clear, we are prime:
        await db.ensure_alone(n);
        return true;
    }
    /**
     * serves the first from database and then generates the rest
     * @param upperbound the upper bound for the prime numbers to generate
     * @return AsyncGenerator<number, undefined>
     */
    async *prime_list_gen(
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
        // console.log(
        //     `starting to yield from db ... my upperbound: ${upperbound}`,
        // );
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
            if (!await this.isPrime(yieldval)) continue;
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
}
export const primeService = await new PrimeService();
