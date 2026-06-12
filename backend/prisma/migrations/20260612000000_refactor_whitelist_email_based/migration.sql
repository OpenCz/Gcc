-- Vider la table avant de modifier la structure (données de dev, pas de prod)
TRUNCATE TABLE "Whitelist";

-- Supprimer la contrainte de clé étrangère et la colonne userId
ALTER TABLE "Whitelist" DROP CONSTRAINT "Whitelist_userId_fkey";
DROP INDEX "Whitelist_userId_key";
ALTER TABLE "Whitelist" DROP COLUMN "userId";

-- Ajouter les nouvelles colonnes
ALTER TABLE "Whitelist" ADD COLUMN "email" TEXT NOT NULL;
ALTER TABLE "Whitelist" ADD COLUMN "role" "Role" NOT NULL;

-- Index unique sur email
CREATE UNIQUE INDEX "Whitelist_email_key" ON "Whitelist"("email");
