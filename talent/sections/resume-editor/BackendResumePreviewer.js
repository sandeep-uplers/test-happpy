import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "@/talent/navigation/routerCompat";
import Error from "../../pages/access-public/Error";
import { checkResumeMatchWithJobForBackend } from "../../store/actions/resumeActions";
import ResumePreviewer from "./ResumePreviewer";
const genericSections = ["interests", "hobbies", "activities", "communication_languages"];

export default function BackendResumePreviewer() {

    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const tailored_resume_id = searchParams.get('tr_id');
    const enc_t_id = searchParams.get('t_id');

    if(!tailored_resume_id || !enc_t_id) {
        return <div><Error /></div>;
    }
    const [error, setError] = useState(null);
    useEffect(() => {
        getTailoredResumeData()
    }, [tailored_resume_id]);

    const [tailoredResumeData, setTailoredResumeData] = useState(null)

    const getTailoredResumeData = () => {
        let payload = {
            tailored_resume_id: tailored_resume_id,
            t_id: enc_t_id
        }
        checkResumeMatchWithJobForBackend(payload)(dispatch)
            .then((res) => {
                if (res?.data?.status == 200) {
                    setTailoredResumeData(res.data.data);
                    window.__RESUME_READY__ = true;
                }
            })
            .catch((err) => {
                setError(true);
            })
    }


    return (
        <div>
            {error && <Error />}
            {tailoredResumeData &&
                <ResumePreviewer
                    templateConfig={tailoredResumeData.config_json}
                    resumeJson={tailoredResumeData.tailor_json}
                    sortingOrder={tailoredResumeData.sorting_json}
                    genericSections={genericSections}
                    raPreview={true}
                />
            }
        </div>
    )
}