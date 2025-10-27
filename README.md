# Primes

## Ein neuer Primzahl Generator mit Datenbankunterstützung

Es gibt 2 Tabellen, eine

- `consecutive`: Hier werden die Primzahlen in aufsteigender Reihenfolge gelistet
- `alone`: Hier werden entdeckte Primzahlen gespeichert, die aber noch zu groß für "consecutive" sind

## Tech-Stack

- deno / prisma / sqlite
- Async Generator Pattern
- dynlib für `openssl prime` resp. `BN_check_prime` zum Verifizieren
