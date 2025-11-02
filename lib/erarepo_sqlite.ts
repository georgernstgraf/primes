import { Database } from "@db/sqlite";

// Create in-memory SQLite database
const db = new Database(":memory:");

// Set SQLite pragmas for performance
// db.exec("PRAGMA journal_mode = WAL;");
// db.exec("PRAGMA synchronous = NORMAL;");

// Create the numbers table
db.exec(`
    CREATE TABLE IF NOT EXISTS numbers (
        id number NOT NULL
    );
`);
export function smallest_number_in_db(): number | null {
    const result = db.sql`SELECT id FROM numbers ORDER BY id ASC LIMIT 1`;
    // either: [{"id":2}] or: []
    return result.length > 0 ? result[0].id : null;
}
export function biggest_number_in_db(): number | null {
    const result = db.sql`SELECT id FROM numbers ORDER BY id DESC LIMIT 1`;
    // either: [{"id":2}] or: []
    return result.length > 0 ? result[0].id : null;
}
export function total_count_in_db(): number {
    const result = db.sql`SELECT COUNT(*) as count FROM numbers`;
    return result[0].count;
}
export function prime_after(number: number): number | null {
    const result = db
        .sql`SELECT id FROM numbers WHERE id > ${number} ORDER BY id ASC LIMIT 1`;
    if (result.length === 0) {
        return null;
    }
    return result[0].id;
}
/**
 * @param n (defaults to 0, meaning no limit)
 */
export function last_n_primes(n: number = 0): number[] {
    if (n === 0) {
        return db.sql`SELECT id FROM numbers ORDER BY id ASC`.map((r) => r.id);
    }
    const results = db
        .sql`SELECT id FROM numbers ORDER BY id DESC LIMIT ${n}`;
    return results.map((r) => r.id).sort();
}
export function delete_multiples_of(p: number): number {
    // we know:
    // - p is prime

    // - all numbers < p are prime
    // - no multiples of all numbers < p are in db

    // - all numbers p .. (p² -1) are prime
    // - p * p is not prime
    // - p * (prime after p) is not prime

    // - for getting faster we would need to:
    // - - delete p * p
    // - - delete p * (nextprime p)
    // - - delete p * (nextprime nextprime p)
    // - - delete p * (nextprime nextprime nextprimep)
    // - until p * last_next_prime >= biggest
    // - this is cool if p² is bigger than limit
    // - if not

    // so here we delete the first efficiently (it is guaranteed to be in db)
    const upperbound = biggest_number_in_db()! / p;
    const stmt = db.prepare(`
        DELETE FROM numbers
        WHERE id IN (
            SELECT id * ?
            FROM numbers
            WHERE id >= ?
                AND id <= ?
        )
    `);
    const changes = stmt.run(p, p, upperbound);

    return changes;
}
export function ensure_numbers(max_ensure: number): number {
    while (!biggest_number_in_db()) {
        console.log(`repo: DB empty, inserting initial number 2`);
        db.prepare("INSERT INTO numbers (id) VALUES (?)").run(2);
    }
    const current_biggest = biggest_number_in_db()!;
    if (current_biggest >= max_ensure) {
        console.log(
            `DB already has numbers up to ${current_biggest}, no need to add more.`,
        );
        return 0;
    }
    console.log(
        `repo: Ensuring numbers up to ${max_ensure}, current biggest is ${current_biggest}`,
    );
    const start = biggest_number_in_db()! + 1;
    const stmt = db.prepare(`
        WITH RECURSIVE series(n) AS (
            SELECT ? AS n
            UNION ALL
            SELECT n + 1 FROM series WHERE n < ?
        )
        INSERT INTO numbers (id)
        SELECT n FROM series
    `);
    const insertions = stmt.run(start, max_ensure);
    console.log(
        `repo: Ensured numbers, did ${insertions} insertions.`,
    );
    return insertions;
}
