// import { primeService } from "./primeservice.ts";
import * as repo from "./lib/primerepo.ts";

const lastConsecutive = await repo.last_consecutive();
console.log(`Last  consecutive prime  in DB: ${lastConsecutive}`);
const countConsecutives = await repo.consecutives_count();
console.log(`Total consecutive primes in DB: ${countConsecutives}`);
console.log();
const smallestAlone = await repo.smallest_alone()!;
console.log(`Smallest alone prime in DB: ${smallestAlone}`);
const biggestAlone = await repo.biggest_alone()!;
console.log(`Biggest alone prime in DB: ${biggestAlone}`);
const countAlones = await repo.alone_count();
console.log(`Total alone primes in DB: ${countAlones}`);
console.log();
const pragmas = await repo.report_all_pragmas();
console.log("Database pragmas:");
pragmas.forEach((p) => {
    console.log(`  ${p.name}: ${p.value}`);
});
