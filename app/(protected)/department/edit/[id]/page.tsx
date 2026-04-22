import Link from "next/link";
import { notFound } from "next/navigation";

import DepartmentForm from "@/components/department/department-form";
import { getDepartmentById } from "@/lib/actions/department";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DepartmentEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const res = await getDepartmentById(id);

  if (!res?.success || !res.data) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Department</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/department">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <DepartmentForm data={res.data} update={true} />
      </CardContent>
    </Card>
  );
};

export default DepartmentEditPage;
