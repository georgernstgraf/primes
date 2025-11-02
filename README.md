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

## benchmarks (smell: `O(n log n)`)

- 1e6: 00:01
- 1e7: 16:00
- 1e8: xxxx (ensure: 00:18, index: 00:25)
