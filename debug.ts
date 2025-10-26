import { primeService } from "./primeservice.ts";

const num = 7;
await primeService.ensure_consecutives_up_to(num);
console.log(`Consecutive primes up to ${num} ensured.`);
