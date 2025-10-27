import { PrimeService as PrimeService } from "./lib/primeservice.ts";

while (true) {
    const versuch = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    await Deno.stdout.write(
        new TextEncoder().encode(`Testing number: ${versuch} .. `),
    );
    if (await PrimeService.isPrime(versuch)) {
        console.log(`Found prime: ${versuch}`);
    } else {
        console.log(`Not prime: ${versuch}`);
    }
}

// await primeService.ensure_consecutives_up_to(101000);
