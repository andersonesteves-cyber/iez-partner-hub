/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Documento` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accessLevel` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `dataAtualizacao` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `empresaDestino` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `formato` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `tamanho` on the `Documento` table. All the data in the column will be lost.
  - You are about to drop the column `visibilidade` on the `Documento` table. All the data in the column will be lost.
  - Added the required column `arquivoUrl` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atualizadoEm` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nivelAcesso` to the `Documento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regraVisibilidade` to the `Documento` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Documento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "nivelAcesso" TEXT NOT NULL,
    "regraVisibilidade" TEXT NOT NULL,
    "empresa" TEXT,
    "descricao" TEXT,
    "arquivoUrl" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" DATETIME NOT NULL
);
INSERT INTO "new_Documento" ("categoria", "descricao", "id", "titulo") SELECT "categoria", "descricao", "id", "titulo" FROM "Documento";
DROP TABLE "Documento";
ALTER TABLE "new_Documento" RENAME TO "Documento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
