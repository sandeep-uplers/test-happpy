'use client';

import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();

import React, { createContext, useContext, useState } from "react";

import Modal from 'react-modal';
import WhatsappButton from "../../assets/WhatsappButton";
import { trackMatcherWhatsapp } from "../../helpers/Mixpanel";
import { useSelector } from "react-redux";

ensureModalAppElement();


const MatcherContext = createContext()

export const useMatcherContext = () => useContext(MatcherContext);

export default function MatcherModalProvider(props) {
    // const [query, setQuery] = useState('')
    const [matcherData, setMatcherData] = useState({})
    const { user } = useSelector(state => state.auth)

    const [isOpen, setOpen] = useState(false)
    const handleClose = () => {
        setOpen(false)
    }
    // const handleSubmitQuery = () => {
    //     setOpen(false)
    // }
    const showMatcherModal = (data) => {
        setMatcherData(data)
        setOpen(true)
    }
    const chatWithWhatsapp = (data) => {
        let url = `https://wa.me/91${data.whatsapp_number}?text=I'm keen on the *${data.role}* role at *${data.company}*, as it aligns perfectly with my skills and experience. Can we discuss next steps?
        %0a%0aJob ID : *${data.HR_Number}*
        %0a%0aFrom :
        %0a${user.name}
        %0a${user.email}
        %0a%0a_*Please do not remove this unique job ID number, this helps us to identify your application/interest faster._`;

        trackMatcherWhatsapp({ data: data });
        window.open(url, '_blank')
    }
    return (
        <>
            <MatcherContext.Provider
                value={{
                    showMatcherModal: showMatcherModal,
                    chatWithWhatsapp: chatWithWhatsapp
                }}
            >
                <Modal
                    isOpen={isOpen}
                    portalClassName="react-modal-portal"
                    className={`modal commonModal matcheQuery fade ${(isOpen) && "show"}`}
                >
                    <div className="modal-dialog modal-dialog-centered " role="document">
                        <div className="modal-content">
                            <button type="button" className="modalCloseBtn" data-dismiss="modal" aria-label="Close" onClick={handleClose}>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <div className="modal-body matcherQueryModal">
                                {/* {tNc} */}
                                {/* <h5 className="head">{matcherData.company ?`${matcherData.company} | `:''}{matcherData.role}</h5> */}
                                <h5 className="head">Need Help? Reach out to the contact mentioned below! </h5>
                                <div className="matcherContent">
                                    <div className="matcherIntro">
                                        <div className='d-flex align-items-center flex-wrap'>
                                            {matcherData.profileImage &&
                                                <img className='profilePic' src={matcherData.profileImage} />
                                            }
                                            <div>
                                                <h6>{matcherData.name}</h6>
                                                {/* <>{process.env.MIX_APP_NAME} Opportunity Matcher</> */}
                                            </div>
                                        </div>
                                        {/* <div className="bio">As this Opportunity’s matcher, I am the primary liaison between our organization and you. I am here to assist you in any way possible and answer any questions you may have about this opportunity</div> */}
                                    </div>

                                    {matcherData.whatsapp_number &&
                                        <ul className="mb-4">
                                            <li>
                                                <WhatsappButton onClick={() => chatWithWhatsapp({
                                                    whatsapp_number: matcherData.whatsapp_number,
                                                    role: matcherData.role,
                                                    company: matcherData.company,
                                                    HR_Number: matcherData.HR_Number,
                                                })} />
                                            </li>
                                        </ul>
                                    }
                                    <ul>
                                        <li>
                                            <h4>Email</h4>
                                            <p><a href={"mailto:" + matcherData.email}>{matcherData.email}</a></p>
                                        </li>
                                        {matcherData.linkedin && <li>
                                            <h4>Linkedin</h4>
                                            <p><a href={matcherData.linkedin} target="_blank">{matcherData.linkedin}</a></p>
                                        </li>
                                        }
                                    </ul>

                                    {/* <div className="queryInput">
                                        <label>Directly ask your queries here</label>
                                        <textarea
                                            placeholder="Type your queries here"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)} />
                                    </div>
                                    <div className="modalAction">
                                        <button type="button"
                                            className="btn"
                                            data-dismiss="modal"
                                            disabled={!query}
                                            aria-label="Submit query" onClick={handleSubmitQuery}>
                                            Submit query
                                        </button>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>

                {props.children}
            </MatcherContext.Provider>
        </>
    )
}