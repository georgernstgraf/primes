-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_numbers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isprime" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_numbers" ("id", "isprime") SELECT "id", "isprime" FROM "numbers";
DROP TABLE "numbers";
ALTER TABLE "new_numbers" RENAME TO "numbers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
