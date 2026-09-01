import React from "react"
import { IMAGE_URL } from "../components/Constant"

export const BookmarkNotification = ({ closeToast, toastProps, role, newValue, undoAllowed, onUndo }) => {
    return (
        <div className="snackbarBody bookmark">
            <div className="leftContent">
                <img src={IMAGE_URL + (newValue ? 'bookmarked.png' : 'bookmarkRemoved.png')} />
                <div className="content">
                    <p>{newValue ? 'Job added to Saved Jobs!' : 'Job removed from Saved Jobs'}</p>
                   {role && <h6>{role}</h6>}
                </div>
            </div>
            <div className="snackbarAction">
                {(undoAllowed && !newValue) &&
                    <button className="snackbarBtn undoBtn" onClick={() => { onUndo(newValue); closeToast(); }}>Undo</button>
                }
                {(undoAllowed && !newValue) && <div className="middleBar"></div>}
                <button className="snackbarBtn closeBtn" onClick={closeToast}><img src={IMAGE_URL + 'fi_x-circle.svg'} /></button>
            </div>
        </div>
    )
}