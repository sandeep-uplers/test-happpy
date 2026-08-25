'use client';

import { SET_BOOKMARK_COUNT, SET_LEGAL_MASTER, SET_SIDEBAR_COLLAPSE, SET_SIDEBAR_RESUME_REVIEW_CLICKED, SET_TNC_MODAL, VR_PUSHER_SUBSCRIBE, VR_PUSHER_TOGGLE } from '../actions/actionsTypes';

const initialState = {
    tncOpen: false,
    vrPusherToggle: false,
    vrPusherSubscribe: false,
    isSidebarCollapsed: true,
    sidebarResumeReviewClicked: false,
    bookmarkCount: '',
    legalMaster: {
        name: 'Talent Onboarding Details',
        version: 'v1.0.1',
        key: 'talent_onboarding_details_v1_0_1',
        type: 'onboarding',
        status: 1,
        details: `<p>This Talent Platform Access Agreement is a substantial revision from the prior on-line agreement entitled ”Pool boarding agreement“ and replaces such prior agreement in its entirety. Please read it carefully to acquaint yourself with your rights and obligations for using the Talent Platform portions of Uplers. </p>
        <p> </p>
        <h5><span>1</span><strong>Terms and condition: </strong></h5>
        <ol>
        <li>Talent agrees that all the Talent’s personal information, qualifications, details of work history, availability, skills or other information shared with Uplers is true and accurate and Talent shall be solely liable for any incorrect or misleading information provided.
        </li>
        <li>
        The Talent may work for other clients’ other than Uplers until they have been assigned work with Uplers clients. This provision shall depend on the conditions set forth in the Statement of Work (“SOW”) signed by both the Parties.
        </li>
        <li> The Talent shall within 24 hours of the interview and presenting the opportunity confirm and accept the opportunity. If the Talent fails to confirm within 24 hours then the Talent shall not be eligible for the current Client. 
        </li>
        <li>The client may select the Talent from Uplers after evaluating the Talent as per the client's needs. </li>
        <li> Uplers makes no commitments or undertakes that the client or work assigned by Uplers will be suitable to the Talent’s expectations nor it guarantees any job security.
        </li>
        <li> Uplers is an independent service provider and is not to be considered an employer, partner, an agent  or  a  fiduciary  of  the  Talent  for  any  purpose  whatsoever.  UPLERS  MAKES  NO  OTHER GUARANTEES,  REPRESENTATIONS  OR  WARRANTIES  OF  ANY  KIND  EXCEPT  AS  EXPRESSLY PROVIDED HEREIN. 
        </li>
        <li>The Talent is duly authorized to enter into this Agreement and warrants to have all the necessary valid and renewed work permits, certifications, insurances, licenses and other required statutory permissions and authorisations to perform the Services, when executed, this Agreement shall be legal, valid and binding on the Talent, enforceable against the Talent in accordance with its terms and conditions subject to all applicable laws, and will not violate or create a default under any law, rule, regulation, judgment, order, instrument, agreement or document binding on the Talent. 
        </li>
        <li>There are no pending or threatened actions or proceedings before any court or administrative agency that could have a material adverse effect on performance of the Talent’s obligations under this Agreement, nor is the Talent in default under any material loan, lease or purchase obligation. </p><p> 
        </li>
        </ol>
        <h5><span>2</span><strong>Confidentiality: </strong></h5>
        <ol>
        <li>Talent agrees that during the course of this Agreement, information that is confidential may be disclosed  to  the  Talent,  including,  but  not  limited  to  client  information,  software,  technical processes  and  formulas,  source  codes,  product  designs,  sales,  cost  and  other  unpublished financial  information,  product  and  business  plans,  trade  secrets,  advertising,  revenues, projections,  marketing  data  or  any  information  that  is  labeled  as  confidential  ("Confidential Information"). </li>
        <li>Except as provided for in this Agreement, Talent shall not make any disclosure of the Confidential Information to anyone who is not Party to this Agreement or who is not authorized by Uplers in writing. The confidential obligations shall survive 3 (three) years beyond expiration or termination of this Agreement. 
        </li>
        </ol>
        <p> </p>
        <h5><span>3</span><strong>Non- Solicitation </strong></h5>
        <h6>The Talent acknowledges that they shall have exposure to the clientele of Uplers. The Talent shall not make any  communication either directly or  indirectly  with the  client without Uplers prior approval or prior intimation. The Talent shall not engage in any activity which results in loss of client or monetary loss for Uplers. </h6><p> </p>
        <h5><span>4</span><strong>Talent Pool boarding agreement </strong></h5>
        <h6>Once the Talent is selected by the client and the Talent gives confirmation on joining the client, at this stage the Talent shall become a party to the Pool On Boarding agreement which shall govern the term of the Talent with the Client. </h6><p> </p>
        <h5><span>5</span><strong>Term and Termination </strong></h5>
        <h6>Either Party may terminate this Agreement by giving a prior 30 days notice period. </h6><p> </p>
        <h5><span>6</span><strong>Compensation </strong></h5>
        <h6>Talent shall receive compensation when they start working with the client of Uplers. During the duration when  no  client/  work  is  allotted  to  the  Talent,  Uplers  shall  not  be  liable  for  the  payment  of  any compensation to the Talent. </h6><p> </p>
        <h5><span>7</span><strong>Governing Law and Jurisdiction: </strong></h5>
        <h6>This Agreement shall be governed by and construed in accordance with the laws of India. The adjudication of any dispute will be the exclusive jurisdiction of the courts of Ahmedabad, Gujarat. </h6>`
    }
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_TNC_MODAL:
            return {
                ...state,
                tncOpen: action.payload
            }
        case SET_SIDEBAR_COLLAPSE:
            return {
                ...state,
                isSidebarCollapsed: action.payload
            }
        case SET_LEGAL_MASTER:
            return {
                ...state,
                legalMaster: action.payload
            }
        case VR_PUSHER_TOGGLE:
            return {
                ...state,
                vrPusherToggle: action.payload
            }
        case VR_PUSHER_SUBSCRIBE:
            return {
                ...state,
                vrPusherSubscribe: action.payload
            }
        case SET_SIDEBAR_RESUME_REVIEW_CLICKED:
            return {
                ...state,
                sidebarResumeReviewClicked: action.payload
            }
        case SET_BOOKMARK_COUNT:
            return {
                ...state,
                bookmarkCount: action.payload
            }
        default:
            return state;
    }
}