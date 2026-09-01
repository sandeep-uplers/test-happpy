import { useDispatch, useSelector } from "react-redux";
import { defaultCompactConfig } from "../../components/Constant";
import { SET_CONFIG_JSON } from "../../store/actions/actionsTypes";

export default function MakeResumeCompact() {
    const { config_json } = useSelector(state => state.resumeEditor);
    const dispatch = useDispatch();

    const handleMakeCompact = () => {
        dispatch({
            type: SET_CONFIG_JSON,
            payload: {
                ...config_json,
                template_id: 6,
                font_size: { ...config_json.font_size, ...defaultCompactConfig.font_size },
                spacing: { ...config_json.spacing, ...defaultCompactConfig.spacing }
            }
        });
    }

    return (
        <>
            {config_json.template_id !== 6 &&
                <div className="make-compact-btn-container">
                    <button className="make-compact-btn" onClick={handleMakeCompact}>
                        Fit To One Page
                    </button>
                </div>
            }
        </>
    )
}