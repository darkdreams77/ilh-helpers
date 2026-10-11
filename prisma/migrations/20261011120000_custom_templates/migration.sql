-- CreateEnum
CREATE TYPE "TemplateKind" AS ENUM ('LINKS', 'RP', 'SIGNATURE');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED');

-- CreateTable
CREATE TABLE "custom_templates" (
    "id" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "fields" JSONB NOT NULL,
    "html" TEXT NOT NULL,
    "css" TEXT NOT NULL DEFAULT '',
    "kind" "TemplateKind" NOT NULL DEFAULT 'LINKS',
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "custom_templates_author_id_idx" ON "custom_templates"("author_id");

-- CreateIndex
CREATE INDEX "custom_templates_status_idx" ON "custom_templates"("status");

-- AddForeignKey
ALTER TABLE "custom_templates" ADD CONSTRAINT "custom_templates_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
