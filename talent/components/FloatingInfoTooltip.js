import { useEffect, useRef } from "react";
import { IMAGE_URL } from "./Constant";

export default function FloatingInfoTooltip({ message }) {
    const tooltipRef = useRef(null);
    useEffect(() => {
        const myElement = tooltipRef.current;
        const parentDiv = document.documentElement; // Use viewport bounds

        if (!myElement || !parentDiv) return;

        console.log('myElement', myElement)
        console.log('parentDiv', parentDiv)

        const position = isElementAtExtreme(myElement, parentDiv);
        if (position === 'left') {
            myElement.classList.add('left-edge'); // Add a CSS class for styling
        } else if (position === 'right') {
            myElement.classList.add('right-edge'); // Add a CSS class for styling
        } else {
            myElement.classList.remove('left-edge', 'right-edge'); // Remove edge classes
        }
    }, []);

    const isElementAtExtreme = (element, parent) => {
        const parentRect = parent.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        if (elementRect.left <= parentRect.left + 130) {
            return 'left';
        }
        if (elementRect.right + 130 >= parentRect.right) {
            return 'right';
        }
        return false;
    }
    return (
        <span className="floatingInfoTooltip" ref={tooltipRef}>
            <img src={IMAGE_URL + 'work/box-info-icon.svg'} />
            <span className="floatingInfoTooltipMessage">
                {message}
            </span>
        </span>
    )
}