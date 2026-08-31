import { useState, useEffect } from "react";

export default function DownloadResumeLoader() {
    const [activeStep, setActiveStep] = useState(0);
    const steps = [
        "Preparing your resume file",
        "Finalizing structure and format",
        "Creating downloadable file",
        "Initiating download",
    ];
    const isComplete = activeStep > steps.length - 1;

    useEffect(() => {
        setActiveStep(0);
    }, []);
  
    useEffect(() => {
      if (isComplete) return;
      const timer = setInterval(() => {
        setActiveStep((prev) => prev + 1);
      }, 5000);
      return () => clearInterval(timer);
    }, [isComplete]);
  
    const progress = isComplete ? 100 : (activeStep / steps.length) * 100;
  
    return (
        <div className="download-resume-loader">
            {/* Animated icon */}
            <div className="icon-container">
                <div className="icon-wrapper">
                    <div className="icon-circle">
                        {activeStep == 0 && <Step1Icon />}
                        {activeStep == 1 && <Step2Icon />}
                        {activeStep == 2 && <Step3Icon />}
                        {(activeStep == 3 || isComplete) && <Step4Icon />}
                    </div>

                    {!isComplete && (
                        <svg className="progress-ring" viewBox="0 0 56 56">
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                className="progress-bg"
                            />
                            <circle
                                cx="28"
                                cy="28"
                                r="24"
                                className="progress-bar"
                                strokeDasharray={2 * Math.PI * 24}
                                strokeDashoffset={
                                    2 * Math.PI * 24 * (1 - progress / 100)
                                }
                            />
                        </svg>
                    )}
                </div>
            </div>

            {/* Label */}
            <div className="label">
                <p className="label-text" key={activeStep}>
                    {isComplete ? steps[steps.length - 1] : steps[activeStep]}
                </p>
            </div>

            {/* Step dots */}
            <div className="dots">
                {steps.map((_, i) => (
                    <div
                        key={i}
                        className={`dot ${
                            i < activeStep
                                ? "dot-done"
                                : i === activeStep
                                    ? "dot-active"
                                    : "dot-inactive"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
};
  
const Step1Icon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M4.268 21a2 2 0 0 0 1.727 1H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" />
          <path d="m9 18-1.5-1.5" />
          <circle cx="5" cy="14" r="3" />
        </svg>
    )
}

const Step2Icon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="m21 2-9.3 9.3" />
          <path d="m18.5 5.5 3 3" />
        </svg>
    )
}

const Step3Icon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M13 6h3a2 2 0 0 1 2 2v7" />
              <path d="M11 18H8a2 2 0 0 1-2-2V9" />
        </svg>
    )
}

const Step4Icon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
        </svg>
    )
}