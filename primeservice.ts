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
        const gen = this.prime_list(root);
        for await (const p of gen) {
            if (n % p === 0) {
                return false;
            }
        }
        // now it is clear, we are prime:
        return true;
    }

    async *prime_list(upperbound: number): AsyncGenerator<number, undefined> {
        await this.ensure_consecutives_up_to(upperbound);
        let mylist = await db.consecutives_from(2);
        let lastval = mylist.shift();
        if (lastval === undefined) {
            throw new Error("consecutives_from returned empty list");
        }
        while (true) {
            yield lastval;
            if (lastval >= upperbound) {
                return;
            }
            if (mylist.length == 0) {
                mylist = await db.consecutives_from(lastval + 1);
                lastval = mylist.shift();
                if (lastval === undefined) {
                    throw new Error("consecutives_from returned empty list");
                }
            }
            lastval = mylist.shift()!;
        }
    }
    async ensure_consecutives_up_to(n: number) {
        const last_consecutive = await db.last_consecutive();
        if (last_consecutive >= n) {
            return;
        }
        const alones = await db.all_alones();
        // We need to check_prime all numbers from last_consecutive + 1 to n
        for (
            let i = last_consecutive + 2;
            i <= n;
            i += 2
        ) {
            if (alones.has(i)) {
                db.store_consecutive(i, true);
                continue;
            }
            const root = Math.floor(Math.sqrt(i));
            const gen = this.prime_list(root);
            let is_prime = true;
            for await (const p of gen) {
                if (i % p === 0) {
                    is_prime = false;
                    break;
                }
            }
            if (is_prime) {
                await db.store_consecutive(i, false);
            }
        }
    }
}
export const primeService = await new PrimeService();
