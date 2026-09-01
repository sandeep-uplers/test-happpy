import { useSelector } from "react-redux";
import ResumePreviewer from "./ResumePreviewer";

export default function ResumePreviewerGhost() {
    const { tailor_json, config_json, sorting_json, generic_sections } = useSelector(state => state.resumeEditor);

    return (
        <>
            <ResumePreviewer
                templateConfig={config_json}
                resumeJson={tailor_json}
                sortingOrder={sorting_json}
                genericSections={generic_sections}
                hidden={true}
            />
        </>
    )
}