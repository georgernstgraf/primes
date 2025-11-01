/*
  Warnings:

  - The primary key for the `alone` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `alone` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `consecutive` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `consecutive` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_alone" (
    "id" BIGINT NOT NULL PRIMARY KEY
);
INSERT INTO "new_alone" ("id") SELECT "id" FROM "alone";
DROP TABLE "alone";
ALTER TABLE "new_alone" RENAME TO "alone";
CREATE TABLE "new_consecutive" (
    "id" BIGINT NOT NULL PRIMARY KEY
);
INSERT INTO "new_consecutive" ("id") SELECT "id" FROM "consecutive";
DROP TABLE "consecutive";
ALTER TABLE "new_consecutive" RENAME TO "consecutive";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
