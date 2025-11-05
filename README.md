# Primes

Ein Primzahl Generator mit Datenbankunterstützung, 3 verschiedene Implementierungen

## Native sqlite Implementierung (`jsr:@db/sqlite`)

- rekursive CTEs
- auskreuzen mit `DELETE FROM ... WHERE id in (SELECT p * n ...)`

## Implementierung Sieb des Eratosthenes mit Prisma

- prisma/eratosthenes
- verwendet sqlite
- praktisch alle Logik mit sql statements umgesetzt (insbesondere das auskreuzen)

## Klassische Methode mit Test bis incl. sqrt(n)

Es gibt 2 Tabellen, eine

- `consecutive`: Hier werden die Primzahlen in aufsteigender Reihenfolge gelistet
- `alone`: Hier werden entdeckte Primzahlen gespeichert, die aber noch zu groß für "consecutive" sind

## Tech-Stack

- deno / prisma / sqlite
- Async Generator Pattern
- dynlib für `openssl prime` resp. `BN_check_prime` zum Verifizieren

## benchmarks (smell: `O(n log n)`, but actually: `O(n log log n)`)

- 1e6: 1s
- 1e7: 16s
- 1e8: 03:33 (ensure: 18s, index: 25s, crossing: 02:07, backup: 00:43)
- 1e9: (ensure: 185s, index: 477s, crossing: 20.5h with heavy swapping, backup 7.5min) deno process takes 8.5GB RAM
- 1e9: total: 25 Stunden

Remarks:

- Linux in a 16G RAM Machine starts paging heavily! (~40G Ram needed)
- see pragmas in lib/erareponative.ts
