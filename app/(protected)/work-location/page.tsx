import { Button } from "@/components/ui/button";
import { getWorkLocations } from "@/lib/actions/work-location";
import Link from "next/link";
import WorkLocationDataTable from "./work-location-data-table";

const WorkLocationPage = async () => {
  const workLocations = await getWorkLocations();

  const canCreate = true;
  const canEdit = true;
  const canDelete = true;

  return (
    <WorkLocationDataTable
      data={workLocations}
      canEdit={canEdit}
      canDelete={canDelete}
      title="Work Location"
      actions={
        canCreate && (
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Link href="/work-location/create">Add Work Location</Link>
          </Button>
        )
      }
    />
  );
};

export default WorkLocationPage;
