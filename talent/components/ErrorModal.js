import React, { useEffect } from "react";
import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();

const ErrorModal = props => {
    const closeCommonErrorModal = event => {
        props.closeCommonErrorModal();
    };
    let { content } = props
    return (
        <>
            <Modal
                isOpen={props.isOpen}
                onRequestClose={closeCommonErrorModal}
                portalClassName="react-modal-portal"
                className="react-modal custom-modal-wrap"
            >
                <div className="ui-dialog ui-corner-all ui-widget ui-widget-content ui-front ui-dialog-buttons ui-draggable">
                    <div id="ui-id-3" className="ui-dialog-content ui-widget-content">
                        <div dangerouslySetInnerHTML={{ __html: content }}>
                        </div>
                        <br />
                    </div>
                    <div className="ui-dialog-buttonpane ui-widget-content ui-helper-clearfix">
                        <div className="ui-dialog-buttonset">
                            <button type="button" className="ui-button ui-corner-all ui-widget" onClick={closeCommonErrorModal}>Close</button>
                        </div>
                    </div>
                </div>
            </Modal>
        </>

    )
};


export default ErrorModal