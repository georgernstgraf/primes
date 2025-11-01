/*
  Warnings:

  - The primary key for the `numbers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isprime` on the `numbers` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `numbers` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_numbers" (
    "id" BIGINT NOT NULL PRIMARY KEY
);
INSERT INTO "new_numbers" ("id") SELECT "id" FROM "numbers";
DROP TABLE "numbers";
ALTER TABLE "new_numbers" RENAME TO "numbers";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
