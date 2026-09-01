import React from 'react';
export default function ProgressBar({ value, width, height }) {
    return (
        <div className='progressBarDiv' style={{ width: width ?? 'calc(100% - 2.625rem)' }}>
            <div className='progressBar' style={{ height: `${height}px`, width: '100%' }}>
                <div className='progress' style={{
                    width: `${value}%`,
                    backgroundColor: "#32936F"
                }}>
                    <div className='progressValue'>{value}%</div>
                </div>
            </div>
            {/* {(!noValue || signupApplyFlow) && <div className='value'>&nbsp;&nbsp;{value}%</div>} */}
        </div>
    )
}