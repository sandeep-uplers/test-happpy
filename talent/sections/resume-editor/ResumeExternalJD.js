import JDEditor from "../../components/JDEditor";
import MatchLoader from "../../pages/app/resume/payment/MatchLoader";

export default function ResumeExternalJD({ jobDescription, setJobDescription, matchLoader }) {
    return (
        <div className="trd-drawer-external-jd">
            {matchLoader ? (
                <div className="match-loader-container">
                    <div className="match-loader">
                        <MatchLoader />
                    </div>
                </div>
            ) : (
            <>
            <h2>Target Job Description</h2>
            <div className="external-jd-input">
                <JDEditor
                    placeholder="Paste your job description with job title and years of experience required here..."
                    onChange={(value) => setJobDescription({ value: value, error: '' })}
                    value={jobDescription.value}
                />
                {jobDescription.error && <span className="error">{jobDescription.error}</span>}
            </div>
            </>
            )}
        </div>
    )
}