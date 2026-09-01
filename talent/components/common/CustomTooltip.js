import { useState } from "react";

export const CustomTooltip = ({ children, text, placement = "bottom", customStyles = {}, forceShow = false }) => {
    const [isVisible, setIsVisible] = useState(false);

    // Tooltip styles
    const tooltipStyles = {
        container: {
            position: 'relative',
            display: 'inline-block',
            ...customStyles.container,
        },
        tooltip: {
            position: 'absolute',
            backgroundColor: '#333',
            color: 'white',
            padding: '0.5rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.65rem',
            whiteSpace: 'normal',
            lineHeight: '1.2',
            zIndex: 1000,
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            width: 'max-content',
            maxWidth: '16rem',
            ...(placement === 'top' && {
                bottom: 'calc(100% + 0.625rem)',
                left: '50%',
                transform: 'translateX(-50%)',
            }),
            ...(placement === 'bottom' && {
                top: 'calc(100% + 0.625rem)',
                left: '50%',
                transform: 'translateX(-50%)',
            }),
            ...(placement === 'left' && {
                right: 'calc(100% + 0.625rem)',
                top: '50%',
                transform: 'translateY(-50%)',
            }),
            ...(placement === 'right' && {
                left: 'calc(100% + 0.625rem)',
                top: '50%',
                transform: 'translateY(-50%)',
            }),
            ...(placement === 'bottom-left' && {
                top: 'calc(100% + 0.625rem)',
                left: '0',
            }),
            ...(placement === 'bottom-right' && {
                top: 'calc(100% + 0.625rem)',
                right: '0',
            }),
            ...customStyles.tooltip,
        },
        arrow: {
            position: 'absolute',
            width: 0,
            height: 0,
            ...(placement === 'top' && {
                bottom: '-0.375rem',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '6px 6px 0',
                borderStyle: 'solid',
                borderColor: '#333 transparent transparent transparent',
            }),
            ...(placement === 'bottom' && {
                top: '-0.375rem',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '0 6px 6px',
                borderStyle: 'solid',
                borderColor: 'transparent transparent #333 transparent',
            }),
            ...(placement === 'left' && {
                right: '-0.375rem',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '6px 0 6px 6px',
                borderStyle: 'solid',
                borderColor: 'transparent transparent transparent #333',
            }),
            ...(placement === 'right' && {
                left: '-0.375rem',
                top: '50%',
                transform: 'translateY(-50%)',
                borderWidth: '6px 6px 6px 0',
                borderStyle: 'solid',
                borderColor: 'transparent #333 transparent transparent',
            }),
            ...(placement === 'bottom-left' && {
                top: '-0.375rem',
                left: '0.625rem', // tweak if needed
                transform: 'translateX(-50%)',
                borderWidth: '0 6px 6px',
                borderStyle: 'solid',
                borderColor: 'transparent transparent #333 transparent',
            }),
            ...(placement === 'bottom-right' && {
                top: '-0.3125rem',
                right: '0.625rem', // tweak if needed
                transform: 'translateX(50%)',
                borderWidth: '0 6px 6px',
                borderStyle: 'solid',
                borderColor: 'transparent transparent #333 transparent',
            }),
            ...customStyles.arrow,
        },
    };

    return (
        <div
            style={tooltipStyles.container}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {(isVisible || forceShow) && (
                <div style={tooltipStyles.tooltip} className="custom-tooltip">
                    {text}
                    <div style={tooltipStyles.arrow} className="custom-tooltip-arrow"></div>
                </div>
            )}
        </div>
    );
};
