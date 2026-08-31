import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { IMAGE_URL } from '../../../components/Constant';
import { IosLoader } from '../../../components/SectionLoader';

export const ContentAnalysisSection = ({ report_details, transform_eligible, handleTransformSubmit, transformResumeLoader }) => {
    return (
        <div className='section-content'>
            <div className='sub-section-wrapper' id='section-ats_parse_rate'>
                <div className='sub-section-header'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11.667 2.60938C15.7462 2.60954 19.0586 5.92168 19.0586 10.001C19.0584 14.0801 15.7461 17.3924 11.667 17.3926C9.7943 17.3926 8.08266 16.6943 6.7793 15.5439H6.77832C6.4791 15.2792 6.45021 14.8213 6.71484 14.5215C6.97966 14.2209 7.43858 14.1926 7.73828 14.457C8.78576 15.3807 10.1615 15.9424 11.667 15.9424C14.9457 15.9422 17.6082 13.2797 17.6084 10.001C17.6084 6.72214 14.9458 4.05876 11.667 4.05859C10.2555 4.05859 8.95818 4.55213 7.93848 5.375L7.73828 5.54395C7.43863 5.80853 6.97973 5.78097 6.71484 5.48047C6.44983 5.18064 6.47883 4.72183 6.77832 4.45703H6.7793C8.08264 3.30675 9.79438 2.60938 11.667 2.60938Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                        <path d="M11.334 5.60938C11.7342 5.60938 12.0586 5.93376 12.0586 6.33398V9.36719L14.5127 11.8213C14.7961 12.1037 14.7961 12.5643 14.5127 12.8467C14.2303 13.1295 13.7706 13.1296 13.4883 12.8467L10.8213 10.1797C10.685 10.0441 10.6094 9.85908 10.6094 9.66699V6.33398C10.6094 5.93376 10.9338 5.60938 11.334 5.60938Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                        <path d="M6.66699 6.35938C7.06722 6.35938 7.3916 6.68376 7.3916 7.08398C7.3916 7.48421 7.06722 7.80859 6.66699 7.80859H1.66699C1.26676 7.80859 0.942383 7.48421 0.942383 7.08398C0.942383 6.68376 1.26676 6.35938 1.66699 6.35938H6.66699Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                        <path d="M7.5 9.27539C7.90023 9.27539 8.22461 9.59977 8.22461 10C8.22461 10.4002 7.90023 10.7246 7.5 10.7246H2.5C2.09977 10.7246 1.77539 10.4002 1.77539 10C1.77539 9.59977 2.09977 9.27539 2.5 9.27539H7.5Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                        <path d="M8.33398 12.1934C8.73421 12.1934 9.05859 12.5177 9.05859 12.918C9.05859 13.3182 8.73421 13.6426 8.33398 13.6426H3.33398C2.93376 13.6426 2.60938 13.3182 2.60938 12.918C2.60938 12.5177 2.93376 12.1934 3.33398 12.1934H8.33398Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                    </svg>
                    <span>ATS Parse Rate</span>
                </div>
                <div className='sub-section-info'>
                    <h6>What is ATS Compatibility?</h6>
                    ATS (Applicant Tracking Systems) are used by almost every product company to scan, parse, and filter resumes. If your resume is not ATS-compatible, recruiters may never even see your profile - no matter how strong your skills are.
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.content?.ats_parse_rate?.status == 'GOOD' && (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.content?.ats_parse_rate?.message}</span>
                            </div>
                        </div>
                    )}
                    {report_details?.sections?.content?.ats_parse_rate?.status == 'BAD' && (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.content?.ats_parse_rate?.message}</span>
                            </div>
                            {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                        </div>
                    )}
                    {report_details?.sections?.content?.ats_parse_rate?.status == 'MODERATE' && (
                        <div className="sub-section recommendations">
                            <span>
                                <img src={IMAGE_URL + "fi_rocket.svg"} />
                                <h6>Suggested Rewrite</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.content?.ats_parse_rate?.message}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className='sub-section-wrapper' id='section-quantify_impact'>
                <div className='sub-section-header'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_18860_140373)">
                            <path d="M17.5146 7.31543C17.7873 7.31543 18.0078 7.53702 18.0078 7.80957V19.2139H19.7061C19.9786 19.2139 20.2 19.4347 20.2002 19.707C20.2002 19.9796 19.9787 20.2012 19.7061 20.2012H0.293945C0.0213221 20.2012 -0.200195 19.9796 -0.200195 19.707C-0.200006 19.4346 0.0214399 19.2139 0.293945 19.2139H1.99219V12.8193C1.99219 12.5468 2.21273 12.3252 2.48535 12.3252H5.61621C5.88883 12.3252 6.11035 12.5468 6.11035 12.8193V19.2139H7.94043V11.2529C7.94068 10.9806 8.1621 10.7598 8.43457 10.7598H11.5654C11.8379 10.7598 12.0593 10.9806 12.0596 11.2529V19.2139H13.8896V7.80957C13.8896 7.53702 14.1112 7.31543 14.3838 7.31543H17.5146ZM14.877 19.2139H17.0215V8.30273H14.877V19.2139ZM8.92773 19.2139H11.0723V11.7471H8.92773V19.2139ZM2.97852 19.2139H5.12305V13.3125H2.97852V19.2139Z" fill="#231F20" stroke="#231F20" stroke-width="0.4" />
                            <path d="M18.3281 -0.0917969C18.6182 -0.128152 18.9097 -0.0381139 19.1289 0.155273C19.3481 0.348755 19.4746 0.627588 19.4746 0.919922V3.4248C19.4746 3.98714 19.0164 4.44434 18.4541 4.44434C17.983 4.4442 17.5863 4.12322 17.4697 3.68848C16.5079 4.76746 15.449 5.7573 14.3096 6.63672C14.1376 6.7692 13.8905 6.73741 13.7578 6.56543C13.6252 6.39336 13.6572 6.14643 13.8291 6.01367C15.1888 4.9643 16.4319 3.75352 17.5234 2.41602C17.6289 2.28715 17.8109 2.23824 17.9668 2.29688C18.1178 2.35393 18.2216 2.50355 18.2217 2.66504V3.4248C18.2218 3.55288 18.326 3.65708 18.4541 3.65723C18.5823 3.65723 18.6874 3.55294 18.6875 3.4248V0.919922C18.6875 0.783099 18.5613 0.671396 18.4258 0.688477L15.9209 1.00195C15.7843 1.01906 15.6899 1.15853 15.7246 1.29199C15.7535 1.40232 15.8649 1.47788 15.9785 1.46387L16.9199 1.3457C17.2649 1.30247 17.4936 1.71187 17.2754 1.9834C14.0092 6.04724 9.98619 8.09633 7.1875 9.09961C3.85836 10.293 1.27534 10.3919 1.22656 10.3936C1.09856 10.3976 0.997355 10.505 1.00098 10.6328C1.00481 10.7596 1.10598 10.8582 1.23242 10.8584H1.24023C1.34095 10.8554 3.89806 10.7658 7.2998 9.55371C9.21369 8.87171 11.0134 7.96659 12.6494 6.86426C12.8296 6.74287 13.0748 6.79041 13.1963 6.9707C13.3178 7.15092 13.2701 7.39616 13.0898 7.51758C11.3987 8.65701 9.53898 9.59096 7.56348 10.2949C4.05006 11.5468 1.38167 11.641 1.26367 11.6445L1.26465 11.6455C1.25376 11.6459 1.24255 11.6455 1.23242 11.6455C0.678393 11.6453 0.230714 11.2112 0.213867 10.6572C0.196889 10.0957 0.639735 9.62508 1.20117 9.60742L1.20312 9.60645C1.20458 9.60639 1.2073 9.60656 1.20996 9.60645C1.21523 9.60621 1.22274 9.60596 1.23242 9.60547C1.25245 9.60444 1.2822 9.60307 1.32031 9.60059C1.39653 9.59561 1.50819 9.58684 1.65137 9.57324C1.93801 9.54602 2.35184 9.49816 2.86523 9.41406C3.8927 9.24574 5.31849 8.93321 6.92188 8.3584C9.44621 7.45347 12.9968 5.66918 16.0205 2.24902C15.484 2.28686 15.0049 1.89868 14.9375 1.35938C14.8684 0.806762 15.2712 0.289696 15.8232 0.220703L18.3281 -0.0917969Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                        </g>
                        <defs>
                            <clipPath id="clip0_18860_140373">
                                <rect width="20" height="20" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                    <span>Quantify Impact</span>
                </div>
                <div className='sub-section-info'>
                    <h6>What is Quantification?</h6>
                    <text>Quantification means backing your experiences with measurable outcomes that signal your impact in both current and past roles.</text>
                    <br />
                    <text>Today, recruiters and hiring managers judge resumes primarily on impact, not tasks.</text>
                    <br />
                    <br />
                    <strong>
                        Your resume should cover 4 of these important parameters as possible:
                    </strong>
                    <br />
                    <ul>
                        <li>Technical / Execution Impact (Scope of Work)</li>
                        <li>Business Impact</li>
                        <li>Collaboration / Leadership</li>
                    </ul>
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.content?.quantify_impact?.check ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.content?.quantify_impact?.message}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                {(report_details?.sections?.content?.quantify_impact?.examples && report_details?.sections?.content?.quantify_impact?.examples?.length > 0) ?
                                    <span className='bullet gray'>{report_details?.sections?.content?.quantify_impact?.message}</span>
                                    :
                                    <span className='bullet'>{report_details?.sections?.content?.quantify_impact?.message}</span>
                                }
                                {report_details?.sections?.content?.quantify_impact?.examples?.map((example, i) => (
                                    <span className='bullet' key={'quantify_impact_example_' + i}>{example}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {transform_eligible && report_details?.sections?.content?.quantify_impact?.rewritten_suggestions?.length > 0 && (
                        <div className="sub-section recommendations quantify">
                            <span>
                                <img src={IMAGE_URL + "fi_rocket.svg"} />
                                <h6>Suggested Rewrite</h6>
                            </span>
                            <div className="bullet-list">
                                {report_details?.sections?.content?.quantify_impact?.rewritten_suggestions?.map((suggestion, i) => (
                                    <span className='bullet' key={'quantify_impact_suggestion_' + i}>
                                        {suggestion} Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium
                                    </span>
                                ))}
                            </div>
                            <div className='overlay'>
                                <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} quanitifySection={true} transformResumeLoader={transformResumeLoader} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className='sub-section-wrapper' id='section-skill_experience_mapping'>
                <div className='sub-section-header'>
                    <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.5 0.349609C11.4684 0.349609 13.0703 1.95155 13.0703 3.91992C13.0703 4.62353 12.8568 5.30199 12.4756 5.87891C12.8315 6.10786 13.0703 6.50455 13.0703 6.95996C13.0703 7.67125 12.4915 8.24987 11.7803 8.25H11.5742C11.705 11.6477 13.0384 13.5144 14.1455 14.0889C14.8222 14.4389 15.2465 14.8787 15.334 15.4102C15.349 15.5017 15.348 15.587 15.3428 15.666C15.7926 15.8667 16.1103 16.3136 16.1104 16.8398C16.1104 17.1263 16.0136 17.3874 15.8564 17.5996C16.0138 17.8119 16.1104 18.0737 16.1104 18.3604C16.1102 19.0715 15.5314 19.6502 14.8203 19.6504H4.17969C3.4686 19.6502 2.88984 19.0714 2.88965 18.3604C2.88965 18.0739 2.98547 17.8118 3.14258 17.5996C2.9857 17.3875 2.88965 17.126 2.88965 16.8398C2.88971 16.3139 3.20688 15.8669 3.65625 15.666C3.65099 15.587 3.65107 15.5017 3.66602 15.4102C3.75345 14.8786 4.17675 14.4389 4.85352 14.0889C5.96081 13.515 7.29501 11.6486 7.42578 8.25H7.21973C6.50852 8.24981 5.92969 7.67121 5.92969 6.95996C5.9297 6.50488 6.16796 6.10794 6.52344 5.87891C6.14243 5.30208 5.92969 4.62333 5.92969 3.91992C5.92973 1.95158 7.53165 0.349651 9.5 0.349609ZM4.17969 18.1299C4.05294 18.1301 3.9502 18.2336 3.9502 18.3604C3.95039 18.487 4.05306 18.5896 4.17969 18.5898H14.8203C14.947 18.5897 15.0496 18.487 15.0498 18.3604C15.0498 18.2335 14.9471 18.13 14.8203 18.1299H4.17969ZM4.17969 16.6104C4.05299 16.6106 3.95028 16.7131 3.9502 16.8398C3.9502 16.9666 4.05294 17.0701 4.17969 17.0703H14.8203C14.9471 17.0702 15.0498 16.9667 15.0498 16.8398C15.0497 16.7131 14.9471 16.6105 14.8203 16.6104H4.17969ZM8.5 8.25C8.36937 12.0682 6.83254 14.2574 5.34082 15.0303C4.86867 15.275 4.75316 15.4687 4.72363 15.5498H14.2764C14.2469 15.4687 14.1314 15.275 13.6592 15.0303C12.1675 14.2574 10.6306 12.0682 10.5 8.25H8.5ZM7.21973 6.73047C7.09299 6.73066 6.99026 6.83317 6.99023 6.95996C6.99023 7.08674 7.09299 7.19024 7.21973 7.19043H11.7803C11.9071 7.19032 12.0098 7.0868 12.0098 6.95996C12.0097 6.83314 11.9071 6.73058 11.7803 6.73047H7.21973ZM9.5 1.41016C8.11612 1.4102 6.99028 2.53604 6.99023 3.91992C6.99023 4.57475 7.2501 5.20253 7.70703 5.66992H11.293C11.7499 5.20253 12.0098 4.57479 12.0098 3.91992C12.0097 2.53602 10.8839 1.41016 9.5 1.41016Z" fill="#231F20" stroke="#231F20" stroke-width="0.3" />
                    </svg>
                    <span>Skills to Experience Support</span>
                </div>
                <div className='sub-section-info'>
                    <h6>What is Skills to Experience Support?</h6>
                    <text>Skills listed should be reflected in experience or project sections. If not supported, they may appear as keyword stuffing rather than genuine expertise.</text>
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.content?.skill_experience_mapping?.check ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.content?.skill_experience_mapping?.message}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.content?.skill_experience_mapping?.message}</span>
                                {report_details?.sections?.content?.skill_experience_mapping?.unjustified_skills?.length > 0 && (
                                    <span className='bullet skills'>
                                        <h6>Unjustified Skills :</h6>
                                        <ul>
                                            {report_details?.sections?.content?.skill_experience_mapping?.unjustified_skills?.map((skill, i) => (
                                                <li key={'unjustified_skill_' + i}>{i + 1}. {skill}&nbsp;</li>
                                            ))}
                                        </ul>
                                    </span>
                                )}
                            </div>
                            {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                        </div>
                    )}
                </div>
            </div>
            <div className='sub-section-wrapper' id='section-repetition'>
                <div className='sub-section-header'>
                    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.50684 1.00586C9.87133 0.641364 10.4617 0.641364 10.8262 1.00586C11.1906 1.37036 11.1906 1.96073 10.8262 2.3252L9.91992 3.23242H14.3428C18.0787 3.23778 21.0994 6.26196 21.0996 9.99902C21.0996 11.6868 20.425 13.276 19.25 14.4521C18.8856 14.8168 18.2944 14.8175 17.9297 14.4531C17.5652 14.0888 17.5654 13.4974 17.9297 13.1328C18.7594 12.3023 19.2334 11.1855 19.2334 9.99902C19.2332 7.28956 17.0425 5.09967 14.333 5.09961C14.3272 5.09961 14.3218 5.09867 14.3213 5.09863H9.91992L10.8262 6.00586C11.1906 6.37035 11.1906 6.96071 10.8262 7.3252C10.4617 7.68968 9.87133 7.68967 9.50684 7.3252L7.00684 4.8252C6.98491 4.80327 6.96367 4.78042 6.94434 4.75684C6.93489 4.74532 6.92289 4.72759 6.91992 4.72363C6.9131 4.71454 6.90083 4.69884 6.89062 4.68359C6.88084 4.66898 6.87056 4.65248 6.86523 4.64355C6.86044 4.63559 6.85048 4.61986 6.84277 4.60547C6.83472 4.5904 6.82784 4.57328 6.82324 4.56348L6.80371 4.52246C6.7975 4.50738 6.79229 4.48948 6.78906 4.48047C6.7856 4.47077 6.77844 4.45298 6.77344 4.43652C6.76879 4.42127 6.76482 4.40304 6.7627 4.39453L6.75098 4.34766C6.74742 4.32972 6.74472 4.30967 6.74316 4.29883C6.74241 4.29358 6.73878 4.2727 6.7373 4.25781C6.73435 4.22772 6.73344 4.19652 6.7334 4.16602V4.16504L6.7373 4.07324L6.74316 4.03223C6.74477 4.02085 6.74741 4.00138 6.75098 3.9834C6.75442 3.96593 6.76019 3.94645 6.7627 3.93652C6.76488 3.9278 6.76887 3.90967 6.77344 3.89453C6.77854 3.87774 6.7853 3.86004 6.78906 3.84961C6.79227 3.84063 6.79758 3.82346 6.80371 3.80859C6.80999 3.7935 6.81931 3.77594 6.82324 3.76758C6.82783 3.7578 6.83474 3.74068 6.84277 3.72559H6.84375C6.85138 3.71136 6.8608 3.69491 6.86523 3.6875C6.87064 3.67839 6.88081 3.66212 6.89062 3.64746C6.90089 3.63209 6.91308 3.61556 6.91992 3.60645C6.92346 3.60169 6.93525 3.58533 6.94434 3.57422C6.96363 3.55072 6.98491 3.52778 7.00684 3.50586L9.50684 1.00586Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                        <path d="M2.75 5.54492C3.11436 5.18026 3.70564 5.17958 4.07031 5.54395C4.43486 5.90831 4.43464 6.49963 4.07031 6.86426C3.24053 7.69481 2.7666 8.81147 2.7666 9.99805C2.76664 12.7077 4.95737 14.8984 7.66699 14.8984H12.0801L11.1738 13.9922C10.8093 13.6277 10.8093 13.0364 11.1738 12.6719C11.5383 12.3076 12.1287 12.3075 12.4932 12.6719L14.9941 15.1729C15.0156 15.1944 15.0366 15.217 15.0557 15.2402L15.0801 15.2734C15.0868 15.2824 15.0992 15.2983 15.1094 15.3135C15.1192 15.3282 15.1293 15.3454 15.1348 15.3545C15.1392 15.3619 15.1488 15.3777 15.1562 15.3916C15.1646 15.4072 15.1723 15.425 15.1768 15.4346C15.1809 15.4432 15.189 15.4595 15.1953 15.4746C15.2016 15.4897 15.2078 15.5078 15.2109 15.5166C15.2144 15.5261 15.2215 15.5439 15.2266 15.5605L15.2373 15.6035C15.2399 15.6138 15.2456 15.6322 15.249 15.6494C15.2526 15.6675 15.2552 15.688 15.2568 15.6992C15.2578 15.7054 15.2603 15.7256 15.2617 15.7402C15.2677 15.8013 15.2677 15.8628 15.2617 15.9238C15.2603 15.9382 15.2575 15.9604 15.2568 15.9648H15.2559C15.2543 15.9757 15.2525 15.9959 15.249 16.0137V16.0146C15.2456 16.0319 15.2399 16.0504 15.2373 16.0605C15.2351 16.0692 15.2312 16.0872 15.2266 16.1025C15.2215 16.1192 15.2145 16.1375 15.2109 16.1475C15.2075 16.157 15.2015 16.1735 15.1953 16.1885L15.1768 16.2295C15.1722 16.2392 15.1644 16.2562 15.1562 16.2715C15.1486 16.2857 15.1393 16.302 15.1348 16.3096C15.1294 16.3185 15.1191 16.335 15.1094 16.3496V16.3506C15.0992 16.3657 15.0868 16.3817 15.0801 16.3906C15.0763 16.3957 15.065 16.4125 15.0557 16.4238H15.0547C15.0356 16.447 15.0156 16.4697 14.9941 16.4912L12.4932 18.9922C12.1288 19.3564 11.5383 19.3562 11.1738 18.9922C10.8093 18.6277 10.8093 18.0364 11.1738 17.6719L12.0801 16.7656H7.66699C7.6612 16.7656 7.6555 16.7647 7.6543 16.7646H7.65625V16.7637C3.92064 16.7579 0.900475 13.735 0.900391 9.99805C0.900391 8.31014 1.57483 6.721 2.75 5.54492Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                    </svg>
                    <span>Repetition</span>
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.content?.repetition?.check ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.content?.repetition?.message}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.content?.repetition?.message}</span>
                                {report_details?.sections?.content?.repetition?.repeated_phrases?.length > 0 && (
                                    <span className={`bullet phrases`}>
                                        <h6>Repeated Phrases :</h6>
                                        <ul>
                                            {report_details?.sections?.content?.repetition?.repeated_phrases?.map(([word, info], i) => (
                                                <li key={'repeated_phrase_' + i}>
                                                    {i + 1}. <b>"{word}"</b> - {info?.count} times. &nbsp;
                                                    {info?.alternatives && (<><b>Try using:</b> {info.alternatives?.join(', ')}</>)}
                                                </li>
                                            ))}
                                        </ul>
                                    </span>
                                )}
                            </div>
                            {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                        </div>
                    )}
                </div>
            </div>

            <div className='sub-section-wrapper' id='section-spelling_grammar'>
                <div className='sub-section-header'>
                    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.8447 2.10645C11.062 1.79611 11.4907 1.72145 11.8008 1.93848L13.7197 3.28223C14.0302 3.49948 14.1057 3.92819 13.8887 4.23828L12.3848 6.38379L16.3945 8.3457H20.4141C20.7926 8.3457 21.0994 8.65258 21.0996 9.03125V16.0635C21.0995 16.3233 20.9529 16.5605 20.7207 16.6768L18.377 17.8486C18.1641 17.9551 17.9118 17.9429 17.71 17.8184C17.5079 17.6934 17.3839 17.473 17.3838 17.2354V15.9746C16.3056 16.4796 15.1036 16.749 13.8906 16.749C12.7159 16.749 11.541 16.4864 10.4746 15.9932V16.0635C10.4744 17.0876 9.64149 17.9207 8.61719 17.9209C8.17255 17.9209 7.76444 17.7623 7.44434 17.501C7.12455 17.7619 6.71773 17.9208 6.27344 17.9209C5.60858 17.9209 5.02449 17.5697 4.69629 17.0439L2.61035 18.1748C2.38211 18.2983 2.10365 18.2829 1.89062 18.1338C1.67779 17.9849 1.56763 17.7285 1.60547 17.4717L1.99023 14.8789C2.00595 14.7738 2.04538 14.6733 2.10645 14.5859L2.2793 14.3398C2.15759 14.3083 2.03922 14.2652 1.92676 14.209C1.48298 13.987 1.151 13.6053 0.994141 13.1348C0.81673 12.602 0.904888 12.0094 1.12988 11.6553L4.33008 6.62305C4.52971 6.30881 4.81583 6.06448 5.15723 5.91602L7.38672 4.94727L7.54395 4.89062C7.90846 4.78633 8.38978 4.80949 8.81445 5.00586C9.17061 4.49727 10.609 2.4431 10.8447 2.10645ZM5.78711 15.8066V16.0635C5.7873 16.3313 6.00577 16.5488 6.27344 16.5488C6.54104 16.5486 6.7586 16.3312 6.75879 16.0635V15.5771H5.94824L5.78711 15.8066ZM8.13086 16.0635C8.13105 16.3313 8.34938 16.5488 8.61719 16.5488C8.88473 16.5487 9.10235 16.3312 9.10254 16.0635V15.5771H8.13086V16.0635ZM3.32324 15.2393L3.16406 16.3154L4.11914 15.7979L4.49316 15.2627C4.20595 15.1011 3.95347 14.8851 3.75293 14.626L3.32324 15.2393ZM18.7559 16.125L19.7285 15.6387V9.71777H18.7559V16.125ZM9.37109 10.6875C10.2313 10.6704 11.0371 10.3289 11.6475 9.71875C11.9154 9.45081 12.3502 9.45081 12.6182 9.71875C12.8855 9.98659 12.8855 10.4206 12.6182 10.6885C11.7331 11.5736 10.5552 12.0614 9.30371 12.0615H5.6875C5.13706 12.0615 4.68074 12.4788 4.62109 13.0137C4.63804 13.0973 4.63934 13.1837 4.62402 13.2695C4.69104 13.7965 5.1428 14.2051 5.6875 14.2051H9.78906C9.89004 14.2051 9.9977 14.2283 10.0957 14.2773H10.0947C10.5836 14.4764 11.8349 15.377 13.8906 15.377C15.7443 15.3769 16.9187 14.6654 17.3838 14.458V9.71777H16.2344C16.1298 9.71777 16.0265 9.69332 15.9326 9.64746L11.5879 7.52246L9.37109 10.6875ZM7.97461 6.20605C7.9492 6.20901 7.92358 6.21263 7.89844 6.21973L5.7041 7.17383C5.61461 7.21274 5.53957 7.27712 5.4873 7.35938L2.31152 12.3525C2.20928 12.5855 2.30443 12.8647 2.54004 12.9824C2.66277 13.0437 2.82631 13.0461 2.97461 12.9961C3.12186 12.9464 3.23295 12.8517 3.27441 12.7412C3.40722 11.9216 3.94952 11.2392 4.68262 10.9072L7.97461 6.20605ZM6.50977 10.6895H7.69727L11.0264 5.93164L10.2305 5.375C9.66326 6.18515 7.20255 9.70004 6.50977 10.6895ZM11.0176 4.25195L11.8135 4.80859L12.3711 4.0127L11.5752 3.45508L11.0176 4.25195Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                    </svg>
                    <span>Spelling & Grammar</span>
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.content?.spelling_grammar?.check ? (
                        <>
                            <div className="sub-section working-well">
                                <span>
                                    <img src={IMAGE_URL + "green_check_icon.svg"} />
                                    <h6>What's Working Well</h6>
                                </span>
                                <div className="bullet-list">
                                    <span className='bullet'>{report_details?.sections?.content?.spelling_grammar?.message}</span>
                                </div>
                            </div>
                            {report_details?.sections?.content?.spelling_grammar?.issues?.length > 0 && (
                                <div className="sub-section areas-improvement">
                                    <span>
                                        <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                        <h6>Areas For Improvement</h6>
                                    </span>
                                    <div className="bullet-list">
                                        {report_details?.sections?.content?.spelling_grammar?.issues?.map((issue, i) => (
                                            <span className={`bullet`}>{issue}</span>
                                        ))}
                                        {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="sub-section areas-improvement">
                                <span>
                                    <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                    <h6>Areas For Improvement</h6>
                                </span>
                                <div className="bullet-list">
                                    <span className='bullet'>{report_details?.sections?.content?.spelling_grammar?.message}</span>
                                    {report_details?.sections?.content?.spelling_grammar?.issues?.length > 0 &&
                                        report_details?.sections?.content?.spelling_grammar?.issues?.map((issue, i) => (
                                            <span className={`bullet`}>{issue}</span>
                                        ))
                                    }
                                </div>
                                {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export const FormatStructureSection = ({ report_details, transform_eligible, handleTransformSubmit, transformResumeLoader }) => {
    return (
        <div className='section-content'>
            <div className='sub-section-wrapper' id='section-file_format'>
                <div className='sub-section-header'>
                    <svg width="22" height="20" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.8447 2.10645C11.062 1.79611 11.4907 1.72145 11.8008 1.93848L13.7197 3.28223C14.0302 3.49948 14.1057 3.92819 13.8887 4.23828L12.3848 6.38379L16.3945 8.3457H20.4141C20.7926 8.3457 21.0994 8.65258 21.0996 9.03125V16.0635C21.0995 16.3233 20.9529 16.5605 20.7207 16.6768L18.377 17.8486C18.1641 17.9551 17.9118 17.9429 17.71 17.8184C17.5079 17.6934 17.3839 17.473 17.3838 17.2354V15.9746C16.3056 16.4796 15.1036 16.749 13.8906 16.749C12.7159 16.749 11.541 16.4864 10.4746 15.9932V16.0635C10.4744 17.0876 9.64149 17.9207 8.61719 17.9209C8.17255 17.9209 7.76444 17.7623 7.44434 17.501C7.12455 17.7619 6.71773 17.9208 6.27344 17.9209C5.60858 17.9209 5.02449 17.5697 4.69629 17.0439L2.61035 18.1748C2.38211 18.2983 2.10365 18.2829 1.89062 18.1338C1.67779 17.9849 1.56763 17.7285 1.60547 17.4717L1.99023 14.8789C2.00595 14.7738 2.04538 14.6733 2.10645 14.5859L2.2793 14.3398C2.15759 14.3083 2.03922 14.2652 1.92676 14.209C1.48298 13.987 1.151 13.6053 0.994141 13.1348C0.81673 12.602 0.904888 12.0094 1.12988 11.6553L4.33008 6.62305C4.52971 6.30881 4.81583 6.06448 5.15723 5.91602L7.38672 4.94727L7.54395 4.89062C7.90846 4.78633 8.38978 4.80949 8.81445 5.00586C9.17061 4.49727 10.609 2.4431 10.8447 2.10645ZM5.78711 15.8066V16.0635C5.7873 16.3313 6.00577 16.5488 6.27344 16.5488C6.54104 16.5486 6.7586 16.3312 6.75879 16.0635V15.5771H5.94824L5.78711 15.8066ZM8.13086 16.0635C8.13105 16.3313 8.34938 16.5488 8.61719 16.5488C8.88473 16.5487 9.10235 16.3312 9.10254 16.0635V15.5771H8.13086V16.0635ZM3.32324 15.2393L3.16406 16.3154L4.11914 15.7979L4.49316 15.2627C4.20595 15.1011 3.95347 14.8851 3.75293 14.626L3.32324 15.2393ZM18.7559 16.125L19.7285 15.6387V9.71777H18.7559V16.125ZM9.37109 10.6875C10.2313 10.6704 11.0371 10.3289 11.6475 9.71875C11.9154 9.45081 12.3502 9.45081 12.6182 9.71875C12.8855 9.98659 12.8855 10.4206 12.6182 10.6885C11.7331 11.5736 10.5552 12.0614 9.30371 12.0615H5.6875C5.13706 12.0615 4.68074 12.4788 4.62109 13.0137C4.63804 13.0973 4.63934 13.1837 4.62402 13.2695C4.69104 13.7965 5.1428 14.2051 5.6875 14.2051H9.78906C9.89004 14.2051 9.9977 14.2283 10.0957 14.2773H10.0947C10.5836 14.4764 11.8349 15.377 13.8906 15.377C15.7443 15.3769 16.9187 14.6654 17.3838 14.458V9.71777H16.2344C16.1298 9.71777 16.0265 9.69332 15.9326 9.64746L11.5879 7.52246L9.37109 10.6875ZM7.97461 6.20605C7.9492 6.20901 7.92358 6.21263 7.89844 6.21973L5.7041 7.17383C5.61461 7.21274 5.53957 7.27712 5.4873 7.35938L2.31152 12.3525C2.20928 12.5855 2.30443 12.8647 2.54004 12.9824C2.66277 13.0437 2.82631 13.0461 2.97461 12.9961C3.12186 12.9464 3.23295 12.8517 3.27441 12.7412C3.40722 11.9216 3.94952 11.2392 4.68262 10.9072L7.97461 6.20605ZM6.50977 10.6895H7.69727L11.0264 5.93164L10.2305 5.375C9.66326 6.18515 7.20255 9.70004 6.50977 10.6895ZM11.0176 4.25195L11.8135 4.80859L12.3711 4.0127L11.5752 3.45508L11.0176 4.25195Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
                    </svg>
                    <span>File Format & Size</span>
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.format?.file_format?.check ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.format?.file_format?.message}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.format?.file_format?.message}</span>
                            </div>
                            {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                        </div>
                    )}
                </div>
            </div>
            <div className='sub-section-wrapper' id='section-resume_length'>
                <div className='sub-section-header'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_18920_5895)">
                            <mask id="mask0_18920_5895" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
                                <path d="M0 0H20V20H0V0Z" fill="white" />
                            </mask>
                            <g mask="url(#mask0_18920_5895)">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.66699 2.5C1.66699 1.1231 2.79009 0 4.16699 0H7.50032C8.87724 0 10.0003 1.1231 10.0003 2.5V17.5C10.0003 18.8769 8.87724 20 7.50032 20H4.16699C2.79009 20 1.66699 18.8769 1.66699 17.5V2.5ZM4.16699 1.66667C3.71056 1.66667 3.33366 2.04357 3.33366 2.5V17.5C3.33366 17.9564 3.71056 18.3333 4.16699 18.3333H7.50032C7.95676 18.3333 8.33366 17.9564 8.33366 17.5V2.5C8.33366 2.04357 7.95676 1.66667 7.50032 1.66667H4.16699Z" fill="#231F20" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.66699 8.33333C1.66699 7.8731 2.04009 7.5 2.50033 7.5H5.83366C6.29389 7.5 6.66699 7.8731 6.66699 8.33333C6.66699 8.79358 6.29389 9.16667 5.83366 9.16667H2.50033C2.04009 9.16667 1.66699 8.79358 1.66699 8.33333Z" fill="#231F20" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.66699 15.0013C1.66699 14.5411 2.04009 14.168 2.50033 14.168H5.83366C6.29389 14.168 6.66699 14.5411 6.66699 15.0013C6.66699 15.4616 6.29389 15.8346 5.83366 15.8346H2.50033C2.04009 15.8346 1.66699 15.4616 1.66699 15.0013Z" fill="#231F20" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.66699 5.0013C1.66699 4.54107 2.04009 4.16797 2.50033 4.16797H5.00032C5.46056 4.16797 5.83366 4.54107 5.83366 5.0013C5.83366 5.46154 5.46056 5.83464 5.00032 5.83464H2.50033C2.04009 5.83464 1.66699 5.46154 1.66699 5.0013Z" fill="#231F20" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M1.66699 11.6654C1.66699 11.2051 2.04009 10.832 2.50033 10.832H5.00032C5.46056 10.832 5.83366 11.2051 5.83366 11.6654C5.83366 12.1256 5.46056 12.4987 5.00032 12.4987H2.50033C2.04009 12.4987 1.66699 12.1256 1.66699 11.6654Z" fill="#231F20" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4111 0.244078C14.7365 -0.0813592 15.2641 -0.0813592 15.5896 0.244078L18.0896 2.74407C18.415 3.06952 18.415 3.59715 18.0896 3.92259C17.7641 4.24802 17.2365 4.24802 16.9111 3.92259L15.0003 2.01184L13.0896 3.92259C12.7641 4.24802 12.2365 4.24802 11.9111 3.92259C11.5856 3.59715 11.5856 3.06952 11.9111 2.74407L14.4111 0.244078Z" fill="#231F20" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9111 16.0761C12.2365 15.7507 12.7641 15.7507 13.0896 16.0761L15.0003 17.9868L16.9111 16.0761C17.2365 15.7507 17.7641 15.7507 18.0896 16.0761C18.415 16.4015 18.415 16.9292 18.0896 17.2546L15.5896 19.7546C15.2641 20.08 14.7365 20.08 14.4111 19.7546L11.9111 17.2546C11.5856 16.9292 11.5856 16.4015 11.9111 16.0761Z" fill="#231F20" />
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M15.0003 0C15.4606 0 15.8337 0.373096 15.8337 0.833333V19.1667C15.8337 19.6269 15.4606 20 15.0003 20C14.5401 20 14.167 19.6269 14.167 19.1667V0.833333C14.167 0.373096 14.5401 0 15.0003 0Z" fill="#231F20" />
                            </g>
                        </g>
                        <defs>
                            <clipPath id="clip0_18920_5895">
                                <rect width="20" height="20" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                    <span>Resume Length</span>
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.format?.resume_length?.check ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.format?.resume_length?.message}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.format?.resume_length?.message}</span>
                            </div>
                            {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                        </div>
                    )}
                    {report_details?.sections?.format?.resume_length?.suggestions?.length > 0 && (
                        <div className="sub-section recommendations">
                            <span>
                                <img src={IMAGE_URL + "fi_rocket.svg"} />
                                <h6>Recommendations</h6>
                            </span>
                            <div className="bullet-list">
                                {report_details?.sections?.format?.resume_length?.suggestions?.map((suggestion, i) => (
                                    <span className='bullet' key={'resume_length_suggestion_' + i}>{suggestion}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className='sub-section-wrapper' id='section-long_bullet_points'>
                <div className='sub-section-header'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.06899 2.41406C0.926209 2.41406 0 3.34027 0 4.48302C0 5.62576 0.926209 6.552 2.06899 6.552C3.21173 6.552 4.13794 5.62579 4.13794 4.48302C4.13794 3.34024 3.21173 2.41406 2.06899 2.41406ZM2.06899 7.93128C0.926209 7.93128 0 8.85753 0 10.0003C0 11.1431 0.926209 12.0693 2.06899 12.0693C3.21173 12.0693 4.13794 11.1431 4.13794 10.0003C4.13794 8.85753 3.21173 7.93128 2.06899 7.93128ZM2.06899 13.4486C0.926209 13.4486 0 14.3747 0 15.5175C0 16.6603 0.926209 17.5865 2.06899 17.5865C3.21173 17.5865 4.13794 16.6603 4.13794 15.5175C4.13794 14.3747 3.21173 13.4486 2.06899 13.4486ZM7.58621 5.86233H18.6207C19.3827 5.86233 20 5.24508 20 4.48302C20 3.72096 19.3827 3.1037 18.6207 3.1037H7.58621C6.82415 3.1037 6.2069 3.72096 6.2069 4.48302C6.2069 5.24508 6.82415 5.86233 7.58621 5.86233ZM18.6207 8.62096H7.58621C6.82415 8.62096 6.2069 9.23821 6.2069 10.0003C6.2069 10.7623 6.82415 11.3796 7.58621 11.3796H18.6207C19.3827 11.3796 20 10.7623 20 10.0003C20 9.23821 19.3827 8.62096 18.6207 8.62096ZM18.6207 14.1382H7.58621C6.82415 14.1382 6.2069 14.7554 6.2069 15.5175C6.2069 16.2796 6.82415 16.8968 7.58621 16.8968H18.6207C19.3827 16.8968 20 16.2796 20 15.5175C20 14.7554 19.3827 14.1382 18.6207 14.1382Z" fill="#231F20" />
                    </svg>
                    <span>Long Bullet Points</span>
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.format?.long_bullet_points?.check ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.format?.long_bullet_points?.message}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.format?.long_bullet_points?.message}</span>
                                {report_details?.sections?.format?.long_bullet_points?.examples?.map((example, i) => (
                                    <span className='bullet' key={'long_bullet_points_example_' + i}>{example}</span>
                                ))}
                            </div>
                            {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export const EssentialSectionsSection = ({ report_details, transform_eligible, handleTransformSubmit, recommendedContactInfo, transformResumeLoader }) => {

    const [contactMessages, setContactMessages] = useState([])
    const [allContactsPresent, setAllContactPresent] = useState(null);

    const [essentialMessages, setEssentialMessages] = useState([])
    const [allEssentialPresent, setAllEssentialPresent] = useState(null)
    useEffect(() => {
        let newContactMsg = [...contactMessages];

        Object.keys(report_details?.sections?.mandatory_sections?.contact_information || {}).forEach(item => {
            const contactItem = report_details?.sections?.mandatory_sections?.contact_information[item];
            if (contactItem && !contactItem.check && typeof contactItem === 'object' && item != "github") {
                newContactMsg.push(contactItem.message);
            }
        })
        if (newContactMsg.length === 0) {
            setAllContactPresent(true)
        } else {
            setAllContactPresent(false)
        }
        setContactMessages(newContactMsg);

        let newEssentialMsg = [...essentialMessages];
        Object.values(report_details?.sections?.mandatory_sections?.essential_sections || {}).forEach(essentialItem => {
            if (essentialItem && !essentialItem.check && typeof essentialItem === 'object') {
                newEssentialMsg.push(essentialItem.message);
            }
        })
        if (newEssentialMsg.length === 0) {
            setAllEssentialPresent(true)
        }
        else {
            setAllEssentialPresent(false)
        }
        setEssentialMessages(newEssentialMsg);
    }, []);

    return (
        <div className='section-content'>
            <div className='sub-section-wrapper' id='section-contact_information'>
                <div className='sub-section-header'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_18860_140772)">
                            <path d="M3.08984 1.00098C3.4906 0.724983 3.95775 0.634877 4.43262 0.742188C4.90745 0.849357 5.29081 1.13124 5.53418 1.55273L6.66602 3.51465H18.6172C19.4039 3.51467 20.0439 4.15479 20.0439 4.94141V13.6006C20.0439 14.3873 19.4039 15.0273 18.6172 15.0273H13.3125L13.5596 15.4541C13.803 15.8756 13.8554 16.3487 13.7109 16.8135C13.5664 17.2782 13.2549 17.6375 12.8154 17.8467L9.89453 19.2373C9.80425 19.2802 9.70602 19.3018 9.60742 19.3018C9.55265 19.3018 9.49798 19.2947 9.44434 19.2812C8.09281 18.9404 6.75092 17.943 5.55469 16.7002C4.3548 15.4536 3.28218 13.9408 2.47168 12.5371C1.52392 10.8956 0.79793 9.20177 0.375 7.63867C-0.0972342 5.8932 -0.177395 4.39709 0.161133 3.2041C0.203609 3.05437 0.297554 2.92421 0.425781 2.83594L3.08984 1.00098ZM4.1377 2.04688C4.02709 2.02194 3.94206 2.03823 3.84863 2.10254L1.39355 3.79297C1.19719 4.7072 1.29103 5.91491 1.66309 7.29297C2.04414 8.70426 2.7117 10.2778 3.62988 11.8682C4.5469 13.4564 5.59291 14.8413 6.63965 15.8975C7.66144 16.9284 8.67137 17.6314 9.5498 17.9189L12.2412 16.6387C12.3437 16.5898 12.4009 16.5244 12.4346 16.416C12.4682 16.3076 12.4581 16.2214 12.4014 16.123L10.9404 13.5928C10.8419 13.4221 10.6184 13.3595 10.4453 13.4541L8.7832 14.3623C8.5354 14.4979 8.22863 14.4632 8.01758 14.2754C7.13629 13.4915 6.19728 12.2287 5.42188 10.8857C4.64634 9.54247 4.02239 8.09674 3.78418 6.94141C3.72735 6.66488 3.8497 6.38223 4.09082 6.23535L5.70898 5.25C5.87718 5.14759 5.93503 4.92358 5.83691 4.75293L4.375 2.22168C4.31822 2.12339 4.24852 2.07192 4.1377 2.04688ZM12.332 9.82227C12.2181 9.90041 12.0851 9.93945 11.9531 9.93945C11.8213 9.93936 11.689 9.90028 11.5752 9.82227L6.48926 6.33594C6.46168 6.35511 6.43429 6.37489 6.40527 6.39258L5.20605 7.12109C5.46763 8.04678 5.9692 9.15874 6.58008 10.2168C7.19052 11.2741 7.9028 12.2629 8.57324 12.9521L9.80371 12.2803C10.6104 11.8392 11.6389 12.1276 12.0986 12.9238L12.541 13.6895H18.6172C18.6633 13.6894 18.7061 13.6466 18.7061 13.6006V5.45312L12.332 9.82227ZM7.2168 4.85254C7.22202 4.969 7.21539 5.08495 7.19727 5.19922L11.9531 8.45996L17.2168 4.85254H7.2168Z" fill="#231F20" stroke="#231F20" stroke-width="0.4" />
                        </g>
                        <defs>
                            <clipPath id="clip0_18860_140772">
                                <rect width="20" height="20" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                    <span>Contact Information</span>
                </div>
                <div className="sub-section-content">
                    {allContactsPresent ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>All contact information is present.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                {contactMessages?.length > 0 && contactMessages?.map((message) =>
                                    <span className='bullet'>{message}</span>
                                )}
                            </div>
                            {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                        </div>
                    )}
                    {recommendedContactInfo?.length > 0 && (
                        <div className="sub-section recommendations">
                            <span>
                                <img src={IMAGE_URL + "fi_rocket.svg"} />
                                <h6>Recommendations</h6>
                            </span>
                            <div className="bullet-list">
                                {recommendedContactInfo.map((message, i) =>
                                    <span className='bullet' key={`${message}_recommendation_${i}`}>{message}</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className='sub-section-wrapper' id='section-essential_sections'>
                <div className='sub-section-header'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6664 11.6665C22.3236 5.202 12.9164 -1.66655 9.9998 5.83267C7.0831 -1.66655 -2.21441 5.20203 3.44267 11.6665C6.35935 14.9995 8.7498 16.2496 9.9998 17.4991C11.2497 16.2496 13.7497 14.9994 16.6664 11.6665Z" stroke="#231F20" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M13.3346 10.4173H12.5013L10.8346 12.5007L9.16797 8.33398L7.91797 10.4173H6.66797" stroke="#231F20" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Essential Sections</span>
                </div>
                <div className="sub-section-content">
                    {allEssentialPresent ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>All esssential sections are present.</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                {essentialMessages?.length > 0 && essentialMessages?.map((message) =>
                                    <span className='bullet'>{message}</span>
                                )}
                            </div>
                            {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export const WritingStyleSection = ({ report_details, transform_eligible, handleTransformSubmit, transformResumeLoader }) => {
    return (
        <div className='section-content'>
            <div className='sub-section-wrapper' id='section-active_voice'>
                <div className='sub-section-header'>
                    <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.32227 7.80566C2.32227 9.18238 2.86156 10.4724 3.84277 11.4385C4.61473 12.1986 5.00142 13.2547 4.90332 14.3359L4.63477 17.291H9.375V14.3936H11.9053C11.9941 14.3936 12.0674 14.3203 12.0674 14.2314V11.2627L12.167 11.2266L13.4932 10.752L12.3721 8.13184L12.3594 8.10352V6.74121C12.0666 4.55499 9.8463 2.74449 7.46387 2.70898C4.69412 2.66779 2.26238 5.05753 2.32227 7.80273V7.80566ZM13.832 7.80273L15.4004 11.4639L15.4629 11.6104L15.3135 11.6641L13.5391 12.2979V14.2314C13.5391 15.1322 12.806 15.8652 11.9053 15.8652H10.8467V18.7627H3.02344L3.03809 18.5996L3.4375 14.2031C3.49572 13.5618 3.26733 12.936 2.81055 12.4863C1.62567 11.3196 0.93949 9.78536 0.858398 8.13672L0.849609 7.80566C0.83834 4.27354 3.69353 1.27106 7.41406 1.2373C10.3749 1.21063 13.4737 3.5055 13.8311 6.64551L13.832 6.65332V7.80273Z" fill="#231F20" stroke="#231F20" stroke-width="0.3" />
                        <path d="M16.8828 11.5771C17.2439 11.9381 17.4433 12.4192 17.4434 12.9297C17.4434 13.4403 17.2438 13.9212 16.8828 14.2822L16.7773 14.3887L16.6709 14.2822L15.8418 13.4541L15.7363 13.3477L15.8418 13.2422C15.9253 13.1587 15.9717 13.0477 15.9717 12.9297C15.9716 12.8118 15.9252 12.7016 15.8418 12.6182L15.7363 12.5127L15.8418 12.4062L16.6709 11.5771L16.7773 11.4717L16.8828 11.5771Z" fill="#231F20" stroke="#231F20" stroke-width="0.3" />
                        <path d="M18.5469 9.91309C19.3524 10.7186 19.7968 11.7906 19.7969 12.9297C19.7969 14.069 19.3525 15.1417 18.5469 15.9473L18.4414 16.0527L18.335 15.9473L17.5059 15.1182L17.4004 15.0117L17.5059 14.9062C18.0338 14.3782 18.3242 13.6764 18.3242 12.9297C18.3241 12.1832 18.0337 11.482 17.5059 10.9541L17.4004 10.8486L17.5059 10.7422L18.335 9.91309L18.4414 9.80762L18.5469 9.91309Z" fill="#231F20" stroke="#231F20" stroke-width="0.3" />
                        <path d="M20.2109 8.24902C21.4611 9.49911 22.1504 11.1628 22.1504 12.9307C22.1503 14.6984 21.461 16.3613 20.2109 17.6113L20.1055 17.7168L19.999 17.6113L19.0645 16.6768L19.1699 16.5703C20.1424 15.5979 20.6776 14.3058 20.6777 12.9307C20.6777 11.5554 20.1424 10.2625 19.1699 9.29004L19.0645 9.18457L19.1699 9.07812L19.999 8.24902L20.1055 8.14355L20.2109 8.24902Z" fill="#231F20" stroke="#231F20" stroke-width="0.3" />
                    </svg>
                    <span>Active Voice</span>
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.style?.active_voice?.check ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.style?.active_voice?.message}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.style?.active_voice?.message}</span>
                                {report_details?.sections?.style?.active_voice?.examples?.map((example, i) => (
                                    <span className='bullet' key={'active_voice_example_' + i}>{example}</span>
                                ))}
                            </div>
                            {transform_eligible && <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />}
                        </div>
                    )}
                </div>
            </div>
            <div className='sub-section-wrapper' id='section-buzzwords_cliches'>
                <div className='sub-section-header'>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_18860_140895)">
                            <path d="M9.99998 0C4.47714 0 0 4.47714 0 9.99998C0 15.5228 4.47714 20 9.99998 20C15.5228 20 20 15.5228 20 9.99998C20 4.47714 15.5228 0 9.99998 0ZM2.48915 9.99998C2.48915 5.85184 5.85188 2.48915 9.99998 2.48915C11.6252 2.48915 13.1298 3.0055 14.3589 3.88291L3.88291 14.359C3.0055 13.1299 2.48915 11.6253 2.48915 9.99998ZM9.99998 17.5109C8.37571 17.5109 6.87197 16.9952 5.64329 16.1188L16.1187 5.64333C16.9952 6.87201 17.5108 8.37579 17.5108 10C17.5109 14.1481 14.1481 17.5109 9.99998 17.5109Z" fill="#231F20" />
                        </g>
                        <defs>
                            <clipPath id="clip0_18860_140895">
                                <rect width="20" height="20" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                    <span>Buzzwords & Cliches</span>
                </div>
                <div className="sub-section-content">
                    {report_details?.sections?.style?.buzzwords_cliches?.check ? (
                        <div className="sub-section working-well">
                            <span>
                                <img src={IMAGE_URL + "green_check_icon.svg"} />
                                <h6>What's Working Well</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.style?.buzzwords_cliches?.message}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="sub-section areas-improvement">
                            <span>
                                <img src={IMAGE_URL + "fi_alert-triangle.svg"} />
                                <h6>Areas For Improvement</h6>
                            </span>
                            <div className="bullet-list">
                                <span className='bullet'>{report_details?.sections?.style?.buzzwords_cliches?.message}</span>
                                <span className='bullet buzzwords'>
                                    <h6>Detected Buzzwords :</h6>
                                    <ul>
                                        {report_details?.sections?.style?.buzzwords_cliches?.buzzwords?.map((buzzword, i) => (
                                            <li key={'buzzword_' + i}>{i + 1}. {buzzword}</li>
                                        ))}
                                    </ul>
                                </span>
                            </div>
                            {transform_eligible &&
                                <FixIssuesWithResumeTransformCard report_details={report_details} handleTransformSubmit={handleTransformSubmit} transformResumeLoader={transformResumeLoader} />
                            }
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const FixIssuesWithResumeTransformCard = ({ report_details, handleTransformSubmit, quanitifySection = false, transformResumeLoader }) => {
    const { user } = useSelector(state => state.auth);
    return (
        <>
            {!report_details?.hasUplers &&
                <div className={`fix-issues-resume-transformation`}>
                    <div className='left-section'>
                        <img src={IMAGE_URL + "sparkle-blue.svg"} />
                        <div className='content'>
                            {/* <h6>Fix all issues automatically with resume transformation at only <s>₹999</s> <b>₹{user?.resume_transform_price}!</b></h6> */}
                            {quanitifySection ?
                                <h6>Revise your experience bullets to highlight measurable outcomes with clear metrics and results.</h6>
                                :
                                <h6>Breakthrough to interviews, transform your resume and see faster, better results in your job search journey.</h6>
                            }
                        </div>
                    </div>
                    <div className='right-section'>
                        <button className='transform-resume-button' onClick={() => handleTransformSubmit('inside-section-fix')} disabled={transformResumeLoader}>
                            {/* <span className='btn-text'>Fix Resume For Just <s>₹999</s> <b>₹{user?.resume_transform_price}</b></span> */}
                            {transformResumeLoader && <IosLoader whiteLoader={quanitifySection ? true : false} />}
                            {quanitifySection && !transformResumeLoader &&
                                <img src={IMAGE_URL + "flash-icon.svg"} />
                            }
                            <span className='btn-text'>{quanitifySection ? 'QUANTIFY MY RESUME IN 5 MINS' : 'Fix My Resume In 5 Mins'}</span>
                        </button>
                    </div>
                </div>
            }
        </>
    )
}
