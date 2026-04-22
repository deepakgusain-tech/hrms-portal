import Link from "next/link";

import DepartmentForm from "@/components/department/department-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DepartmentCreatePage = async () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add Department</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/department">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <DepartmentForm update={false} />
      </CardContent>
    </Card>
  );
};

export default DepartmentCreatePage;
