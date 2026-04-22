import WorkLocationForm from "@/components/work-location/work-location-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkLocationById } from "@/lib/actions/work-location";
import { WorkLocation } from "@/types";
import Link from "next/link";
import { notFound } from "next/navigation";

const WorkLocationEditPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const location = await getWorkLocationById(id);

  if (!location.success || !location.data) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Work Location</CardTitle>
          <Button className="bg-blue-500 hover:bg-blue-600" asChild>
            <Link href="/work-location">Back</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <WorkLocationForm data={location.data as WorkLocation} update={true} />
      </CardContent>
    </Card>
  );
};

export default WorkLocationEditPage;
