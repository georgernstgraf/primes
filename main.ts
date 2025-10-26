import * as sql from "node:sqlite";

const db = await sql.open("./primes.sqlite");
