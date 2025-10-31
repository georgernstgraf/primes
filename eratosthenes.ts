import { total_count_in_db } from "./lib/erarepo.ts";

console.log(`Total count in DB: ${await total_count_in_db()}`);
