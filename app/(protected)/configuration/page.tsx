import ConfigurationForm from "./configuration-form";
import { getConfiguration } from "@/lib/actions/configuration";


const ConfigurationPage = async () => {
    const configuration = await getConfiguration();

    return (
        <ConfigurationForm data={configuration || undefined} />
    );
};

export default ConfigurationPage;
