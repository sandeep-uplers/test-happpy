import React from 'react';
export default function Progresser({ totalStep, activeStep,progressorStyle }) {
    return (
        <div className='progresser' style={progressorStyle}>
            {[...Array(totalStep)].map((_, index) => (
                <div className={`progresserStep ${activeStep >= index + 1 ? activeStep == index + 1 ? 'active' : 'completed' : ''}`} key={'progresserStep' + index}></div>
            ))}
            {/* <div className='label'>Step {activeStep} of {totalStep}</div> */}
        </div>
    )
}