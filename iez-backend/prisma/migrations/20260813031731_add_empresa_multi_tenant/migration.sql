-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Documento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "formato" TEXT NOT NULL,
    "tamanho" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL DEFAULT 'PARTNER',
    "visibilidade" TEXT NOT NULL DEFAULT 'PUBLICA',
    "empresaDestino" TEXT,
    "dataAtualizacao" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Documento" ("accessLevel", "categoria", "createdAt", "dataAtualizacao", "descricao", "formato", "id", "tamanho", "titulo") SELECT "accessLevel", "categoria", "createdAt", "dataAtualizacao", "descricao", "formato", "id", "tamanho", "titulo" FROM "Documento";
DROP TABLE "Documento";
ALTER TABLE "new_Documento" RENAME TO "Documento";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTNER',
    "empresa" TEXT NOT NULL DEFAULT 'N/A',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "id", "nome", "role", "senha") SELECT "createdAt", "email", "id", "nome", "role", "senha" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
