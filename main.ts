import { primeService } from "./primeservice.ts";

for (let i = 2; i <= 100; i++) {
    const rnd = Math.floor(Math.random() * 10e6);
    primeService.isPrime(rnd).then((isPrime) => {
        console.log(`Is ${rnd} prime? ${isPrime}`);
    });
}
