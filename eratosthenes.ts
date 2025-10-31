import { total_count_in_db } from "./lib/era_numberrepo.ts";

console.log(`Total count in DB: ${await total_count_in_db()}`);
