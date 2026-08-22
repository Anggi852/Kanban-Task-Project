-- AlterTable
-- Track the user's manually-set priority separately from the effective
-- `priority`, which may be auto-raised as the deadline approaches.
ALTER TABLE "tasks" ADD COLUMN "basePriority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM';

-- Backfill: existing tasks' current priority becomes their manual baseline.
UPDATE "tasks" SET "basePriority" = "priority";
