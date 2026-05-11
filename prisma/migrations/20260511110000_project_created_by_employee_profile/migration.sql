ALTER TABLE "Project" DROP CONSTRAINT IF EXISTS "Project_createdById_fkey";

UPDATE "Project" AS project
SET "createdById" = employee.id
FROM "User" AS app_user
JOIN "EmployeeProfile" AS employee
  ON lower(employee.email) = lower(app_user.email)
WHERE project."createdById" = app_user.id;

UPDATE "Project" AS project
SET "createdById" = (
  SELECT employee.id
  FROM "EmployeeProfile" AS employee
  ORDER BY employee."createdAt" ASC
  LIMIT 1
)
WHERE NOT EXISTS (
  SELECT 1
  FROM "EmployeeProfile" AS employee
  WHERE employee.id = project."createdById"
)
AND EXISTS (
  SELECT 1
  FROM "EmployeeProfile"
);

ALTER TABLE "Project"
ADD CONSTRAINT "Project_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "EmployeeProfile"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
