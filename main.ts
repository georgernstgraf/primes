import { primeService } from "./primeservice.ts";
import { last_consecutive } from "./primerepo.ts";

while (true) {
    const versuch = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    if (await primeService.isPrime(versuch)) {
        console.log(`Found prime: ${versuch}`);
    }
}

// await primeService.ensure_consecutives_up_to(101000);
