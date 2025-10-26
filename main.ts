import { primeService } from "./primeservice.ts";
import { last_consecutive } from "./primerepo.ts";

while (true) {
    const versuch = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    console.log(`Testing number: ${versuch}`);
    if (await primeService.isPrime(versuch)) {
        console.log(`Found prime: ${versuch}`);
    } else {
        console.log(`Not prime: ${versuch}`);
    }
}

// await primeService.ensure_consecutives_up_to(101000);
