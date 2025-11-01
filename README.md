# Primes

Ein Primzahl Generator mit Datenbankunterstützung, 2 verschiedene Implementierungen

## Implementierung Sieb des Eratosthenes

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
