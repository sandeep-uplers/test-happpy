'use client';

import React from "react"

export const AnimatedCheckMark = () => {
    return (
        <svg className="checkmark_icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
    )
}

export const StepperErrorIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11.5" fill="white" stroke="#6B6B6B" />
            <circle cx="12" cy="12" r="4" fill="#6B6B6B" />
            <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="#E03A3A" />
            <path d="M15.6063 8.39844L8.40625 15.5984" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8.40625 8.39844L15.6063 15.5984" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

    )
}

export const StepperSuccessIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11.5" fill="#32936F" stroke="#32936F" />
            <path d="M16 9L10.5 14.5L8 12" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}


export const StepperTitleIcon = () => {
    return (
        <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.38461 2.72852L9.42108 7.99559L14.7692 10.0012L9.42108 12.0068L7.38461 17.2739L5.34815 12.0068L0 10.0012L5.34815 7.99559L7.38461 2.72852Z" fill="#FFDA30" />
            <path d="M19.381 0L20.6538 3.29192L23.9964 4.54542L20.6538 5.79892L19.381 9.09084L18.1082 5.79892L14.7656 4.54542L18.1082 3.29192L19.381 0Z" fill="#FFDA30" />
            <path d="M17.5349 14.5449L18.2985 16.5201L20.3041 17.2722L18.2985 18.0243L17.5349 19.9994L16.7712 18.0243L14.7656 17.2722L16.7712 16.5201L17.5349 14.5449Z" fill="#FFDA30" />
        </svg>
    )
}

export const LockedStepIcon = () => {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#F5F5F5" />
            <path d="M15.5 11.5H8.5C7.94772 11.5 7.5 11.9477 7.5 12.5V16C7.5 16.5523 7.94772 17 8.5 17H15.5C16.0523 17 16.5 16.5523 16.5 16V12.5C16.5 11.9477 16.0523 11.5 15.5 11.5Z" stroke="#CECCCC" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15.5 11.5H8.5C7.94772 11.5 7.5 11.9477 7.5 12.5V16C7.5 16.5523 7.94772 17 8.5 17H15.5C16.0523 17 16.5 16.5523 16.5 16V12.5C16.5 11.9477 16.0523 11.5 15.5 11.5Z" stroke="black" strokeOpacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 11.5V9.5C9.5 8.83696 9.76339 8.20107 10.2322 7.73223C10.7011 7.26339 11.337 7 12 7C12.663 7 13.2989 7.26339 13.7678 7.73223C14.2366 8.20107 14.5 8.83696 14.5 9.5V11.5" stroke="#CECCCC" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9.5 11.5V9.5C9.5 8.83696 9.76339 8.20107 10.2322 7.73223C10.7011 7.26339 11.337 7 12 7C12.663 7 13.2989 7.26339 13.7678 7.73223C14.2366 8.20107 14.5 8.83696 14.5 9.5V11.5" stroke="black" strokeOpacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}



export const StepperActiveIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11.75" fill="white" stroke="#232323" strokeWidth="0.5" />
            <circle cx="12" cy="12" r="4" fill="#232323" />
        </svg>
    )
}

export const BookmarkIcon = () => {
    return (
        <svg width="50" height="40" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className="container" opacity="0.5" d="M36.602 0.871537L36.602 0.87163L36.6114 0.869036C40.1247 -0.0985877 43.902 0.87 46.4841 3.38272C49.0607 5.89022 50.0588 9.55948 49.197 13.1136L46.5577 23.1854L46.5557 23.193L46.5539 23.2007C46.4166 23.8013 46.2855 24.3737 46.0932 24.9423L46.0405 25.0451L45.9854 25.1525V25.2299C45.9212 25.3775 45.8625 25.5488 45.8133 25.6922L45.804 25.7195L45.8039 25.7194L45.8006 25.7298C44.3918 30.1434 42.0389 34.4261 38.5277 37.0093C35.0498 39.5679 30.3679 40.5097 24.1491 38.1286L24.1466 38.1277C19.9085 36.5311 14.956 33.3898 10.6193 29.5806C6.27872 25.768 2.60555 21.3306 0.874655 17.169L0.873463 17.1662C0.484251 16.2463 0.417839 15.4165 0.588529 14.6566C0.760489 13.8911 1.1817 13.1594 1.82679 12.4573C3.1274 11.0417 5.27539 9.81387 7.82362 8.75228C11.9369 7.0387 16.9199 5.82426 20.6425 4.91702C21.5261 4.70166 22.3388 4.5036 23.0519 4.3203C23.0521 4.32025 23.0523 4.3202 23.0525 4.32015L36.602 0.871537Z" stroke="#6B6B6B" />
            <path className="content" d="M34.2559 27.1596L27.7744 22.6328L21.293 27.1596V12.674C21.293 12.1938 21.4881 11.7332 21.8354 11.3936C22.1827 11.0541 22.6537 10.8633 23.1448 10.8633H32.4041C32.8952 10.8633 33.3662 11.0541 33.7135 11.3936C34.0608 11.7332 34.2559 12.1938 34.2559 12.674V27.1596Z" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const OppTopbarCheckedIcon = ({ color }) => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.3346 4L6.0013 11.3333L2.66797 8" stroke={color ?? "white"} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const CheckedRoundedIcon = ({ color }) => {
    return (
        <svg width="2.5rem" height="2.5rem" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="check-circle">
                <g id="Vector">
                    <path d="M40 20C40 31.0457 31.0457 40 20 40C8.9543 40 1.24601e-09 31.0457 1.24601e-09 20C1.24601e-09 8.9543 8.9543 0 20 0C31.0457 0 40 8.9543 40 20Z" fill="#F7F7F7" />
                    <path d="M20 0C16.0444 0 12.1776 1.17298 8.8886 3.37061C5.59962 5.56823 3.03617 8.6918 1.52242 12.3463C0.00866572 16.0008 -0.387401 20.0222 0.384303 23.9018C1.15601 27.7814 3.06082 31.3451 5.85787 34.1421C8.65492 36.9392 12.2186 38.844 16.0982 39.6157C19.9778 40.3874 23.9991 39.9913 27.6537 38.4776C31.3082 36.9638 34.4318 34.4004 36.6294 31.1114C38.827 27.8224 40 23.9556 40 20C39.9898 14.6988 37.8794 9.61761 34.1309 5.86909C30.3824 2.12057 25.3012 0.0101653 20 0ZM29.5192 16.5L18.25 27.2692C17.9587 27.5433 17.5731 27.6948 17.1731 27.6923C16.9776 27.6951 16.7835 27.6592 16.6019 27.5865C16.4204 27.5139 16.255 27.4061 16.1154 27.2692L10.4808 21.8846C10.3245 21.7483 10.1974 21.5817 10.1071 21.395C10.0168 21.2083 9.96525 21.0052 9.95545 20.798C9.94564 20.5909 9.97783 20.3839 10.0501 20.1894C10.1223 19.995 10.2331 19.8172 10.3758 19.6667C10.5186 19.5162 10.6902 19.3961 10.8805 19.3137C11.0708 19.2312 11.2759 19.1881 11.4833 19.1869C11.6907 19.1857 11.8962 19.2264 12.0874 19.3067C12.2787 19.3869 12.4517 19.505 12.5962 19.6538L17.1731 24.0192L27.4039 14.2692C27.703 14.0082 28.0914 13.873 28.488 13.8918C28.8845 13.9105 29.2584 14.0818 29.5316 14.3699C29.8048 14.658 29.956 15.0405 29.9537 15.4374C29.9514 15.8344 29.7957 16.2151 29.5192 16.5Z" fill={color ?? "#0EB20B"} />
                </g>
            </g>
        </svg>
    )
}


export const OppTopbarTestIcon = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 13.334H14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 2.33414C11.2652 2.06892 11.6249 1.91992 12 1.91992C12.1857 1.91992 12.3696 1.9565 12.5412 2.02757C12.7128 2.09864 12.8687 2.20281 13 2.33414C13.1313 2.46546 13.2355 2.62136 13.3066 2.79294C13.3776 2.96452 13.4142 3.14842 13.4142 3.33414C13.4142 3.51985 13.3776 3.70375 13.3066 3.87533C13.2355 4.04691 13.1313 4.20281 13 4.33414L4.66667 12.6675L2 13.3341L2.66667 10.6675L11 2.33414Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
export const OppTopbarAIScreeningIcon = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_30878_78196)">
                <path d="M11.9998 2.66797H3.99984C3.26346 2.66797 2.6665 3.26492 2.6665 4.0013V12.0013C2.6665 12.7377 3.26346 13.3346 3.99984 13.3346H11.9998C12.7362 13.3346 13.3332 12.7377 13.3332 12.0013V4.0013C13.3332 3.26492 12.7362 2.66797 11.9998 2.66797Z" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 6H6V10H10V6Z" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 0.667969V2.66797" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 0.667969V2.66797" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 13.332V15.332" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 13.332V15.332" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.3335 6H15.3335" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.3335 9.33203H15.3335" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0.666504 6H2.6665" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M0.666504 9.33203H2.6665" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_30878_78196">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>

    )
}

export const OppTopbarLanguageIcon = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.9987 1.33398L10.0587 5.50732L14.6654 6.18065L11.332 9.42732L12.1187 14.014L7.9987 11.8473L3.8787 14.014L4.66536 9.42732L1.33203 6.18065L5.9387 5.50732L7.9987 1.33398Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const OppTopbarCallIcon = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_21294_161796)">
                <path d="M10.0317 3.33268C10.6828 3.45973 11.2813 3.77819 11.7504 4.24731C12.2195 4.71642 12.538 5.31486 12.665 5.96602M10.0317 0.666016C11.3845 0.816306 12.6461 1.42213 13.6092 2.38402C14.5723 3.34591 15.1797 4.60669 15.3317 5.95935M14.665 11.2793V13.2793C14.6657 13.465 14.6277 13.6488 14.5533 13.8189C14.479 13.989 14.3699 14.1417 14.233 14.2673C14.0962 14.3928 13.9347 14.4883 13.7588 14.5478C13.5829 14.6073 13.3966 14.6294 13.2117 14.6127C11.1602 14.3898 9.18966 13.6888 7.45833 12.566C5.84755 11.5425 4.48189 10.1768 3.45833 8.56602C2.33165 6.82682 1.63049 4.84668 1.41166 2.78602C1.395 2.60166 1.41691 2.41586 1.47599 2.24043C1.53508 2.06501 1.63004 1.90381 1.75484 1.7671C1.87964 1.63038 2.03153 1.52116 2.20086 1.44636C2.37018 1.37157 2.55322 1.33286 2.73833 1.33268H4.73833C5.06187 1.3295 5.37552 1.44407 5.62084 1.65504C5.86615 1.86601 6.02638 2.15898 6.07166 2.47935C6.15608 3.11939 6.31263 3.74783 6.53833 4.35268C6.62802 4.5913 6.64744 4.85063 6.59427 5.09994C6.5411 5.34925 6.41757 5.57809 6.23833 5.75935L5.39166 6.60602C6.3407 8.27505 7.72263 9.65698 9.39166 10.606L10.2383 9.75935C10.4196 9.58011 10.6484 9.45658 10.8977 9.40341C11.1471 9.35024 11.4064 9.36965 11.645 9.45935C12.2498 9.68505 12.8783 9.8416 13.5183 9.92602C13.8422 9.9717 14.1379 10.1348 14.3494 10.3843C14.5608 10.6339 14.6731 10.9524 14.665 11.2793Z" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_21294_161796">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}

export const OppTopbarShareProfileIcon = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 7.33398L14.6667 1.33398L8.66667 14.0007L7.33333 8.66732L2 7.33398Z" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const AlertTriangle = ({ size }) => {
    return (
        <svg width={size ?? "32"} height={size ?? "32"} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M25.724 9.64905L4.54895 44.999C4.11237 45.7551 3.88137 46.6123 3.87893 47.4853C3.87648 48.3584 4.10268 49.2169 4.53502 49.9754C4.96736 50.7339 5.59077 51.3659 6.34322 51.8087C7.09568 52.2514 7.95095 52.4895 8.82395 52.4991H51.174C52.047 52.4895 52.9022 52.2514 53.6547 51.8087C54.4071 51.3659 55.0305 50.7339 55.4629 49.9754C55.8952 49.2169 56.1214 48.3584 56.119 47.4853C56.1165 46.6123 55.8855 45.7551 55.449 44.999L34.274 9.64905C33.8283 8.91431 33.2008 8.30685 32.4519 7.88526C31.7031 7.46367 30.8583 7.24219 29.999 7.24219C29.1396 7.24219 28.2948 7.46367 27.546 7.88526C26.7971 8.30685 26.1696 8.91431 25.724 9.64905Z" fill="#E03A3A" />
            <path d="M30 22.5V32.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M30 42.5H30.025" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
export const AlertTriangleOutilne = ({ size }) => (
    <svg width={size ?? "1.5rem"} height={size ?? "1.5rem"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.2898 3.8602L1.81978 18.0002C1.64514 18.3026 1.55274 18.6455 1.55177 18.9947C1.55079 19.3439 1.64127 19.6873 1.8142 19.9907C1.98714 20.2941 2.2365 20.547 2.53748 20.7241C2.83847 20.9012 3.18058 20.9964 3.52978 21.0002H20.4698C20.819 20.9964 21.1611 20.9012 21.4621 20.7241C21.763 20.547 22.0124 20.2941 22.1853 19.9907C22.3583 19.6873 22.4488 19.3439 22.4478 18.9947C22.4468 18.6455 22.3544 18.3026 22.1798 18.0002L13.7098 3.8602C13.5315 3.56631 13.2805 3.32332 12.981 3.15469C12.6814 2.98605 12.3435 2.89746 11.9998 2.89746C11.656 2.89746 11.3181 2.98605 11.0186 3.15469C10.7191 3.32332 10.468 3.56631 10.2898 3.8602V3.8602Z" stroke="#B60707" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9V13" stroke="#B60707" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 17H12.0105" stroke="#B60707" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)



export const ArrowRightIcon = ({ height, width, stroke }) => {
    return (
        <svg width={width ?? "1.5rem"} height={height ?? "1.5rem"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19" stroke={stroke ?? "#232323"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 5L19 12L12 19" stroke={stroke ?? "#232323"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
export const ArrowRightLongIcon = () => {
    return (
        <svg width="17" height="8" viewBox="0 0 17 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.3536 4.35355C16.5488 4.15829 16.5488 3.84171 16.3536 3.64645L13.1716 0.464465C12.9763 0.269203 12.6597 0.269203 12.4645 0.464465C12.2692 0.659727 12.2692 0.97631 12.4645 1.17157L15.2929 4L12.4645 6.82843C12.2692 7.02369 12.2692 7.34027 12.4645 7.53553C12.6597 7.73079 12.9763 7.73079 13.1716 7.53553L16.3536 4.35355ZM4.37114e-08 4.5L16 4.5L16 3.5L-4.37114e-08 3.5L4.37114e-08 4.5Z" fill="#231F20" />
        </svg>
    )
}

export const ArrowDropDownIcon = ({ height = "24", width = "24" }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L12 15L18 9" stroke="#232323" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const StarFilledIcon = ({ color }) => {
    return (
        <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_21267_165809)">
                <path d="M4.9987 1.33203L6.2862 3.94036L9.16537 4.3612L7.08203 6.39037L7.5737 9.25703L4.9987 7.90286L2.4237 9.25703L2.91536 6.39037L0.832031 4.3612L3.7112 3.94036L4.9987 1.33203Z" fill={color ?? "#32936F"} stroke={color ?? "#32936F"} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_21267_165809">
                    <rect width="10" height="10" fill="white" transform="translate(0 0.5)" />
                </clipPath>
            </defs>
        </svg>
    )
}
export const SmartRecommendationIconDesktop = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" className='rec-desktop-icon'>
            <path d="M13.4581 0.664062C13.3761 1.38281 13.2276 2.22266 13.1183 2.58594C12.9894 3.01953 12.7472 3.46094 12.4933 3.71484C12.0089 4.19922 11.1339 4.47266 9.48936 4.65234C9.02842 4.69922 8.79795 4.76172 9.06358 4.76562C9.28624 4.76562 10.3605 4.91406 10.8175 5.00391C12.5519 5.35156 13.0636 5.98437 13.3761 8.18359C13.4269 8.54687 13.4815 8.96875 13.4972 9.12109L13.5284 9.39453L13.5597 9.12109C13.6534 8.32031 13.798 7.42969 13.8839 7.08984C14.2198 5.79687 14.7745 5.30469 16.2511 5.00391C16.6417 4.92187 17.8097 4.76562 18.0167 4.76562C18.2862 4.76562 18.0362 4.69922 17.5948 4.65234C16.9347 4.58203 16.0948 4.4375 15.6886 4.31641C15.0284 4.125 14.5948 3.83594 14.3175 3.40625C13.9386 2.8125 13.7823 2.17578 13.5597 0.312499L13.5284 0.0585928L13.4581 0.664062Z" fill="#232323" />
            <path d="M5.5293 3.63259C5.48633 4.13259 5.32227 5.06228 5.22852 5.35134C4.97852 6.10134 4.5918 6.48806 3.84961 6.71462C3.56836 6.80056 2.9043 6.91775 2.22461 7.00368L1.81445 7.05447L2.06836 7.08572C2.77148 7.16775 3.57617 7.31228 3.9043 7.41775C4.95117 7.75368 5.29883 8.38259 5.50977 10.3201C5.53711 10.574 5.56445 10.7732 5.57227 10.7654C5.58008 10.7576 5.62305 10.4802 5.66602 10.1521C5.83398 8.81228 6.00977 8.28884 6.43164 7.87478C6.7832 7.52322 7.42383 7.30447 8.47461 7.16775C8.74414 7.13259 9.05273 7.08962 9.1582 7.074L9.35352 7.04665L9.08008 7.0154C7.97852 6.89822 7.26367 6.74197 6.82617 6.51931C6.16602 6.18728 5.85742 5.52712 5.68164 4.074C5.58789 3.29665 5.56445 3.22634 5.5293 3.63259Z" fill="#232323" />
            <path d="M10.4356 7.10152C9.91997 11.7304 9.20122 12.457 4.59185 12.9882C4.11919 13.0429 3.72857 13.0937 3.72075 13.0976C3.71685 13.1054 3.9356 13.1328 4.20904 13.1562C5.54888 13.289 6.88482 13.5234 7.58404 13.7578C9.46294 14.3789 10.0606 15.5273 10.4551 19.2656C10.4903 19.625 10.5254 19.914 10.5333 19.9101C10.5372 19.9023 10.5801 19.5742 10.6231 19.1757C11.045 15.4023 11.6348 14.3242 13.6231 13.7109C14.3067 13.5 15.8067 13.25 17.0411 13.1406C17.209 13.125 17.3379 13.1054 17.3301 13.0976C17.3184 13.0898 17.0059 13.0468 16.6348 13.0078C13.5606 12.664 12.3965 12.2343 11.6778 11.1718C11.1661 10.4179 10.8848 9.31637 10.6231 7.01559C10.5801 6.62887 10.5372 6.30855 10.5333 6.30465C10.5293 6.29684 10.4825 6.65621 10.4356 7.10152Z" fill="#232323" />
        </svg>
    )
}

export const SmartRecommendationIconMobile = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" className='rec-mobile-icon'>
            <path d="M12.111 0.597656C12.0372 1.24453 11.9036 2.00039 11.8051 2.32734C11.6891 2.71758 11.4711 3.11484 11.2426 3.34336C10.8067 3.7793 10.0192 4.02539 8.53912 4.18711C8.12427 4.2293 7.91685 4.28555 8.15592 4.28906C8.35631 4.28906 9.3231 4.42266 9.73443 4.50352C11.2954 4.81641 11.7559 5.38594 12.0372 7.36523C12.0829 7.69219 12.1321 8.07187 12.1462 8.20898L12.1743 8.45508L12.2024 8.20898C12.2868 7.48828 12.4169 6.68672 12.4942 6.38086C12.7965 5.21719 13.2958 4.77422 14.6247 4.50352C14.9762 4.42969 16.0274 4.28906 16.2137 4.28906C16.4563 4.28906 16.2313 4.2293 15.834 4.18711C15.2399 4.12383 14.484 3.99375 14.1184 3.88477C13.5243 3.7125 13.134 3.45234 12.8844 3.06562C12.5434 2.53125 12.4028 1.9582 12.2024 0.28125L12.1743 0.0527334L12.111 0.597656Z" fill="url(#paint0_linear_383_1736)" />
            <path d="M4.9755 3.26948C4.93683 3.71948 4.78917 4.5562 4.7048 4.81635C4.4798 5.49135 4.13175 5.8394 3.46378 6.04331C3.21066 6.12065 2.613 6.22612 2.00128 6.30346L1.63214 6.34917L1.86066 6.37729C2.49347 6.45112 3.21769 6.5812 3.513 6.67612C4.45519 6.97846 4.76808 7.54448 4.95792 9.28823C4.98253 9.51674 5.00714 9.69604 5.01417 9.68901C5.0212 9.68198 5.05988 9.43237 5.09855 9.13706C5.24972 7.9312 5.40792 7.4601 5.78761 7.08745C6.10402 6.77104 6.68058 6.57417 7.62628 6.45112C7.86886 6.41948 8.14659 6.38081 8.24152 6.36674L8.4173 6.34213L8.1712 6.31401C7.1798 6.20854 6.53644 6.06792 6.14269 5.86752C5.54855 5.5687 5.27081 4.97456 5.11261 3.66674C5.02823 2.96713 5.00714 2.90385 4.9755 3.26948Z" fill="url(#paint1_linear_383_1736)" />
            <path d="M9.39161 6.39154C8.92755 10.5576 8.28067 11.2115 4.13224 11.6896C3.70685 11.7388 3.35528 11.7845 3.34825 11.788C3.34474 11.7951 3.54161 11.8197 3.78771 11.8408C4.99356 11.9603 6.19591 12.1712 6.82521 12.3822C8.51622 12.9412 9.05411 13.9747 9.40919 17.3392C9.44083 17.6626 9.47247 17.9228 9.4795 17.9193C9.48302 17.9122 9.52169 17.6169 9.56036 17.2583C9.94005 13.8622 10.4709 12.8919 12.2604 12.34C12.8756 12.1501 14.2256 11.9251 15.3365 11.8267C15.4877 11.8126 15.6037 11.7951 15.5967 11.788C15.5861 11.781 15.3049 11.7423 14.9709 11.7072C12.2041 11.3978 11.1565 11.0111 10.5096 10.0548C10.049 9.37631 9.79591 8.3849 9.56036 6.3142C9.52169 5.96615 9.48302 5.67787 9.4795 5.67435C9.47599 5.66732 9.4338 5.99076 9.39161 6.39154Z" fill="url(#paint2_linear_383_1736)" />
            <defs>
                <linearGradient id="paint0_linear_383_1736" x1="13.3826" y1="5.42267" x2="11.4687" y2="4.29425" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFD54F" />
                    <stop offset="1" stop-color="#FF9E00" />
                </linearGradient>
                <linearGradient id="paint1_linear_383_1736" x1="6.00906" y1="7.29301" x2="4.46892" y2="6.34894" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFD54F" />
                    <stop offset="1" stop-color="#FF9E00" />
                </linearGradient>
                <linearGradient id="paint2_linear_383_1736" x1="11.2496" y1="13.5001" x2="8.43707" y2="11.8126" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFD54F" />
                    <stop offset="1" stop-color="#FF9E00" />
                </linearGradient>
            </defs>
        </svg>
    )
}

export const SmartRecommendationSearchIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M9.87396 9.28725L7.00482 6.4137C7.57045 5.7348 7.91065 4.86719 7.91065 3.9196C7.91065 1.75777 6.13792 0 3.95737 0C1.77682 0 0 1.75982 0 3.92165C0 6.08348 1.77272 7.84125 3.95327 7.84125C4.8796 7.84125 5.73215 7.52333 6.40844 6.9921L9.28784 9.87386C9.45589 10.042 9.70591 10.042 9.87396 9.87386C10.042 9.70567 10.042 9.45544 9.87396 9.28725ZM0.84025 3.92165C0.84025 2.22336 2.23793 0.84299 3.95327 0.84299C5.66861 0.84299 7.0663 2.22336 7.0663 3.92165C7.0663 5.61994 5.66861 7.00031 3.95327 7.00031C2.23793 7.00031 0.84025 5.61789 0.84025 3.92165Z" fill="#6B6B6B" />
        </svg>
    )
}

export const SmartRecommendationLoaderIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3.33398V12.6673" stroke="#232323" strokeWidth="0.842105" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.33203 8H12.6654" stroke="#232323" strokeWidth="0.842105" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
export const InfoCircleIcon = ({ height = "24", width = "24" }) => (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#BABABA" fillOpacity="0.2" />
        <path d="M12 16V12" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8H12.01" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const InfoIcon = ({ height = "32", width = "32" }) => (
    <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle opacity="1" cx="16" cy="16" r="16" fill="#f5f5f5" fillOpacity="1" />
        <path d="M15.6667 22.3333C19.3486 22.3333 22.3333 19.3486 22.3333 15.6667C22.3333 11.9848 19.3486 9 15.6667 9C11.9848 9 9 11.9848 9 15.6667C9 19.3486 11.9848 22.3333 15.6667 22.3333Z" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 18.668V14.668" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 12H16.0053" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const HighestLevelStarIcon = ({ color }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <g clipPath="url(#clip0_25175_44742)">
                <path d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z" fill={color ?? "#32936F"} stroke={color ?? "#32936F"} strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_25175_44742">
                    <rect width="12" height="12" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}

export const HighestLevelInfoIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#BABABA" fillOpacity="0.2" />
            <path d="M12 16V12" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8H12.01" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const Vector = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="609" height="2" viewBox="0 0 609 2" fill="none">
            <path d="M0 1L609 1.00005" stroke="#CECCCC" strokeWidth="0.75" />
        </svg>
    )
}



export const WarningIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.2908 3.8602L1.82075 18.0002C1.64612 18.3026 1.55372 18.6455 1.55274 18.9947C1.55176 19.3439 1.64224 19.6873 1.81518 19.9907C1.98812 20.2941 2.23748 20.547 2.53846 20.7241C2.83944 20.9012 3.18155 20.9964 3.53075 21.0002H20.4708C20.82 20.9964 21.1621 20.9012 21.463 20.7241C21.764 20.547 22.0134 20.2941 22.1863 19.9907C22.3593 19.6873 22.4497 19.3439 22.4488 18.9947C22.4478 18.6455 22.3554 18.3026 22.1808 18.0002L13.7108 3.8602C13.5325 3.56631 13.2815 3.32332 12.9819 3.15469C12.6824 2.98605 12.3445 2.89746 12.0008 2.89746C11.657 2.89746 11.3191 2.98605 11.0196 3.15469C10.72 3.32332 10.469 3.56631 10.2908 3.8602V3.8602Z" stroke="#B60707" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9V13" stroke="#B60707" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 17H12.0105" stroke="#B60707" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const WarningSolidIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M13.72 5.14694L2.42669 24.0003C2.19385 24.4035 2.07065 24.8607 2.06935 25.3263C2.06804 25.7919 2.18868 26.2498 2.41926 26.6543C2.64984 27.0588 2.98233 27.3959 3.38364 27.6321C3.78495 27.8682 4.24109 27.9952 4.70669 28.0003H27.2934C27.759 27.9952 28.2151 27.8682 28.6164 27.6321C29.0177 27.3959 29.3502 27.0588 29.5808 26.6543C29.8114 26.2498 29.932 25.7919 29.9307 25.3263C29.9294 24.8607 29.8062 24.4035 29.5734 24.0003L18.28 5.14694C18.0423 4.75508 17.7077 4.4311 17.3083 4.20625C16.9089 3.9814 16.4583 3.86328 16 3.86328C15.5417 3.86328 15.0911 3.9814 14.6918 4.20625C14.2924 4.4311 13.9577 4.75508 13.72 5.14694Z" fill="#F18505" stroke="#F18505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 12V17.3333" stroke="#FFF8D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 22.666H16.0133" stroke="#FFF8D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const CloseModalIcon = ({ height = "24", width = "24" }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
export const Fi_X_Icon = () => {
    return (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M28.5 9.5L9.5 28.5" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9.5 9.5L28.5 28.5" stroke="#232323" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const WarningMobileIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M13.72 5.14694L2.42669 24.0003C2.19385 24.4035 2.07065 24.8607 2.06935 25.3263C2.06804 25.7919 2.18868 26.2498 2.41926 26.6543C2.64984 27.0588 2.98233 27.3959 3.38364 27.6321C3.78495 27.8682 4.24109 27.9952 4.70669 28.0003H27.2934C27.759 27.9952 28.2151 27.8682 28.6164 27.6321C29.0177 27.3959 29.3502 27.0588 29.5808 26.6543C29.8114 26.2498 29.932 25.7919 29.9307 25.3263C29.9294 24.8607 29.8062 24.4035 29.5734 24.0003L18.28 5.14694C18.0423 4.75508 17.7077 4.4311 17.3083 4.20625C16.9089 3.9814 16.4583 3.86328 16 3.86328C15.5417 3.86328 15.0911 3.9814 14.6918 4.20625C14.2924 4.4311 13.9577 4.75508 13.72 5.14694Z" fill="#F18505" stroke="#F18505" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 12V17.3333" stroke="#FFF8D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 22.667H16.0133" stroke="#FFF8D6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const WarningDesktopIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10.2927 3.85996L1.82271 18C1.64807 18.3024 1.55567 18.6453 1.5547 18.9945C1.55372 19.3437 1.6442 19.6871 1.81713 19.9905C1.99007 20.2939 2.23943 20.5467 2.54041 20.7238C2.8414 20.9009 3.18351 20.9961 3.53271 21H20.4727C20.8219 20.9961 21.164 20.9009 21.465 20.7238C21.766 20.5467 22.0153 20.2939 22.1883 19.9905C22.3612 19.6871 22.4517 19.3437 22.4507 18.9945C22.4497 18.6453 22.3573 18.3024 22.1827 18L13.7127 3.85996C13.5344 3.56607 13.2834 3.32308 12.9839 3.15444C12.6844 2.98581 12.3464 2.89722 12.0027 2.89722C11.659 2.89722 11.321 2.98581 11.0215 3.15444C10.722 3.32308 10.471 3.56607 10.2927 3.85996V3.85996Z" stroke="#B60707" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 9V13" stroke="#B60707" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 17H12.0105" stroke="#B60707" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const InfoNisarIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M7.66667 14.3333C11.3486 14.3333 14.3333 11.3486 14.3333 7.66667C14.3333 3.98477 11.3486 1 7.66667 1C3.98477 1 1 3.98477 1 7.66667C1 11.3486 3.98477 14.3333 7.66667 14.3333Z" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 10.667V6.66699" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 4H8.00667" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
export const InfoFlatIcon = () => {
    return (
        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

    )
}

export const BackArrowIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none">
            <path d="M23 12L5 12" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 5L5 12L12 19" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const ProfilePlayIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 32 32" fill="none">
            <path d="M16.0003 29.3334C23.3641 29.3334 29.3337 23.3638 29.3337 16C29.3337 8.63622 23.3641 2.66669 16.0003 2.66669C8.63653 2.66669 2.66699 8.63622 2.66699 16C2.66699 23.3638 8.63653 29.3334 16.0003 29.3334Z" fill="#BABABA" fillOpacity="0.2" />
            <path d="M13.333 10.6667L21.333 16L13.333 21.3334V10.6667Z" fill="#232323" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export const LoginIcon = () => {
    return (
        <svg width="2.5625rem" height="2.5rem" viewBox="0 0 41 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1_275_3565" fill="white">
                <path d="M37.9462 27.2078C38.2847 27.3438 38.4499 27.7289 38.3028 28.0627C36.6019 31.9241 33.7202 35.1544 30.0641 37.2833C26.2176 39.5232 21.7337 40.4159 17.3226 39.82C12.9115 39.2241 8.82522 37.1737 5.71083 33.9936C2.59644 30.8134 0.631934 26.6851 0.128388 22.2625C-0.375158 17.8399 0.611035 13.3757 2.93081 9.57682C5.25058 5.77792 8.77134 2.86144 12.9356 1.28919C17.0999 -0.283051 21.6696 -0.4212 25.9212 0.896622C29.9623 2.14917 33.4964 4.649 36.0219 8.0292C36.2402 8.32139 36.1658 8.73381 35.8666 8.94235V8.94235C35.5673 9.15089 35.1566 9.07653 34.9376 8.78485C32.5807 5.64558 29.2904 3.32373 25.5302 2.15822C21.5593 0.927425 17.2914 1.05645 13.4021 2.52486C9.51289 3.99328 6.22463 6.71715 4.05806 10.2652C1.89149 13.8132 0.970426 17.9826 1.44072 22.1131C1.91101 26.2436 3.74578 30.0993 6.65449 33.0694C9.56321 36.0396 13.3796 37.9545 17.4994 38.5111C21.6192 39.0676 25.807 38.2339 29.3995 36.1419C32.8015 34.1609 35.4856 31.1589 37.0765 27.5701C37.2243 27.2367 37.6078 27.0719 37.9462 27.2078V27.2078Z" />
            </mask>
            <path d="M37.9462 27.2078C38.2847 27.3438 38.4499 27.7289 38.3028 28.0627C36.6019 31.9241 33.7202 35.1544 30.0641 37.2833C26.2176 39.5232 21.7337 40.4159 17.3226 39.82C12.9115 39.2241 8.82522 37.1737 5.71083 33.9936C2.59644 30.8134 0.631934 26.6851 0.128388 22.2625C-0.375158 17.8399 0.611035 13.3757 2.93081 9.57682C5.25058 5.77792 8.77134 2.86144 12.9356 1.28919C17.0999 -0.283051 21.6696 -0.4212 25.9212 0.896622C29.9623 2.14917 33.4964 4.649 36.0219 8.0292C36.2402 8.32139 36.1658 8.73381 35.8666 8.94235V8.94235C35.5673 9.15089 35.1566 9.07653 34.9376 8.78485C32.5807 5.64558 29.2904 3.32373 25.5302 2.15822C21.5593 0.927425 17.2914 1.05645 13.4021 2.52486C9.51289 3.99328 6.22463 6.71715 4.05806 10.2652C1.89149 13.8132 0.970426 17.9826 1.44072 22.1131C1.91101 26.2436 3.74578 30.0993 6.65449 33.0694C9.56321 36.0396 13.3796 37.9545 17.4994 38.5111C21.6192 39.0676 25.807 38.2339 29.3995 36.1419C32.8015 34.1609 35.4856 31.1589 37.0765 27.5701C37.2243 27.2367 37.6078 27.0719 37.9462 27.2078V27.2078Z" stroke="#232323" stroke-width="2" mask="url(#path-1-inside-1_275_3565)" />
            <path d="M24.3334 28.25V26.4167C24.3334 25.4442 23.9471 24.5116 23.2595 23.8239C22.5718 23.1363 21.6392 22.75 20.6667 22.75H13.3334C12.361 22.75 11.4283 23.1363 10.7407 23.8239C10.0531 24.5116 9.66675 25.4442 9.66675 26.4167V28.25" stroke="#232323" stroke-width="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16.9999 19.0833C19.025 19.0833 20.6666 17.4417 20.6666 15.4167C20.6666 13.3916 19.025 11.75 16.9999 11.75C14.9749 11.75 13.3333 13.3916 13.3333 15.4167C13.3333 17.4417 14.9749 19.0833 16.9999 19.0833Z" stroke="#232323" stroke-width="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M31 24L27 20L31 16" stroke="#232323" stroke-width="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 20H28" stroke="#232323" stroke-width="1.5" stroke-miterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}



export const PowerIcon = () => (
    <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="fi:power">
            <path id="Vector" d="M18.3601 6.64014C19.6185 7.89893 20.4754 9.50258 20.8224 11.2483C21.1694 12.9941 20.991 14.8035 20.3098 16.4479C19.6285 18.0923 18.4749 19.4977 16.9949 20.4865C15.515 21.4753 13.775 22.0031 11.9951 22.0031C10.2152 22.0031 8.47527 21.4753 6.99529 20.4865C5.51532 19.4977 4.36176 18.0923 3.68049 16.4479C2.99921 14.8035 2.82081 12.9941 3.16784 11.2483C3.51487 9.50258 4.37174 7.89893 5.63012 6.64014" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_2" d="M12 2V12" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>
    </svg>
)

export const SnoozeIcon = () => (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="Group 3577">
            <path id="Vector" d="M18.1433 8.70259C18.1433 6.84972 17.4209 5.07273 16.1349 3.76254C14.8489 2.45236 13.1047 1.71631 11.286 1.71631C9.46733 1.71631 7.72314 2.45236 6.43714 3.76254C5.15114 5.07273 4.42867 6.84972 4.42867 8.70259C4.42867 16.8533 1 19.182 1 19.182H21.572C21.572 19.182 18.1433 16.8533 18.1433 8.70259Z" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_2" d="M13.2669 23.8398C13.066 24.1927 12.7776 24.4857 12.4306 24.6893C12.0836 24.8929 11.6901 25.0001 11.2897 25.0001C10.8893 25.0001 10.4958 24.8929 10.1488 24.6893C9.80184 24.4857 9.51343 24.1927 9.3125 23.8398" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <ellipse id="Ellipse 116" cx="16.5616" cy="8.79233" rx="5.80236" ry="5.91147" fill="white" />
            <g id="Z">
                <path d="M15.4567 11.4173H19.7266V12.2856H14.188V11.6069L18.3538 6.16761H14.2543V5.29932H19.6035V5.97798L15.4567 11.4173Z" fill="#6B6B6B" fill-opacity="0.6" />
                <path d="M19.7766 11.4173V11.3673H19.7266H15.5577L19.6433 6.0083L19.6535 5.99487V5.97798V5.29932V5.24932H19.6035H14.2543H14.2043V5.29932V6.16761V6.21761H14.2543H18.2525L14.1483 11.5765L14.138 11.59V11.6069V12.2856V12.3356H14.188H19.7266H19.7766V12.2856V11.4173Z" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="0.1" />
            </g>
            <g id="Z_2">
                <path d="M22.7632 4.2943H24.9998V4.76185H22.0986V4.39641L24.2807 1.46754H22.1333V1H24.9353V1.36544L22.7632 4.2943Z" fill="#6B6B6B" fill-opacity="0.6" />
                <path d="M25.0498 4.2943V4.2443H24.9998H22.8625L24.9755 1.39522L24.9853 1.38195V1.36544V1V0.95H24.9353H22.1333H22.0833V1V1.46754V1.51754H22.1333H24.1811L22.0585 4.36654L22.0486 4.37983V4.39641V4.76185V4.81185H22.0986H24.9998H25.0498V4.76185V4.2943Z" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="0.1" />
            </g>
        </g>
    </svg>
)

export const UserDelteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="fi:user-x">
            <path id="Vector" d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_2" d="M18 8L23 13" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_3" d="M23 8L18 13" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_4" d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="#6B6B6B" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>
    </svg>
)


export const AlertRedIcon = ({ width, height }) => (
    <svg width={width ?? "1rem"} height={height ?? "1rem"} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="fi:alert-circle" clip-path="url(#clip0_292_3852)">
            <path id="Vector" d="M8.00016 14.6663C11.6821 14.6663 14.6668 11.6816 14.6668 7.99967C14.6668 4.31778 11.6821 1.33301 8.00016 1.33301C4.31826 1.33301 1.3335 4.31778 1.3335 7.99967C1.3335 11.6816 4.31826 14.6663 8.00016 14.6663Z" stroke="#E03A3A" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_2" d="M8 10.667H8.00667" stroke="#E03A3A" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_3" d="M8 5.33301V7.99967" stroke="#E03A3A" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
            <clipPath id="clip0_292_3852">
                <rect width="16" height="16" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

export const HomeIcon_Fi = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="fi:home">
            <path id="Vector" d="M4 11.9998L16 2.6665L28 11.9998V26.6665C28 27.3737 27.719 28.052 27.219 28.5521C26.7189 29.0522 26.0406 29.3332 25.3333 29.3332H6.66667C5.95942 29.3332 5.28115 29.0522 4.78105 28.5521C4.28095 28.052 4 27.3737 4 26.6665V11.9998Z" stroke="#232323" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_2" d="M12 29.3333V16H20V29.3333" stroke="#232323" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </g>
    </svg>
)

export const GlobeIcon_Fi = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="fi:globe">
            <path id="Vector" d="M15.9998 29.3332C23.3636 29.3332 29.3332 23.3636 29.3332 15.9998C29.3332 8.63604 23.3636 2.6665 15.9998 2.6665C8.63604 2.6665 2.6665 8.63604 2.6665 15.9998C2.6665 23.3636 8.63604 29.3332 15.9998 29.3332Z" stroke="#232323" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_2" d="M2.6665 16H29.3332" stroke="#232323" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_3" d="M15.9998 2.6665C19.3349 6.31764 21.2302 11.0559 21.3332 15.9998C21.2302 20.9438 19.3349 25.682 15.9998 29.3332C12.6648 25.682 10.7695 20.9438 10.6665 15.9998C10.7695 11.0559 12.6648 6.31764 15.9998 2.6665V2.6665Z" stroke="#232323" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </g>
    </svg>
)

export const MoneyIcon = ({ color }) => (
    <svg width="2rem" height="2rem" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="money (1) 1">
            <g id="XMLID_489_">
                <path id="XMLID_366_" d="M31.0625 7.979H0.9375V24.0207H31.0625V7.979Z" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="square" />
                <path id="XMLID_462_" d="M17.2919 7.97866L4.21231 3.6626L2.79688 7.95197" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" />
                <path id="XMLID_460_" d="M14.7031 24.0205L27.7828 28.3366L29.207 24.0205" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" />
                <path id="XMLID_367_" d="M4.8125 7.979C4.8125 10.1191 3.07763 11.854 0.9375 11.854" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="square" />
                <path id="XMLID_417_" d="M31.0625 11.854C28.9224 11.854 27.1875 10.1191 27.1875 7.979" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="square" />
                <path id="XMLID_371_" d="M0.9375 20.1455C3.07763 20.1455 4.8125 21.8804 4.8125 24.0205" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="square" />
                <path id="XMLID_392_" d="M27.1875 24.0205C27.1875 21.8804 28.9224 20.1455 31.0625 20.1455" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="square" />
                <path id="XMLID_370_" d="M16.0052 19.8956C18.1568 19.8956 19.901 18.1514 19.901 15.9998C19.901 13.8482 18.1568 12.104 16.0052 12.104C13.8536 12.104 12.1094 13.8482 12.1094 15.9998C12.1094 18.1514 13.8536 19.8956 16.0052 19.8956Z" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="square" />
                <path id="XMLID_419_" d="M7.38019 16H5.92188" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="square" />
                <path id="XMLID_421_" d="M26.1615 16H24.7031" stroke={color ?? "#232323"} stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="square" />
            </g>
        </g>
    </svg>
)

export const HeartHandshakeIcon = ({ color }) => (
    <svg width="2rem" height="2rem" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="heart-handshake">
            <path id="Vector" d="M27.2268 6.10645C26.5579 5.43522 25.763 4.90263 24.8879 4.53923C24.0127 4.17583 23.0744 3.98877 22.1268 3.98877C21.1792 3.98877 20.2409 4.17583 19.3657 4.53923C18.4905 4.90263 17.6957 5.43522 17.0268 6.10645L16.0001 7.14645L14.9734 6.10645C14.3045 5.43522 13.5097 4.90263 12.6345 4.53923C11.7594 4.17583 10.8211 3.98877 9.87345 3.98877C8.92583 3.98877 7.98753 4.17583 7.11235 4.53923C6.23718 4.90263 5.44235 5.43522 4.77345 6.10645C1.94678 8.93311 1.77345 13.7064 5.33345 17.3331L16.0001 27.9998L26.6668 17.3331C30.2268 13.7064 30.0534 8.93311 27.2268 6.10645Z" stroke={color ?? "#232323"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_2" d="M15.9999 7.14648L11.8266 11.3332C11.299 11.8651 11.0029 12.5839 11.0029 13.3332C11.0029 14.0824 11.299 14.8012 11.8266 15.3332C12.3585 15.8608 13.0774 16.1568 13.8266 16.1568C14.5758 16.1568 15.2947 15.8608 15.8266 15.3332L18.8399 12.3865C19.5888 11.6455 20.5998 11.2299 21.6533 11.2299C22.7068 11.2299 23.7177 11.6455 24.4666 12.3865L27.6666 15.5865" stroke={color ?? "#232323"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_3" d="M24.0002 20.0002L21.3335 17.3335" stroke={color ?? "#232323"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_4" d="M20.0002 24.0002L17.3335 21.3335" stroke={color ?? "#232323"} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </g>
    </svg>
)

export const RewardIcon = () => (
    <svg width="2rem" height="2rem" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="rewards" clip-path="url(#clip0_11778_154342)">
            <g id="Vector">
                <mask id="path-1-outside-1_11778_154342" maskUnits="userSpaceOnUse" x="3.30469" y="-1" width="25" height="34" fill="black">
                    <rect fill="white" x="3.30469" y="-1" width="25" height="34" />
                    <path d="M27.251 2.52875C27.0766 2.32367 26.8596 2.15898 26.6152 2.0461C26.3708 1.93321 26.1047 1.87483 25.8355 1.875H24.2326C24.2151 1.71738 24.1959 1.5645 24.1753 1.418C24.1176 1.02477 23.9207 0.66531 23.6203 0.405059C23.3199 0.144808 22.9361 0.00106719 22.5386 0L9.46114 0C9.06371 0.00108437 8.67988 0.144841 8.37951 0.405103C8.07915 0.665366 7.88222 1.02483 7.82458 1.41806C7.80395 1.56456 7.78483 1.71744 7.76727 1.875H6.16427C5.89501 1.87505 5.62897 1.93356 5.38454 2.0465C5.14011 2.15943 4.92311 2.32408 4.74855 2.52908C4.57398 2.73409 4.446 2.97455 4.37346 3.23385C4.30092 3.49315 4.28554 3.76511 4.32839 4.03094L4.67964 6.20706C4.97881 8.06857 5.8097 9.80392 7.07226 11.2042C8.33482 12.6044 9.97522 13.6098 11.796 14.0994C12.4276 14.7759 13.1169 15.3961 13.8562 15.9529C13.5935 16.1012 13.3794 16.3224 13.2398 16.5898C13.1001 16.8572 13.0409 17.1593 13.0693 17.4596C13.0976 17.7599 13.2124 18.0456 13.3996 18.2821C13.5868 18.5186 13.8385 18.6958 14.1243 18.7923C14.0536 19.4768 13.875 20.1458 13.5952 20.7744C12.8425 22.4589 11.5315 23.4232 10.751 23.875H10.5624C10.2724 23.8753 9.99441 23.9907 9.78936 24.1957C9.58431 24.4008 9.46897 24.6788 9.46864 24.9688V28.875H8.68739C8.39741 28.8753 8.11941 28.9907 7.91436 29.1957C7.70931 29.4008 7.59397 29.6788 7.59364 29.9688V30.9062C7.59397 31.1962 7.70931 31.4742 7.91436 31.6793C8.11941 31.8843 8.39741 31.9997 8.68739 32H23.3124C23.6024 31.9997 23.8804 31.8843 24.0854 31.6793C24.2905 31.4742 24.4058 31.1962 24.4061 30.9062V29.9688C24.4058 29.6788 24.2905 29.4008 24.0854 29.1957C23.8804 28.9907 23.6024 28.8753 23.3124 28.875H22.5311V24.9688C22.5308 24.6788 22.4155 24.4008 22.2104 24.1957C22.0054 23.9907 21.7274 23.8753 21.4374 23.875H21.2488C20.4683 23.4231 19.1573 22.4589 18.4046 20.7744C18.1248 20.1457 17.9462 19.4768 17.8755 18.7923C18.1612 18.6958 18.413 18.5186 18.6002 18.2821C18.7874 18.0456 18.9021 17.7599 18.9305 17.4596C18.9589 17.1593 18.8996 16.8572 18.76 16.5898C18.6203 16.3224 18.4062 16.1012 18.1436 15.9529C18.8829 15.3961 19.5722 14.7759 20.2038 14.0994C22.0245 13.6098 23.6649 12.6044 24.9275 11.2042C26.1901 9.804 27.021 8.06868 27.3201 6.20719L27.6714 4.03081C27.7144 3.76494 27.6991 3.49288 27.6265 3.23351C27.5539 2.97414 27.4258 2.73366 27.251 2.52875ZM5.6052 6.05781L5.25395 3.88169C5.23272 3.74987 5.24036 3.61502 5.27633 3.48644C5.31231 3.35787 5.37576 3.23863 5.46232 3.13697C5.54887 3.03531 5.65646 2.95365 5.77765 2.89763C5.89884 2.84161 6.03075 2.81257 6.16427 2.8125H7.69139C7.56184 5.22571 8.00253 7.63551 8.97777 9.84669C9.42109 10.8479 9.97173 11.7981 10.62 12.6806C9.30577 12.0717 8.16117 11.1493 7.28678 9.99454C6.41238 8.83977 5.83495 7.48794 5.6052 6.05781ZM23.3124 29.8125C23.3538 29.8125 23.3935 29.829 23.4228 29.8583C23.4521 29.8876 23.4686 29.9273 23.4686 29.9688V30.9062C23.4686 30.9477 23.4521 30.9874 23.4228 31.0167C23.3935 31.046 23.3538 31.0625 23.3124 31.0625H8.68739C8.64597 31.0625 8.60625 31.046 8.57696 31.0167C8.54767 30.9874 8.53119 30.9477 8.53114 30.9062V29.9688C8.53119 29.9273 8.54767 29.8876 8.57696 29.8583C8.60625 29.829 8.64597 29.8125 8.68739 29.8125H23.3124ZM21.123 24.8125L21.1245 24.8126L21.1258 24.8125H21.4374C21.4788 24.8125 21.5185 24.829 21.5478 24.8583C21.5771 24.8876 21.5936 24.9273 21.5936 24.9688V28.875H10.4061V24.9688C10.4062 24.9273 10.4227 24.8876 10.452 24.8583C10.4813 24.829 10.521 24.8125 10.5624 24.8125H10.874L10.8753 24.8126L10.8768 24.8125H21.123ZM19.6234 23.875H12.3764C13.2657 23.1385 13.9753 22.2089 14.4512 21.1569C14.7738 20.4334 14.9791 19.6631 15.0593 18.875H16.9405C17.0207 19.6631 17.2259 20.4334 17.5486 21.1569C18.0245 22.2089 18.7341 23.1385 19.6234 23.875ZM17.3749 17.9375H14.6249C14.4591 17.9375 14.3002 17.8717 14.183 17.7544C14.0657 17.6372 13.9999 17.4783 13.9999 17.3125C13.9999 17.1467 14.0657 16.9878 14.183 16.8706C14.3002 16.7533 14.4591 16.6875 14.6249 16.6875H15.0405C15.0551 16.6881 15.0698 16.6882 15.0843 16.6875H16.9235C16.9283 16.6876 16.933 16.6884 16.9378 16.6884C16.9421 16.6884 16.9463 16.6876 16.9506 16.6875H17.3749C17.5407 16.6875 17.6996 16.7533 17.8168 16.8706C17.934 16.9878 17.9999 17.1467 17.9999 17.3125C17.9999 17.4783 17.934 17.6372 17.8168 17.7544C17.6996 17.8717 17.5407 17.9375 17.3749 17.9375ZM16.8008 15.75H15.199C13.7911 14.8344 11.3328 12.8529 9.83502 9.46744C8.45658 6.35138 8.48564 3.4415 8.75283 1.54912C8.77804 1.37924 8.86341 1.22406 8.99339 1.11181C9.12338 0.99956 9.28934 0.937705 9.46108 0.9375H22.5386C22.7104 0.937694 22.8763 0.999547 23.0063 1.1118C23.1363 1.22405 23.2216 1.37924 23.2468 1.54912C23.5141 3.4415 23.5431 6.35138 22.1647 9.46744C20.667 12.8529 18.2086 14.8343 16.8007 15.75H16.8008ZM26.7459 3.8815L26.3946 6.05794C26.1649 7.48805 25.5874 8.83986 24.713 9.9946C23.8386 11.1494 22.694 12.0717 21.3798 12.6806C22.0281 11.7981 22.5787 10.8479 23.022 9.84669C23.9973 7.63551 24.4379 5.22571 24.3084 2.8125H25.8355C25.969 2.81255 26.1009 2.84158 26.2221 2.89758C26.3433 2.95358 26.4509 3.03522 26.5375 3.13686C26.624 3.23851 26.6875 3.35772 26.7235 3.48629C26.7595 3.61485 26.7671 3.74969 26.7459 3.8815Z" />
                </mask>
                <path d="M27.251 2.52875C27.0766 2.32367 26.8596 2.15898 26.6152 2.0461C26.3708 1.93321 26.1047 1.87483 25.8355 1.875H24.2326C24.2151 1.71738 24.1959 1.5645 24.1753 1.418C24.1176 1.02477 23.9207 0.66531 23.6203 0.405059C23.3199 0.144808 22.9361 0.00106719 22.5386 0L9.46114 0C9.06371 0.00108437 8.67988 0.144841 8.37951 0.405103C8.07915 0.665366 7.88222 1.02483 7.82458 1.41806C7.80395 1.56456 7.78483 1.71744 7.76727 1.875H6.16427C5.89501 1.87505 5.62897 1.93356 5.38454 2.0465C5.14011 2.15943 4.92311 2.32408 4.74855 2.52908C4.57398 2.73409 4.446 2.97455 4.37346 3.23385C4.30092 3.49315 4.28554 3.76511 4.32839 4.03094L4.67964 6.20706C4.97881 8.06857 5.8097 9.80392 7.07226 11.2042C8.33482 12.6044 9.97522 13.6098 11.796 14.0994C12.4276 14.7759 13.1169 15.3961 13.8562 15.9529C13.5935 16.1012 13.3794 16.3224 13.2398 16.5898C13.1001 16.8572 13.0409 17.1593 13.0693 17.4596C13.0976 17.7599 13.2124 18.0456 13.3996 18.2821C13.5868 18.5186 13.8385 18.6958 14.1243 18.7923C14.0536 19.4768 13.875 20.1458 13.5952 20.7744C12.8425 22.4589 11.5315 23.4232 10.751 23.875H10.5624C10.2724 23.8753 9.99441 23.9907 9.78936 24.1957C9.58431 24.4008 9.46897 24.6788 9.46864 24.9688V28.875H8.68739C8.39741 28.8753 8.11941 28.9907 7.91436 29.1957C7.70931 29.4008 7.59397 29.6788 7.59364 29.9688V30.9062C7.59397 31.1962 7.70931 31.4742 7.91436 31.6793C8.11941 31.8843 8.39741 31.9997 8.68739 32H23.3124C23.6024 31.9997 23.8804 31.8843 24.0854 31.6793C24.2905 31.4742 24.4058 31.1962 24.4061 30.9062V29.9688C24.4058 29.6788 24.2905 29.4008 24.0854 29.1957C23.8804 28.9907 23.6024 28.8753 23.3124 28.875H22.5311V24.9688C22.5308 24.6788 22.4155 24.4008 22.2104 24.1957C22.0054 23.9907 21.7274 23.8753 21.4374 23.875H21.2488C20.4683 23.4231 19.1573 22.4589 18.4046 20.7744C18.1248 20.1457 17.9462 19.4768 17.8755 18.7923C18.1612 18.6958 18.413 18.5186 18.6002 18.2821C18.7874 18.0456 18.9021 17.7599 18.9305 17.4596C18.9589 17.1593 18.8996 16.8572 18.76 16.5898C18.6203 16.3224 18.4062 16.1012 18.1436 15.9529C18.8829 15.3961 19.5722 14.7759 20.2038 14.0994C22.0245 13.6098 23.6649 12.6044 24.9275 11.2042C26.1901 9.804 27.021 8.06868 27.3201 6.20719L27.6714 4.03081C27.7144 3.76494 27.6991 3.49288 27.6265 3.23351C27.5539 2.97414 27.4258 2.73366 27.251 2.52875ZM5.6052 6.05781L5.25395 3.88169C5.23272 3.74987 5.24036 3.61502 5.27633 3.48644C5.31231 3.35787 5.37576 3.23863 5.46232 3.13697C5.54887 3.03531 5.65646 2.95365 5.77765 2.89763C5.89884 2.84161 6.03075 2.81257 6.16427 2.8125H7.69139C7.56184 5.22571 8.00253 7.63551 8.97777 9.84669C9.42109 10.8479 9.97173 11.7981 10.62 12.6806C9.30577 12.0717 8.16117 11.1493 7.28678 9.99454C6.41238 8.83977 5.83495 7.48794 5.6052 6.05781ZM23.3124 29.8125C23.3538 29.8125 23.3935 29.829 23.4228 29.8583C23.4521 29.8876 23.4686 29.9273 23.4686 29.9688V30.9062C23.4686 30.9477 23.4521 30.9874 23.4228 31.0167C23.3935 31.046 23.3538 31.0625 23.3124 31.0625H8.68739C8.64597 31.0625 8.60625 31.046 8.57696 31.0167C8.54767 30.9874 8.53119 30.9477 8.53114 30.9062V29.9688C8.53119 29.9273 8.54767 29.8876 8.57696 29.8583C8.60625 29.829 8.64597 29.8125 8.68739 29.8125H23.3124ZM21.123 24.8125L21.1245 24.8126L21.1258 24.8125H21.4374C21.4788 24.8125 21.5185 24.829 21.5478 24.8583C21.5771 24.8876 21.5936 24.9273 21.5936 24.9688V28.875H10.4061V24.9688C10.4062 24.9273 10.4227 24.8876 10.452 24.8583C10.4813 24.829 10.521 24.8125 10.5624 24.8125H10.874L10.8753 24.8126L10.8768 24.8125H21.123ZM19.6234 23.875H12.3764C13.2657 23.1385 13.9753 22.2089 14.4512 21.1569C14.7738 20.4334 14.9791 19.6631 15.0593 18.875H16.9405C17.0207 19.6631 17.2259 20.4334 17.5486 21.1569C18.0245 22.2089 18.7341 23.1385 19.6234 23.875ZM17.3749 17.9375H14.6249C14.4591 17.9375 14.3002 17.8717 14.183 17.7544C14.0657 17.6372 13.9999 17.4783 13.9999 17.3125C13.9999 17.1467 14.0657 16.9878 14.183 16.8706C14.3002 16.7533 14.4591 16.6875 14.6249 16.6875H15.0405C15.0551 16.6881 15.0698 16.6882 15.0843 16.6875H16.9235C16.9283 16.6876 16.933 16.6884 16.9378 16.6884C16.9421 16.6884 16.9463 16.6876 16.9506 16.6875H17.3749C17.5407 16.6875 17.6996 16.7533 17.8168 16.8706C17.934 16.9878 17.9999 17.1467 17.9999 17.3125C17.9999 17.4783 17.934 17.6372 17.8168 17.7544C17.6996 17.8717 17.5407 17.9375 17.3749 17.9375ZM16.8008 15.75H15.199C13.7911 14.8344 11.3328 12.8529 9.83502 9.46744C8.45658 6.35138 8.48564 3.4415 8.75283 1.54912C8.77804 1.37924 8.86341 1.22406 8.99339 1.11181C9.12338 0.99956 9.28934 0.937705 9.46108 0.9375H22.5386C22.7104 0.937694 22.8763 0.999547 23.0063 1.1118C23.1363 1.22405 23.2216 1.37924 23.2468 1.54912C23.5141 3.4415 23.5431 6.35138 22.1647 9.46744C20.667 12.8529 18.2086 14.8343 16.8007 15.75H16.8008ZM26.7459 3.8815L26.3946 6.05794C26.1649 7.48805 25.5874 8.83986 24.713 9.9946C23.8386 11.1494 22.694 12.0717 21.3798 12.6806C22.0281 11.7981 22.5787 10.8479 23.022 9.84669C23.9973 7.63551 24.4379 5.22571 24.3084 2.8125H25.8355C25.969 2.81255 26.1009 2.84158 26.2221 2.89758C26.3433 2.95358 26.4509 3.03522 26.5375 3.13686C26.624 3.23851 26.6875 3.35772 26.7235 3.48629C26.7595 3.61485 26.7671 3.74969 26.7459 3.8815Z" fill="white" />
                <path d="M27.251 2.52875C27.0766 2.32367 26.8596 2.15898 26.6152 2.0461C26.3708 1.93321 26.1047 1.87483 25.8355 1.875H24.2326C24.2151 1.71738 24.1959 1.5645 24.1753 1.418C24.1176 1.02477 23.9207 0.66531 23.6203 0.405059C23.3199 0.144808 22.9361 0.00106719 22.5386 0L9.46114 0C9.06371 0.00108437 8.67988 0.144841 8.37951 0.405103C8.07915 0.665366 7.88222 1.02483 7.82458 1.41806C7.80395 1.56456 7.78483 1.71744 7.76727 1.875H6.16427C5.89501 1.87505 5.62897 1.93356 5.38454 2.0465C5.14011 2.15943 4.92311 2.32408 4.74855 2.52908C4.57398 2.73409 4.446 2.97455 4.37346 3.23385C4.30092 3.49315 4.28554 3.76511 4.32839 4.03094L4.67964 6.20706C4.97881 8.06857 5.8097 9.80392 7.07226 11.2042C8.33482 12.6044 9.97522 13.6098 11.796 14.0994C12.4276 14.7759 13.1169 15.3961 13.8562 15.9529C13.5935 16.1012 13.3794 16.3224 13.2398 16.5898C13.1001 16.8572 13.0409 17.1593 13.0693 17.4596C13.0976 17.7599 13.2124 18.0456 13.3996 18.2821C13.5868 18.5186 13.8385 18.6958 14.1243 18.7923C14.0536 19.4768 13.875 20.1458 13.5952 20.7744C12.8425 22.4589 11.5315 23.4232 10.751 23.875H10.5624C10.2724 23.8753 9.99441 23.9907 9.78936 24.1957C9.58431 24.4008 9.46897 24.6788 9.46864 24.9688V28.875H8.68739C8.39741 28.8753 8.11941 28.9907 7.91436 29.1957C7.70931 29.4008 7.59397 29.6788 7.59364 29.9688V30.9062C7.59397 31.1962 7.70931 31.4742 7.91436 31.6793C8.11941 31.8843 8.39741 31.9997 8.68739 32H23.3124C23.6024 31.9997 23.8804 31.8843 24.0854 31.6793C24.2905 31.4742 24.4058 31.1962 24.4061 30.9062V29.9688C24.4058 29.6788 24.2905 29.4008 24.0854 29.1957C23.8804 28.9907 23.6024 28.8753 23.3124 28.875H22.5311V24.9688C22.5308 24.6788 22.4155 24.4008 22.2104 24.1957C22.0054 23.9907 21.7274 23.8753 21.4374 23.875H21.2488C20.4683 23.4231 19.1573 22.4589 18.4046 20.7744C18.1248 20.1457 17.9462 19.4768 17.8755 18.7923C18.1612 18.6958 18.413 18.5186 18.6002 18.2821C18.7874 18.0456 18.9021 17.7599 18.9305 17.4596C18.9589 17.1593 18.8996 16.8572 18.76 16.5898C18.6203 16.3224 18.4062 16.1012 18.1436 15.9529C18.8829 15.3961 19.5722 14.7759 20.2038 14.0994C22.0245 13.6098 23.6649 12.6044 24.9275 11.2042C26.1901 9.804 27.021 8.06868 27.3201 6.20719L27.6714 4.03081C27.7144 3.76494 27.6991 3.49288 27.6265 3.23351C27.5539 2.97414 27.4258 2.73366 27.251 2.52875ZM5.6052 6.05781L5.25395 3.88169C5.23272 3.74987 5.24036 3.61502 5.27633 3.48644C5.31231 3.35787 5.37576 3.23863 5.46232 3.13697C5.54887 3.03531 5.65646 2.95365 5.77765 2.89763C5.89884 2.84161 6.03075 2.81257 6.16427 2.8125H7.69139C7.56184 5.22571 8.00253 7.63551 8.97777 9.84669C9.42109 10.8479 9.97173 11.7981 10.62 12.6806C9.30577 12.0717 8.16117 11.1493 7.28678 9.99454C6.41238 8.83977 5.83495 7.48794 5.6052 6.05781ZM23.3124 29.8125C23.3538 29.8125 23.3935 29.829 23.4228 29.8583C23.4521 29.8876 23.4686 29.9273 23.4686 29.9688V30.9062C23.4686 30.9477 23.4521 30.9874 23.4228 31.0167C23.3935 31.046 23.3538 31.0625 23.3124 31.0625H8.68739C8.64597 31.0625 8.60625 31.046 8.57696 31.0167C8.54767 30.9874 8.53119 30.9477 8.53114 30.9062V29.9688C8.53119 29.9273 8.54767 29.8876 8.57696 29.8583C8.60625 29.829 8.64597 29.8125 8.68739 29.8125H23.3124ZM21.123 24.8125L21.1245 24.8126L21.1258 24.8125H21.4374C21.4788 24.8125 21.5185 24.829 21.5478 24.8583C21.5771 24.8876 21.5936 24.9273 21.5936 24.9688V28.875H10.4061V24.9688C10.4062 24.9273 10.4227 24.8876 10.452 24.8583C10.4813 24.829 10.521 24.8125 10.5624 24.8125H10.874L10.8753 24.8126L10.8768 24.8125H21.123ZM19.6234 23.875H12.3764C13.2657 23.1385 13.9753 22.2089 14.4512 21.1569C14.7738 20.4334 14.9791 19.6631 15.0593 18.875H16.9405C17.0207 19.6631 17.2259 20.4334 17.5486 21.1569C18.0245 22.2089 18.7341 23.1385 19.6234 23.875ZM17.3749 17.9375H14.6249C14.4591 17.9375 14.3002 17.8717 14.183 17.7544C14.0657 17.6372 13.9999 17.4783 13.9999 17.3125C13.9999 17.1467 14.0657 16.9878 14.183 16.8706C14.3002 16.7533 14.4591 16.6875 14.6249 16.6875H15.0405C15.0551 16.6881 15.0698 16.6882 15.0843 16.6875H16.9235C16.9283 16.6876 16.933 16.6884 16.9378 16.6884C16.9421 16.6884 16.9463 16.6876 16.9506 16.6875H17.3749C17.5407 16.6875 17.6996 16.7533 17.8168 16.8706C17.934 16.9878 17.9999 17.1467 17.9999 17.3125C17.9999 17.4783 17.934 17.6372 17.8168 17.7544C17.6996 17.8717 17.5407 17.9375 17.3749 17.9375ZM16.8008 15.75H15.199C13.7911 14.8344 11.3328 12.8529 9.83502 9.46744C8.45658 6.35138 8.48564 3.4415 8.75283 1.54912C8.77804 1.37924 8.86341 1.22406 8.99339 1.11181C9.12338 0.99956 9.28934 0.937705 9.46108 0.9375H22.5386C22.7104 0.937694 22.8763 0.999547 23.0063 1.1118C23.1363 1.22405 23.2216 1.37924 23.2468 1.54912C23.5141 3.4415 23.5431 6.35138 22.1647 9.46744C20.667 12.8529 18.2086 14.8343 16.8007 15.75H16.8008ZM26.7459 3.8815L26.3946 6.05794C26.1649 7.48805 25.5874 8.83986 24.713 9.9946C23.8386 11.1494 22.694 12.0717 21.3798 12.6806C22.0281 11.7981 22.5787 10.8479 23.022 9.84669C23.9973 7.63551 24.4379 5.22571 24.3084 2.8125H25.8355C25.969 2.81255 26.1009 2.84158 26.2221 2.89758C26.3433 2.95358 26.4509 3.03522 26.5375 3.13686C26.624 3.23851 26.6875 3.35772 26.7235 3.48629C26.7595 3.61485 26.7671 3.74969 26.7459 3.8815Z" stroke="white" stroke-width="0.5" mask="url(#path-1-outside-1_11778_154342)" />
            </g>
        </g>
        <defs>
            <clipPath id="clip0_11778_154342">
                <rect width="32" height="32" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

export const BriefcaseIcon = () => (
    <svg width="2rem" height="2rem" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="fi:briefcase">
            <path id="Vector" d="M26.666 9.33301H5.33268C3.85992 9.33301 2.66602 10.5269 2.66602 11.9997V25.333C2.66602 26.8058 3.85992 27.9997 5.33268 27.9997H26.666C28.1388 27.9997 29.3327 26.8058 29.3327 25.333V11.9997C29.3327 10.5269 28.1388 9.33301 26.666 9.33301Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path id="Vector_2" d="M21.3327 28V6.66667C21.3327 5.95942 21.0517 5.28115 20.5516 4.78105C20.0515 4.28095 19.3733 4 18.666 4H13.3327C12.6254 4 11.9472 4.28095 11.4471 4.78105C10.947 5.28115 10.666 5.95942 10.666 6.66667V28" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>
    </svg>
)

export const UploadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="#6b6b6b" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M11.334 5.33398L8.00065 2.00065L4.66732 5.33398" stroke="#6b6b6b" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8 2L8 10" stroke="#6b6b6b" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const BlueUploadIcon = () => {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.25 13.75V17.4167C19.25 17.9029 19.0568 18.3692 18.713 18.713C18.3692 19.0568 17.9029 19.25 17.4167 19.25H4.58333C4.0971 19.25 3.63079 19.0568 3.28697 18.713C2.94315 18.3692 2.75 17.9029 2.75 17.4167V13.75" stroke="#384AD7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15.5869 7.33691L11.0036 2.75358L6.42025 7.33691" stroke="#384AD7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11 2.75L11 13.75" stroke="#384AD7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    )
}

export const LockedCircledIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15.25" stroke="#9A8307" stroke-width="1.5" />
        <path d="M20.6667 15.333H11.3333C10.597 15.333 10 15.93 10 16.6663V21.333C10 22.0694 10.597 22.6663 11.3333 22.6663H20.6667C21.403 22.6663 22 22.0694 22 21.333V16.6663C22 15.93 21.403 15.333 20.6667 15.333Z" stroke="#9A8307" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12.668 15.333V12.6663C12.668 11.7823 13.0192 10.9344 13.6443 10.3093C14.2694 9.6842 15.1172 9.33301 16.0013 9.33301C16.8854 9.33301 17.7332 9.6842 18.3583 10.3093C18.9834 10.9344 19.3346 11.7823 19.3346 12.6663V15.333" stroke="#9A8307" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)


export const EditIcon = () => (
    <svg width="1rem" height="1rem" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.44629 11.0732H11.3748" stroke="black" stroke-linecap="round" stroke-linejoin="round" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.9225 2.05551C7.34264 1.55338 8.09791 1.47976 8.61046 1.89136C8.63879 1.91369 9.5493 2.62101 9.5493 2.62101C10.1124 2.9614 10.2873 3.68502 9.93926 4.23724C9.92077 4.26681 4.77314 10.7058 4.77314 10.7058C4.60188 10.9194 4.34191 11.0455 4.06407 11.0486L2.09274 11.0733L1.64858 9.19334C1.58636 8.929 1.64858 8.65138 1.81984 8.43773L6.9225 2.05551Z" stroke="black" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M5.96973 3.25L8.92303 5.51803" stroke="black" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const EditIcon2 = () => (
    <svg width="0.9375rem" height="0.9375rem" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_18148_3871)">
            <path d="M10.625 1.87519C10.7892 1.71104 10.984 1.58082 11.1985 1.49199C11.413 1.40315 11.6429 1.35742 11.875 1.35742C12.1071 1.35742 12.337 1.40315 12.5515 1.49199C12.766 1.58082 12.9608 1.71104 13.125 1.87519C13.2892 2.03934 13.4194 2.23422 13.5082 2.44869C13.597 2.66317 13.6428 2.89304 13.6428 3.12519C13.6428 3.35734 13.597 3.58721 13.5082 3.80168C13.4194 4.01616 13.2892 4.21104 13.125 4.37519L4.6875 12.8127L1.25 13.7502L2.1875 10.3127L10.625 1.87519Z" stroke="#002DCB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
            <clipPath id="clip0_18148_3871">
                <rect width="15" height="15" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

export const DeleteIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1111 2C9.37473 2 8.77778 2.59695 8.77778 3.33333C8.77778 3.70152 8.4793 4 8.11111 4L8 4L5 4C4.44772 4 4 4.44772 4 5C4 5.55228 4.44772 6 5 6L8 6H8.11111L15.8873 6C15.8878 6 15.8884 6 15.8889 6H16L19 6C19.5523 6 20 5.55228 20 5C20 4.44772 19.5523 4 19 4H15.8881C15.5203 3.99956 15.2222 3.70126 15.2222 3.33333C15.2222 2.59695 14.6253 2 13.8889 2H10.1111Z" fill="#fff" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M6 8C5.72035 8 5.45348 8.1171 5.26412 8.32289C5.07477 8.52868 4.98023 8.80436 5.00346 9.08305L5.77422 18.3322C5.94698 20.4054 7.68005 22 9.7604 22H14.2396C16.32 22 18.053 20.4054 18.2258 18.3322L18.9965 9.08305C19.0198 8.80436 18.9252 8.52868 18.7359 8.32289C18.5465 8.1171 18.2797 8 18 8H6Z" fill="#fff" />
    </svg>
)

export const DeleteIcon2 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash2">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
        <line x1="10" x2="10" y1="11" y2="17"></line>
        <line x1="14" x2="14" y1="11" y2="17"></line>
    </svg>
)

export const WhatsappIcon = ({ color }) => (
    <svg width="48" height="48" viewBox="0 0 360 362" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M307.546 52.5655C273.709 18.685 228.706 0.0171895 180.756 0C81.951 0 1.53846 80.404 1.50408 179.235C1.48689 210.829 9.74646 241.667 25.4319 268.844L0 361.736L95.0236 336.811C121.203 351.096 150.683 358.616 180.679 358.625H180.756C279.544 358.625 359.966 278.212 360 179.381C360.017 131.483 341.392 86.4547 307.546 52.5741V52.5655ZM180.756 328.354H180.696C153.966 328.346 127.744 321.16 104.865 307.589L99.4242 304.358L43.034 319.149L58.0834 264.168L54.5423 258.53C39.6304 234.809 31.749 207.391 31.7662 179.244C31.8006 97.1036 98.6334 30.2707 180.817 30.2707C220.61 30.2879 258.015 45.8015 286.145 73.9665C314.276 102.123 329.755 139.562 329.738 179.364C329.703 261.513 262.871 328.346 180.756 328.346V328.354ZM262.475 216.777C257.997 214.534 235.978 203.704 231.869 202.209C227.761 200.713 224.779 199.966 221.796 204.452C218.814 208.939 210.228 219.029 207.615 222.011C205.002 225.002 202.389 225.372 197.911 223.128C193.434 220.885 179.003 216.158 161.891 200.902C148.578 189.024 139.587 174.362 136.975 169.875C134.362 165.389 136.7 162.965 138.934 160.739C140.945 158.728 143.412 155.505 145.655 152.892C147.899 150.279 148.638 148.406 150.133 145.423C151.629 142.432 150.881 139.82 149.764 137.576C148.646 135.333 139.691 113.287 135.952 104.323C132.316 95.5909 128.621 96.777 125.879 96.6309C123.266 96.5019 120.284 96.4762 117.293 96.4762C114.302 96.4762 109.454 97.5935 105.346 102.08C101.238 106.566 89.6691 117.404 89.6691 139.441C89.6691 161.478 105.716 182.785 107.959 185.776C110.202 188.767 139.544 234.001 184.469 253.408C195.153 258.023 203.498 260.782 210.004 262.845C220.731 266.257 230.494 265.776 238.212 264.624C246.816 263.335 264.71 253.786 268.44 243.326C272.17 232.866 272.17 223.893 271.053 222.028C269.936 220.163 266.945 219.037 262.467 216.794L262.475 216.777Z" fill="#25D366" />
    </svg>

)

export const TopApplicantScoreboardIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.6749 9.9165C27.4717 9.16809 27.9139 8.39494 28.6637 8.19169C31.251 7.48856 33.1791 5.37234 33.7009 2.8125H29.625C28.8477 2.8125 28.2188 2.18353 28.2188 1.40625C28.2188 0.628969 28.8477 0 29.625 0H35.25C36.0273 0 36.6563 0.628969 36.6563 1.40625C36.6563 5.83922 33.6735 9.74484 29.3998 10.9053C28.6756 11.1065 27.884 10.6852 27.6749 9.9165Z" fill="#FFAA33" />
        <path d="M25.4062 12.6562V21.0938C25.4062 21.8812 24.7876 22.5 24 22.5C23.2124 22.5 22.5938 21.8812 22.5938 21.0938V12.6562C22.5938 11.8687 23.2124 11.25 24 11.25C24.7876 11.25 25.4062 11.8687 25.4062 12.6562Z" fill="#FFD24D" />
        <path d="M25.4062 12.6562V21.0938C25.4062 21.8812 24.7876 22.5 24 22.5V11.25C24.7876 11.25 25.4062 11.8687 25.4062 12.6562Z" fill="#FFAA33" />
        <path d="M18.6002 10.9053C14.3265 9.74484 11.3438 5.83922 11.3438 1.40625C11.3438 0.628969 11.9727 0 12.75 0H18.375C19.1523 0 19.7812 0.628969 19.7812 1.40625C19.7812 2.18353 19.1523 2.8125 18.375 2.8125H14.299C14.8208 5.37234 16.749 7.48856 19.3362 8.19169C20.086 8.39494 20.5283 9.16809 20.325 9.9165C20.1159 10.6854 19.324 11.1064 18.6002 10.9053Z" fill="#FFD24D" />
        <path d="M29.625 28.125H18.375C17.5874 28.125 16.9688 28.7437 16.9688 29.5312V46.5938C16.9688 47.3812 17.5874 48 18.375 48H29.625C30.4126 48 31.0312 47.3812 31.0312 46.5938V29.5312C31.0312 28.7437 30.4126 28.125 29.625 28.125Z" fill="#FF884D" />
        <path d="M43.6875 11.25H42.2812V9.84375C42.2812 9.06647 41.6523 8.4375 40.875 8.4375C40.0977 8.4375 39.4688 9.06647 39.4688 9.84375V11.25H38.0625C37.2852 11.25 36.6562 11.879 36.6562 12.6562C36.6562 13.4335 37.2852 14.0625 38.0625 14.0625H39.4688V15.4688C39.4688 16.246 40.0977 16.875 40.875 16.875C41.6523 16.875 42.2812 16.246 42.2812 15.4688V14.0625H43.6875C44.4648 14.0625 45.0938 13.4335 45.0938 12.6562C45.0938 11.879 44.4648 11.25 43.6875 11.25Z" fill="#FFE6B3" />
        <path d="M9.9375 8.4375H8.53125V7.03125C8.53125 6.25397 7.90228 5.625 7.125 5.625C6.34772 5.625 5.71875 6.25397 5.71875 7.03125V8.4375H4.3125C3.53522 8.4375 2.90625 9.06647 2.90625 9.84375C2.90625 10.621 3.53522 11.25 4.3125 11.25H5.71875V12.6562C5.71875 13.4335 6.34772 14.0625 7.125 14.0625C7.90228 14.0625 8.53125 13.4335 8.53125 12.6562V11.25H9.9375C10.7148 11.25 11.3438 10.621 11.3438 9.84375C11.3438 9.06647 10.7148 8.4375 9.9375 8.4375Z" fill="#FCE88C" />
        <path d="M46.5938 48H35.25C34.4727 48 33.8438 47.371 33.8438 46.5938V35.1562C33.8438 34.379 34.4727 33.75 35.25 33.75H46.5938C47.371 33.75 48 34.379 48 35.1562V46.5938C48 47.371 47.371 48 46.5938 48Z" fill="#80AAFF" />
        <path d="M12.75 48H1.40625C0.628969 48 0 47.371 0 46.5938V40.875C0 40.0977 0.628969 39.4688 1.40625 39.4688H12.75C13.5273 39.4688 14.1562 40.0977 14.1562 40.875V46.5938C14.1562 47.371 13.5273 48 12.75 48Z" fill="#FFA800" />
        <path d="M31.0312 29.5312V46.5938C31.0312 47.3812 30.4126 48 29.625 48H24V28.125H29.625C30.4126 28.125 31.0312 28.7437 31.0312 29.5312Z" fill="#FF4D4D" />
        <path d="M29.625 0H18.375C17.5874 0 16.9688 0.618656 16.9688 1.40625V7.03125C16.9688 10.9125 20.1187 14.0625 24 14.0625C27.8813 14.0625 31.0312 10.9125 31.0312 7.03125V1.40625C31.0312 0.618656 30.4126 0 29.625 0Z" fill="#FFA800" />
        <path d="M31.0312 1.40625V7.03125C31.0312 10.9125 27.8813 14.0625 24 14.0625V0H29.625C30.4126 0 31.0312 0.618656 31.0312 1.40625Z" fill="#FFD24D" />
        <path d="M28.2188 19.6875H19.7812C18.2344 19.6875 16.9688 20.9531 16.9688 22.5V23.9062C16.9688 24.6937 17.5874 25.3125 18.375 25.3125H29.625C30.4126 25.3125 31.0312 24.6937 31.0312 23.9062V22.5C31.0312 20.9531 29.7656 19.6875 28.2188 19.6875Z" fill="#FFA800" />
        <path d="M31.0312 22.5V23.9062C31.0312 24.6937 30.4126 25.3125 29.625 25.3125H24V19.6875H28.2188C29.7656 19.6875 31.0312 20.9531 31.0312 22.5Z" fill="#FFD24D" />
    </svg>

)

export const TouchPointDocIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_5520_157350)">
            <path d="M21 0.766644V22.2334C21 22.6568 20.604 23 20.1154 23H1.8846C1.39604 23 1 22.6568 1 22.2334V0.766644C1 0.34323 1.39604 0 1.8846 0H20.1154C20.604 0 21 0.34323 21 0.766644Z" fill="#F2F0F0" />
            <path opacity="0.08" d="M21 0.766643V22.2333C21 22.6575 20.7052 23 20.34 23H19C19.3652 23 19.66 22.6575 19.66 22.2333V0.766643C19.66 0.342409 19.3652 5.10307e-09 19 5.10307e-09H20.34C20.7052 -4.82691e-05 21 0.342409 21 0.766643Z" fill="black" />
            <path d="M16.6829 15.789C16.6829 15.5264 16.47 15.3135 16.2074 15.3135H4.68448C4.42189 15.3135 4.20898 15.5263 4.20898 15.789C4.20898 16.0516 4.42184 16.2645 4.68448 16.2645H16.2074C16.47 16.2644 16.6829 16.0516 16.6829 15.789Z" fill="#E5E3E5" />
            <path opacity="0.08" d="M16.6817 15.7894C16.6817 16.0525 16.4698 16.2643 16.2068 16.2643H15.2788C15.5394 16.2643 15.7537 16.0524 15.7537 15.7894C15.7537 15.5264 15.5394 15.3145 15.2788 15.3145H16.2068C16.4698 15.3144 16.6817 15.5263 16.6817 15.7894Z" fill="black" />
            <path d="M16.6829 13.6972C16.6829 13.4346 16.47 13.2217 16.2074 13.2217H4.68448C4.42189 13.2217 4.20898 13.4345 4.20898 13.6972C4.20898 13.9598 4.42184 14.1727 4.68448 14.1727H16.2074C16.47 14.1726 16.6829 13.9598 16.6829 13.6972Z" fill="#E5E3E5" />
            <path opacity="0.08" d="M16.6817 13.6976C16.6817 13.9607 16.4698 14.1725 16.2068 14.1725H15.2788C15.5394 14.1725 15.7537 13.9606 15.7537 13.6976C15.7537 13.4345 15.5394 13.2227 15.2788 13.2227H16.2068C16.4698 13.2226 16.6817 13.4345 16.6817 13.6976Z" fill="black" />
            <path d="M16.6829 17.8944C16.6829 17.6319 16.47 17.4189 16.2074 17.4189H4.68448C4.42189 17.4189 4.20898 17.6318 4.20898 17.8944C4.20898 18.157 4.42184 18.3699 4.68448 18.3699H16.2074C16.47 18.3699 16.6829 18.157 16.6829 17.8944Z" fill="#E5E3E5" />
            <path opacity="0.08" d="M16.6817 17.8949C16.6817 18.1579 16.4698 18.3698 16.2068 18.3698H15.2788C15.5394 18.3698 15.7537 18.1579 15.7537 17.8949C15.7537 17.6318 15.5394 17.4199 15.2788 17.4199H16.2068C16.4698 17.4199 16.6817 17.6318 16.6817 17.8949Z" fill="black" />
            <path d="M12.5423 19.9999C12.5423 19.7373 12.3294 19.5244 12.0668 19.5244H4.68448C4.42189 19.5244 4.20898 19.7373 4.20898 19.9999C4.20898 20.2625 4.42184 20.4754 4.68448 20.4754H12.0668C12.3294 20.4754 12.5423 20.2626 12.5423 19.9999Z" fill="#E5E3E5" />
            <path opacity="0.08" d="M12.5411 20.0003C12.5411 20.2634 12.3292 20.4753 12.0662 20.4753H11.1382C11.3988 20.4753 11.6131 20.2633 11.6131 20.0003C11.6131 19.7373 11.3988 19.5254 11.1382 19.5254H12.0662C12.3292 19.5254 12.5411 19.7373 12.5411 20.0003Z" fill="black" />
            <path d="M15.2201 7.30649C15.2201 8.53396 14.7565 9.65423 13.9948 10.4998C13.2544 11.322 12.2071 11.9063 11.0088 12.0467C10.9655 12.0524 10.9222 12.0566 10.8782 12.0602C10.7987 12.068 10.7185 12.073 10.6376 12.0758C10.5737 12.0786 10.5098 12.0801 10.4459 12.0801C10.3799 12.0801 10.3145 12.0786 10.2492 12.0758C10.1442 12.0715 10.0405 12.0644 9.93757 12.0531C9.90419 12.0495 9.87082 12.046 9.83749 12.0417C8.67236 11.8927 7.64955 11.3278 6.91118 10.5154C6.14163 9.66773 5.67236 8.54179 5.67236 7.30649C5.67236 4.66982 7.80925 2.53223 10.4459 2.53223C13.0826 2.53223 15.2201 4.66982 15.2201 7.30649Z" fill="#66D5F2" />
            <path d="M11.3593 7.72C11.256 7.80044 11.0243 8.10292 10.4334 8.55517C10.429 8.55888 10.426 8.56328 10.4245 8.56773C10.4223 8.56333 10.4201 8.55888 10.4156 8.55517C9.8306 8.10808 9.59819 7.80634 9.49268 7.7222C9.53177 7.64031 9.59819 7.47138 9.65721 7.31055C9.91221 7.54267 10.2057 7.67448 10.5499 7.63811C10.8038 7.61219 11.0111 7.50184 11.2014 7.33637C11.2604 7.4898 11.3239 7.64622 11.3593 7.72Z" fill="#F2B816" />
            <path d="M10.23 9.39553C10.1503 9.21689 10.061 9.1148 10.0514 8.96667C9.97006 9.05761 9.91006 9.15323 9.91855 9.243C9.94245 9.49636 9.20478 8.64534 9.11272 8.21484C9.10349 8.2905 9.09706 8.46412 9.3291 8.80603C9.4437 8.97497 9.74839 9.84544 10.0485 10.7826C10.143 10.1519 10.2336 9.57923 10.2614 9.4267C10.2481 9.41883 10.2359 9.4087 10.23 9.39553Z" fill="#F2F0F0" />
            <path d="M10.6193 9.39619C10.6135 9.40931 10.6013 9.41953 10.5879 9.42745C10.6164 9.58402 10.7111 10.1828 10.8083 10.8328C11.0624 9.96211 11.3757 9.015 11.517 8.80673C11.7387 8.48002 11.7427 8.30733 11.7345 8.22656C11.6322 8.66044 10.9071 9.49481 10.9308 9.24366C10.9393 9.15389 10.8793 9.05827 10.7979 8.96733C10.7883 9.11545 10.6991 9.21755 10.6193 9.39619Z" fill="#F2F0F0" />
            <path d="M11.6108 9.05623L11.6171 9.06096C11.6178 9.05918 11.6184 9.05749 11.619 9.05566C11.614 9.05599 11.6108 9.05623 11.6108 9.05623Z" fill="#93AFCA" />
            <path d="M10.8079 10.8329C10.7923 10.8869 10.7767 10.9671 10.7611 11.0636C10.7582 11.0835 10.7547 11.1041 10.7518 11.1254C10.7114 11.398 10.673 11.7721 10.6376 12.076C10.5737 12.0789 10.5098 12.0803 10.4459 12.0803C10.3799 12.0803 10.3145 12.0789 10.2492 12.076C10.1839 11.6139 10.1165 10.9948 10.0483 10.7832C10.1427 10.1528 10.2336 9.5799 10.2613 9.42727C10.2478 9.41945 10.2358 9.40951 10.2301 9.39605C10.1506 9.21788 10.0612 9.11565 10.0512 8.96724C10.1946 8.80749 10.4034 8.66199 10.4247 8.58887C10.4459 8.66199 10.6547 8.80754 10.7981 8.96724C10.7881 9.1156 10.6994 9.21784 10.6191 9.39605C10.6135 9.40955 10.6014 9.41949 10.5879 9.42727C10.6162 9.58416 10.7114 10.1826 10.8079 10.8329Z" fill="#EA4E4E" />
            <path d="M9.14964 8.0435C9.10881 8.10378 9.1202 8.15454 9.11279 8.21501C9.20486 8.64551 9.94257 9.49653 9.91862 9.24317C9.91014 9.1534 9.97014 9.05778 10.0515 8.96684C10.1945 8.80685 10.4035 8.66154 10.4247 8.58828C10.446 8.66154 10.655 8.80685 10.798 8.96684C10.8793 9.05778 10.9393 9.1534 10.9308 9.24317C10.9071 9.49432 11.6322 8.65995 11.7346 8.22607C11.7045 7.92865 11.6328 8.06178 11.4279 7.71509C11.4135 7.69076 11.3933 7.69325 11.3594 7.71954C11.2561 7.7997 11.0243 8.10279 10.4337 8.555C10.4291 8.55856 10.4265 8.56282 10.4247 8.56737C10.423 8.56278 10.4203 8.55856 10.4157 8.555C9.83106 8.10734 9.59818 7.80593 9.49323 7.72217C9.45742 7.69353 9.43632 7.69001 9.42151 7.71509C9.3129 7.89893 9.20364 7.98926 9.14964 8.0435Z" fill="#E5E3E5" />
            <path d="M10.5498 7.63788C10.781 7.61449 11.0189 7.5168 11.2779 7.26626C11.5821 6.97258 11.5794 6.23055 11.6528 6.28301C11.8207 6.39574 11.9281 6.06016 11.9491 5.86085C11.9671 5.68994 11.9027 5.60482 11.8312 5.63669C11.812 5.67926 11.7884 5.71151 11.7591 5.72852C11.7591 5.72852 11.6541 6.16226 11.6092 6.14871C11.5642 6.13516 11.5838 5.74366 11.6541 5.28546C11.7291 4.79749 11.1294 5.01016 10.7097 4.99662C10.29 4.98307 9.3189 4.90122 9.24394 5.13166C9.16899 5.36205 9.31562 6.05805 9.25562 6.08515C9.19566 6.11224 9.12071 5.76921 9.06076 5.70143C9.0511 5.69055 9.04107 5.66449 9.0309 5.62952C8.97052 5.62624 8.9228 5.71071 8.9386 5.86085C8.95955 6.06012 9.06708 6.39574 9.2349 6.28301C9.30821 6.23065 9.30572 6.97085 9.60882 7.26518C9.70819 7.33643 10.0114 7.6923 10.5498 7.63788Z" fill="#FFCE29" />
            <path d="M9.25589 6.08549C9.31584 6.05839 9.16926 5.36239 9.24422 5.132C9.31917 4.90157 10.2902 4.98341 10.71 4.99696C11.1297 5.0105 11.7293 4.79783 11.6544 5.2858C11.584 5.744 11.5644 6.1355 11.6094 6.14905C11.6544 6.1626 11.7593 5.72886 11.7593 5.72886C11.7886 5.71185 11.8123 5.6796 11.8314 5.63703C11.9496 5.37491 11.8943 4.70694 11.8943 4.59032C11.8943 4.4548 11.6844 4.22436 11.5945 4.22436C11.5045 4.22436 11.5795 3.84486 10.9649 3.68221C10.3503 3.51955 9.81065 3.60088 9.51084 3.74999C9.21103 3.89905 8.98617 4.15663 8.85126 4.19727C8.71636 4.23791 8.89622 4.33283 8.79131 4.42771C8.6864 4.52258 8.86626 4.64455 8.89626 4.83435C8.92143 4.99358 8.97825 5.44757 9.03131 5.62991C9.04148 5.66488 9.05151 5.69089 9.06117 5.70182C9.12098 5.76955 9.19593 6.11258 9.25589 6.08549Z" fill="#5B5B5B" />
            <path d="M13.6606 8.80024C13.2116 8.72651 13.0124 10.939 12.9592 11.3645C12.3807 11.7251 11.7183 11.9636 11.0091 12.0467C10.9657 12.0524 10.9224 12.0566 10.8784 12.0602C11.0893 11.0528 11.3264 9.88287 11.6139 9.05866C11.6139 9.05796 11.6146 9.05726 11.6146 9.05656C11.7374 8.70443 11.8702 8.41549 12.0136 8.2302V8.22949C12.1542 8.23235 12.3813 8.3786 12.6674 8.49429C12.9982 8.62845 13.486 8.72566 13.6606 8.80024Z" fill="#6D6D6D" />
            <path d="M11.6146 9.05686C11.6125 9.05686 11.611 9.05686 11.611 9.05686L11.6139 9.05897L11.6174 9.06183L12.0867 9.41607C12.1428 9.45868 12.1549 9.53888 12.1129 9.59569C11.5954 10.3049 11.359 11.2214 11.009 12.0471C10.9657 12.0527 10.9224 12.057 10.8784 12.0606C10.7989 12.0684 10.7186 12.0734 10.6377 12.0762C10.6732 11.7723 10.7115 11.3982 10.752 11.1256C10.7548 11.1043 10.7584 11.0837 10.7612 11.0638C10.7768 10.9673 10.7924 10.8871 10.8081 10.8331C11.404 8.7909 11.5154 8.85061 11.6515 8.57836L11.6522 8.57766C11.7601 8.35571 11.7296 8.286 11.7296 8.17866C11.7331 8.10765 11.7118 8.06152 11.6884 8.03241C11.6778 8.01891 11.692 7.99974 11.7083 8.00616C11.7779 8.03147 11.9819 8.20126 12.0135 8.23051C12.0675 8.28019 12.1221 8.34057 12.164 8.4158C12.3117 8.6799 12.3195 8.84105 12.4239 8.91915C12.5218 8.99227 11.7076 9.05049 11.6188 9.05616C11.6174 9.05616 11.616 9.05686 11.6146 9.05686Z" fill="#5B5B5B" />
            <path d="M9.93738 12.0535C9.904 12.0499 9.87063 12.0464 9.8373 12.0421C9.15433 11.9548 8.51613 11.7241 7.95527 11.3798C7.90807 10.9077 7.69193 8.69368 7.23682 8.80205C7.35325 8.72537 7.9091 8.62243 8.27402 8.47407C8.50474 8.38037 8.69786 8.26749 8.83769 8.22559C8.98038 8.43216 9.10746 8.7204 9.22319 9.05621C9.22389 9.05907 9.2246 9.06118 9.22605 9.06334V9.06404C9.52136 9.92659 9.73929 11.1043 9.93738 12.0535Z" fill="#6D6D6D" />
            <path d="M10.249 12.0754C10.144 12.0711 10.0403 12.064 9.93733 12.0526C9.90396 12.0491 9.87058 12.0456 9.83725 12.0413C9.51921 11.2312 9.12733 10.1351 8.72196 9.57998C8.68577 9.531 8.69641 9.46284 8.74469 9.42665L9.226 9.06318V9.06248L9.23524 9.0561C9.23524 9.0561 9.23097 9.0561 9.22314 9.0554C9.11524 9.04757 8.32511 8.99081 8.42233 8.91839C8.52667 8.84029 8.5345 8.67914 8.68216 8.41504C8.72547 8.33765 8.78228 8.27592 8.83764 8.22478C8.91006 8.15948 8.97963 8.11331 9.01656 8.08209C9.05847 8.0466 9.09466 8.02246 9.12803 8.00756C9.14505 8.00048 9.16211 8.01679 9.15714 8.0331V8.03381C9.15644 8.03521 9.15574 8.03737 9.15428 8.03878C9.15428 8.03948 9.15358 8.03948 9.15358 8.04018C9.14088 8.05635 9.13075 8.07529 9.12236 8.10478C9.12236 8.22534 9.03517 8.37318 9.32894 8.80617C9.44322 8.97515 9.74852 9.84548 10.0481 10.7826C10.1163 10.9942 10.1837 11.6132 10.249 12.0754Z" fill="#5B5B5B" />
            <path d="M7.95541 11.3785C7.5671 11.1413 7.21568 10.8496 6.91113 10.5145C7.1298 8.8349 7.10046 8.83607 7.23701 8.80073C7.69263 8.69221 7.90854 10.9097 7.95541 11.3785Z" fill="#5B5B5B" />
            <path d="M13.9948 10.4994C13.693 10.8345 13.3445 11.1263 12.959 11.3641C13.0258 10.8301 13.2092 8.56818 13.7328 8.82262C13.8152 8.86307 13.8982 9.77957 13.9948 10.4994Z" fill="#5B5B5B" />
            <path d="M22.9694 19.9639C22.9694 22.0068 21.313 23.6632 19.2702 23.6632C17.2412 23.6632 15.5728 22.0229 15.5728 19.9639C15.5728 17.9218 17.228 16.2646 19.2702 16.2646C21.3142 16.2646 22.9694 17.9218 22.9694 19.9639Z" fill="#FBBC09" />
            <path opacity="0.08" d="M22.9685 19.963C22.9685 22.0078 21.3133 23.6629 19.271 23.6629C19.085 23.6629 18.9013 23.648 18.7227 23.6232C20.5044 23.3577 21.8742 21.8217 21.8742 19.963C21.8742 18.1069 20.5069 16.5708 18.7227 16.3053C18.9013 16.2805 19.085 16.2656 19.271 16.2656C21.3133 16.2656 22.9685 17.9208 22.9685 19.963Z" fill="black" />
            <path d="M18.1877 21.398L17.3468 20.3722C17.1731 20.1602 17.2041 19.8475 17.416 19.6737C17.6281 19.4998 17.9406 19.5308 18.1146 19.7429L18.6081 20.345L20.4602 18.4931C20.6538 18.2992 20.9684 18.2992 21.162 18.4931C21.3559 18.6868 21.3559 19.0011 21.162 19.1949L18.9225 21.4343C18.7148 21.642 18.3738 21.6246 18.1877 21.398Z" fill="white" />
        </g>
        <defs>
            <clipPath id="clip0_5520_157350">
                <rect width="24" height="24" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

export const WorriedFace = () => (
    <svg width="136" height="136" viewBox="0 0 136 136" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="68" cy="68" r="68" fill="#FFF8D6" />
        <g transform="translate(28, 28)">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 80C62.0914 80 80 62.0914 80 40C80 17.9086 62.0914 0 40 0C17.9086 0 0 17.9086 0 40C0 62.0914 17.9086 80 40 80Z" fill="#FFDD67" />
                <path d="M24.6667 43.4666C28.3486 43.4666 31.3333 40.4819 31.3333 36.8C31.3333 33.1181 28.3486 30.1333 24.6667 30.1333C20.9848 30.1333 18 33.1181 18 36.8C18 40.4819 20.9848 43.4666 24.6667 43.4666Z" fill="#664E27" />
                <path d="M55.3327 43.4666C59.0146 43.4666 61.9993 40.4819 61.9993 36.8C61.9993 33.1181 59.0146 30.1333 55.3327 30.1333C51.6508 30.1333 48.666 33.1181 48.666 36.8C48.666 40.4819 51.6508 43.4666 55.3327 43.4666Z" fill="#664E27" />
                <path d="M65.5996 22.2667C61.3329 18.6667 55.5996 17.0667 49.9996 18.1334C49.1996 18.2667 48.5329 15.4667 49.4663 15.2001C55.8663 14.0001 62.5329 15.8667 67.4663 20.0001C68.2663 20.6667 66.1329 22.8001 65.5996 22.2667ZM29.9996 17.8667C24.3996 16.9334 18.6663 18.4001 14.3996 22.0001C13.8663 22.5334 11.7329 20.4001 12.5329 19.7334C17.4663 15.4667 24.1329 13.7334 30.5329 14.9334C31.4663 15.2001 30.7996 18.1334 29.9996 17.8667Z" fill="#917524" />
                <path d="M51.466 56.5334C45.1426 55.8432 36.6774 55.8982 28.5326 56.5334C26.7993 57.3334 29.9996 61.2 30.7993 61.2C31.5991 61.2 49.5 61 49.3327 61.2C49.1653 61.4001 53.3326 57.4667 51.466 56.5334Z" fill="#664E27" />
            </svg>
        </g>
    </svg>

)

export const NonMandatoryAiIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_9537_11889)">
            <path d="M7.07812 24H0.703125C0.314812 24 0 23.6852 0 23.2969V17.625C0 17.2367 0.314812 16.9219 0.703125 16.9219H7.78125C8.16956 16.9219 8.48438 17.2367 8.48438 17.625V22.5938C8.48438 23.3704 7.8548 24 7.07812 24Z" fill="#E63950" />
            <path d="M23.2969 24H16.9219C16.1452 24 15.5156 23.3704 15.5156 22.5938V19.0312C15.5156 18.6429 15.8304 18.3281 16.2188 18.3281H23.2969C23.6852 18.3281 24 18.6429 24 19.0312V23.2969C24 23.6852 23.6852 24 23.2969 24Z" fill="#AE2538" />
            <path d="M16.9219 24H7.07812V14.8125C7.07812 14.4242 7.39294 14.1094 7.78125 14.1094H9.89062C10.6673 14.1094 11.2969 14.739 11.2969 15.5156V19.091C11.7473 18.9523 12.2527 18.9523 12.7031 19.091V15.5156C12.7031 14.739 13.3327 14.1094 14.1094 14.1094H16.2188C16.6071 14.1094 16.9219 14.4242 16.9219 14.8125V24Z" fill="#FF6C6C" />
            <path d="M15.178 12.4386L12.0002 10.7886L8.82238 12.4386C8.58754 12.5602 8.30052 12.5402 8.08495 12.383C7.86932 12.2264 7.76085 11.9621 7.80477 11.6991L8.39118 8.16765L5.84099 5.6552C5.65148 5.46775 5.5828 5.18964 5.66521 4.93698C5.74762 4.68362 5.96596 4.49823 6.22963 4.45839L9.75351 3.92762L11.3589 0.37698C11.5868 -0.12566 12.4136 -0.12566 12.6415 0.37698L14.2469 3.92762L17.7708 4.45839C18.0344 4.49823 18.2528 4.68362 18.3352 4.93698C18.4176 5.18968 18.3489 5.46775 18.1594 5.6552L15.6092 8.16765L16.1956 11.6991C16.2396 11.962 16.1311 12.2264 15.9155 12.383C15.699 12.5411 15.4118 12.5603 15.178 12.4386Z" fill="#FED843" />
            <path d="M16.9219 24V14.8125C16.9219 14.4242 16.6071 14.1094 16.2188 14.1094H14.1094C13.3327 14.1094 12.7031 14.739 12.7031 15.5156V19.091C12.4779 19.0216 12.239 18.987 12 18.987V24H16.9219Z" fill="#E63950" />
            <path d="M15.1778 12.4386C15.4116 12.5602 15.6988 12.541 15.9152 12.3829C16.1309 12.2264 16.2393 11.962 16.1954 11.699L15.609 8.16759L18.1592 5.65514C18.3487 5.46769 18.4174 5.18958 18.335 4.93692C18.2526 4.68356 18.0342 4.49817 17.7705 4.45833L14.2467 3.92761L12.6413 0.376969C12.5273 0.125672 12.2636 0 12 0V10.7886L15.1778 12.4386Z" fill="#FABE2C" />
            <path d="M12.824 20.8316C12.4449 20.2727 11.5551 20.2727 11.176 20.8316C11.0016 21.0877 10.6858 21.1997 10.3878 21.1097C10.0925 21.0191 9.89062 20.7465 9.89062 20.4375V14.1094H14.1094V20.4375C14.1094 20.7465 13.9075 21.0191 13.6123 21.1097C13.3054 21.2018 12.9921 21.0804 12.824 20.8316Z" fill="#FED843" />
            <path d="M13.6123 21.1097C13.9075 21.0191 14.1094 20.7465 14.1094 20.4375V14.1094H12V20.4124C12.3173 20.4124 12.6345 20.5522 12.824 20.8316C12.9921 21.0804 13.3054 21.2018 13.6123 21.1097Z" fill="#FABE2C" />
        </g>
        <defs>
            <clipPath id="clip0_9537_11889">
                <rect width="24" height="24" fill="white" />
            </clipPath>
        </defs>
    </svg>
)

export const VideoIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.1673 5.83301L13.334 9.99967L19.1673 14.1663V5.83301Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M11.6673 4.16699H2.50065C1.58018 4.16699 0.833984 4.91318 0.833984 5.83366V14.167C0.833984 15.0875 1.58018 15.8337 2.50065 15.8337H11.6673C12.5878 15.8337 13.334 15.0875 13.334 14.167V5.83366C13.334 4.91318 12.5878 4.16699 11.6673 4.16699Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)
export const CloseIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)
export const BackIcon = ({ height = "32px", width = "32px" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} fill="#000000" className="bi bi-arrow-left-short" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z" />
    </svg>
)
export const CancelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
    </svg>
)
// export const VideoIcon = () => (
//     <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
//         <path d="M19.1673 5.83301L13.334 9.99967L19.1673 14.1663V5.83301Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
//         <path d="M11.6673 4.16699H2.50065C1.58018 4.16699 0.833984 4.91318 0.833984 5.83366V14.167C0.833984 15.0875 1.58018 15.8337 2.50065 15.8337H11.6673C12.5878 15.8337 13.334 15.0875 13.334 14.167V5.83366C13.334 4.91318 12.5878 4.16699 11.6673 4.16699Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
//     </svg>
// )
// export const CloseIcon = () => (
//     <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
//         xmlns="http://www.w3.org/2000/svg">
//         <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
//         <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
// )

export const VideoPlay = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle opacity="0.32" cx="16" cy="16" r="16" fill="#FFDA30" />
        <g clip-path="url(#clip0_10662_10154)">
            <path d="M22.4265 14.8605L12.9999 9.21384C12.7982 9.09741 12.5697 9.03581 12.3369 9.03516C12.104 9.03451 11.8751 9.09483 11.6728 9.21012C11.4706 9.32541 11.302 9.49165 11.184 9.69231C11.0659 9.89296 11.0024 10.121 10.9999 10.3538L10.9999 21.6472C11.0024 21.88 11.0659 22.108 11.184 22.3087C11.302 22.5094 11.4706 22.6756 11.6728 22.7909C11.8751 22.9062 12.104 22.9665 12.3368 22.9658C12.5697 22.9652 12.7982 22.9036 12.9999 22.7872L22.4265 17.1405C22.6225 17.0217 22.7845 16.8543 22.8969 16.6546C23.0093 16.4549 23.0684 16.2297 23.0684 16.0005C23.0684 15.7713 23.0093 15.5461 22.8969 15.3464C22.7845 15.1467 22.6225 14.9793 22.4265 14.8605V14.8605Z" stroke="#FFDA30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
            <clipPath id="clip0_10662_10154">
                <rect width="16" height="16" fill="white" transform="translate(25 8) rotate(90)" />
            </clipPath>
        </defs>
    </svg>
)

export const ManualBook = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.5 20.625V22.125C10.5 22.4234 10.6185 22.7095 10.8295 22.9205C11.0405 23.1315 11.3266 23.25 11.625 23.25H12.375C12.6734 23.25 12.9595 23.1315 13.1705 22.9205C13.3815 22.7095 13.5 22.4234 13.5 22.125V20.625H10.5Z" fill="#C62828" />
        <path d="M20.3577 9.93643C18.6321 9.77354 14.3988 9.45795 12 9.99635C9.60103 9.45814 5.3677 9.77354 3.64236 9.93643C3.36344 9.96199 3.10422 10.0912 2.91588 10.2985C2.72754 10.5058 2.62376 10.7762 2.62501 11.0563V21.4624C2.62598 21.6183 2.65917 21.7724 2.7225 21.9149C2.78583 22.0574 2.87793 22.1852 2.99303 22.2904C3.10813 22.3956 3.24373 22.4759 3.39132 22.5262C3.53892 22.5765 3.69532 22.5958 3.85072 22.5828C5.53089 22.4288 9.68025 22.1274 11.9136 22.6562C11.9705 22.6689 12.0295 22.6689 12.0864 22.6562C14.3194 22.1274 18.4689 22.429 20.1495 22.583C20.3049 22.5959 20.4613 22.5766 20.6088 22.5262C20.7564 22.4759 20.892 22.3956 21.007 22.2904C21.1221 22.1852 21.2142 22.0573 21.2775 21.9148C21.3408 21.7723 21.374 21.6183 21.375 21.4624V11.0563C21.3763 10.7762 21.2725 10.5058 21.0841 10.2985C20.8958 10.0912 20.6366 9.962 20.3577 9.93643Z" fill="#E53935" />
        <path d="M19.2845 9.12731C16.8768 8.66117 14.4001 8.68031 12 9.18396C9.59996 8.67991 7.12335 8.66059 4.71571 9.12713C4.54806 9.16281 4.39763 9.25533 4.29008 9.3888C4.18253 9.52226 4.12424 9.6887 4.12501 9.8601V20.5348C4.12547 20.6394 4.14776 20.7429 4.19043 20.8384C4.23311 20.934 4.29524 21.0196 4.37285 21.0898C4.45047 21.16 4.54188 21.2133 4.64123 21.2462C4.74059 21.2791 4.84571 21.2909 4.9499 21.2809C6.07655 21.1636 9.90766 20.8197 11.9096 21.3174C11.9691 21.3306 12.0309 21.3306 12.0905 21.3174C14.0918 20.8202 17.9235 21.1637 19.0503 21.2809C19.1545 21.291 19.2597 21.2793 19.359 21.2464C19.4584 21.2135 19.5499 21.1603 19.6275 21.0901C19.7051 21.0198 19.7672 20.9342 19.8099 20.8385C19.8525 20.7429 19.8747 20.6395 19.875 20.5348V9.8601C19.8758 9.6887 19.8175 9.52226 19.7099 9.3888C19.6024 9.25533 19.4521 9.16299 19.2845 9.12731Z" fill="#EEEEEE" />
        <path d="M18.2593 17.1717C16.637 16.8829 14.9764 16.8829 13.3541 17.1717C13.2566 17.1912 13.1708 17.2487 13.1157 17.3315C13.0605 17.4142 13.0405 17.5155 13.06 17.613C13.0796 17.7105 13.137 17.7963 13.2198 17.8514C13.3025 17.9066 13.4038 17.9266 13.5013 17.9071C15.0269 17.6422 16.5867 17.6422 18.1123 17.9071C18.1606 17.9167 18.2103 17.9168 18.2586 17.9072C18.3069 17.8977 18.3528 17.8787 18.3938 17.8514C18.4348 17.824 18.47 17.7889 18.4973 17.748C18.5247 17.7071 18.5438 17.6612 18.5535 17.6129C18.5631 17.5646 18.5632 17.5149 18.5536 17.4666C18.5441 17.4183 18.5251 17.3724 18.4978 17.3314C18.4704 17.2904 18.4353 17.2552 18.3944 17.2278C18.3535 17.2004 18.3076 17.1814 18.2593 17.1717Z" fill="#424242" />
        <path d="M18.2582 14.8046C16.6359 14.5157 14.9753 14.5157 13.353 14.8046C13.2557 14.8244 13.1703 14.8819 13.1154 14.9646C13.0604 15.0473 13.0405 15.1483 13.06 15.2457C13.0795 15.343 13.1368 15.4286 13.2193 15.4838C13.3018 15.539 13.4028 15.5592 13.5002 15.54C15.0258 15.275 16.5856 15.275 18.1112 15.54C18.2086 15.5592 18.3097 15.539 18.3922 15.4839C18.4748 15.4287 18.5321 15.343 18.5516 15.2456C18.571 15.1483 18.5511 15.0471 18.4961 14.9645C18.4411 14.8818 18.3556 14.8243 18.2582 14.8046Z" fill="#424242" />
        <path d="M13.4272 13.1564C14.9772 12.8885 16.5614 12.886 18.1122 13.1491C18.1604 13.1588 18.2102 13.1588 18.2585 13.1492C18.3068 13.1397 18.3527 13.1207 18.3937 13.0934C18.4347 13.0661 18.4698 13.031 18.4972 12.99C18.5246 12.9491 18.5437 12.9032 18.5534 12.8549C18.563 12.8067 18.5631 12.7569 18.5535 12.7086C18.5439 12.6603 18.525 12.6144 18.4977 12.5734C18.4703 12.5325 18.4352 12.4973 18.3943 12.4699C18.3534 12.4425 18.3075 12.4234 18.2592 12.4137C16.6369 12.1251 14.9763 12.1251 13.354 12.4137C13.2628 12.432 13.1817 12.4836 13.1263 12.5583C13.071 12.633 13.0454 12.7257 13.0545 12.8182C13.0637 12.9108 13.1069 12.9966 13.1757 13.0591C13.2446 13.1216 13.3342 13.1563 13.4272 13.1564Z" fill="#424242" />
        <path d="M10.6461 17.1717C9.02379 16.8829 7.3632 16.8829 5.74089 17.1717C5.64338 17.1912 5.5576 17.2487 5.50244 17.3314C5.44727 17.4141 5.42723 17.5154 5.44673 17.6129C5.46623 17.7104 5.52367 17.7962 5.60641 17.8514C5.68915 17.9065 5.79041 17.9266 5.88792 17.9071C7.41351 17.6423 8.9733 17.6423 10.4989 17.9071C10.5964 17.9266 10.6977 17.9066 10.7804 17.8514C10.8632 17.7963 10.9206 17.7105 10.9402 17.613C10.9597 17.5155 10.9397 17.4142 10.8845 17.3315C10.8294 17.2487 10.7436 17.1913 10.6461 17.1717Z" fill="#424242" />
        <path d="M10.6469 14.8049C9.02462 14.5156 7.36396 14.5156 5.74168 14.8049C5.64441 14.8246 5.55896 14.8822 5.50404 14.9648C5.44912 15.0475 5.42922 15.1486 5.4487 15.2459C5.46819 15.3432 5.52547 15.4289 5.60798 15.484C5.6905 15.5392 5.79152 15.5594 5.8889 15.5402C7.41432 15.2743 8.97426 15.2743 10.4997 15.5402C10.548 15.55 10.5978 15.5502 10.6463 15.5408C10.6947 15.5313 10.7408 15.5124 10.7819 15.4851C10.8229 15.4578 10.8583 15.4227 10.8857 15.3817C10.9132 15.3407 10.9324 15.2947 10.9421 15.2464C10.9517 15.198 10.9518 15.1482 10.9422 15.0998C10.9326 15.0514 10.9135 15.0054 10.8861 14.9644C10.8587 14.9233 10.8234 14.8881 10.7824 14.8608C10.7413 14.8334 10.6953 14.8144 10.6469 14.8049Z" fill="#424242" />
        <path d="M10.6461 12.414C9.0238 12.125 7.36319 12.125 5.74089 12.414C5.64338 12.4335 5.5576 12.4909 5.50244 12.5737C5.44727 12.6564 5.42723 12.7577 5.44673 12.8552C5.46623 12.9527 5.52367 13.0385 5.60641 13.0936C5.68915 13.1488 5.79041 13.1688 5.88792 13.1493C7.41352 12.8847 8.97329 12.8847 10.4989 13.1493C10.5964 13.1689 10.6977 13.1489 10.7804 13.0937C10.8632 13.0386 10.9206 12.9528 10.9402 12.8553C10.9597 12.7578 10.9397 12.6565 10.8845 12.5737C10.8294 12.491 10.7436 12.4335 10.6461 12.414Z" fill="#424242" />
        <path d="M12.375 9.11133V21.2538C12.2775 21.2726 12.18 21.2951 12.09 21.3176H12.0862C12.0712 21.3213 12.0525 21.3213 12.0375 21.3251C12.0262 21.3251 12.015 21.3288 12 21.3288C11.985 21.3288 11.9737 21.3251 11.9625 21.3251C11.9475 21.3213 11.9288 21.3213 11.9138 21.3176H11.91C11.82 21.2951 11.7225 21.2726 11.625 21.2538V9.11133C11.7488 9.13383 11.8725 9.15633 12 9.18258C12.1275 9.15633 12.2512 9.13383 12.375 9.11133Z" fill="#BDBDBD" />
        <path d="M15.7443 2.17637C14.9841 1.4979 14.0538 1.03867 13.0529 0.847711C12.052 0.656755 11.018 0.741249 10.0614 1.09217C9.10472 1.44309 8.26137 2.04726 7.62136 2.84016C6.98135 3.63305 6.56872 4.5849 6.42754 5.59404C6.24738 6.85309 6.50141 8.13596 7.1478 9.23134C7.79419 10.3267 8.79439 11.1693 9.98364 11.6202L11.3498 13.8949C11.4158 14.0064 11.5099 14.0986 11.6227 14.1625C11.7354 14.2264 11.8629 14.2596 11.9925 14.259H11.9996C12.1305 14.2584 12.2589 14.2234 12.3718 14.1573C12.4848 14.0913 12.5784 13.9966 12.643 13.8829L13.9222 11.6574C14.8366 11.3252 15.6492 10.7614 16.2805 10.0211C16.9118 9.28079 17.3401 8.38937 17.5238 7.43395C17.7074 6.47854 17.6399 5.49183 17.328 4.57028C17.0161 3.64873 16.4704 2.82388 15.7443 2.17637Z" fill="#FF8F00" />
        <path d="M12.8042 4.89982C13.0076 4.68933 13.1208 4.40779 13.1197 4.11512C13.1186 3.82245 13.0033 3.54176 12.7984 3.3328C12.5862 3.1238 12.3005 3.00641 12.0027 3.00586C11.7048 3.00531 11.4187 3.12166 11.2057 3.32987C10.9964 3.53765 10.8781 3.82009 10.877 4.11506C10.8758 4.41003 10.9919 4.69337 11.1997 4.90275C11.3028 5.01213 11.4273 5.09922 11.5654 5.15866C11.7035 5.2181 11.8523 5.24862 12.0026 5.24835C12.1529 5.24808 12.3016 5.21701 12.4395 5.15707C12.5774 5.09712 12.7015 5.00957 12.8042 4.89982Z" fill="#EEEEEE" />
        <path d="M12.6984 5.78134C12.1329 5.42934 10.8276 5.67472 10.8743 6.41471V9.77651C10.8799 10.8357 13.1096 10.8196 13.1243 9.77651V6.41471C13.1223 6.27922 13.081 6.14721 13.0054 6.03476C12.9298 5.92231 12.8231 5.83426 12.6984 5.78134Z" fill="#EEEEEE" />
    </svg>
)

export const VideoLeft = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.666 22.6673L7.99935 16.0007L14.666 9.33398" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M24 22.6673L17.3333 16.0007L24 9.33398" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const VideoRight = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.334 22.6673L24.0007 16.0007L17.334 9.33398" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M8 22.6673L14.6667 16.0007L8 9.33398" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const VideoPause = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.334 12.3327V3.66602H11.0007V12.3327H10.334Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M5 12.3327V3.66602H5.66667V12.3327H5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const VideoVolume = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.666 6.66602L7.99935 11.9993H2.66602V19.9993H7.99935L14.666 25.3327V6.66602Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M25.4274 6.57422C27.927 9.07459 29.3312 12.4654 29.3312 16.0009C29.3312 19.5364 27.927 22.9272 25.4274 25.4276M20.7207 11.2809C21.9705 12.5311 22.6726 14.2265 22.6726 15.9942C22.6726 17.762 21.9705 19.4574 20.7207 20.7076" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)
export const DropZone1 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="32" height="32" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='text-dark'>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
)
export const DropZone2 = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="16" height="16" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className='mr-2'>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
    </svg>
)
export const PlayVideo = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle opacity="0.32" cx="16" cy="16" r="16" fill="#FFDA30" />
        <g clip-path="url(#clip0_10049_225623)">
            <path d="M22.4265 14.8605L12.9999 9.21384C12.7982 9.09741 12.5697 9.03581 12.3369 9.03516C12.104 9.03451 11.8751 9.09483 11.6728 9.21012C11.4706 9.32541 11.302 9.49165 11.184 9.69231C11.0659 9.89296 11.0024 10.121 10.9999 10.3538L10.9999 21.6472C11.0024 21.88 11.0659 22.108 11.184 22.3087C11.302 22.5094 11.4706 22.6756 11.6728 22.7909C11.8751 22.9062 12.104 22.9665 12.3368 22.9658C12.5697 22.9652 12.7982 22.9036 12.9999 22.7872L22.4265 17.1405C22.6225 17.0217 22.7845 16.8543 22.8969 16.6546C23.0093 16.4549 23.0684 16.2297 23.0684 16.0005C23.0684 15.7713 23.0093 15.5461 22.8969 15.3464C22.7845 15.1467 22.6225 14.9793 22.4265 14.8605V14.8605Z" stroke="#FFDA30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
            <clipPath id="clip0_10049_225623">
                <rect width="16" height="16" fill="white" transform="translate(25 8) rotate(90)" />
            </clipPath>
        </defs>
    </svg>

)

export const SettingSvg = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.37114e-08 7.5C1.95703e-08 7.22386 0.298477 7 0.666667 7L7.33333 7C7.70152 7 8 7.22386 8 7.5C8 7.77614 7.70152 8 7.33333 8L0.666667 8C0.298477 8 6.78526e-08 7.77614 4.37114e-08 7.5Z" fill="black" />
            <path fillRule="evenodd" clipRule="evenodd" d="M9.5 8.75C10.1904 8.75 10.75 8.19036 10.75 7.5C10.75 6.80964 10.1904 6.25 9.5 6.25C8.80964 6.25 8.25 6.80964 8.25 7.5C8.25 8.19036 8.80964 8.75 9.5 8.75ZM9.5 10C10.8807 10 12 8.88071 12 7.5C12 6.11929 10.8807 5 9.5 5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10Z" fill="black" />
            <path fillRule="evenodd" clipRule="evenodd" d="M13 2.5C13 2.22386 12.7015 2 12.3333 2L5.66667 2C5.29848 2 5 2.22386 5 2.5C5 2.77614 5.29848 3 5.66667 3L12.3333 3C12.7015 3 13 2.77614 13 2.5Z" fill="black" />
            <path fillRule="evenodd" clipRule="evenodd" d="M3.5 3.75C2.80964 3.75 2.25 3.19036 2.25 2.5C2.25 1.80964 2.80964 1.25 3.5 1.25C4.19036 1.25 4.75 1.80964 4.75 2.5C4.75 3.19036 4.19036 3.75 3.5 3.75ZM3.5 5C2.11929 5 1 3.88071 1 2.5C1 1.11929 2.11929 0 3.5 0C4.88071 0 6 1.11929 6 2.5C6 3.88071 4.88071 5 3.5 5Z" fill="black" />
        </svg>
    )
}
export const PlayBtn = () => {
    return (
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#FFDE2F" fill-opacity="0.32" />
            <circle cx="20" cy="19.999" r="16" fill="white" />
            <g opacity="0.16" filter="url(#filter0_f_11043_278348)">
                <circle cx="20" cy="20" r="8" fill="#FFDE2F" />
            </g>
            <g clip-path="url(#clip0_11043_278348)">
                <path d="M25.1916 19.7484L17.6503 15.016C17.489 14.9184 17.3061 14.8668 17.1199 14.8662C16.9336 14.8657 16.7505 14.9162 16.5887 15.0128C16.4269 15.1095 16.292 15.2488 16.1976 15.417C16.1031 15.5851 16.0523 15.7763 16.0503 15.9714L16.0503 25.4363C16.0523 25.6314 16.1031 25.8225 16.1976 25.9907C16.292 26.1589 16.4269 26.2982 16.5887 26.3948C16.7505 26.4914 16.9336 26.542 17.1199 26.5415C17.3061 26.5409 17.489 26.4893 17.6503 26.3917L25.1916 21.6593C25.3484 21.5597 25.478 21.4194 25.5679 21.2521C25.6578 21.0847 25.7051 20.8959 25.7051 20.7038C25.7051 20.5118 25.6578 20.323 25.5679 20.1556C25.478 19.9883 25.3484 19.848 25.1916 19.7484Z" fill="#231F20" />
            </g>
            <defs>
                <filter id="filter0_f_11043_278348" x="8" y="8" width="24" height="24" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feGaussianBlur stdDeviation="2" result="effect1_foregroundBlur_11043_278348" />
                </filter>
                <clipPath id="clip0_11043_278348">
                    <rect width="13.4095" height="12.8" fill="white" transform="translate(27.25 13.999) rotate(90)" />
                </clipPath>
            </defs>
        </svg>

    )
}

export const EyeIcon = ({ height, width }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width ?? "14"} height={height ?? "15"} viewBox="0 0 14 15" fill="none">
            <g clip-path="url(#clip0_11043_278363)">
                <path d="M0.583984 7.49967C0.583984 7.49967 2.91732 2.83301 7.00065 2.83301C11.084 2.83301 13.4173 7.49967 13.4173 7.49967C13.4173 7.49967 11.084 12.1663 7.00065 12.1663C2.91732 12.1663 0.583984 7.49967 0.583984 7.49967Z" stroke="#749C8D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M7 9.25C7.9665 9.25 8.75 8.4665 8.75 7.5C8.75 6.5335 7.9665 5.75 7 5.75C6.0335 5.75 5.25 6.5335 5.25 7.5C5.25 8.4665 6.0335 9.25 7 9.25Z" stroke="#749C8D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_11043_278363">
                    <rect width="14" height="14" fill="white" transform="translate(0 0.5)" />
                </clipPath>
            </defs>
        </svg>
    )
}

export const GreenEyeIcon = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_15026_10663)">
                <path d="M0.667969 7.99935C0.667969 7.99935 3.33464 2.66602 8.0013 2.66602C12.668 2.66602 15.3346 7.99935 15.3346 7.99935C15.3346 7.99935 12.668 13.3327 8.0013 13.3327C3.33464 13.3327 0.667969 7.99935 0.667969 7.99935Z" stroke="#0CB174" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="#0CB174" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_15026_10663">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>

    )
}

export const ToggleTrue = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="white" />
            <path d="M13.75 7.5L8.96277 11.875L6.25 8.95833" stroke="#32936F" stroke-width="1.5" />
        </svg>
    )
}

export const ToggleFalse = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="10" fill="white" />
            <path d="M8.125 6.5625L11.5922 10.0297C11.7484 10.1859 11.7484 10.4391 11.5922 10.5953L8.125 14.0625" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" />
        </svg>
    )
}
export const VideoPlayerClose = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle opacity="0.48" cx="20" cy="20" r="20" fill="white" fill-opacity="0.9" />
            <path d="M26 14L14 26" stroke="#6B6B6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M14 14L26 26" stroke="#6B6B6B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}
export const WarningSvgIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <g clip-path="url(#clip0_11062_280219)">
                <path d="M13.6653 15.9978H2.33459C0.601342 15.9978 -0.525971 14.1738 0.249154 12.6236L5.9145 1.29278C6.77375 -0.425719 9.22612 -0.425719 10.0854 1.29278L15.7507 12.6235C16.5259 14.1738 15.3986 15.9978 13.6653 15.9978Z" fill="url(#paint0_linear_11062_280219)" />
                <path d="M13.6653 15.9978H2.33459C0.601342 15.9978 -0.525971 14.1738 0.249154 12.6236L5.9145 1.29278C6.77375 -0.425719 9.22612 -0.425719 10.0854 1.29278L15.7507 12.6235C16.5259 14.1738 15.3986 15.9978 13.6653 15.9978Z" fill="url(#paint1_linear_11062_280219)" />
                <path d="M15.1895 12.9036L9.52419 1.57289C9.22925 0.983016 8.65944 0.630859 7.99997 0.630859C7.3405 0.630859 6.77069 0.983016 6.47575 1.57289L0.810376 12.9036C0.544313 13.4358 0.572188 14.0556 0.884969 14.5617C1.19775 15.0678 1.73969 15.3699 2.33459 15.3699H13.6653C14.2603 15.3699 14.8022 15.0678 15.115 14.5617C15.4277 14.0556 15.4556 13.4358 15.1895 12.9036ZM14.5813 14.2318C14.3836 14.5515 14.0413 14.7425 13.6654 14.7425H2.33459C1.95872 14.7425 1.61631 14.5515 1.41872 14.2318C1.22109 13.9121 1.20347 13.5205 1.37159 13.1842L7.03694 1.85352C7.22606 1.47527 7.57703 1.25833 7.99994 1.25833C8.42284 1.25833 8.77384 1.47527 8.96294 1.85352L14.6283 13.1843C14.7964 13.5205 14.7788 13.9121 14.5813 14.2318Z" fill="url(#paint2_linear_11062_280219)" />
                <path d="M13.6647 15.9961H12.7725L7.61519 10.8387C7.46272 10.7641 7.38616 10.6352 7.38616 10.451C7.38616 9.75516 7.35759 9.25884 7.3005 7.68394C7.24341 6.10934 7.21484 5.78591 7.21484 5.09006C7.21484 4.86794 7.29044 4.69666 7.44166 4.57588C7.59256 4.45478 7.78831 4.39453 8.02863 4.39453C8.26894 4.39453 8.44556 4.45728 8.55788 4.58309C8.57953 4.60694 13.281 9.30684 14.9039 10.9291L15.7503 12.6219C16.5256 14.1721 15.3981 15.9961 13.6647 15.9961Z" fill="url(#paint3_linear_11062_280219)" />
                <path d="M12.4045 15.9971H10.071L7.39587 13.3219C7.218 13.1651 7.12891 12.9822 7.12891 12.7729C7.12891 12.5549 7.218 12.3695 7.39587 12.217C7.57375 12.0645 7.78991 11.9883 8.04403 11.9883C8.26772 11.9883 8.46128 12.0645 8.62441 12.217L12.4045 15.9971Z" fill="url(#paint4_linear_11062_280219)" />
                <path d="M7.12891 12.7718C7.12891 12.5538 7.21784 12.3686 7.39569 12.2162C7.57356 12.0637 7.78975 11.9872 8.04384 11.9872C8.26762 11.9872 8.46106 12.0637 8.62419 12.2162C8.78734 12.3686 8.86919 12.5538 8.86919 12.7718C8.86919 12.9811 8.78741 13.1641 8.62419 13.321C8.46106 13.4779 8.26759 13.5564 8.04384 13.5564C7.78972 13.5564 7.57356 13.4779 7.39569 13.321C7.21784 13.1641 7.12891 12.9811 7.12891 12.7718ZM7.2145 5.09016C7.2145 4.86813 7.29003 4.69663 7.44119 4.57581C7.59228 4.455 7.78797 4.39453 8.02825 4.39453C8.26853 4.39453 8.44506 4.45744 8.55762 4.58313C8.67016 4.70881 8.72656 4.87778 8.72656 5.09016C8.72656 5.78606 8.7145 6.10931 8.69091 7.68416C8.66706 9.25906 8.65528 9.75531 8.65528 10.4509C8.65528 10.5961 8.58731 10.7097 8.45156 10.7917C8.31559 10.8738 8.1745 10.9148 8.02828 10.9148C7.59994 10.9148 7.38572 10.7603 7.38572 10.4509C7.38572 9.75531 7.35716 9.25906 7.30012 7.68416C7.243 6.10928 7.2145 5.78603 7.2145 5.09016Z" fill="white" />
            </g>
            <defs>
                <linearGradient id="paint0_linear_11062_280219" x1="4.01284" y1="6.84455" x2="22.2644" y2="25.0961" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFB92D" />
                    <stop offset="1" stop-color="#F59500" />
                </linearGradient>
                <linearGradient id="paint1_linear_11062_280219" x1="6.43572" y1="9.26736" x2="11.9374" y2="14.7687" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFB92D" />
                    <stop offset="1" stop-color="#F59500" />
                </linearGradient>
                <linearGradient id="paint2_linear_11062_280219" x1="0.628895" y1="8.00055" x2="15.3707" y2="8.00055" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFF465" />
                    <stop offset="1" stop-color="#FFE600" />
                </linearGradient>
                <linearGradient id="paint3_linear_11062_280219" x1="13.2233" y1="12.8649" x2="4.3109" y2="3.95242" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#BE3F45" stop-opacity="0" />
                    <stop offset="1" stop-color="#BE3F45" />
                </linearGradient>
                <linearGradient id="paint4_linear_11062_280219" x1="10.3372" y1="15.0982" x2="7.42994" y2="12.1906" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#BE3F45" stop-opacity="0" />
                    <stop offset="1" stop-color="#BE3F45" />
                </linearGradient>
                <clipPath id="clip0_11062_280219">
                    <rect width="16" height="16" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}

export const ShareIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3.33398 10V16.6667C3.33398 17.1087 3.50958 17.5326 3.82214 17.8452C4.1347 18.1577 4.55862 18.3333 5.00065 18.3333H15.0007C15.4427 18.3333 15.8666 18.1577 16.1792 17.8452C16.4917 17.5326 16.6673 17.1087 16.6673 16.6667V10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M13.3327 5.00033L9.99935 1.66699L6.66602 5.00033" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 1.66699V12.5003" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}
export const BigWarning = () => {
    return (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
        <g clip-path="url(#clip0_11062_279773)">
            <path d="M27.3306 31.9937H4.66918C1.20268 31.9937 -1.05194 28.3457 0.498308 25.2452L11.829 2.58361C13.5475 -0.853391 18.4522 -0.853391 20.1707 2.58361L31.5014 25.2451C33.0518 28.3457 30.7972 31.9937 27.3306 31.9937Z" fill="url(#paint0_linear_11062_279773)" />
            <path d="M27.3306 31.9937H4.66918C1.20268 31.9937 -1.05194 28.3457 0.498308 25.2452L11.829 2.58361C13.5475 -0.853391 18.4522 -0.853391 20.1707 2.58361L31.5014 25.2451C33.0518 28.3457 30.7972 31.9937 27.3306 31.9937Z" fill="url(#paint1_linear_11062_279773)" />
            <path d="M30.3791 25.8073L19.0484 3.14578C18.4585 1.96603 17.3189 1.26172 15.9999 1.26172C14.681 1.26172 13.5414 1.96603 12.9515 3.14578L1.62075 25.8073C1.08863 26.8715 1.14438 28.1112 1.76994 29.1233C2.3955 30.1355 3.47938 30.7398 4.66919 30.7398H27.3307C28.5205 30.7398 29.6044 30.1355 30.2299 29.1233C30.8554 28.1112 30.9113 26.8716 30.3791 25.8073ZM29.1625 28.4636C28.7673 29.1031 28.0825 29.4849 27.3308 29.4849H4.66919C3.91744 29.4849 3.23263 29.1031 2.83744 28.4636C2.44219 27.8242 2.40694 27.0409 2.74319 26.3685L14.0739 3.70703C14.4521 2.95053 15.1541 2.51666 15.9999 2.51666C16.8457 2.51666 17.5477 2.95053 17.9259 3.70703L29.2566 26.3685C29.5929 27.0409 29.5577 27.8242 29.1625 28.4636Z" fill="url(#paint2_linear_11062_279773)" />
            <path d="M27.3294 31.9941H25.545L15.2304 21.6795C14.9254 21.5301 14.7723 21.2723 14.7723 20.904C14.7723 19.5123 14.7152 18.5196 14.601 15.3698C14.4868 12.2206 14.4297 11.5738 14.4297 10.1821C14.4297 9.73783 14.5809 9.39527 14.8833 9.1537C15.1851 8.91152 15.5766 8.79102 16.0573 8.79102C16.5379 8.79102 16.8911 8.91652 17.1158 9.16814C17.1591 9.21583 26.562 18.6156 29.8077 21.8601L31.5006 25.2458C33.0511 28.3461 30.7961 31.9941 27.3294 31.9941Z" fill="url(#paint3_linear_11062_279773)" />
            <path d="M24.8109 31.9941H20.144L14.7937 26.6439C14.438 26.3301 14.2598 25.9644 14.2598 25.5458C14.2598 25.1098 14.438 24.7389 14.7937 24.434C15.1495 24.1291 15.5818 23.9766 16.09 23.9766C16.5374 23.9766 16.9245 24.1291 17.2508 24.434L24.8109 31.9941Z" fill="url(#paint4_linear_11062_279773)" />
            <path d="M14.2598 25.5437C14.2598 25.1076 14.4376 24.7373 14.7933 24.4324C15.1491 24.1274 15.5815 23.9745 16.0896 23.9745C16.5372 23.9745 16.9241 24.1274 17.2503 24.4324C17.5766 24.7373 17.7403 25.1076 17.7403 25.5437C17.7403 25.9622 17.5768 26.3283 17.2503 26.642C16.9241 26.9559 16.5371 27.1128 16.0896 27.1128C15.5814 27.1128 15.1491 26.9558 14.7933 26.642C14.4376 26.3283 14.2598 25.9622 14.2598 25.5437ZM14.431 10.1803C14.431 9.73625 14.582 9.39325 14.8843 9.15163C15.1865 8.91 15.5779 8.78906 16.0585 8.78906C16.539 8.78906 16.8921 8.91488 17.1172 9.16625C17.3423 9.41763 17.4551 9.75556 17.4551 10.1803C17.4551 11.5721 17.431 12.2186 17.3838 15.3683C17.3361 18.5181 17.3125 19.5106 17.3125 20.9019C17.3125 21.1922 17.1766 21.4194 16.9051 21.5834C16.6331 21.7475 16.351 21.8296 16.0585 21.8296C15.2018 21.8296 14.7734 21.5206 14.7734 20.9019C14.7734 19.5106 14.7163 18.5181 14.6022 15.3683C14.488 12.2186 14.431 11.5721 14.431 10.1803Z" fill="white" />
        </g>
        <defs>
            <linearGradient id="paint0_linear_11062_279773" x1="8.02567" y1="13.6871" x2="44.5287" y2="50.1902" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FFB92D" />
                <stop offset="1" stop-color="#F59500" />
            </linearGradient>
            <linearGradient id="paint1_linear_11062_279773" x1="12.8714" y1="18.5328" x2="23.8748" y2="29.5355" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FFB92D" />
                <stop offset="1" stop-color="#F59500" />
            </linearGradient>
            <linearGradient id="paint2_linear_11062_279773" x1="1.25779" y1="16.0011" x2="30.7415" y2="16.0011" gradientUnits="userSpaceOnUse">
                <stop stop-color="#FFF465" />
                <stop offset="1" stop-color="#FFE600" />
            </linearGradient>
            <linearGradient id="paint3_linear_11062_279773" x1="26.4467" y1="25.7317" x2="8.6218" y2="7.9068" gradientUnits="userSpaceOnUse">
                <stop stop-color="#BE3F45" stop-opacity="0" />
                <stop offset="1" stop-color="#BE3F45" />
            </linearGradient>
            <linearGradient id="paint4_linear_11062_279773" x1="20.6763" y1="30.1964" x2="14.8618" y2="24.3813" gradientUnits="userSpaceOnUse">
                <stop stop-color="#BE3F45" stop-opacity="0" />
                <stop offset="1" stop-color="#BE3F45" />
            </linearGradient>
            <clipPath id="clip0_11062_279773">
                <rect width="32" height="32" fill="white" />
            </clipPath>
        </defs>
    </svg>)
}


export const DotIcon = () => {
    return (
        <svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="2" cy="2" r="2" fill="#6B6B6B" />
        </svg>
    )
}

export const VideoCircle = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11.25" stroke="#231F20" stroke-width="1.5" />
        <g clip-path="url(#clip0_11499_321449)">
            <path d="M16.8194 11.1444L9.74941 6.9094C9.5982 6.82208 9.42676 6.77588 9.25215 6.77539C9.07754 6.77491 8.90584 6.82015 8.75415 6.90661C8.60245 6.99308 8.47604 7.11776 8.38748 7.26825C8.29893 7.41874 8.25133 7.5898 8.24941 7.7644L8.24941 16.2344C8.25133 16.409 8.29893 16.5801 8.38748 16.7305C8.47603 16.881 8.60245 17.0057 8.75415 17.0922C8.90584 17.1787 9.07754 17.2239 9.25215 17.2234C9.42676 17.2229 9.5982 17.1767 9.74941 17.0894L16.8194 12.8544C16.9664 12.7653 17.0878 12.6398 17.1722 12.49C17.2565 12.3402 17.3008 12.1713 17.3008 11.9994C17.3008 11.8275 17.2565 11.6586 17.1722 11.5088C17.0878 11.359 16.9664 11.2335 16.8194 11.1444V11.1444Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
            <clipPath id="clip0_11499_321449">
                <rect width="12" height="12" fill="white" transform="translate(18.75 6) rotate(90)" />
            </clipPath>
        </defs>
    </svg>
);


export const Restart = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
        <g clip-path="url(#clip0_10611_18362)">
            <path d="M0.666016 3.16602V7.16602H4.66602" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M2.33935 10.4996C2.77161 11.7266 3.59091 12.7798 4.67379 13.5006C5.75667 14.2214 7.04447 14.5707 8.34316 14.496C9.64185 14.4212 10.8811 13.9264 11.8741 13.0861C12.8671 12.2459 13.5602 11.1056 13.8488 9.83722C14.1375 8.56881 14.0061 7.24094 13.4744 6.05371C12.9428 4.86647 12.0397 3.88417 10.9012 3.25482C9.76278 2.62546 8.45062 2.38315 7.16247 2.56438C5.87432 2.74562 4.67996 3.34059 3.75935 4.25964L0.666016 7.16631" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </g>
        <defs>
            <clipPath id="clip0_10611_18362">
                <rect width="16" height="16" fill="white" transform="translate(0 0.5)" />
            </clipPath>
        </defs>
    </svg>
)
export const ShareVRSvg = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.1673 5.83398L13.334 10.0007L19.1673 14.1673V5.83398Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M11.6673 4.16602H2.50065C1.58018 4.16602 0.833984 4.91221 0.833984 5.83268V14.166C0.833984 15.0865 1.58018 15.8327 2.50065 15.8327H11.6673C12.5878 15.8327 13.334 15.0865 13.334 14.166V5.83268C13.334 4.91221 12.5878 4.16602 11.6673 4.16602Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const Caution = () => {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_13154_340969)">
                <path d="M10.249 11.9984H1.75094C0.451006 11.9984 -0.394478 10.6304 0.186865 9.46767L4.43587 0.969586C5.08031 -0.319289 6.91959 -0.319289 7.56403 0.969586L11.813 9.46765C12.3944 10.6304 11.5489 11.9984 10.249 11.9984Z" fill="url(#paint0_linear_13154_340969)" />
                <path d="M10.249 11.9984H1.75094C0.451006 11.9984 -0.394478 10.6304 0.186865 9.46767L4.43587 0.969586C5.08031 -0.319289 6.91959 -0.319289 7.56403 0.969586L11.813 9.46765C12.3944 10.6304 11.5489 11.9984 10.249 11.9984Z" fill="url(#paint1_linear_13154_340969)" />
                <path d="M11.3931 9.67724L7.14412 1.17918C6.92291 0.736773 6.49555 0.472656 6.00095 0.472656C5.50635 0.472656 5.07899 0.736773 4.85779 1.17918L0.608758 9.67724C0.409211 10.0763 0.430118 10.5412 0.664704 10.9208C0.899289 11.3003 1.30574 11.527 1.75192 11.527H10.25C10.6962 11.527 11.1026 11.3003 11.3372 10.9208C11.5718 10.5412 11.5927 10.0764 11.3931 9.67724ZM10.9369 10.6734C10.7887 10.9132 10.5319 11.0564 10.25 11.0564H1.75192C1.47002 11.0564 1.21321 10.9132 1.06502 10.6734C0.916797 10.4336 0.903579 10.1399 1.02967 9.88769L5.27868 1.38965C5.42052 1.10596 5.68375 0.943258 6.00093 0.943258C6.31811 0.943258 6.58136 1.10596 6.72318 1.38965L10.9722 9.88771C11.0983 10.1399 11.0851 10.4336 10.9369 10.6734Z" fill="url(#paint2_linear_13154_340969)" />
                <path d="M10.2476 11.997H9.5784L5.71041 8.12906C5.59606 8.07307 5.53864 7.97637 5.53864 7.83825C5.53864 7.31637 5.51722 6.94413 5.4744 5.76295C5.43158 4.58201 5.41016 4.33943 5.41016 3.81755C5.41016 3.65095 5.46685 3.52249 5.58027 3.43191C5.69345 3.34109 5.84026 3.2959 6.02049 3.2959C6.20073 3.2959 6.3332 3.34296 6.41743 3.43732C6.43367 3.4552 9.95977 6.98013 11.1769 8.19682L11.8118 9.46645C12.3932 10.629 11.5476 11.997 10.2476 11.997Z" fill="url(#paint3_linear_13154_340969)" />
                <path d="M9.30433 11.9978H7.55423L5.54788 9.99145C5.41448 9.8738 5.34766 9.73664 5.34766 9.57968C5.34766 9.41616 5.41448 9.2771 5.54788 9.16275C5.68129 9.0484 5.84341 8.99121 6.034 8.99121C6.20177 8.99121 6.34694 9.0484 6.46928 9.16275L9.30433 11.9978Z" fill="url(#paint4_linear_13154_340969)" />
                <path d="M5.34766 9.57888C5.34766 9.41536 5.41436 9.27647 5.54774 9.16214C5.68115 9.04777 5.84329 8.99044 6.03386 8.99044C6.2017 8.99044 6.34677 9.04777 6.46912 9.16214C6.59148 9.27647 6.65287 9.41536 6.65287 9.57888C6.65287 9.73582 6.59153 9.87309 6.46912 9.99075C6.34677 10.1085 6.20167 10.1673 6.03386 10.1673C5.84327 10.1673 5.68115 10.1084 5.54774 9.99075C5.41436 9.87309 5.34766 9.73584 5.34766 9.57888ZM5.41185 3.81762C5.41185 3.65109 5.4685 3.52247 5.58187 3.43186C5.69519 3.34125 5.84195 3.2959 6.02216 3.2959C6.20238 3.2959 6.33477 3.34308 6.41919 3.43734C6.50359 3.53161 6.5459 3.65834 6.5459 3.81762C6.5459 4.33955 6.53685 4.58198 6.51916 5.76312C6.50127 6.9443 6.49244 7.31648 6.49244 7.8382C6.49244 7.94707 6.44146 8.03229 6.33965 8.09379C6.23767 8.15531 6.13185 8.18611 6.02219 8.18611C5.70093 8.18611 5.54027 8.07023 5.54027 7.8382C5.54027 7.31648 5.51884 6.9443 5.47607 5.76312C5.43323 4.58196 5.41185 4.33952 5.41185 3.81762Z" fill="white" />
            </g>
            <defs>
                <linearGradient id="paint0_linear_13154_340969" x1="3.00963" y1="5.13341" x2="16.6983" y2="18.8221" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFB92D" />
                    <stop offset="1" stop-color="#F59500" />
                </linearGradient>
                <linearGradient id="paint1_linear_13154_340969" x1="4.82679" y1="6.95052" x2="8.95306" y2="11.0766" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFB92D" />
                    <stop offset="1" stop-color="#F59500" />
                </linearGradient>
                <linearGradient id="paint2_linear_13154_340969" x1="0.472648" y1="5.99992" x2="11.529" y2="5.99992" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFF465" />
                    <stop offset="1" stop-color="#FFE600" />
                </linearGradient>
                <linearGradient id="paint3_linear_13154_340969" x1="9.91652" y1="9.64864" x2="3.2322" y2="2.96432" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#BE3F45" stop-opacity="0" />
                    <stop offset="1" stop-color="#BE3F45" />
                </linearGradient>
                <linearGradient id="paint4_linear_13154_340969" x1="7.75386" y1="11.3236" x2="5.57344" y2="9.14298" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#BE3F45" stop-opacity="0" />
                    <stop offset="1" stop-color="#BE3F45" />
                </linearGradient>
                <clipPath id="clip0_13154_340969">
                    <rect width="12" height="12" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}

export const QuickTipSvg = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none" className="quickTipSvg">
            <path d="M32.041 15.5137H1.7447C0.781086 15.5137 0 16.2948 0 17.2584V35.2287C0 36.1922 0.781086 36.9734 1.7447 36.9734H5.73177V41.3227C5.73177 42.0998 6.67141 42.489 7.22098 41.9395L12.1871 36.9734H32.041C33.0046 36.9734 33.7857 36.1923 33.7857 35.2287V17.2584C33.7857 16.2948 33.0046 15.5137 32.041 15.5137Z" fill="#60B7FF" />
            <path d="M32.0406 15.5137H26.9805C27.4261 16.3806 28.038 17.1646 28.7951 17.8165C28.9947 17.9882 29.1481 18.1929 29.2387 18.4084L29.6906 19.4818C29.7447 19.6104 29.7726 19.7485 29.7726 19.888V20.8297C29.7726 22.0324 30.3047 23.1128 31.1456 23.8487C31.3776 24.0518 31.5172 24.3402 31.5172 24.6486V35.2287C31.5172 36.1922 30.7361 36.9734 29.7725 36.9734H32.0406C33.0041 36.9734 33.7853 36.1923 33.7853 35.2287V17.2584C33.7853 16.2948 33.0042 15.5137 32.0406 15.5137Z" fill="#26A6FE" />
            <path d="M32.9133 22.34H33.4685L34.1461 22.109L35.1325 21.9396C35.3811 21.6381 35.5303 21.2518 35.5303 20.8306V19.2196L33.7857 18.6973L32.041 19.2196V20.8306C32.0409 21.4761 32.3923 22.0382 32.9133 22.34Z" fill="#CBC4CC" />
            <path d="M33.7854 19.219V20.83C33.7854 21.4754 33.434 22.0376 32.9131 22.3394C33.17 22.4881 33.4673 22.5747 33.7854 22.5747C34.749 22.5747 35.5301 21.7936 35.5301 20.83V19.219L34.5451 18.8418L33.7854 19.219Z" fill="#B5ADB6" />
            <path d="M30.2755 16.0979C30.4011 16.2061 30.5191 16.322 30.6302 16.4438L31.5127 16.9785H36.5273C36.7249 16.6619 36.968 16.375 37.2547 16.1331C38.4712 15.1067 39.2267 13.5514 39.1646 11.8211C39.0625 8.97596 36.7154 6.68023 33.8687 6.63734C30.858 6.59197 28.4033 9.01893 28.4033 12.0192C28.4032 13.6502 29.1293 15.1111 30.2755 16.0979Z" fill="#FFD15B" />
            <path d="M39.1642 11.8213C39.0854 9.62565 37.6691 7.7584 35.7186 7C36.6425 8.01045 37.2064 9.35563 37.2064 10.8327C37.2064 13.9707 34.6625 16.5147 31.5245 16.5147C31.22 16.5147 30.9214 16.4901 30.6299 16.4439C30.9214 16.7635 31.1605 17.1278 31.3292 17.5287L32.0407 19.2189H33.1409L33.7855 18.6966L34.43 19.2189H35.5301L36.2416 17.5285C36.4675 16.9918 36.8093 16.5087 37.2544 16.1332C38.4708 15.1068 39.2263 13.5515 39.1642 11.8213Z" fill="#FFC344" />
            <path d="M36.6307 12.3643C36.2448 11.9744 35.7298 11.7598 35.1808 11.7598C34.6412 11.7598 34.1503 11.9707 33.7851 12.3139C33.4198 11.9707 32.9289 11.7598 32.3893 11.7598C31.8403 11.7598 31.3253 11.9745 30.9394 12.3643C30.689 12.6172 30.691 13.0254 30.944 13.2758C31.1969 13.5261 31.605 13.5243 31.8555 13.2711C31.9975 13.1277 32.187 13.0487 32.3893 13.0487C32.8036 13.0487 33.1405 13.3857 33.1405 13.8C33.1405 13.8014 33.1407 13.8027 33.1407 13.804C33.1407 13.806 33.1404 13.8078 33.1404 13.8098V19.2184H34.4295V13.8098C34.4295 13.8084 34.4293 13.8071 34.4293 13.8058C34.4293 13.8038 34.4296 13.802 34.4296 13.8C34.4296 13.3858 34.7665 13.0487 35.1808 13.0487C35.3831 13.0487 35.5726 13.1277 35.7146 13.2711C35.9651 13.5242 36.3732 13.5261 36.6261 13.2758C36.879 13.0254 36.8811 12.6173 36.6307 12.3643Z" fill="#F6AB31" />
            <path d="M33.7852 4.48955C33.4291 4.48955 33.1406 4.20097 33.1406 3.84502V2.44922C33.1406 2.09327 33.4291 1.80469 33.7852 1.80469C34.1412 1.80469 34.4297 2.09327 34.4297 2.44922V3.84502C34.4297 4.20097 34.1411 4.48955 33.7852 4.48955Z" fill="#FFD15B" />
            <path d="M29.6995 5.5839C29.4767 5.5839 29.2601 5.46832 29.1407 5.26155L28.4429 4.05284C28.2649 3.74458 28.3705 3.35039 28.6788 3.17241C28.9872 2.99444 29.3813 3.09997 29.5592 3.40831L30.257 4.61702C30.435 4.92528 30.3294 5.31948 30.0211 5.49745C29.9196 5.55606 29.8088 5.5839 29.6995 5.5839Z" fill="#FFD15B" />
            <path d="M26.7062 8.57702C26.5969 8.57702 26.4861 8.54917 26.3846 8.49056L25.1759 7.79267C24.8676 7.61469 24.762 7.22049 24.94 6.91224C25.1179 6.60398 25.5119 6.49828 25.8204 6.67634L27.0291 7.37424C27.3374 7.55221 27.443 7.94641 27.265 8.25467C27.1456 8.46135 26.9289 8.57702 26.7062 8.57702Z" fill="#FFD15B" />
            <path d="M25.6115 12.6641H24.2158C23.8598 12.6641 23.5713 12.3755 23.5713 12.0195C23.5713 11.6636 23.8598 11.375 24.2158 11.375H25.6115C25.9676 11.375 26.2561 11.6636 26.2561 12.0195C26.2561 12.3755 25.9676 12.6641 25.6115 12.6641Z" fill="#FFD15B" />
            <path d="M40.8649 8.57704C40.6422 8.57704 40.4255 8.46145 40.3062 8.25468C40.1282 7.94643 40.2338 7.55223 40.5421 7.37426L41.7508 6.67636C42.0589 6.49829 42.4533 6.60391 42.6312 6.91226C42.8092 7.22051 42.7036 7.61471 42.3953 7.79269L41.1866 8.49058C41.0852 8.54919 40.9743 8.57704 40.8649 8.57704Z" fill="#FFD15B" />
            <path d="M43.3547 12.6641H41.959C41.6029 12.6641 41.3145 12.3755 41.3145 12.0195C41.3145 11.6636 41.6029 11.375 41.959 11.375H43.3547C43.7107 11.375 43.9992 11.6636 43.9992 12.0195C43.9992 12.3755 43.7107 12.6641 43.3547 12.6641Z" fill="#FFD15B" />
            <path d="M37.8716 5.58392C37.7622 5.58392 37.6514 5.55608 37.5499 5.49747C37.2416 5.31949 37.136 4.9253 37.314 4.61704L38.0118 3.40833C38.1897 3.10007 38.5837 2.99437 38.8922 3.17243C39.2005 3.35041 39.3061 3.7446 39.1281 4.05286L38.4303 5.26157C38.311 5.46825 38.0943 5.58392 37.8716 5.58392Z" fill="#FFD15B" />
            <path d="M29.9759 24.2957L27.918 22.3103L29.7973 20.5828C30.0594 20.342 30.0766 19.9342 29.8356 19.6722C29.5948 19.4101 29.187 19.3929 28.925 19.6337L27.4717 20.9696V20.0488C27.4717 19.6929 27.1832 19.4043 26.8271 19.4043C26.4711 19.4043 26.1826 19.6929 26.1826 20.0488V24.7595C26.1826 25.1154 26.4711 25.404 26.8271 25.404C27.1832 25.404 27.4717 25.1154 27.4717 24.7595V23.6708L29.0809 25.2234C29.206 25.344 29.3673 25.4041 29.5283 25.4041C29.6972 25.4041 29.8658 25.3382 29.9922 25.2071C30.2395 24.9509 30.2322 24.5428 29.9759 24.2957Z" fill="#EAF6FF" />
            <path d="M17.4053 19.4043C17.0493 19.4043 16.7607 19.6929 16.7607 20.0488V24.7595C16.7607 25.1154 17.0493 25.404 17.4053 25.404C17.7612 25.404 18.0498 25.1154 18.0498 24.7595V20.0488C18.0498 19.6929 17.7612 19.4043 17.4053 19.4043Z" fill="#EAF6FF" />
            <path d="M24.4507 23.6008C24.178 23.372 23.7715 23.4076 23.5427 23.6804C23.5034 23.7272 23.461 23.771 23.4167 23.8105C23.1898 24.0126 22.8991 24.115 22.5526 24.115C21.6093 24.115 20.8418 23.3475 20.8418 22.4041C20.8418 21.4608 21.6093 20.6934 22.5526 20.6934C22.8955 20.6934 23.2261 20.7942 23.5087 20.9852C23.8036 21.1845 24.2044 21.1069 24.4036 20.812C24.6028 20.5169 24.5253 20.1163 24.2302 19.917C23.7339 19.5816 23.1537 19.4043 22.5526 19.4043C20.8985 19.4043 19.5527 20.75 19.5527 22.4041C19.5527 24.0582 20.8985 25.404 22.5526 25.404C23.2153 25.404 23.8105 25.1858 24.274 24.7732C24.3647 24.6923 24.451 24.6033 24.5302 24.5088C24.7591 24.2361 24.7233 23.8296 24.4507 23.6008Z" fill="#EAF6FF" />
            <path d="M15.2586 23.2869V20.0488C15.2586 19.6929 14.97 19.4043 14.6141 19.4043C14.2581 19.4043 13.9696 19.6929 13.9696 20.0488V23.2869C13.9696 23.5096 13.9062 23.7691 13.4364 24.0057C13.2905 24.0792 13.1318 24.115 12.951 24.115C12.9503 24.115 12.9497 24.115 12.949 24.115C12.752 24.1147 12.5812 24.0667 12.4268 23.968C12.0593 23.7332 11.9854 23.5346 11.9854 23.2903V20.0488C11.9854 19.6929 11.6968 19.4043 11.3408 19.4043C10.9849 19.4043 10.6963 19.6929 10.6963 20.0488V23.2903C10.6963 24.0215 11.045 24.6149 11.7328 25.0543C12.0951 25.2858 12.5037 25.4034 12.9472 25.404H12.9511C13.3325 25.404 13.6908 25.3209 14.0162 25.1571C15.0431 24.64 15.2586 23.8546 15.2586 23.2869Z" fill="#EAF6FF" />
            <path d="M8.54911 25.3849C8.71402 25.3849 8.87902 25.322 9.00484 25.1961C9.25655 24.9444 9.25655 24.5363 9.00484 24.2847L8.71634 23.9962C9.00673 23.5345 9.17542 22.9888 9.17542 22.4041C9.17542 20.75 7.82973 19.4043 6.1756 19.4043C4.52148 19.4043 3.17578 20.75 3.17578 22.4041C3.17578 24.0582 4.52148 25.404 6.1756 25.404C6.77948 25.404 7.34177 25.2241 7.81297 24.9158L8.09338 25.1961C8.2192 25.322 8.38411 25.3849 8.54911 25.3849ZM6.1756 24.115C5.23227 24.115 4.46484 23.3475 4.46484 22.4041C4.46484 21.4608 5.23227 20.6934 6.1756 20.6934C7.11894 20.6934 7.88636 21.4608 7.88636 22.4041C7.88636 22.6295 7.84141 22.8445 7.76184 23.0417L7.49784 22.7777C7.24612 22.5259 6.83801 22.526 6.58638 22.7777C6.33467 23.0294 6.33467 23.4375 6.58638 23.6891L6.86559 23.9684C6.65427 24.0619 6.42112 24.115 6.1756 24.115Z" fill="#EAF6FF" />
            <path d="M9.03906 27.082C8.68311 27.082 8.39453 27.3706 8.39453 27.7266V32.4372C8.39453 32.7932 8.68311 33.0818 9.03906 33.0818C9.39502 33.0818 9.68359 32.7932 9.68359 32.4372V27.7266C9.68359 27.3706 9.39502 27.082 9.03906 27.082Z" fill="#EAF6FF" />
            <path d="M6.42173 27.082H3.82031C3.46436 27.082 3.17578 27.3706 3.17578 27.7266C3.17578 28.0825 3.46436 28.3711 3.82031 28.3711H4.47129V32.4372C4.47129 32.7932 4.75987 33.0818 5.11582 33.0818C5.47177 33.0818 5.76035 32.7932 5.76035 32.4372V28.3711H6.42181C6.77777 28.3711 7.06634 28.0825 7.06634 27.7266C7.06634 27.3706 6.77768 27.082 6.42173 27.082Z" fill="#EAF6FF" />
            <path d="M12.9669 27.082H11.6553C11.2993 27.082 11.0107 27.3706 11.0107 27.7266V32.4372C11.0107 32.7932 11.2993 33.0818 11.6553 33.0818C12.0112 33.0818 12.2998 32.7932 12.2998 32.4372V31.0321C12.5489 31.0309 12.8113 31.0298 12.9669 31.0298C14.0697 31.0298 14.9669 30.1443 14.9669 29.0559C14.9669 27.9675 14.0697 27.082 12.9669 27.082ZM12.9669 29.7408C12.8112 29.7408 12.5493 29.7418 12.2998 29.743V28.3711H12.9669C13.3523 28.3711 13.6778 28.6847 13.6778 29.0559C13.6778 29.4272 13.3523 29.7408 12.9669 29.7408Z" fill="#EAF6FF" />
        </svg>
    )
}

export const IconMismatchTriangle = () => (
    <svg width="0.8125rem" height="0.8125rem" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.57379 2.0918L0.985875 9.75097C0.891283 9.91478 0.841232 10.1005 0.840702 10.2897C0.840173 10.4788 0.889183 10.6648 0.982856 10.8292C1.07653 10.9935 1.2116 11.1305 1.37463 11.2264C1.53767 11.3223 1.72297 11.3739 1.91213 11.376H11.088C11.2771 11.3739 11.4624 11.3223 11.6254 11.2264C11.7885 11.1305 11.9236 10.9935 12.0172 10.8292C12.1109 10.6648 12.1599 10.4788 12.1594 10.2897C12.1589 10.1005 12.1088 9.91478 12.0142 9.75097L7.42629 2.0918C7.32973 1.93261 7.19377 1.80099 7.03152 1.70964C6.86928 1.6183 6.68623 1.57031 6.50004 1.57031C6.31385 1.57031 6.1308 1.6183 5.96856 1.70964C5.80632 1.80099 5.67035 1.93261 5.57379 2.0918V2.0918Z" stroke="#32936F" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6.5 4.875V7.04167" stroke="#32936F" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M6.5 9.20898H6.5057" stroke="#32936F" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)
export const CompanySvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none">
        <path d="M18.6947 19H1.65706C1.33471 18.9954 1.07005 18.7423 1.05083 18.4199C1.03237 18.0976 1.26546 17.8152 1.58551 17.7737V5.31138C1.58858 4.37434 2.2079 3.55116 3.10725 3.28872L10.7705 1.08231C11.406 0.899206 12.0907 1.02538 12.6192 1.42313C13.1477 1.82088 13.4586 2.44403 13.4578 3.10489V7.29005C13.5078 7.29774 13.557 7.30851 13.6055 7.32236L17.9852 8.58328C18.4468 8.71715 18.7646 9.13951 18.7661 9.62034V17.7736C19.0861 17.8152 19.3193 18.0975 19.3008 18.4198C19.2815 18.7422 19.017 18.9954 18.6947 19ZM13.4586 17.7691H17.5352V9.73416L13.4586 8.56094V17.7691ZM10.102 17.7691H12.2269V3.10487C12.2269 2.83023 12.0976 2.57173 11.8784 2.40631C11.6591 2.24168 11.3752 2.18936 11.1114 2.26476L3.44811 4.47117C3.07499 4.58042 2.81803 4.92278 2.81649 5.31128V17.7691H4.94216L4.94293 13.0508C4.94293 12.8877 5.00755 12.7315 5.12295 12.6161C5.23835 12.5007 5.39452 12.4353 5.55839 12.4353H9.48574C9.64884 12.4353 9.80578 12.5007 9.92117 12.6161C10.0366 12.7315 10.1012 12.8877 10.1012 13.0508L10.102 17.7691ZM6.17466 17.7691H8.87109L8.87032 13.6662H6.17389L6.17466 17.7691ZM9.92437 10.4036H8.8173C8.47802 10.4036 8.20184 10.1282 8.20184 9.78812C8.20184 9.44807 8.47802 9.17266 8.8173 9.17266H9.92437C10.2613 9.17728 10.5314 9.45193 10.5314 9.78812C10.5314 10.1243 10.2613 10.399 9.92437 10.4036ZM6.22626 10.4036H5.1192C4.78224 10.399 4.5122 10.1243 4.5122 9.78812C4.5122 9.45193 4.78224 9.17727 5.1192 9.17266H6.22626C6.56322 9.17728 6.83326 9.45193 6.83326 9.78812C6.83326 10.1243 6.56322 10.399 6.22626 10.4036ZM9.92437 7.67408H8.8173C8.47802 7.67408 8.20184 7.3979 8.20184 7.05861C8.20184 6.71856 8.47802 6.44315 8.8173 6.44315H9.92437C10.2613 6.44777 10.5314 6.72165 10.5314 7.05861C10.5314 7.39481 10.2613 7.6687 9.92437 7.67408ZM6.22626 7.67408H5.1192C4.78224 7.66869 4.5122 7.39481 4.5122 7.05861C4.5122 6.72165 4.78224 6.44776 5.1192 6.44315H6.22626C6.56322 6.44777 6.83326 6.72165 6.83326 7.05861C6.83326 7.39481 6.56322 7.6687 6.22626 7.67408Z" fill="#231F20" stroke="#231F20" stroke-width="0.3" />
    </svg>
)


export const AnnouncementHorn = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.02734 24.376H10.0273V36.876C10.0273 37.5659 9.46724 38.126 8.77734 38.126H6.27734C5.58745 38.126 5.02734 37.5659 5.02734 36.876V24.376Z" fill="#4AA5FF" />
        <path d="M8.77734 38.751H6.27734C5.24341 38.751 4.40234 37.9099 4.40234 36.876V24.376C4.40234 24.0305 4.68219 23.751 5.02734 23.751H10.0273C10.3725 23.751 10.6523 24.0305 10.6523 24.376V36.876C10.6523 37.9099 9.81128 38.751 8.77734 38.751ZM5.65234 25.001V36.876C5.65234 37.2208 5.9328 37.501 6.27734 37.501H8.77734C9.12189 37.501 9.40234 37.2208 9.40234 36.876V25.001H5.65234Z" fill="#21257C" />
        <path d="M10.0273 26.251H12.5273V31.251C12.5273 31.9409 11.9672 32.501 11.2773 32.501H10.0273V26.251Z" fill="#E6F3FF" />
        <path d="M11.2773 33.126H10.0273C9.68219 33.126 9.40234 32.8464 9.40234 32.501V26.251C9.40234 25.9055 9.68219 25.626 10.0273 25.626H12.5273C12.8725 25.626 13.1523 25.9055 13.1523 26.251V31.251C13.1523 32.2849 12.3113 33.126 11.2773 33.126ZM10.6523 31.876H11.2773C11.6219 31.876 11.9023 31.5958 11.9023 31.251V26.876H10.6523V31.876Z" fill="#21257C" />
        <path d="M21.9023 31.251L6.90234 25.626V16.876L21.9023 11.251V31.251Z" fill="#E6F3FF" />
        <path d="M21.9023 31.8764C21.8285 31.8764 21.754 31.8636 21.6829 31.8367L6.68292 26.2117C6.43909 26.1201 6.27734 25.887 6.27734 25.6264V16.8764C6.27734 16.6158 6.43909 16.3826 6.68292 16.291L21.6829 10.666C21.8743 10.5934 22.09 10.6209 22.2585 10.7375C22.4269 10.8546 22.5273 11.0463 22.5273 11.2514V31.2514C22.5345 31.5868 22.2366 31.884 21.9023 31.8764ZM7.52734 25.193L21.2773 30.3493V12.1535L7.52734 17.3097V25.193Z" fill="#21257C" />
        <path d="M25.0273 9.37598H23.7773C22.7418 9.37598 21.9023 10.2154 21.9023 11.251V31.251C21.9023 32.2865 22.7418 33.126 23.7773 33.126H25.0273C26.0629 33.126 26.9023 32.2865 26.9023 31.251V11.251C26.9023 10.2154 26.0629 9.37598 25.0273 9.37598Z" fill="#E6F3FF" />
        <path d="M25.0273 33.751H23.7773C22.3989 33.751 21.2773 32.6298 21.2773 31.251V11.251C21.2773 9.8722 22.3989 8.75098 23.7773 8.75098H25.0273C26.4058 8.75098 27.5273 9.8722 27.5273 11.251V31.251C27.5273 32.6298 26.4058 33.751 25.0273 33.751ZM23.7773 10.001C23.0879 10.001 22.5273 10.5619 22.5273 11.251V31.251C22.5273 31.9401 23.0879 32.501 23.7773 32.501H25.0273C25.7167 32.501 26.2773 31.9401 26.2773 31.251V11.251C26.2773 10.5619 25.7167 10.001 25.0273 10.001H23.7773Z" fill="#21257C" />
        <path d="M5.02734 17.501H6.90234V25.001H5.02734C3.30261 25.001 1.90234 23.6007 1.90234 21.876V20.626C1.90234 18.9012 3.30261 17.501 5.02734 17.501Z" fill="#4AA5FF" />
        <path d="M6.90234 25.626H5.02734C2.95948 25.626 1.27734 23.9438 1.27734 21.876V20.626C1.27734 18.5581 2.95948 16.876 5.02734 16.876H6.90234C7.2475 16.876 7.52734 17.1555 7.52734 17.501V25.001C7.52734 25.3464 7.2475 25.626 6.90234 25.626ZM5.02734 18.126C3.64886 18.126 2.52734 19.2472 2.52734 20.626V21.876C2.52734 23.2548 3.64886 24.376 5.02734 24.376H6.27734V18.126H5.02734Z" fill="#21257C" />
        <path d="M28.1523 1.87549C21.0221 1.75138 16.0067 9.54618 19.0335 15.9657L17.5273 20.0005L21.0521 18.9144C27.2106 25.2032 38.1775 20.7871 38.1523 11.8753C38.1523 6.35265 33.6752 1.87549 28.1523 1.87549Z" fill="#4AA5FF" />
        <path d="M28.1518 22.5009C25.4257 22.5009 22.8589 21.481 20.8813 19.6213L17.7109 20.5985C17.2354 20.7605 16.7498 20.2481 16.9412 19.7824C16.9412 19.7824 18.3591 15.9836 18.3591 15.9836C15.3505 9.19972 20.7206 1.10182 28.152 1.25106C42.2467 1.83394 42.2439 21.9194 28.1518 22.5009ZM21.0516 18.2901C21.2158 18.2901 21.3763 18.3548 21.4954 18.475C23.2703 20.2652 25.6341 21.2509 28.1518 21.2509C33.3212 21.2509 37.5268 17.0456 37.5268 11.8759C37.5268 6.70625 33.3212 2.50092 28.1518 2.50092C21.5037 2.36269 16.7562 9.70794 19.6031 15.7097C19.6704 15.8597 19.6759 16.0306 19.6185 16.1844L18.5565 19.0299C18.5736 19.0344 21.1328 18.2087 21.0516 18.2901Z" fill="#21257C" />
        <path d="M27.0859 17.501C27.1277 15.8524 29.5444 15.8527 29.5859 17.501C29.5442 19.1495 27.1275 19.1492 27.0859 17.501Z" fill="#E6F3FF" />
        <path d="M28.3385 19.376C25.8661 19.3112 25.8666 15.6904 28.3386 15.626C30.8109 15.6908 30.8104 19.3115 28.3385 19.376ZM28.3385 16.876C27.5172 16.8905 27.5173 18.1116 28.3385 18.126C29.1598 18.1115 29.1597 16.8904 28.3385 16.876Z" fill="#E6F3FF" />
        <path d="M26.6643 12.5324L25.6921 6.69906C25.5439 5.81016 26.2294 5.00098 27.1306 5.00098H29.1269C29.9961 5.00098 30.6723 5.75649 30.5764 6.62036L29.9282 12.4537C29.7776 14.1622 26.91 14.223 26.6643 12.5324Z" fill="#E6F3FF" />
        <path d="M28.4795 14.3755C27.3389 14.4975 26.2297 13.8066 26.0485 12.6342C26.0484 12.6342 25.0765 6.80107 25.0765 6.80107C24.841 5.57383 25.8815 4.34506 27.1312 4.37556C27.1312 4.37553 29.1277 4.37553 29.1277 4.37553C30.3332 4.34852 31.3584 5.49363 31.1979 6.68879C31.198 6.68877 30.5501 12.5225 30.5501 12.5225C30.4329 13.579 29.5427 14.3755 28.4795 14.3755ZM27.1312 5.62553C26.6317 5.61356 26.2153 6.10477 26.3094 6.59539C26.3094 6.59538 27.2813 12.4291 27.2813 12.4291C27.3485 12.8326 27.6942 13.1255 28.1035 13.1255H28.4795C28.9049 13.1255 29.261 12.8069 29.308 12.3846L29.9559 6.55082C30.0211 6.07234 29.6104 5.61376 29.1276 5.62554C29.1277 5.62553 27.1312 5.62553 27.1312 5.62553Z" fill="#E6F3FF" />
    </svg>
)
export const ModalCloseIcon = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
        >
            <path
                d="M24 8L8 24"
                stroke="#676767"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 8L24 24"
                stroke="#676767"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export const ExtensionGreenArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
        <rect width="18.6066" height="16.6066" rx="6" fill="#DEEEE8" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.83674 5.27932C8.79436 5.36623 8.77684 5.45925 8.7864 5.54659C8.79596 5.63393 8.83218 5.71168 8.89045 5.76998L9.77418 6.6537L5.88544 10.5424C5.69792 10.73 5.58015 10.9719 5.55804 11.215C5.53593 11.458 5.61129 11.6824 5.76754 11.8386C5.92379 11.9949 6.14814 12.0702 6.39122 12.0481C6.6343 12.026 6.87621 11.9083 7.06373 11.7207L10.9525 7.832L11.8362 8.71572C11.8944 8.77418 11.9721 8.81057 12.0595 8.82027C12.1469 8.82997 12.24 8.81255 12.327 8.77022C12.414 8.72788 12.491 8.66253 12.5483 8.58246C12.6055 8.5024 12.6404 8.41121 12.6486 8.32046L12.9433 5.07998C12.9489 5.0197 12.9425 4.96107 12.9245 4.90746C12.9065 4.85385 12.8774 4.80631 12.8386 4.76756C12.7999 4.72882 12.7523 4.69962 12.6987 4.68166C12.6451 4.66369 12.5865 4.65731 12.5262 4.66287L9.28571 4.95761C9.19506 4.96591 9.10402 5.00091 9.02411 5.05818C8.94419 5.11544 8.87899 5.1924 8.83674 5.27932Z" fill="#32936F" />
    </svg>
);

export const GreenCheckMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
        <g clip-path="url(#clip0_6526_125898)">
            <path d="M15 30C23.2843 30 30 23.2843 30 15C30 6.71573 23.2843 0 15 0C6.71573 0 0 6.71573 0 15C0 23.2843 6.71573 30 15 30Z" fill="#32BA7C" />
            <path d="M11.1665 21.7663L18.8794 29.4792C25.2675 27.7757 29.9993 21.9555 29.9993 14.9997C29.9993 14.8577 29.9993 14.7158 29.9993 14.5738L23.9425 8.99023L11.1665 21.7663Z" fill="#0AA06E" />
            <path d="M15.3782 18.3593C16.0406 19.0218 16.0406 20.1574 15.3782 20.8199L14.0059 22.1921C13.3435 22.8546 12.2078 22.8546 11.5454 22.1921L5.53591 16.1353C4.87345 15.4729 4.87345 14.3372 5.53591 13.6747L6.90815 12.3025C7.57061 11.64 8.70625 11.64 9.36872 12.3025L15.3782 18.3593Z" fill="white" />
            <path d="M20.6307 7.90212C21.2931 7.23966 22.4288 7.23966 23.0912 7.90212L24.4635 9.27436C25.1259 9.93682 25.1259 11.0725 24.4635 11.7349L14.0534 22.0977C13.3909 22.7602 12.2553 22.7602 11.5928 22.0977L10.2206 20.7255C9.55811 20.063 9.55811 18.9274 10.2206 18.2649L20.6307 7.90212Z" fill="white" />
        </g>
        <defs>
            <clipPath id="clip0_6526_125898">
                <rect width="30" height="30" fill="white" />
            </clipPath>
        </defs>
    </svg>
);

export const BluePluseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M11.6667 1H2.33333C1.59695 1 1 1.59695 1 2.33333V11.6667C1 12.403 1.59695 13 2.33333 13H11.6667C12.403 13 13 12.403 13 11.6667V2.33333C13 1.59695 12.403 1 11.6667 1Z" stroke="#384AD7" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M7 4.33301V9.66634" stroke="#384AD7" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4.3335 7H9.66683" stroke="#384AD7" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
);

export const BlueMinusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M11.6667 1H2.33333C1.59695 1 1 1.59695 1 2.33333V11.6667C1 12.403 1.59695 13 2.33333 13H11.6667C12.403 13 13 12.403 13 11.6667V2.33333C13 1.59695 12.403 1 11.6667 1Z" stroke="#384AD7" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M4.3335 7H9.66683" stroke="#384AD7" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
);
export const ModalFooterBagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none">
        <path d="M13.677 2.86262H11.2915C11.2493 2.86262 11.2088 2.84587 11.179 2.81604C11.1492 2.78622 11.1324 2.74577 11.1324 2.70359V2.54455C11.1324 1.8697 10.8643 1.22248 10.3871 0.745282C9.90994 0.268086 9.26272 0 8.58786 0H6.67945C6.00459 0 5.35738 0.268086 4.88018 0.745282C4.40298 1.22248 4.1349 1.8697 4.1349 2.54455V2.70359C4.1349 2.74577 4.11814 2.78622 4.08832 2.81604C4.05849 2.84587 4.01804 2.86262 3.97586 2.86262H1.59035C1.16856 2.86262 0.764049 3.03018 0.465801 3.32842C0.167554 3.62667 0 4.03118 0 4.45297L0 7.31559C0 7.56866 0.100532 7.81137 0.279481 7.99031C0.458429 8.16926 0.701136 8.2698 0.954207 8.2698H6.17054C6.19606 8.26938 6.2212 8.26349 6.24425 8.25252C6.2673 8.24154 6.28772 8.22574 6.30413 8.20618C6.44566 7.98147 6.64184 7.79629 6.87435 7.66796C7.10685 7.53962 7.36809 7.47231 7.63366 7.47231C7.89923 7.47231 8.16047 7.53962 8.39297 7.66796C8.62547 7.79629 8.82165 7.98147 8.96319 8.20618C8.97959 8.22574 9.00001 8.24154 9.02306 8.25252C9.04611 8.26349 9.07125 8.26938 9.09678 8.2698H14.3131C14.5662 8.2698 14.8089 8.16926 14.9878 7.99031C15.1668 7.81137 15.2673 7.56866 15.2673 7.31559V4.45297C15.2673 4.24412 15.2262 4.03732 15.1463 3.84437C15.0663 3.65142 14.9492 3.4761 14.8015 3.32842C14.6538 3.18075 14.4785 3.0636 14.2856 2.98368C14.0926 2.90376 13.8858 2.86262 13.677 2.86262ZM6.67945 1.27228H8.58786C8.89564 1.26903 9.19415 1.37746 9.42809 1.57747C9.66203 1.77749 9.81553 2.05553 9.86014 2.36007C9.86427 2.38279 9.86296 2.40615 9.85633 2.42827C9.84969 2.45038 9.83792 2.47061 9.82197 2.4873C9.80719 2.50505 9.78872 2.51936 9.76785 2.52925C9.74698 2.53914 9.7242 2.54436 9.70111 2.54455H5.57893C5.55584 2.54436 5.53306 2.53914 5.51219 2.52925C5.49131 2.51936 5.47285 2.50505 5.45806 2.4873C5.44212 2.47061 5.43034 2.45038 5.42371 2.42827C5.41708 2.40615 5.41577 2.38279 5.4199 2.36007C5.46421 2.05771 5.61587 1.7814 5.84714 1.58166C6.07842 1.38193 6.37386 1.2721 6.67945 1.27228Z" fill="#6B6B6B" />
        <path d="M7.63362 11.6092C7.38269 11.5891 7.1382 11.5196 6.91423 11.4047C6.69026 11.2898 6.49125 11.1317 6.32864 10.9395C6.16604 10.7473 6.04306 10.5249 5.96679 10.285C5.89052 10.0451 5.86246 9.79249 5.88424 9.5417C5.88092 9.49299 5.88092 9.4441 5.88424 9.39539C5.88528 9.37329 5.88187 9.35121 5.87423 9.33044C5.86658 9.30968 5.85484 9.29067 5.83971 9.27452C5.82507 9.25873 5.80737 9.24607 5.78768 9.23733C5.768 9.22858 5.74674 9.22392 5.72521 9.22363H1.27224C1.19542 9.22419 1.12129 9.25199 1.06304 9.30208C1.0048 9.35217 0.966219 9.4213 0.954171 9.49717C0.916002 9.76435 0.871473 10.0443 0.826943 10.3178C0.604295 11.5901 0.400731 12.8051 0.985978 13.4985C1.14676 13.672 1.34477 13.8067 1.56514 13.8927C1.7855 13.9786 2.02248 14.0135 2.25825 13.9947H13.0153C13.2511 14.0135 13.4881 13.9786 13.7085 13.8927C13.9288 13.8067 14.1268 13.672 14.2876 13.4985C14.8729 12.8051 14.6693 11.5901 14.4467 10.3178C14.4021 10.0443 14.3576 9.76435 14.3194 9.49717C14.3074 9.4213 14.2688 9.35217 14.2106 9.30208C14.1523 9.25199 14.0782 9.22419 14.0014 9.22363H9.54204C9.5205 9.22392 9.49924 9.22858 9.47956 9.23733C9.45988 9.24607 9.44217 9.25873 9.42753 9.27452C9.4124 9.29067 9.40067 9.30968 9.39302 9.33044C9.38537 9.35121 9.38196 9.37329 9.383 9.39539C9.38632 9.4441 9.38632 9.49299 9.383 9.5417C9.40478 9.79249 9.37672 10.0451 9.30045 10.285C9.22418 10.5249 9.1012 10.7473 8.9386 10.9395C8.77599 11.1317 8.57698 11.2898 8.35301 11.4047C8.12904 11.5196 7.88455 11.5891 7.63362 11.6092Z" fill="#6B6B6B" />
        <path d="M6.83838 9.54195C6.83838 9.8372 6.92216 10.1204 7.07128 10.3291C7.2204 10.5379 7.42266 10.6552 7.63355 10.6552C7.84444 10.6552 8.0467 10.5379 8.19582 10.3291C8.34495 10.1204 8.42872 9.8372 8.42872 9.54195C8.42872 9.2467 8.34495 8.96354 8.19582 8.75477C8.0467 8.546 7.84444 8.42871 7.63355 8.42871C7.42266 8.42871 7.2204 8.546 7.07128 8.75477C6.92216 8.96354 6.83838 9.2467 6.83838 9.54195Z" fill="#6B6B6B" />
    </svg>
);

export const GrayWhiteCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#232323" fill-opacity="0.15" />
        <circle cx="10" cy="10" r="4" fill="white" />
    </svg>
);

export const IconLastUpdated = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.584473 2.33447V5.83447H4.08447" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M2.04864 8.74944C2.42687 9.82299 3.14375 10.7445 4.09127 11.3752C5.03879 12.0059 6.16562 12.3116 7.30197 12.2462C8.43833 12.1808 9.52264 11.7479 10.3915 11.0126C11.2605 10.2774 11.8669 9.27968 12.1194 8.16982C12.372 7.05996 12.257 5.89808 11.7918 4.85925C11.3266 3.82042 10.5364 2.9609 9.54029 2.41022C8.54414 1.85954 7.396 1.64751 6.26887 1.80609C5.14174 1.96467 4.09667 2.48527 3.29114 3.28944L0.584473 5.83277" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M7 5.34229V8.01426L8.78132 8.90492" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const HeartIcs = () => {
    return (
        <svg width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.3144 2.4827C22.1646 1.53333 20.6896 1.01046 19.1605 1.01046C17.3924 1.01046 15.6816 1.71365 14.4677 2.94029C14.1845 3.22518 13.9256 3.53919 13.6853 3.88711C12.4446 2.08758 10.4401 1 8.28022 1C7.88453 1 7.48319 1.03646 7.08722 1.10825C5.0432 1.48048 3.43671 2.6048 2.31239 4.44899C0.702783 7.09276 0.575315 9.53415 1.9215 11.9128C2.64363 13.1869 3.58311 14.4333 4.79533 15.7227C7.0256 18.0937 9.66513 20.3432 13.1048 22.8041C13.2879 22.9344 13.483 23 13.6833 23C13.9942 23 14.2045 22.8426 14.3244 22.7521C17.3813 20.571 19.8897 18.4696 21.9942 16.3256C23.1779 15.1193 24.5187 13.6372 25.4989 11.7941C25.9101 11.018 26.3799 9.97619 26.3524 8.7993C26.2908 6.22337 25.2691 4.09796 23.3144 2.4827ZM24.244 11.1285C23.3497 12.811 22.0923 14.1976 20.981 15.331C18.9771 17.3725 16.588 19.38 13.6788 21.4678C10.4407 19.1344 7.94049 16.9949 5.82978 14.7502C4.69585 13.5439 3.8225 12.3871 3.15746 11.2127C2.07328 9.29646 2.18972 7.38189 3.52574 5.18836C4.42989 3.70453 5.71446 2.80208 7.34074 2.50559C7.6522 2.44879 7.96847 2.42052 8.28022 2.42052C10.2182 2.42052 11.9341 3.48916 12.8654 5.27174C12.9185 5.37547 12.9708 5.47439 13.057 5.63492C13.1803 5.86725 13.4213 6.01139 13.6831 6.01139C13.687 6.01139 13.6913 6.01139 13.6952 6.01139C13.9612 6.00687 14.2025 5.85397 14.3201 5.61514C14.6596 4.92664 15.0267 4.39472 15.4767 3.93968C16.4266 2.98014 17.7691 2.43098 19.1608 2.43098C20.3609 2.43098 21.5146 2.83826 22.4094 3.57819C24.0334 4.91845 24.8819 6.68717 24.9333 8.83294C24.9523 9.67575 24.595 10.466 24.244 11.1285Z" fill="#B60707" stroke="#B60707" stroke-width="0.4" />
        </svg>
    )
}

export const RecommandIcs = () => {
    return (
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4375 0C11.5889 0 9.97312 1.26292 9.5261 3.05668C9.49134 3.19647 9.39494 3.30859 9.26365 3.36288C9.13126 3.4176 8.98758 3.40695 8.86385 3.33224C7.27937 2.37986 5.24311 2.62866 3.93589 3.93588C2.62868 5.24309 2.379 7.27849 3.33138 8.86297C3.40605 8.98668 3.41763 9.13126 3.36287 9.26365C3.3086 9.39495 3.19648 9.49134 3.05668 9.5261C1.26291 9.97311 0 11.5889 0 13.4375C0 15.2861 1.26291 16.9019 3.05668 17.3489C3.19648 17.3837 3.3086 17.4801 3.36287 17.6114C3.41759 17.7437 3.40605 17.8874 3.33138 18.0112C2.379 19.5956 2.62868 21.6319 3.93589 22.9391C5.24311 24.2463 7.27937 24.496 8.86385 23.5436C8.98757 23.469 9.13127 23.4584 9.26365 23.513C9.39495 23.5673 9.49134 23.6785 9.5261 23.8183C9.97311 25.6121 11.5889 26.875 13.4375 26.875C15.2861 26.875 16.9019 25.6121 17.3489 23.8183C17.3837 23.6785 17.48 23.5673 17.6113 23.513C17.7437 23.4583 17.8883 23.4689 18.012 23.5436C19.5965 24.496 21.6319 24.2463 22.9391 22.9391C24.2463 21.6319 24.496 19.5956 23.5436 18.0112C23.469 17.8874 23.4574 17.7437 23.5121 17.6114C23.5664 17.4801 23.6785 17.3837 23.8183 17.3489C25.6121 16.9019 26.875 15.2861 26.875 13.4375C26.875 11.5889 25.6121 9.97311 23.8183 9.5261C23.6785 9.49134 23.5664 9.39495 23.5121 9.26365C23.4574 9.13126 23.469 8.98668 23.5436 8.86297C24.496 7.27849 24.2463 5.24309 22.9391 3.93588C21.6319 2.62866 19.5956 2.37986 18.0111 3.33224C17.8874 3.40695 17.7437 3.41748 17.6113 3.36288C17.48 3.30861 17.3836 3.19647 17.3489 3.05668C16.9019 1.26292 15.2861 -4.47916e-06 13.4375 0Z" fill="#E2E3F6" />
            <path d="M19.103 9.22076C18.7167 8.86243 18.2371 8.6458 17.7171 8.5949C17.3854 8.56189 17.0484 8.53369 16.7107 8.50893C16.7114 8.46904 16.712 8.42915 16.712 8.38926C16.712 7.97868 16.6735 7.56739 16.5972 7.16712C16.5432 6.88239 16.4034 6.62861 16.1926 6.43329C15.9819 6.23796 15.7212 6.12105 15.4368 6.09216C14.8121 6.03095 14.1765 6 13.5463 6C12.9161 6 12.2805 6.03095 11.6557 6.09216C11.372 6.11967 11.1106 6.23796 10.9006 6.43329C10.6898 6.62861 10.5494 6.88239 10.496 7.16644C10.4203 7.56739 10.3812 7.97868 10.3812 8.38926C10.3812 8.42915 10.3818 8.46904 10.3825 8.50893C10.0448 8.53369 9.70778 8.56257 9.37614 8.5949C8.85607 8.64579 8.37652 8.86174 7.9895 9.22007C7.60181 9.5784 7.34514 10.044 7.24653 10.5667C7.08308 11.4291 7 12.3136 7 13.1953C7 14.0763 7.08308 14.9607 7.24653 15.824C7.44645 16.8817 8.32182 17.6933 9.37538 17.7964C10.7586 17.9312 12.1615 18 13.5454 18C14.93 18 16.3329 17.9312 17.7154 17.7964C18.2355 17.7455 18.7151 17.5296 19.1021 17.1713C19.4884 16.8136 19.7451 16.3473 19.8444 15.8246C20.0078 14.9615 20.0909 14.0778 20.0909 13.196C20.0909 12.3143 20.0078 11.4299 19.8444 10.5674C19.7458 10.044 19.4891 9.57836 19.1028 9.22074L19.103 9.22076ZM11.3235 7.32876C11.3424 7.22766 11.3924 7.13757 11.4674 7.0681C11.5417 6.99932 11.6349 6.95668 11.7355 6.94705C12.334 6.8886 12.9419 6.85902 13.545 6.85902C14.1482 6.85902 14.7567 6.8886 15.3545 6.94705C15.4558 6.95668 15.5484 6.99864 15.6233 7.0681C15.6983 7.13756 15.7476 7.22766 15.7672 7.32945C15.8334 7.67677 15.8665 8.03371 15.8665 8.38927V8.4553C15.8017 8.45186 15.7368 8.44842 15.672 8.44567C15.6463 8.44429 15.6206 8.44292 15.595 8.44154C15.4883 8.43604 15.3802 8.43191 15.2735 8.42779C15.2519 8.42641 15.2302 8.42641 15.2093 8.42504C15.1242 8.4216 15.0384 8.41816 14.9526 8.41541C14.9162 8.41403 14.8797 8.41266 14.8432 8.41197C14.7723 8.4099 14.7014 8.40784 14.6311 8.40647C14.5906 8.40509 14.5508 8.4044 14.5109 8.40371C14.4427 8.40234 14.3738 8.40096 14.3056 8.39959C14.2664 8.3989 14.2259 8.39821 14.1867 8.39753C14.1138 8.39615 14.0408 8.39546 13.9679 8.39477C13.9341 8.39477 13.8997 8.39409 13.8652 8.3934C13.7585 8.39271 13.6531 8.39202 13.5464 8.39202C13.4404 8.39202 13.3343 8.39202 13.2276 8.3934C13.1938 8.3934 13.1594 8.39409 13.1249 8.39477C13.052 8.39546 12.9797 8.39615 12.9061 8.39753C12.8669 8.39821 12.8264 8.3989 12.7872 8.39959C12.719 8.40096 12.6501 8.40234 12.5819 8.40371C12.5414 8.40509 12.5015 8.40509 12.4617 8.40647C12.3914 8.40784 12.3198 8.41059 12.2496 8.41197C12.2124 8.41334 12.176 8.41403 12.1388 8.41541C12.0537 8.41816 11.9686 8.42091 11.8835 8.42504C11.8619 8.42572 11.8403 8.42641 11.8186 8.42779C11.7113 8.43191 11.6039 8.43673 11.4971 8.44154C11.4715 8.44292 11.4458 8.44429 11.4201 8.44567C11.3553 8.44842 11.2905 8.45255 11.2256 8.4553V8.38927C11.2249 8.03302 11.258 7.67676 11.3235 7.32876ZM19.0166 15.6616C18.9524 16.0006 18.7856 16.3025 18.5357 16.535C18.2844 16.7675 17.9737 16.9078 17.636 16.9408C16.2798 17.0728 14.9032 17.1402 13.5457 17.1402C12.1882 17.1402 10.8122 17.0728 9.45608 16.9408C8.77255 16.8734 8.20519 16.3479 8.07551 15.6616C7.92219 14.8521 7.84452 14.0226 7.84452 13.1959C7.84452 12.3693 7.92219 11.5391 8.07551 10.7296C8.13967 10.3906 8.30649 10.0887 8.55709 9.85619C8.80767 9.62373 9.11904 9.48343 9.45675 9.45042C9.91468 9.40502 10.3841 9.36788 10.8522 9.33762C11.7451 9.27985 12.6521 9.25097 13.5471 9.25097C13.6592 9.25097 13.7714 9.25097 13.8828 9.25234C14.0003 9.25372 14.1179 9.25509 14.2347 9.25647C14.6791 9.26335 15.1249 9.27848 15.5694 9.2998C15.622 9.30255 15.6747 9.3053 15.7267 9.30805C15.7862 9.3108 15.8463 9.31355 15.9057 9.31768C16.0178 9.32387 16.13 9.33075 16.2407 9.33831C16.7081 9.36789 17.1769 9.40571 17.6362 9.4511C17.9739 9.48412 18.2846 9.62442 18.5351 9.85688C18.7857 10.0893 18.9526 10.3906 19.016 10.7303C19.1694 11.5391 19.247 12.3692 19.247 13.1959C19.2477 14.0226 19.1692 14.852 19.0166 15.6616Z" fill="#231F20" />
        </svg>
    )
}

export const CareerIcs = () => {
    return (
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4375 0C11.5889 0 9.97312 1.26292 9.5261 3.05668C9.49134 3.19647 9.39494 3.30859 9.26365 3.36288C9.13126 3.4176 8.98758 3.40695 8.86385 3.33224C7.27937 2.37986 5.24311 2.62866 3.93589 3.93588C2.62868 5.24309 2.379 7.27849 3.33138 8.86297C3.40605 8.98668 3.41763 9.13126 3.36287 9.26365C3.3086 9.39495 3.19648 9.49134 3.05668 9.5261C1.26291 9.97311 0 11.5889 0 13.4375C0 15.2861 1.26291 16.9019 3.05668 17.3489C3.19648 17.3837 3.3086 17.4801 3.36287 17.6114C3.41759 17.7437 3.40605 17.8874 3.33138 18.0112C2.379 19.5956 2.62868 21.6319 3.93589 22.9391C5.24311 24.2463 7.27937 24.496 8.86385 23.5436C8.98757 23.469 9.13127 23.4584 9.26365 23.513C9.39495 23.5673 9.49134 23.6785 9.5261 23.8183C9.97311 25.6121 11.5889 26.875 13.4375 26.875C15.2861 26.875 16.9019 25.6121 17.3489 23.8183C17.3837 23.6785 17.48 23.5673 17.6113 23.513C17.7437 23.4583 17.8883 23.4689 18.012 23.5436C19.5965 24.496 21.6319 24.2463 22.9391 22.9391C24.2463 21.6319 24.496 19.5956 23.5436 18.0112C23.469 17.8874 23.4574 17.7437 23.5121 17.6114C23.5664 17.4801 23.6785 17.3837 23.8183 17.3489C25.6121 16.9019 26.875 15.2861 26.875 13.4375C26.875 11.5889 25.6121 9.97311 23.8183 9.5261C23.6785 9.49134 23.5664 9.39495 23.5121 9.26365C23.4574 9.13126 23.469 8.98668 23.5436 8.86297C24.496 7.27849 24.2463 5.24309 22.9391 3.93588C21.6319 2.62866 19.5956 2.37986 18.0111 3.33224C17.8874 3.40695 17.7437 3.41748 17.6113 3.36288C17.48 3.30861 17.3836 3.19647 17.3489 3.05668C16.9019 1.26292 15.2861 -4.47916e-06 13.4375 0Z" fill="#D0F3DE" />
            <path d="M19.1429 15.3569H17.3257V13.4284C17.3257 13.2013 17.2352 12.9833 17.0745 12.8225C16.9138 12.6618 16.6957 12.5713 16.4686 12.5713H14.6514V10.6428C14.6514 10.4157 14.5609 10.1976 14.4002 10.0369C14.2395 9.87617 14.0214 9.78565 13.7943 9.78565H11.9771V7.85714C11.9771 7.63001 11.8866 7.41196 11.7259 7.25125C11.5652 7.09053 11.3471 7 11.12 7H8.85714C8.38357 7 8 7.38357 8 7.85714V18.1429C8 18.37 8.09054 18.588 8.25125 18.7488C8.41196 18.9095 8.62999 19 8.85714 19H19.1429C19.37 19 19.588 18.9095 19.7488 18.7488C19.9095 18.588 20 18.37 20 18.1429V16.2144C20 15.9872 19.9095 15.7692 19.7488 15.6085C19.588 15.4477 19.37 15.3572 19.1429 15.3572V15.3569ZM19.1429 18.1426H8.85714V7.85687H11.12V9.78537C11.12 10.0125 11.2105 10.2306 11.3712 10.3913C11.532 10.552 11.75 10.6425 11.9771 10.6425H13.7943V12.571C13.7943 12.7982 13.8848 13.0162 14.0455 13.1769C14.2062 13.3376 14.4243 13.4282 14.6514 13.4282H16.4686V15.3567C16.4686 15.5838 16.5591 15.8018 16.7198 15.9626C16.8805 16.1233 17.0986 16.2138 17.3257 16.2138H19.1429V18.1426Z" fill="#231F20" />
        </svg>

    )
}

export const ProductIcs = () => {
    return (
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4375 0C11.5889 0 9.97312 1.26292 9.5261 3.05668C9.49134 3.19647 9.39494 3.30859 9.26365 3.36288C9.13126 3.4176 8.98758 3.40695 8.86385 3.33224C7.27937 2.37986 5.24311 2.62866 3.93589 3.93588C2.62868 5.24309 2.379 7.27849 3.33138 8.86297C3.40605 8.98668 3.41763 9.13126 3.36287 9.26365C3.3086 9.39495 3.19648 9.49134 3.05668 9.5261C1.26291 9.97311 0 11.5889 0 13.4375C0 15.2861 1.26291 16.9019 3.05668 17.3489C3.19648 17.3837 3.3086 17.4801 3.36287 17.6114C3.41759 17.7437 3.40605 17.8874 3.33138 18.0112C2.379 19.5956 2.62868 21.6319 3.93589 22.9391C5.24311 24.2463 7.27937 24.496 8.86385 23.5436C8.98757 23.469 9.13127 23.4584 9.26365 23.513C9.39495 23.5673 9.49134 23.6785 9.5261 23.8183C9.97311 25.6121 11.5889 26.875 13.4375 26.875C15.2861 26.875 16.9019 25.6121 17.3489 23.8183C17.3837 23.6785 17.48 23.5673 17.6113 23.513C17.7437 23.4583 17.8883 23.4689 18.012 23.5436C19.5965 24.496 21.6319 24.2463 22.9391 22.9391C24.2463 21.6319 24.496 19.5956 23.5436 18.0112C23.469 17.8874 23.4574 17.7437 23.5121 17.6114C23.5664 17.4801 23.6785 17.3837 23.8183 17.3489C25.6121 16.9019 26.875 15.2861 26.875 13.4375C26.875 11.5889 25.6121 9.97311 23.8183 9.5261C23.6785 9.49134 23.5664 9.39495 23.5121 9.26365C23.4574 9.13126 23.469 8.98668 23.5436 8.86297C24.496 7.27849 24.2463 5.24309 22.9391 3.93588C21.6319 2.62866 19.5956 2.37986 18.0111 3.33224C17.8874 3.40695 17.7437 3.41748 17.6113 3.36288C17.48 3.30861 17.3836 3.19647 17.3489 3.05668C16.9019 1.26292 15.2861 -4.47916e-06 13.4375 0Z" fill="#F7E0EF" />
            <path d="M13.5004 8.24482C11.224 8.24482 9.37207 10.0967 9.37207 12.3732C9.37207 13.0564 9.56992 13.6394 9.57784 13.6658C9.75459 14.1749 9.98673 14.4756 10.2294 14.7948C10.4062 15.027 10.5908 15.2644 10.7728 15.6126C10.9944 16.0347 11.1527 16.5069 11.2424 17.0134V17.9841C11.2424 18.4009 11.5774 18.7386 11.9916 18.7465V19.2371C11.9916 19.7938 12.4427 20.2449 12.9993 20.2449H14.007C14.5609 20.2449 15.0147 19.7938 15.0147 19.2371V18.7465C15.4288 18.7386 15.7639 18.4009 15.7639 17.9841V17.0134C15.8536 16.5069 16.0118 16.0347 16.2334 15.6126C16.4154 15.2644 16.6001 15.027 16.7768 14.7948C17.0222 14.4756 17.2517 14.1749 17.4311 13.6632C17.439 13.6394 17.6368 13.0538 17.6368 12.3706C17.6368 10.0941 15.7849 8.24219 13.5084 8.24219L13.5004 8.24482ZM14.4844 19.2371C14.4844 19.5009 14.2681 19.7172 14.0043 19.7172H12.9966C12.7328 19.7172 12.5165 19.5009 12.5165 19.2371V18.7491H14.4818V19.2371H14.4844ZM15.2309 17.9867C15.2309 18.116 15.1254 18.2215 14.9962 18.2215H12.0022C11.8729 18.2215 11.7674 18.116 11.7674 17.9867V17.2534H15.2311L15.2309 17.9867ZM16.9245 13.4944C16.7741 13.9243 16.5789 14.1802 16.352 14.4757C16.17 14.7131 15.9643 14.9822 15.7611 15.3699C15.5448 15.7841 15.3865 16.2405 15.281 16.7258H11.7172C11.6143 16.2405 11.456 15.7841 11.2371 15.3699C11.034 14.9822 10.8282 14.7131 10.6462 14.4757C10.4193 14.1802 10.2215 13.9243 10.0738 13.4944C10.0738 13.4891 9.89701 12.9668 9.89701 12.3732C9.89701 10.3868 11.5141 8.77245 13.4978 8.77245C15.4815 8.77245 17.0986 10.3895 17.0986 12.3732C17.0986 12.9641 16.9218 13.4891 16.9218 13.4917L16.9245 13.4944Z" fill="#231F20" />
            <path d="M13.5001 7.58277C13.6452 7.58277 13.7639 7.46406 13.7639 7.31898V6.2638C13.7639 6.11871 13.6452 6 13.5001 6C13.355 6 13.2363 6.11871 13.2363 6.2638V7.31898C13.2363 7.46406 13.355 7.58277 13.5001 7.58277Z" fill="#231F20" />
            <path d="M9.46383 8.83648L9.65113 9.02378C9.70389 9.07654 9.76984 9.10028 9.83843 9.10028C9.90702 9.10028 9.97296 9.0739 10.0257 9.02378C10.1286 8.9209 10.1286 8.7547 10.0257 8.65183L9.27918 7.90529C9.1763 7.8024 9.0101 7.8024 8.90723 7.90529C8.80437 8.00817 8.80435 8.17437 8.90723 8.27723L9.46648 8.83648H9.46383Z" fill="#231F20" />
            <path d="M11.2733 7.81534C11.3155 7.91822 11.4131 7.97889 11.516 7.97889C11.5503 7.97889 11.5846 7.97362 11.6163 7.95779C11.7508 7.90239 11.8141 7.74675 11.7587 7.61221L11.6585 7.36952C11.6031 7.23498 11.4474 7.17167 11.3129 7.22707C11.1783 7.28247 11.115 7.43811 11.1704 7.57265L11.2707 7.81534H11.2733Z" fill="#231F20" />
            <path d="M8.81534 10.2746L8.57264 10.1743C8.43811 10.1189 8.28246 10.1822 8.22707 10.3168C8.17168 10.4513 8.23498 10.607 8.36952 10.6624L8.61221 10.7626C8.6465 10.7758 8.67816 10.7837 8.71245 10.7837C8.81533 10.7837 8.91294 10.723 8.95514 10.6202C9.01054 10.4856 8.94723 10.33 8.81269 10.2746H8.81534Z" fill="#231F20" />
            <path d="M8.31898 12.2363H7.2638C7.11871 12.2363 7 12.355 7 12.5001C7 12.6452 7.11871 12.7639 7.2638 12.7639H8.31898C8.46406 12.7639 8.58277 12.6452 8.58277 12.5001C8.58277 12.355 8.46406 12.2363 8.31898 12.2363Z" fill="#231F20" />
            <path d="M19.736 12.2363H18.6808C18.5357 12.2363 18.417 12.355 18.417 12.5001C18.417 12.6452 18.5357 12.7639 18.6808 12.7639H19.736C19.8811 12.7639 19.9998 12.6452 19.9998 12.5001C19.9998 12.355 19.8811 12.2363 19.736 12.2363Z" fill="#231F20" />
            <path d="M15.381 7.95779C15.4126 7.97098 15.4469 7.97889 15.4812 7.97889C15.5841 7.97889 15.6817 7.91822 15.7239 7.81534L15.8241 7.57264C15.8795 7.43811 15.8162 7.28246 15.6817 7.22707C15.5471 7.17168 15.3915 7.23498 15.3361 7.36952L15.2359 7.61221C15.1805 7.74675 15.2438 7.90239 15.3783 7.95779H15.381Z" fill="#231F20" />
            <path d="M17.1612 9.10027C17.2298 9.10027 17.2958 9.07389 17.3485 9.02377L18.0951 8.27723C18.1979 8.17435 18.1979 8.00815 18.0951 7.90528C17.9922 7.80241 17.826 7.8024 17.7231 7.90528L16.9766 8.65183C16.8737 8.75471 16.8737 8.92091 16.9766 9.02377C17.0293 9.07389 17.0953 9.10027 17.1639 9.10027H17.1612Z" fill="#231F20" />
            <path d="M18.7732 10.3168C18.7178 10.1823 18.5622 10.1189 18.4276 10.1743L18.185 10.2746C18.0504 10.33 17.9871 10.4856 18.0425 10.6202C18.0847 10.7204 18.1823 10.7837 18.2852 10.7837C18.3195 10.7837 18.3538 10.7784 18.3854 10.7626L18.6281 10.6624C18.7627 10.607 18.826 10.4513 18.7706 10.3168H18.7732Z" fill="#231F20" />
            <path d="M15.9111 11.3026L14.4075 11.0836L13.7348 9.72243C13.6451 9.54305 13.3496 9.54305 13.2626 9.72243L12.5899 11.0836L11.0863 11.3026C10.986 11.3158 10.9043 11.387 10.8726 11.4819C10.841 11.5769 10.8673 11.6824 10.9386 11.7537L12.0254 12.8141L11.7695 14.3125C11.7537 14.4127 11.7933 14.5103 11.875 14.571C11.9568 14.629 12.065 14.6369 12.152 14.5921L13.4974 13.8851L14.8427 14.5921C14.8823 14.6132 14.9245 14.6211 14.9667 14.6211C15.0221 14.6211 15.0749 14.6053 15.1224 14.571C15.2041 14.5129 15.2437 14.4127 15.2279 14.3125L14.972 12.8141L16.0588 11.7537C16.1301 11.6824 16.1564 11.5796 16.1248 11.4819C16.0931 11.3843 16.0113 11.3158 15.9111 11.3026ZM14.5024 12.5318C14.4391 12.5925 14.4127 12.6796 14.4259 12.764L14.6158 13.8719L13.6213 13.3496C13.5818 13.3285 13.5396 13.3206 13.4974 13.3206C13.4551 13.3206 13.4129 13.3311 13.3734 13.3496L12.3789 13.8719L12.5688 12.764C12.5846 12.6796 12.5556 12.5899 12.4923 12.5318L11.6877 11.7484L12.7983 11.5875C12.8854 11.5743 12.9592 11.5215 12.9962 11.4424L13.4921 10.4347L13.988 11.4424C14.0276 11.5215 14.1015 11.5743 14.1859 11.5875L15.2964 11.7484L14.4919 12.5318H14.5024Z" fill="#231F20" />
        </svg>

    )
}

export const StartCandidate = () => {
    return (
        <svg width="105" height="105" viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg" className='starCandidateIcs'>
            <rect width="90" height="90" transform="matrix(-1 0 0 1 90 0)" fill="url(#pattern0_10718_159478)" />
            <defs>
                <pattern id="pattern0_10718_159478" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use href="#image0_10718_159478" transform="scale(0.0025)" />
                </pattern>
                <image id="image0_10718_159478" width="400" height="400" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAABkKADAAQAAAABAAABkAAAAAAbMW/MAAA+ZklEQVR4Ae297ZnizJamO90ODB50HAuGsSDjWFB4gMaC4liAxoJkfp8faCxI2gKpLUjaAtQWlMaCmvuprditzQuZAgRImc+6rvtVoI8VK24qV0Dmnp7/8l8cNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADNmADX87AnBWVEL7cyrwgG7ABG7CBuxo4kP03rO46i5PbgA3YgA18KQMZq9HmISI4bMAGbMAGbKCXgfTtQxvIrNcTvskGbMAGbODbG8gwkL59NN/ehgXYgA3YgA30NtD99lH1fso32oAN2MBIDPzzSOr4bmVkLDh8t0V7vTZgAzZgA7cbSN8+ClLp11gVOGzABmxgUgb8DeTxb1fOlAH+HQpQVH/+6//YgA3YwIQMjH0DCbj8BRl8hdD/0upnuxD/v/v4Cu+o12AD39jA2DcQNVyxhQBTjw0L0Hr+DSpw2IAN2IAN3NFATW79naC84xyPSB2ZROsQARQR9DoHhw3YgA1MysDYv4FIZtEajRxX7XiKh9e26P/JsT5aQDh67Zc2YAM2YAMDGJiTI31y199D9CugqUVOwVpDDd2IvND5Chw2YAM2YAN3MFCTM20ib3fIf8+U3Q0wHk2UrlVH5/3SBmzABmxgIAMb8qQNRMdsoLyPSPPOJKpZazgVuqZvVg4bsAEbsIE7GFiQs7uBqOGGO8wzdMqchKq7hhmcioaTusdhAzZgAzZwBwNqvmkDqdpxeYd5hkwZ2zpVt8bnouLCZ/ece9bnbcAGbMAGehiouEeNNoP0qX3FeIyhDU/fklRvDh9FwcW0ro/u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" />
            </defs>
        </svg>
    )
}

export const BoostEnergy = () => {
    return (
        <svg width="190" height="190" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg" className='boostEnergyCls'>
            <rect width="170" height="170" fill="url(#pattern0_10718_159431)" />
            <defs>
                <pattern id="pattern0_10718_159431" patternContentUnits="objectBoundingBox" width="1" height="1">
                    <use href="#image0_10718_159431" transform="scale(0.0025)" />
                </pattern>
                <image id="image0_10718_159431" width="400" height="400" href="data:image/png;base64,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FCITgYsI6L/GexG+VS5OkNX3kG3JrsTYnyEW+C7LMPHcmPwLng+Qa4zrcVsE9kj3Y5DyH9DPg2d1RUAEHpAAL4330Bvk32H2tXz3yUviHRRahofmugpjaeik/kUEyPwj9Ao1WfN14Tjn6cfXdW4rENDve5w7uOKJgAhsi8AT0mXh8UVhbHvG2vcQL4lmnBPGlihiCPtQRoZPUJNvzGv1gnXvZqRlECvcl88yERCBByPAgv8GhcVgzn6F2Lo8Lv+i4ut0nuF1Yoz3l6fzOUKOP/3Xym6mmArzgAT0O5BtvugZ0v4IdRX4nzB3giootBQPFvqbcLCj//cYZwzZdALk/QoljRB8fZpG35jXpYDfv4YueW0M1vNCov0R2n/u6Q8REIG7J5DhhP7dY9gWGOdcjLFY5VAFhTF8/4Bx2WUEEiw/Q2RKzjlkoT4zmMygHOp6bRjvE/QBusRyLGasAmpa2hzQswiIwPYJ7HAEftOHYqHJoCmWYJGDmvE4LruMgH+tcoSZyjPD2gIKX5+w/4y5qWax0MdinLfg2Y/79hVzT9A7aOpZsFQmAiJwKwIpNuY7T/9NzfYIzfENbRDnAOUQ95Gti4BFOgUUvva+/4zxKcavGx9jTMuvQe5pIZkIiMBGCDTfIbqN5K005yNgEeoENQv+y4QtdnWcAq2rlaMtoGb8rudX+FpIJgIisGICGXILv4n5LHtcAnscvYLCrwk3Mw6LeIxZQOE+bf1n+CSQTAREYIUEwh9duRXmp5SuTyDFlicoLOi7hdLg5ZBBBRTuF/b5NcqcZCIgAisikCEX/416XFFeSuX2BFjYc8h/fZyvkBIviXBPvzdbXiIZJBMBEVgJgTfkwW/OCmLBkIlAk8AeA76Qs38Ns9jkBPl9wzbDuEwERODGBHhh+G9Md+NctP26CWRIj18r/BRwTTtgM/816lv9OOuar4D2EoEOAhbj/puSl4lMBPoIZJjk10va57TAXIaY/uvUt2eM6Wt2AdgKKQKxBCwc+Q1ZQDIRWDOBDMn5y8O3+ZoTVm4icO8ELA7Ib0YHyURg7QTafpxl1p608hOBeyXAH0XwArn2jyTulafOtTyBE7bwn0DY5stvqR1EQAS6COy6JjQuAisk4N/0hJdIssI8lZIIiIAIiMAKCeTIKbxA9CZohS+SUhIBERCBNRIwSKqC/CVyWGOSykkEREAERGCdBBzS8hcI/zGsTAREQAREQASiCBh4+QuErUwEREAEREAEogkU8PSXSPQiOW6HwLfbSVWZioAIbIxAHuRrg766d0JAF8idvJA6hgiskECxwpyU0owEdIHMCFOhREAEviBQ4unnL0b0IAIiIAIiIAKRBHL46ZfokbDkJgIiIAIi8C8ELLr8NyEyERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERABERCBuyfw/wHbFnnWZzff8gAAAABJRU5ErkJggg==" />
            </defs>
        </svg>
    )
}

export const BoostRocket = () => {
    return (
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4375 0C11.5889 0 9.97312 1.26292 9.5261 3.05668C9.49134 3.19647 9.39494 3.30859 9.26365 3.36288C9.13126 3.4176 8.98758 3.40695 8.86385 3.33224C7.27937 2.37986 5.24311 2.62866 3.93589 3.93588C2.62868 5.24309 2.379 7.27849 3.33138 8.86297C3.40605 8.98668 3.41763 9.13126 3.36287 9.26365C3.3086 9.39495 3.19648 9.49134 3.05668 9.5261C1.26291 9.97311 0 11.5889 0 13.4375C0 15.2861 1.26291 16.9019 3.05668 17.3489C3.19648 17.3837 3.3086 17.4801 3.36287 17.6114C3.41759 17.7437 3.40605 17.8874 3.33138 18.0112C2.379 19.5956 2.62868 21.6319 3.93589 22.9391C5.24311 24.2463 7.27937 24.496 8.86385 23.5436C8.98757 23.469 9.13127 23.4584 9.26365 23.513C9.39495 23.5673 9.49134 23.6785 9.5261 23.8183C9.97311 25.6121 11.5889 26.875 13.4375 26.875C15.2861 26.875 16.9019 25.6121 17.3489 23.8183C17.3837 23.6785 17.48 23.5673 17.6113 23.513C17.7437 23.4583 17.8883 23.4689 18.012 23.5436C19.5965 24.496 21.6319 24.2463 22.9391 22.9391C24.2463 21.6319 24.496 19.5956 23.5436 18.0112C23.469 17.8874 23.4574 17.7437 23.5121 17.6114C23.5664 17.4801 23.6785 17.3837 23.8183 17.3489C25.6121 16.9019 26.875 15.2861 26.875 13.4375C26.875 11.5889 25.6121 9.97311 23.8183 9.5261C23.6785 9.49134 23.5664 9.39495 23.5121 9.26365C23.4574 9.13126 23.469 8.98668 23.5436 8.86297C24.496 7.27849 24.2463 5.24309 22.9391 3.93588C21.6319 2.62866 19.5956 2.37986 18.0111 3.33224C17.8874 3.40695 17.7437 3.41748 17.6113 3.36288C17.48 3.30861 17.3836 3.19647 17.3489 3.05668C16.9019 1.26292 15.2861 -4.47916e-06 13.4375 0Z" fill="#42BC93" />
            <path d="M9.19416 14.426C9.03166 14.9149 8.87254 15.4138 8.81689 15.9147L8.81628 15.9146V15.9257C8.81628 15.9307 8.81627 15.9356 8.81626 15.9405C8.81606 16.0436 8.81588 16.1418 8.9039 16.2298L8.90511 16.231L10.6539 17.9215C10.6541 17.9217 10.6543 17.9219 10.6545 17.9221C10.7424 18.0095 10.8403 18.0093 10.9432 18.0091C10.9481 18.0091 10.953 18.0091 10.9579 18.0091V18.0097L10.969 18.0085C11.4647 17.9534 12.0123 17.8469 12.5165 17.6884L12.8999 19.4961C12.9053 19.5964 12.9774 19.6762 13.0417 19.7245C13.1114 19.7768 13.2049 19.8174 13.2913 19.8174C13.2929 19.8174 13.2945 19.8174 13.2963 19.8174C13.3211 19.8175 13.3652 19.8176 13.4031 19.805C13.4263 19.7973 13.4548 19.7826 13.4769 19.7542C13.4841 19.7449 13.4899 19.735 13.4944 19.725L15.6149 18.5215C15.615 18.5214 15.6151 18.5213 15.6153 18.5213C16.1847 18.2047 16.4296 17.5156 16.306 16.8978L16.3061 16.8978L16.3052 16.8939L15.9106 15.2592L16.6803 14.5444C18.5173 13.1786 19.2864 10.81 18.6993 8.56145C18.6946 8.47109 18.6456 8.40611 18.5907 8.36038C18.5379 8.31639 18.4707 8.28281 18.4161 8.25551L18.411 8.25297L18.4018 8.24834L18.3917 8.24571C16.1382 7.65266 13.7069 8.42309 12.2234 10.2027L11.5063 11.03L9.99591 10.6385C9.30569 10.3899 8.61574 10.7059 8.30304 11.3286L7.07931 13.4847L7.07495 13.4924H7.03587L7.01308 13.5608C6.97411 13.6777 6.99261 13.7852 7.05711 13.8712C7.11769 13.9519 7.21176 14.0046 7.30966 14.0373L7.30943 14.038L7.32112 14.0404L9.19416 14.426ZM8.019 13.4052L8.94563 11.7155L8.94569 11.7155L8.94739 11.7121C9.02448 11.558 9.13733 11.4597 9.26542 11.4109C9.39426 11.3618 9.54531 11.3603 9.70133 11.4123L9.70125 11.4125L9.70771 11.4142L10.8969 11.7244L10.4145 12.3034L10.4144 12.3033L10.4113 12.3074L10.4079 12.3119C10.0762 12.7541 9.73721 13.2062 9.50012 13.7117L8.019 13.4052ZM14.693 16.5891L14.6933 16.5895L14.7008 16.5826L15.3366 15.9956L15.6412 17.1634C15.6399 17.3246 15.6121 17.4964 15.5534 17.6466C15.493 17.8008 15.4029 17.9253 15.2821 17.998C15.2819 17.9981 15.2817 17.9982 15.2815 17.9983L13.5944 18.9779L13.2887 17.5002C13.7942 17.2632 14.2462 16.9242 14.6884 16.5925L14.693 16.5891ZM16.2031 14.0982L16.203 14.0981L16.1988 14.1019L14.1581 15.9677C13.3112 16.7014 12.2408 17.1573 11.1116 17.2797L9.66448 15.8325C9.8427 14.7006 10.2998 13.6297 11.0331 12.7834L11.9641 11.736L12.0203 11.6798L12.0205 11.6799L12.0249 11.6749L12.8415 10.7416L12.8416 10.7416L12.8426 10.7403C14.0876 9.26903 16.1177 8.58013 17.9896 8.95203C18.3641 10.8816 17.7298 12.8542 16.2031 14.0982ZM15.5663 10.1674C14.866 10.1674 14.358 10.7406 14.358 11.3757C14.358 12.0143 14.9277 12.5841 15.5663 12.5841C16.2666 12.5841 16.7746 12.0108 16.7746 11.3757C16.7746 10.7406 16.2666 10.1674 15.5663 10.1674ZM15.5663 11.8591C15.3299 11.8591 15.1413 11.6705 15.1413 11.4341C15.1413 11.1976 15.3299 11.0091 15.5663 11.0091C15.8027 11.0091 15.9913 11.1976 15.9913 11.4341C15.9913 11.6705 15.8027 11.8591 15.5663 11.8591Z" fill="white" stroke="white" stroke-width="0.2" />
        </svg>
    )
}

export const RightArrowText = () => {
    return (
        <svg width="17" height="9" viewBox="0 0 17 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.3536 4.85355C16.5488 4.65829 16.5488 4.34171 16.3536 4.14645L13.1716 0.964465C12.9763 0.769203 12.6597 0.769203 12.4645 0.964465C12.2692 1.15973 12.2692 1.47631 12.4645 1.67157L15.2929 4.5L12.4645 7.32843C12.2692 7.52369 12.2692 7.84027 12.4645 8.03553C12.6597 8.23079 12.9763 8.23079 13.1716 8.03553L16.3536 4.85355ZM4.37114e-08 5L16 5L16 4L-4.37114e-08 4L4.37114e-08 5Z" fill="black" />
        </svg>
    )
}

export const AlertInfoIcs = () => {
    return (
        <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M13.4375 0C11.5889 0 9.97312 1.26292 9.5261 3.05668C9.49134 3.19647 9.39494 3.30859 9.26365 3.36288C9.13126 3.4176 8.98758 3.40695 8.86385 3.33224C7.27937 2.37986 5.24311 2.62866 3.93589 3.93588C2.62868 5.24309 2.379 7.27849 3.33138 8.86297C3.40605 8.98668 3.41763 9.13126 3.36287 9.26365C3.3086 9.39495 3.19648 9.49134 3.05668 9.5261C1.26291 9.97311 0 11.5889 0 13.4375C0 15.2861 1.26291 16.9019 3.05668 17.3489C3.19648 17.3837 3.3086 17.4801 3.36287 17.6114C3.41759 17.7437 3.40605 17.8874 3.33138 18.0112C2.379 19.5956 2.62868 21.6319 3.93589 22.9391C5.24311 24.2463 7.27937 24.496 8.86385 23.5436C8.98757 23.469 9.13127 23.4584 9.26365 23.513C9.39495 23.5673 9.49134 23.6785 9.5261 23.8183C9.97311 25.6121 11.5889 26.875 13.4375 26.875C15.2861 26.875 16.9019 25.6121 17.3489 23.8183C17.3837 23.6785 17.48 23.5673 17.6113 23.513C17.7437 23.4583 17.8883 23.4689 18.012 23.5436C19.5965 24.496 21.6319 24.2463 22.9391 22.9391C24.2463 21.6319 24.496 19.5956 23.5436 18.0112C23.469 17.8874 23.4574 17.7437 23.5121 17.6114C23.5664 17.4801 23.6785 17.3837 23.8183 17.3489C25.6121 16.9019 26.875 15.2861 26.875 13.4375C26.875 11.5889 25.6121 9.97311 23.8183 9.5261C23.6785 9.49134 23.5664 9.39495 23.5121 9.26365C23.4574 9.13126 23.469 8.98668 23.5436 8.86297C24.496 7.27849 24.2463 5.24309 22.9391 3.93588C21.6319 2.62866 19.5956 2.37986 18.0111 3.33224C17.8874 3.40695 17.7437 3.41748 17.6113 3.36288C17.48 3.30861 17.3836 3.19647 17.3489 3.05668C16.9019 1.26292 15.2861 -4.47916e-06 13.4375 0Z" fill="#E03A3A" />
            <path d="M12.5739 8.0918L7.986 15.751C7.8914 15.9148 7.84135 16.1005 7.84082 16.2897C7.84029 16.4788 7.8893 16.6648 7.98298 16.8292C8.07665 16.9935 8.21172 17.1305 8.37476 17.2264C8.53779 17.3223 8.7231 17.3739 8.91225 17.376H18.0881C18.2772 17.3739 18.4625 17.3223 18.6256 17.2264C18.7886 17.1305 18.9237 16.9935 19.0173 16.8292C19.111 16.6648 19.16 16.4788 19.1595 16.2897C19.159 16.1005 19.1089 15.9148 19.0143 15.751L14.4264 8.0918C14.3299 7.93261 14.1939 7.80099 14.0316 7.70964C13.8694 7.6183 13.6864 7.57031 13.5002 7.57031C13.314 7.57031 13.1309 7.6183 12.9687 7.70964C12.8064 7.80099 12.6705 7.93261 12.5739 8.0918V8.0918Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M13.5 10.875V13.0417" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M13.5 15.209H13.5057" stroke="white" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const InspireUnionStar = () => {
    return (
        <svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M27.0167 26.9262C41.4138 26.9218 53 26.7328 53 26.5003C53 26.2713 41.7693 26.0846 27.6826 26.0746C34.6296 19.1115 40.0238 13.5308 39.91 13.4169C39.7943 13.3013 34.0403 18.8666 26.926 25.97C26.9214 11.5791 26.7325 0 26.5 0C26.2675 0 26.0785 11.5866 26.074 25.984C18.9533 18.8739 13.1918 13.3012 13.0761 13.417C12.9622 13.5308 18.3564 19.1115 25.3035 26.0746C11.2232 26.0847 0 26.2714 0 26.5003C0 26.7327 11.5788 26.9217 25.9694 26.9262C18.7043 34.1966 12.9586 40.1333 13.0761 40.2508C13.1918 40.3665 18.9535 34.7937 26.0744 27.6835C26.0843 41.7698 26.2711 53 26.5 53C26.7288 53 26.9156 41.7772 26.9256 27.6974C34.0401 34.801 39.7943 40.3665 39.91 40.2508C40.0275 40.1334 34.2818 34.1966 27.0167 26.9262Z" fill="white" />
        </svg>
    )
}

export const RocketIcs = () => {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.7283 1.00202C17.991 1.10335 14.8634 1.40113 13.435 2.25935C11.5994 3.36224 9.78808 5.43269 8.32675 7.42025L5.41186 7.80136C4.84941 7.87491 4.35986 8.24402 4.1343 8.76447L3.45075 10.342C3.39652 10.4669 3.40275 10.6096 3.46719 10.7291C3.53163 10.8489 3.64741 10.9327 3.78119 10.9562L5.76786 11.3074C5.6203 11.5571 5.4943 11.7751 5.39519 11.9498C5.12986 12.4174 5.21052 13.0096 5.59141 13.3905L5.7023 13.5014L5.23119 13.9725C4.75675 14.4471 4.75675 15.2196 5.23119 15.6945L6.30564 16.7691C6.53564 16.9991 6.84142 17.1256 7.16675 17.1256C7.49186 17.1256 7.79764 16.9989 8.02764 16.7689L8.49853 16.298L8.60942 16.4089C8.83675 16.6363 9.13853 16.7614 9.45897 16.7614C9.66564 16.7614 9.86986 16.7074 10.0501 16.6051C10.2248 16.506 10.4425 16.3803 10.6923 16.2325L11.0434 18.2191C11.067 18.3531 11.1508 18.4689 11.2705 18.5331C11.3361 18.5685 11.4085 18.5863 11.481 18.5863C11.541 18.5863 11.6012 18.574 11.6576 18.5496L13.2352 17.8663C13.7556 17.6407 14.1248 17.1511 14.1983 16.5887L14.5794 13.6738C16.567 12.2123 18.6372 10.4011 19.7403 8.56558C20.5985 7.13713 20.8965 4.00958 20.9976 2.27224C21.017 1.93802 20.9014 1.62024 20.6723 1.37713C20.4308 1.12024 20.0868 0.981352 19.7283 1.00202ZM4.49008 10.1789L4.94986 9.1178C5.05164 8.88269 5.27275 8.71602 5.52697 8.68269L7.62164 8.40891C7.09919 9.16447 6.63964 9.87891 6.26097 10.492L4.49008 10.1789ZM7.39964 16.14C7.27542 16.2643 7.05875 16.2643 6.93475 16.14L5.8603 15.0656C5.73208 14.9374 5.73208 14.7287 5.8603 14.6007L6.33141 14.1298L7.87075 15.6691L7.39964 16.14ZM13.3176 16.4734C13.2843 16.7276 13.1176 16.9487 12.8825 17.0505L11.8214 17.5103L11.5083 15.7394C12.1212 15.3609 12.8359 14.9011 13.5914 14.3787L13.3176 16.4734ZM18.979 8.10758C16.9436 11.4951 11.2948 14.8763 9.61186 15.832C9.49231 15.8996 9.33586 15.8774 9.23853 15.7803L8.81386 15.3556L8.81342 15.3549L6.64541 13.1869L6.64475 13.1865L6.22008 12.7618C6.12119 12.6627 6.09964 12.5091 6.1683 12.3885C7.12386 10.7056 10.5052 5.05669 13.8928 3.02135C15.2052 2.23291 18.447 1.96713 19.7992 1.88891C19.8859 1.88891 19.9665 1.9238 20.0263 1.98691C20.0859 2.05002 20.1159 2.13291 20.1108 2.22024C20.0332 3.55335 19.7674 6.79513 18.979 8.10758Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
            <path d="M15.3133 4.39062C14.6999 4.39062 14.1235 4.62951 13.6897 5.06307C12.7948 5.95818 12.7948 7.41485 13.6897 8.30974C14.1233 8.7433 14.6997 8.98218 15.3131 8.98218C15.9262 8.98218 16.5028 8.74352 16.9364 8.30974C17.8315 7.41463 17.8315 5.95818 16.9364 5.06285C16.5031 4.62929 15.9266 4.39062 15.3133 4.39062ZM16.3082 7.68107C16.0424 7.94685 15.6891 8.09307 15.3133 8.09307C14.9375 8.09307 14.5842 7.94685 14.3184 7.68107C13.7699 7.13241 13.7699 6.23996 14.3184 5.69129C14.5842 5.42551 14.9375 5.27929 15.3133 5.27929C15.6891 5.27929 16.0424 5.42551 16.3082 5.69129C16.8568 6.23996 16.8568 7.13263 16.3082 7.68107Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
            <path d="M3.6199 15.9219C2.96323 15.9219 2.3459 16.1777 1.88168 16.6419C1.00679 17.5165 0.994343 20.0594 1.00079 20.5603C1.0039 20.8012 1.19857 20.9959 1.43968 20.9992L1.50168 20.9994C2.39634 20.9994 4.56301 20.9137 5.35812 20.1185C5.82235 19.6543 6.07812 19.037 6.07812 18.3803C6.07812 17.7237 5.82235 17.1063 5.35812 16.6421C4.8939 16.1779 4.27657 15.9219 3.6199 15.9219ZM4.72968 19.4899C4.34679 19.8728 3.0619 20.0683 1.89434 20.1043C1.92745 19.0361 2.11723 17.663 2.51012 17.2703C2.80657 16.9739 3.20057 16.8108 3.6199 16.8108C4.03923 16.8108 4.43323 16.9739 4.72968 17.2703C5.02612 17.5668 5.18924 17.9608 5.18924 18.3801C5.18924 18.7994 5.02612 19.1934 4.72968 19.4899Z" fill="#231F20" stroke="#231F20" stroke-width="0.2" />
        </svg>

    )
}

export const VideoYoutube = () => {
    return (
        <svg width="19" height="14" viewBox="0 0 19 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.6129 0C1.61919 0 0 1.61919 0 3.6129V10.3871C0 12.3808 1.61919 14 3.6129 14H15.3548C17.3486 14 18.9677 12.3808 18.9677 10.3871V3.6129C18.9677 1.61919 17.3486 0 15.3548 0H3.6129ZM3.6129 0.903226H15.3548C16.8638 0.903226 18.0645 2.10395 18.0645 3.6129V10.3871C18.0645 11.896 16.8638 13.0968 15.3548 13.0968H3.6129C2.10395 13.0968 0.903226 11.896 0.903226 10.3871V3.6129C0.903226 2.10395 2.10395 0.903226 3.6129 0.903226ZM7.64214 3.6129C7.52858 3.62181 7.42259 3.67329 7.34538 3.75704C7.26818 3.84078 7.22547 3.95061 7.22581 4.06452V9.93548C7.22422 10.0429 7.261 10.1475 7.32955 10.2302C7.3981 10.313 7.49392 10.3686 7.5998 10.3871C7.70671 10.4062 7.81694 10.3862 7.91028 10.3306L12.878 7.39516C12.9469 7.35559 13.0041 7.29854 13.0439 7.22978C13.0837 7.16101 13.1047 7.08298 13.1047 7.00353C13.1047 6.92408 13.0837 6.84603 13.0439 6.77727C13.0041 6.70851 12.9469 6.65146 12.878 6.61188L7.91028 3.6764C7.8297 3.62782 7.73595 3.60562 7.64214 3.6129ZM8.12903 4.86188L11.749 7L8.12903 9.14516V4.86188Z" fill="#231F20" />
        </svg>
    )
}

export const ArrowUpIcon = () => (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 75.32 122.88" >
        <g>
            <polygon class="st0" points="37.66,0 0,37.99 24.24,37.99 24.24,122.88 51.08,122.88 51.08,37.99 75.32,37.99 37.66,0" />
        </g>
    </svg>
)

export const MenuDots = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M2.25 12C2.25 10.4812 3.48122 9.25 5 9.25C6.51878 9.25 7.75 10.4812 7.75 12C7.75 13.5188 6.51878 14.75 5 14.75C3.48122 14.75 2.25 13.5188 2.25 12ZM5 10.75C4.30964 10.75 3.75 11.3096 3.75 12C3.75 12.6904 4.30964 13.25 5 13.25C5.69036 13.25 6.25 12.6904 6.25 12C6.25 11.3096 5.69036 10.75 5 10.75Z" fill="#1C274C" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.25 12C9.25 10.4812 10.4812 9.25 12 9.25C13.5188 9.25 14.75 10.4812 14.75 12C14.75 13.5188 13.5188 14.75 12 14.75C10.4812 14.75 9.25 13.5188 9.25 12ZM12 10.75C11.3096 10.75 10.75 11.3096 10.75 12C10.75 12.6904 11.3096 13.25 12 13.25C12.6904 13.25 13.25 12.6904 13.25 12C13.25 11.3096 12.6904 10.75 12 10.75Z" fill="#1C274C" />
        <path fill-rule="evenodd" clip-rule="evenodd" d="M19 9.25C17.4812 9.25 16.25 10.4812 16.25 12C16.25 13.5188 17.4812 14.75 19 14.75C20.5188 14.75 21.75 13.5188 21.75 12C21.75 10.4812 20.5188 9.25 19 9.25ZM17.75 12C17.75 11.3096 18.3096 10.75 19 10.75C19.6904 10.75 20.25 11.3096 20.25 12C20.25 12.6904 19.6904 13.25 19 13.25C18.3096 13.25 17.75 12.6904 17.75 12Z" fill="#1C274C" />
    </svg>
)

export const MenuResumeDownload = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width={'1.5rem'} height={'1.5rem'} viewBox="0 0 24 24" fill="none">
        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M7 10L12 15L17 10" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12 15V3" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const MenuResumeUpload = ({ width = '1.5rem', height = '1.5rem' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none">
        <path d="M19.9963 8.82277C18.8871 4.40397 14.4058 1.72104 9.98704 2.83027C6.53385 3.69713 4.02646 6.68166 3.76811 10.2326C1.31621 10.6369 -0.343691 12.9523 0.0606558 15.4042C0.420101 17.584 2.30886 19.1804 4.51803 19.1716H8.26762V17.6718H4.51803C2.86136 17.6718 1.51836 16.3287 1.51836 14.6721C1.51836 13.0154 2.86136 11.6724 4.51803 11.6724C4.93222 11.6724 5.26794 11.3367 5.26794 10.9225C5.2642 7.19498 8.28294 4.17018 12.0105 4.16648C15.2372 4.16325 18.0148 6.4444 18.639 9.61013C18.7006 9.92622 18.9571 10.1677 19.2764 10.2101C21.3266 10.502 22.7519 12.4007 22.46 14.4508C22.1978 16.2918 20.626 17.6625 18.7665 17.6718H15.7668V19.1716H18.7665C21.6656 19.1628 24.0088 16.8055 24 13.9063C23.9926 11.4929 22.3408 9.39547 19.9963 8.82277Z" fill="#231F20" />
        <path d="M11.4848 11.89L8.48511 14.8896L9.54249 15.947L11.2673 14.2297V21.4214H12.7671V14.2297L14.4845 15.947L15.5418 14.8896L12.5422 11.89C12.2496 11.5992 11.7773 11.5992 11.4848 11.89Z" fill="#231F20" />
    </svg>
)

export const ResumeReviewLableFile = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_13269_114238)">
            <path d="M19.0338 17.49C18.9611 17.1705 18.6772 16.9443 18.3495 16.9443H9.19393C8.80656 16.9443 8.49182 16.6295 8.49182 16.2421V7.18465C8.49182 6.97139 8.39517 6.76984 8.22849 6.63681C8.06326 6.50379 7.84663 6.45169 7.63609 6.49967L3.11628 7.51033C1.97792 7.76408 1.26215 8.89485 1.51598 10.0349L4.29629 22.3651C4.55397 23.4999 5.69621 24.2019 6.82019 23.9482L17.7728 21.4908C18.9059 21.2379 19.6262 20.1109 19.3704 18.9642L19.0338 17.49ZM19.0235 7.81683C19.7983 7.81683 20.4277 7.18671 20.4277 6.41261C20.4277 5.63851 19.7983 4.96158 19.0235 4.96158L15.5213 4.98105L18.3214 2.10633L16.7907 1.40422C16.5099 0.589726 15.7236 0 14.8108 0C13.898 0 13.1117 0.589726 12.8309 1.40422L11.3003 2.10633L14.108 4.98887L10.5982 5.00839C9.82335 5.00839 9.19393 5.63851 9.19393 6.41261C9.19393 7.18671 9.82335 7.81683 10.5982 7.81683C9.82335 7.81683 9.19393 8.44695 9.19393 9.22105C9.19393 9.99515 9.82335 10.6253 10.5982 10.6253C9.82335 10.6253 9.19393 11.2554 9.19393 12.0295C9.19393 12.8036 9.82335 13.4337 10.5982 13.4337H16.215C16.9898 13.4337 17.6193 12.8036 17.6193 12.0295C17.6193 11.2554 16.9898 10.6253 16.215 10.6253H19.0235C19.7983 10.6253 20.4277 9.99515 20.4277 9.22105C20.4277 8.44695 19.7983 7.81683 19.0235 7.81683Z" fill="url(#paint0_linear_13269_114238)" />
            <path d="M20.428 1.4043H16.791C16.8753 1.62893 16.9174 1.85365 16.9174 2.10641C16.9174 3.27186 15.9767 4.21274 14.8111 4.21274C13.6456 4.21274 12.7048 3.27186 12.7048 2.10641C12.7048 1.85365 12.7469 1.62893 12.8312 1.4043H9.19422C8.02867 1.4043 7.08789 2.34508 7.08789 3.51063V16.2422C7.08789 17.4077 8.02867 18.3486 9.19422 18.3486H20.428C21.5935 18.3486 22.5343 17.4077 22.5343 16.2422V3.51063C22.5343 2.34508 21.5935 1.4043 20.428 1.4043ZM16.2153 12.7317H10.5984C10.2052 12.7317 9.89633 12.4227 9.89633 12.0296C9.89633 11.6363 10.2052 11.3275 10.5984 11.3275H16.2153C16.6086 11.3275 16.9174 11.6363 16.9174 12.0296C16.9174 12.4227 16.6086 12.7317 16.2153 12.7317ZM19.0238 9.92323H10.5984C10.2052 9.92323 9.89633 9.61426 9.89633 9.22112C9.89633 8.8279 10.2052 8.51901 10.5984 8.51901H19.0238C19.417 8.51901 19.7259 8.8279 19.7259 9.22112C19.7259 9.61426 19.417 9.92323 19.0238 9.92323ZM19.0238 7.11479H10.5984C10.2052 7.11479 9.89633 6.80582 9.89633 6.41268C9.89633 6.01945 10.2052 5.71057 10.5984 5.71057H19.0238C19.417 5.71057 19.7259 6.01945 19.7259 6.41268C19.7259 6.80582 19.417 7.11479 19.0238 7.11479Z" fill="url(#paint1_linear_13269_114238)" />
        </g>
        <defs>
            <linearGradient id="paint0_linear_13269_114238" x1="10.9463" y1="24" x2="10.9463" y2="0" gradientUnits="userSpaceOnUse">
                <stop stop-color="#ABBDF9" />
                <stop offset="1" stop-color="#F2EBFF" />
            </linearGradient>
            <linearGradient id="paint1_linear_13269_114238" x1="6.89481" y1="11.4297" x2="22.545" y2="11.3134" gradientUnits="userSpaceOnUse">
                <stop stop-color="#1B133B" />
                <stop offset="1" stop-color="#32426D" />
            </linearGradient>
            <clipPath id="clip0_13269_114238">
                <rect width="24" height="24" fill="white" />
            </clipPath>
        </defs>
    </svg>

)

export const ResumeReviewDidYouKnowLabel1 = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_13544_128717)">
            <path d="M14.3483 7.25064H14.023C13.9333 5.4838 12.5024 4.09409 10.7161 4.09409H8.88211V1.80164C8.88211 1.32551 8.49415 0.919922 8.00039 0.919922C7.52426 0.919922 7.11868 1.30788 7.11868 1.80164V4.09409H5.2847C3.51599 4.09409 2.06913 5.49979 1.99427 7.25064H1.67006C0.96469 7.25064 0.400391 7.81494 0.400391 8.52031V10.6541C0.400391 11.3418 0.96469 11.9061 1.67006 11.9061H1.99336C2.05916 13.6652 3.51003 15.0803 5.2847 15.0803H10.7337C12.5143 15.0803 13.9693 13.6557 14.026 11.8885H14.3483C15.0361 11.8885 15.6004 11.3242 15.6004 10.6364V8.52031C15.6004 7.81494 15.0361 7.25064 14.3483 7.25064ZM4.03267 7.81494C4.03267 7.05665 4.64987 6.43945 5.40815 6.43945C6.16642 6.43945 6.78362 7.05665 6.78362 7.81494C6.78362 8.57321 6.16642 9.19041 5.40815 9.19041C4.64987 9.19041 4.03267 8.57321 4.03267 7.81494ZM10.7161 12.2764C10.7161 12.5586 10.4868 12.7702 10.2223 12.7702H5.81373C5.53159 12.7702 5.31998 12.5409 5.31998 12.2764V11.2485C5.31998 10.9663 5.54922 10.7547 5.81373 10.7547H10.2223C10.5045 10.7547 10.7161 10.9839 10.7161 11.2485V12.2764ZM10.5926 9.19041C9.83436 9.19041 9.21716 8.57321 9.21716 7.81494C9.21716 7.05665 9.83436 6.43945 10.5926 6.43945C11.3509 6.43945 11.9681 7.05665 11.9681 7.81494C11.9681 8.57321 11.3509 9.19041 10.5926 9.19041Z" fill="url(#paint0_linear_13544_128717)" />
        </g>
        <defs>
            <linearGradient id="paint0_linear_13544_128717" x1="0.210391" y1="9.29812" x2="15.6106" y2="9.16343" gradientUnits="userSpaceOnUse">
                <stop stop-color="#705FB5" />
                <stop offset="0.5625" stop-color="#32426D" />
            </linearGradient>
            <clipPath id="clip0_13544_128717">
                <rect width="16" height="16" fill="white" />
            </clipPath>
        </defs>
    </svg>

)

export const ResumeReviewDidYouKnowLabel2 = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9.21421 7.69189L10.978 6.64763C11.8224 6.14756 12.3471 5.22717 12.3471 4.24575V2.10447H12.8571V0.400391H3.14258V2.10447H3.65258V4.24575C3.65258 5.22717 4.17723 6.14756 5.02184 6.64771L6.78528 7.69189C6.8938 7.75613 6.96109 7.8743 6.96109 8.00039C6.96109 8.1264 6.8938 8.24465 6.78528 8.30881L5.02184 9.35315C4.17723 9.85322 3.65258 10.7735 3.65258 11.755V13.8963H3.14258V15.6004H12.8571V13.8963H12.3471V11.755C12.3471 10.7735 11.8224 9.85322 10.978 9.35315L9.21437 8.30881C9.10585 8.24465 9.03856 8.1264 9.03856 8.00039C9.03856 7.8743 9.10585 7.75613 9.21421 7.69189ZM8.87 8.89003L10.6338 9.93437C11.2739 10.3134 11.6715 11.011 11.6715 11.755V13.8963H11.0782V12.981C11.0782 12.5331 10.8377 12.1107 10.4524 11.8818L8.76112 10.8816C8.53034 10.7452 8.26714 10.6732 7.99902 10.6732C7.73069 10.6732 7.46728 10.7453 7.23638 10.882L5.54728 11.8818C5.16198 12.1107 4.92142 12.5331 4.92142 12.981V13.8963H4.32814V11.755C4.32814 11.011 4.72579 10.3134 5.36605 9.93437L7.12965 8.89003C7.44236 8.70481 7.63665 8.3639 7.63665 8.00039C7.63665 7.63688 7.44236 7.29589 7.12949 7.11067L5.36605 6.06641C4.72579 5.68732 4.32814 4.98967 4.32814 4.24575V2.10447H11.6715V4.24575C11.6715 4.98967 11.2739 5.68732 10.6338 6.06641L8.87 7.11067C8.55729 7.29589 8.363 7.63688 8.363 8.00039C8.363 8.3639 8.55729 8.70481 8.87 8.89003Z" fill="url(#paint0_linear_13544_128729)" />
        <defs>
            <linearGradient id="paint0_linear_13544_128729" x1="3.02115" y1="9.39372" x2="12.8641" y2="9.34247" gradientUnits="userSpaceOnUse">
                <stop stop-color="#705FB5" />
                <stop offset="0.5625" stop-color="#32426D" />
            </linearGradient>
        </defs>
    </svg>


)

export const ResumeHealthCheckImgCard = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1C5.939 1 1 5.939 1 12C1 18.061 5.939 23 12 23C18.061 23 23 18.061 23 12C23 5.939 18.061 1 12 1ZM17.258 9.47L11.021 15.707C10.867 15.861 10.658 15.949 10.438 15.949C10.218 15.949 10.009 15.861 9.855 15.707L6.742 12.594C6.423 12.275 6.423 11.747 6.742 11.428C7.061 11.109 7.589 11.109 7.908 11.428L10.438 13.958L16.092 8.304C16.411 7.985 16.939 7.985 17.258 8.304C17.577 8.623 17.577 9.14 17.258 9.47Z" fill="url(#paint0_linear_13544_128743)" />
        <defs>
            <linearGradient id="paint0_linear_13544_128743" x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                <stop stop-color="#67B26F" />
                <stop offset="1" stop-color="#4CA2CD" />
            </linearGradient>
        </defs>
    </svg>


)

export const ResumeHealthCheckCard = () => {
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1C5.939 1 1 5.939 1 12C1 18.061 5.939 23 12 23C18.061 23 23 18.061 23 12C23 5.939 18.061 1 12 1ZM17.258 9.47L11.021 15.707C10.867 15.861 10.658 15.949 10.438 15.949C10.218 15.949 10.009 15.861 9.855 15.707L6.742 12.594C6.423 12.275 6.423 11.747 6.742 11.428C7.061 11.109 7.589 11.109 7.908 11.428L10.438 13.958L16.092 8.304C16.411 7.985 16.939 7.985 17.258 8.304C17.577 8.623 17.577 9.14 17.258 9.47Z" fill="url(#paint0_linear_13544_128743)" />
        <defs>
            <linearGradient id="paint0_linear_13544_128743" x1="12" y1="1" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                <stop stop-color="#67B26F" />
                <stop offset="1" stop-color="#4CA2CD" />
            </linearGradient>
        </defs>
    </svg>
}

export const ResumeExternalLink = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.5 11.9167V17.4167C16.5 17.9029 16.3068 18.3692 15.963 18.713C15.6192 19.0568 15.1529 19.25 14.6667 19.25H4.58333C4.0971 19.25 3.63079 19.0568 3.28697 18.713C2.94315 18.3692 2.75 17.9029 2.75 17.4167V7.33333C2.75 6.8471 2.94315 6.38079 3.28697 6.03697C3.63079 5.69315 4.0971 5.5 4.58333 5.5H10.0833" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M13.75 2.75H19.25V8.25" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M9.16602 12.8333L19.2493 2.75" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

)
export const DotLoader = () => (
    <svg className="dot-loader" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.99826 1.77778C8.48918 1.77778 8.88715 1.37981 8.88715 0.888889C8.88715 0.397969 8.48918 0 7.99826 0C7.50734 0 7.10938 0.397969 7.10938 0.888889C7.10938 1.37981 7.50734 1.77778 7.99826 1.77778Z" fill="black" />
        <path d="M12.3434 2.2988C12.5888 1.87366 12.4432 1.33004 12.018 1.08458C11.5929 0.839116 11.0493 0.984773 10.8038 1.40991C10.5584 1.83505 10.704 2.37867 11.1292 2.62413C11.5543 2.86959 12.0979 2.72394 12.3434 2.2988Z" fill="black" />
        <path d="M14.5805 5.22792C15.0057 4.98246 15.1513 4.43884 14.9059 4.0137C14.6604 3.58856 14.1168 3.44291 13.6917 3.68837C13.2665 3.93383 13.1209 4.47745 13.3663 4.90259C13.6118 5.32773 14.1554 5.47338 14.5805 5.22792Z" fill="black" />
        <path d="M15.1115 8.88911C15.6025 8.88911 16.0004 8.49114 16.0004 8.00022C16.0004 7.5093 15.6025 7.11133 15.1115 7.11133C14.6206 7.11133 14.2227 7.5093 14.2227 8.00022C14.2227 8.49114 14.6206 8.88911 15.1115 8.88911Z" fill="black" />
        <path d="M14.9137 12.0215C15.1591 11.5963 15.0135 11.0527 14.5884 10.8072C14.1632 10.5618 13.6196 10.7074 13.3741 11.1326C13.1287 11.5577 13.2743 12.1013 13.6995 12.3468C14.1246 12.5922 14.6682 12.4466 14.9137 12.0215Z" fill="black" />
        <path d="M11.9868 14.9037C12.4119 14.6582 12.5576 14.1146 12.3121 13.6895C12.0667 13.2643 11.523 13.1187 11.0979 13.3641C10.6728 13.6096 10.5271 14.1532 10.7726 14.5784C11.018 15.0035 11.5617 15.1492 11.9868 14.9037Z" fill="black" />
        <path d="M7.99826 16.0004C8.48918 16.0004 8.88715 15.6025 8.88715 15.1115C8.88715 14.6206 8.48918 14.2227 7.99826 14.2227C7.50734 14.2227 7.10938 14.6206 7.10938 15.1115C7.10938 15.6025 7.50734 16.0004 7.99826 16.0004Z" fill="black" />
        <path d="M5.19103 14.5918C5.43649 14.1666 5.29083 13.623 4.8657 13.3775C4.44056 13.1321 3.89694 13.2777 3.65148 13.7029C3.40602 14.128 3.55167 14.6716 3.97681 14.9171C4.40195 15.1626 4.94557 15.0169 5.19103 14.5918Z" fill="black" />
        <path d="M2.31101 12.31C2.73615 12.0645 2.8818 11.5209 2.63634 11.0957C2.39088 10.6706 1.84726 10.5249 1.42212 10.7704C0.996985 11.0159 0.851328 11.5595 1.09679 11.9846C1.34225 12.4098 1.88587 12.5554 2.31101 12.31Z" fill="black" />
        <path d="M0.888889 8.88911C1.37981 8.88911 1.77778 8.49114 1.77778 8.00022C1.77778 7.5093 1.37981 7.11133 0.888889 7.11133C0.397969 7.11133 0 7.5093 0 8.00022C0 8.49114 0.397969 8.88911 0.888889 8.88911Z" fill="black" />
        <path d="M2.62463 4.8652C2.87008 4.44007 2.72443 3.89644 2.29929 3.65098C1.87416 3.40552 1.33053 3.55118 1.08507 3.97632C0.83961 4.40145 0.985266 4.94508 1.4104 5.19054C1.83554 5.436 2.37917 5.29034 2.62463 4.8652Z" fill="black" />
    </svg>
)

export const UploadIconCloud = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18" fill="none">
        <path d="M13.0654 2.42188C13.2574 2.42206 13.4061 2.58108 13.4062 2.76855C13.4062 2.95611 13.2575 3.11505 13.0654 3.11523C12.1047 3.11523 11.2318 3.73404 10.8848 4.64551L10.8232 4.83105C10.7811 4.97729 10.6494 5.075 10.5029 5.07812L10.4902 5.09375L10.3965 5.06543C10.2141 5.00953 10.1157 4.81572 10.168 4.63574L10.2461 4.40137C10.6821 3.24832 11.7756 2.42188 13.0654 2.42188Z" fill="#231F20" stroke="#231F20" stroke-width="0.3" />
        <path d="M4.95605 2.14746C6.81647 0.0878991 10.0938 0.338315 11.627 2.67969C12.0683 2.44444 12.5573 2.32135 13.0635 2.32129C14.797 2.32129 16.1741 3.76535 16.1846 5.49414C17.9154 5.71679 19.2498 7.23264 19.25 9.05469C19.25 10.9667 17.7803 12.5437 15.9258 12.6406L15.7451 12.6455H14.5957C14.3772 12.6454 14.2032 12.4876 14.1631 12.2871L14.1543 12.1992L14.1631 12.1104C14.2033 11.91 14.3772 11.752 14.5957 11.752H15.7451C17.1846 11.7518 18.3672 10.5476 18.3672 9.05469C18.367 7.56197 17.1845 6.3586 15.7451 6.3584H15.7168C15.5866 6.3583 15.4649 6.29951 15.3818 6.20117C15.2992 6.1033 15.2625 5.97492 15.2803 5.84863L15.2979 5.68262C15.3017 5.62737 15.3037 5.57251 15.3037 5.51855C15.3037 4.24219 14.2919 3.21387 13.0635 3.21387C12.6442 3.21395 12.2424 3.33191 11.8896 3.55664L11.7422 3.65918C11.549 3.80483 11.2863 3.76401 11.1406 3.58984L11.0859 3.50684C9.9871 1.3599 7.17943 1.01637 5.61133 2.74609L5.46289 2.91992C4.81547 3.73266 4.56028 4.79121 4.76465 5.82422L4.77344 5.92383C4.76697 6.15486 4.58235 6.3584 4.33203 6.3584H4.25488C2.81544 6.35864 1.63281 7.56277 1.63281 9.05566C1.63302 10.5484 2.81557 11.7527 4.25488 11.7529H5.4043C5.65409 11.753 5.8457 11.9588 5.8457 12.1992C5.84556 12.4395 5.65401 12.6455 5.4043 12.6455H4.25488C2.31617 12.6453 0.750211 11.029 0.75 9.05566C0.75 7.22905 2.09114 5.70908 3.82812 5.49219C3.73519 4.36629 4.0684 3.24695 4.77539 2.35938L4.95605 2.14746Z" fill="#231F20" stroke="#231F20" stroke-width="0.5" />
        <path d="M9.9751 6.92383C12.7589 6.92383 15.0122 9.24545 15.0122 12.0859C15.0122 14.9264 12.7589 17.248 9.9751 17.248C7.19141 17.248 4.93802 14.9263 4.93799 12.0859C4.93799 9.24554 7.19135 6.92392 9.9751 6.92383ZM9.9751 7.81641C7.69079 7.8165 5.8208 9.72623 5.8208 12.0859C5.82084 14.4456 7.69085 16.3544 9.9751 16.3545C12.2594 16.3545 14.1294 14.4457 14.1294 12.0859C14.1294 9.72614 12.2594 7.81641 9.9751 7.81641Z" fill="#231F20" stroke="#231F20" stroke-width="0.5" />
        <path d="M10.1416 9.93945C10.3222 9.97727 10.451 10.1404 10.4512 10.3252V14.0654C10.4512 14.2769 10.2827 14.4587 10.0615 14.459C9.84003 14.459 9.6709 14.2768 9.6709 14.0654V10.3252L9.67871 10.248C9.71397 10.0714 9.86765 9.93164 10.0615 9.93164L10.1416 9.93945Z" fill="#231F20" stroke="#231F20" stroke-width="0.5" />
        <path d="M9.78369 10.0498C9.91755 9.91221 10.1263 9.89498 10.2788 9.99805L10.3403 10.0488L11.4614 11.2002L11.5112 11.2617C11.6089 11.4133 11.5915 11.6169 11.4614 11.751L11.4624 11.752C11.4055 11.8106 11.3339 11.8474 11.2593 11.8623L11.1831 11.8701C11.1071 11.87 11.0313 11.8476 10.9663 11.8037L10.9058 11.7529L10.062 10.8857L9.21826 11.751L9.21924 11.752C9.08546 11.8895 8.87657 11.9066 8.72412 11.8037L8.6626 11.7529C8.5132 11.5996 8.5132 11.3535 8.6626 11.2002L9.78369 10.0488V10.0498Z" fill="#231F20" stroke="#231F20" stroke-width="0.5" />
    </svg>
)
export const LockedCircledIconGray = () => (
    <svg width="2rem" height="2rem" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'grayscale(1)' }}>
        <circle cx="16" cy="16" r="15.25" stroke="#9A8307" stroke-width="1.5" />
        <path d="M20.6667 15.333H11.3333C10.597 15.333 10 15.93 10 16.6663V21.333C10 22.0694 10.597 22.6663 11.3333 22.6663H20.6667C21.403 22.6663 22 22.0694 22 21.333V16.6663C22 15.93 21.403 15.333 20.6667 15.333Z" stroke="#9A8307" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12.668 15.333V12.6663C12.668 11.7823 13.0192 10.9344 13.6443 10.3093C14.2694 9.6842 15.1172 9.33301 16.0013 9.33301C16.8854 9.33301 17.7332 9.6842 18.3583 10.3093C18.9834 10.9344 19.3346 11.7823 19.3346 12.6663V15.333" stroke="#9A8307" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)
export const GmailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66" width="24" height="24">
        <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6" />
        <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15" />
        <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2" />
        <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92" />
        <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2" />
    </svg>
)

export const ResumeRebulidIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 15.8333L15.8333 10L18.3333 12.5L12.5 18.3333L10 15.8333Z" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M14.9993 10.8337L13.7493 4.58366L1.66602 1.66699L4.58268 13.7503L10.8327 15.0003L14.9993 10.8337Z" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M1.66602 1.66699L7.98768 7.98866" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M9.16667 10.8333C10.0871 10.8333 10.8333 10.0871 10.8333 9.16667C10.8333 8.24619 10.0871 7.5 9.16667 7.5C8.24619 7.5 7.5 8.24619 7.5 9.16667C7.5 10.0871 8.24619 10.8333 9.16667 10.8333Z" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
};

export const FormatIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.6673 1.66699H5.00065C4.55862 1.66699 4.1347 1.84259 3.82214 2.15515C3.50958 2.46771 3.33398 2.89163 3.33398 3.33366V16.667C3.33398 17.109 3.50958 17.5329 3.82214 17.8455C4.1347 18.1581 4.55862 18.3337 5.00065 18.3337H15.0007C15.4427 18.3337 15.8666 18.1581 16.1792 17.8455C16.4917 17.5329 16.6673 17.109 16.6673 16.667V6.66699L11.6673 1.66699Z" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M13.3327 14.167H6.66602" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M13.3327 10.833H6.66602" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8.33268 7.5H7.49935H6.66602" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M11.666 1.66699V6.66699H16.666" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
};

export const ImpactDrivenLanguageIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.8327 13.75V18.3333L13.9219 15.2441C14.0782 15.0878 14.166 14.8758 14.166 14.6548V9.16667L15.8327 7.5C16.7874 6.54522 17.4994 5.34143 17.4994 3.99117V2.5H16.0082C14.6579 2.5 13.4541 3.21188 12.4994 4.16667L10.8993 5.83333H5.34452C5.12352 5.83333 4.91155 5.92113 4.75527 6.07741L1.66602 9.16667H6.24935M9.99935 10L5.83268 14.1667" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
};

export const GoogleDocsFormatIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5.83398 8.33301L10.0007 12.4997L14.1673 8.33301" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 12.5V2.5" stroke="#27A75D" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
};

export const GuaranteeIcon = () => {
    return (
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.5 0.734375C9.14517 0.734375 9.75926 0.94549 10.7168 1.27344L11.2021 1.43945C12.1881 1.77695 12.9532 2.03882 13.502 2.26172C13.7784 2.37402 14.0197 2.48475 14.2158 2.59863C14.4034 2.70756 14.6021 2.84869 14.7393 3.04395C14.8747 3.23688 14.9424 3.46969 14.9834 3.68262C15.0263 3.90532 15.0511 4.17018 15.0674 4.46973C15.0998 5.06436 15.0996 5.87755 15.0996 6.92676V7.99512C15.0995 12.124 11.9791 14.0996 10.1416 14.9023L10.123 14.9102C9.89749 15.0087 9.67742 15.105 9.42383 15.1699C9.1549 15.2388 8.87146 15.2676 8.5 15.2676C8.12854 15.2676 7.8451 15.2388 7.57617 15.1699C7.32257 15.105 7.10251 15.0087 6.87695 14.9102L6.8584 14.9023C5.02094 14.0996 1.90051 12.124 1.90039 7.99512V6.92676C1.90039 5.87755 1.90025 5.06436 1.93262 4.46973C1.94893 4.17018 1.9737 3.90532 2.0166 3.68262C2.05763 3.46969 2.12533 3.23688 2.26074 3.04395C2.39788 2.84869 2.59662 2.70756 2.78418 2.59863C2.98031 2.48475 3.2216 2.37402 3.49805 2.26172C4.04677 2.03882 4.8119 1.77695 5.79785 1.43945L6.2832 1.27344L6.94238 1.05078C7.54948 0.852864 8.01602 0.734375 8.5 0.734375ZM8.5 1.93359C8.08208 1.93359 7.66893 2.06777 6.58594 2.43848L6.2041 2.56836C5.19446 2.91396 4.46231 3.16558 3.94922 3.37402C3.69358 3.47788 3.51182 3.56313 3.38672 3.63574C3.32513 3.67151 3.28441 3.69969 3.25977 3.71973C3.25211 3.72595 3.24679 3.73097 3.24316 3.73438C3.24091 3.73937 3.23741 3.74753 3.2334 3.75879C3.22227 3.7901 3.20896 3.83844 3.19531 3.90918C3.16745 4.05375 3.14601 4.257 3.13086 4.53516C3.10053 5.09253 3.09961 5.8721 3.09961 6.94531V7.99512C3.09972 11.3833 5.63061 13.0565 7.33887 13.8027C7.5881 13.9116 7.72406 13.9684 7.87402 14.0068C8.01544 14.043 8.19198 14.0674 8.5 14.0674C8.80803 14.0674 8.98456 14.043 9.12598 14.0068C9.27594 13.9684 9.4119 13.9116 9.66113 13.8027C11.3694 13.0565 13.9003 11.3833 13.9004 7.99512V6.94531C13.9004 5.8721 13.8995 5.09253 13.8691 4.53516C13.854 4.257 13.8325 4.05375 13.8047 3.90918C13.791 3.83844 13.7777 3.7901 13.7666 3.75879C13.7625 3.74725 13.7581 3.73935 13.7559 3.73438C13.7522 3.731 13.7475 3.72566 13.7402 3.71973C13.7156 3.69969 13.6749 3.67151 13.6133 3.63574C13.4882 3.56313 13.3064 3.47788 13.0508 3.37402C12.5377 3.16558 11.8055 2.91396 10.7959 2.56836L10.4141 2.43848C9.33107 2.06777 8.91792 1.93359 8.5 1.93359ZM9.71875 6.26758C9.93945 6.0204 10.3192 5.99903 10.5664 6.21973C10.8135 6.44043 10.8349 6.82022 10.6143 7.06738L8.2334 9.7334C8.11966 9.86079 7.9569 9.93347 7.78613 9.93359C7.61521 9.93359 7.45173 9.8609 7.33789 9.7334L6.38574 8.66699C6.16504 8.41981 6.18641 8.04003 6.43359 7.81934C6.68078 7.59877 7.06059 7.62103 7.28125 7.86816L7.78516 8.43262L9.71875 6.26758Z" fill="#32936F" stroke="#32936F" stroke-width="0.2" stroke-linecap="round" />
        </svg>
    );
};

export const GreenCheckIcon = ({ height = "14px", width = "14px", stroke = "#32936F" }) => {
    return (
        <svg width={width} height={height} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.6673 3.5L5.25065 9.91667L2.33398 7" stroke={stroke} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
};

export const PricingIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.88351 10.9346L10.8335 1.66797L10.0002 8.33463H16.5216C16.9102 8.33463 17.1225 8.78788 16.8737 9.08638L9.16685 18.3346L10.0002 11.668H4.25018C3.8725 11.668 3.6569 11.2368 3.88351 10.9346Z" fill="url(#paint0_linear_21331_13671)" stroke="url(#paint1_linear_21331_13671)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <defs>
                <linearGradient id="paint0_linear_21331_13671" x1="3.62614" y1="11.5291" x2="16.9901" y2="11.4429" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#4F26F7" />
                    <stop offset="1" stop-color="#848EFA" />
                </linearGradient>
                <linearGradient id="paint1_linear_21331_13671" x1="3.62614" y1="11.5291" x2="16.9901" y2="11.4429" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#4F26F7" />
                    <stop offset="1" stop-color="#848EFA" />
                </linearGradient>
            </defs>
        </svg>
    );
};

export const QuoteIcon = () => {
    return (
        <svg width="19" height="13" viewBox="0 0 19 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.4261 13L15.0267 0H19L15.8931 13H10.4261ZM0 13L4.60063 0H8.5739L5.43711 13H0Z" fill="#D3D7DF" />
        </svg>
    );
};


export const SampleReportIcon = () => {
    return (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.5014 1.0293H4.48187C4.20293 1.0293 3.98382 1.2484 3.98382 1.52734V13.9785C3.98382 14.5264 3.53561 14.9746 2.98773 14.9746C2.70879 14.9746 2.48968 15.1937 2.48968 15.4727C2.48968 15.6121 1.85218 15.7316 1.22461 15.8113C1.46367 15.9209 1.72266 15.9707 1.99163 15.9707H14.5092C15.8838 15.9707 16.9994 14.8551 16.9994 13.4805V1.52734C16.9994 1.2484 16.7803 1.0293 16.5014 1.0293Z" fill="url(#paint0_linear_21491_55483)" />
            <path d="M0.498047 10.9902C0.222992 10.9902 0 11.2132 0 11.4883V13.9785C0 14.7953 0.508008 15.5125 1.2152 15.8113C1.22516 15.8213 1.22516 15.8113 1.22516 15.8113C1.44985 15.9143 1.69216 15.9645 1.94384 15.9702C3.06574 15.9954 3.98438 14.9959 3.98438 13.8737V10.9902H0.498047ZM6.00977 8.99805H9.99414C10.2694 8.99805 10.4922 8.77529 10.4922 8.5V4.51562C10.4922 4.24034 10.2694 4.01758 9.99414 4.01758H6.00977C5.73448 4.01758 5.51172 4.24034 5.51172 4.51562V8.5C5.51172 8.77529 5.73448 8.99805 6.00977 8.99805ZM12.0195 5.01367H15.0078C15.2831 5.01367 15.5059 4.79091 15.5059 4.51562C15.5059 4.24034 15.2831 4.01758 15.0078 4.01758H12.0195C11.7442 4.01758 11.5215 4.24034 11.5215 4.51562C11.5215 4.79091 11.7442 5.01367 12.0195 5.01367ZM15.0078 6.00977H12.0195C11.7442 6.00977 11.5215 6.23253 11.5215 6.50781C11.5215 6.7831 11.7442 7.00586 12.0195 7.00586H15.0078C15.2831 7.00586 15.5059 6.7831 15.5059 6.50781C15.5059 6.23253 15.2831 6.00977 15.0078 6.00977ZM15.0078 8.00195H12.0195C11.7442 8.00195 11.5215 8.22471 11.5215 8.5C11.5215 8.77529 11.7442 8.99805 12.0195 8.99805H15.0078C15.2831 8.99805 15.5059 8.77529 15.5059 8.5C15.5059 8.22471 15.2831 8.00195 15.0078 8.00195ZM15.0078 9.99414H6.00977C5.73448 9.99414 5.51172 10.2169 5.51172 10.4922C5.51172 10.7675 5.73448 10.9902 6.00977 10.9902H15.0078C15.2831 10.9902 15.5059 10.7675 15.5059 10.4922C15.5059 10.2169 15.2831 9.99414 15.0078 9.99414ZM15.0078 11.9863H6.00977C5.73448 11.9863 5.51172 12.2091 5.51172 12.4844C5.51172 12.7597 5.73448 12.9824 6.00977 12.9824H15.0078C15.2831 12.9824 15.5059 12.7597 15.5059 12.4844C15.5059 12.2091 15.2831 11.9863 15.0078 11.9863Z" fill="url(#paint1_linear_21491_55483)" />
            <defs>
                <linearGradient id="paint0_linear_21491_55483" x1="9.11204" y1="15.9707" x2="9.11204" y2="1.0293" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#5558FF" />
                    <stop offset="1" stop-color="#00C0FF" />
                </linearGradient>
                <linearGradient id="paint1_linear_21491_55483" x1="7.75293" y1="15.9706" x2="7.75293" y2="4.01758" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#ADDCFF" />
                    <stop offset="0.5028" stop-color="#EAF6FF" />
                    <stop offset="1" stop-color="#EAF6FF" />
                </linearGradient>
            </defs>
        </svg>
    )
}

export const OptionIcon = () => {
    return (
        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12Z" fill="#6B6B6B" />
            <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12Z" fill="#6B6B6B" />
            <path d="M21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12Z" fill="#6B6B6B" />
        </svg>
    );
};

export const TopArrowIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="top-arrow-icon" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M208.49,120.49a12,12,0,0,1-17,0L140,69V216a12,12,0,0,1-24,0V69L64.49,120.49a12,12,0,0,1-17-17l72-72a12,12,0,0,1,17,0l72,72A12,12,0,0,1,208.49,120.49Z"></path>
        </svg>
    )
}

export const PlusChatIcon = ({ fill }) => {
    return (
        <svg width="16" height="16" viewBox="0 0 20 20" fill={fill ?? 'currentColor'} xmlns="http://www.w3.org/2000/svg" class="shrink-0 group-hover:scale-105 transition text-always-white" aria-hidden="true">
            <path d="M10 3C10.4142 3 10.75 3.33579 10.75 3.75V9.25H16.25C16.6642 9.25 17 9.58579 17 10C17 10.3882 16.7051 10.7075 16.3271 10.7461L16.25 10.75H10.75V16.25C10.75 16.6642 10.4142 17 10 17C9.58579 17 9.25 16.6642 9.25 16.25V10.75H3.75C3.33579 10.75 3 10.4142 3 10C3 9.58579 3.33579 9.25 3.75 9.25H9.25V3.75C9.25 3.33579 9.58579 3 10 3Z"></path>
        </svg>
    )
}

export const ChatIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M11 18H7a1 1 0 0 0-.71.29L4 20.59V7.74A.74.74 0 0 1 4.74 7h13.52a.74.74 0 0 1 .74.74V9a1 1 0 0 0 2 0V7.74A2.74 2.74 0 0 0 18.26 5H4.74A2.74 2.74 0 0 0 2 7.74V23a1 1 0 0 0 .62.92A.84.84 0 0 0 3 24a1 1 0 0 0 .71-.29L7.41 20H11a1 1 0 0 0 0-2z" />
            <path d="M29 18a1 1 0 0 0 1-1v-3.26A2.74 2.74 0 0 0 27.26 11H15.74A2.74 2.74 0 0 0 13 13.74v7.52A2.74 2.74 0 0 0 15.74 24h8.85l3.7 3.71A1 1 0 0 0 29 28a.84.84 0 0 0 .38-.08A1 1 0 0 0 30 27v-6a1 1 0 0 0-2 0v3.59l-2.29-2.3A1 1 0 0 0 25 22h-9.26a.74.74 0 0 1-.74-.74v-7.52a.74.74 0 0 1 .74-.74h11.52a.74.74 0 0 1 .74.74V17a1 1 0 0 0 1 1z" />
        </svg>
    )
}

export const ToggleSidebarIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" class="shrink-0 group-hover:scale-80 transition scale-100 text-text-300" aria-hidden="true">
            <path d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM7 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H7V15ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H6V5H3.5Z"></path>
        </svg>
    )
}

export const HemBurgerIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-menu-2 tabler-icon">
            <path d="M4 6l16 0"></path>
            <path d="M4 12l16 0"></path>
            <path d="M4 18l16 0"></path>
        </svg>
    )
}

export const SpinnerLoader = () => {
    return <div className="spinner-loader"></div>
}

export const GradientFlashIcon = () => (
    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.10525 9.24732L8.66525 1.83398L7.99858 7.16732H13.2157C13.5266 7.16732 13.6964 7.52992 13.4974 7.76872L7.33191 15.1673L7.99858 9.83398H3.39858C3.09643 9.83398 2.92396 9.48905 3.10525 9.24732Z" fill="url(#paint0_linear_23365_40358)" stroke="url(#paint1_linear_23365_40358)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        <defs>
            <linearGradient id="paint0_linear_23365_40358" x1="2.89935" y1="9.72287" x2="13.5905" y2="9.65393" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4F26F7" />
                <stop offset="1" stop-color="#848EFA" />
            </linearGradient>
            <linearGradient id="paint1_linear_23365_40358" x1="2.89935" y1="9.72287" x2="13.5905" y2="9.65393" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4F26F7" />
                <stop offset="1" stop-color="#848EFA" />
            </linearGradient>
        </defs>
    </svg>
)

export const WhiteFlashIcon = () => {
    return (
        <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.88351 10.9346L10.8335 1.66797L10.0002 8.33463H16.5216C16.9102 8.33463 17.1225 8.78788 16.8737 9.08638L9.16685 18.3346L10.0002 11.668H4.25018C3.8725 11.668 3.6569 11.2368 3.88351 10.9346Z" fill="white" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const GoldenFlashIcon = () => {
    return (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.14261 11.6637L11.5559 1.7793L10.6671 8.89041H17.6232C18.0377 8.89041 18.2642 9.37387 17.9988 9.69227L9.77817 19.5571L10.6671 12.446H4.53372C4.13086 12.446 3.90089 11.986 4.14261 11.6637Z" fill="url(#paint0_linear_25175_115029)" stroke="url(#paint1_linear_25175_115029)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <defs>
                <linearGradient id="paint0_linear_25175_115029" x1="1.46461" y1="11.0915" x2="15.2646" y2="4.82183" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFDA30" />
                    <stop offset="0.817708" stop-color="#FCB101" />
                </linearGradient>
                <linearGradient id="paint1_linear_25175_115029" x1="1.46461" y1="11.0915" x2="15.2646" y2="4.82183" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FFDA30" />
                    <stop offset="0.817708" stop-color="#FCB101" />
                </linearGradient>
            </defs>
        </svg>
    )
}

export const ThumbsDownIcon = () => {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_22188_384923)">
                <path d="M9.91644 1.16623H11.4739C11.8041 1.16039 12.1249 1.27597 12.3754 1.49104C12.626 1.7061 12.7888 2.00568 12.8331 2.33289V6.41623C12.7888 6.74344 12.626 7.04302 12.3754 7.25808C12.1249 7.47315 11.8041 7.58873 11.4739 7.58289H9.91644M5.83311 8.74956V11.0829C5.83311 11.547 6.01748 11.9921 6.34567 12.3203C6.67386 12.6485 7.11898 12.8329 7.58311 12.8329L9.91644 7.58289V1.16623H3.33644C3.05508 1.16305 2.78205 1.26166 2.56766 1.44389C2.35327 1.62612 2.21196 1.8797 2.16977 2.15789L1.36477 7.40789C1.33939 7.5751 1.35067 7.74583 1.39783 7.90825C1.44498 8.07066 1.52688 8.22089 1.63786 8.34851C1.74883 8.47613 1.88623 8.5781 2.04052 8.64735C2.19482 8.7166 2.36233 8.75147 2.53144 8.74956H5.83311Z" stroke="#231F20" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_22188_384923">
                    <rect width="14" height="14" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}

export const CheckIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M16 8C16 12.4183 12.4183 16 8 16C3.58172 16 4.98403e-10 12.4183 4.98403e-10 8C4.98403e-10 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8Z" fill="#F7F7F7" />
            <path d="M8 0C6.41775 0 4.87103 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6568C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7601 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C15.9959 5.87952 15.1518 3.84705 13.6524 2.34764C12.153 0.848226 10.1205 0.00406613 8 0ZM11.8077 6.6L7.3 10.9077C7.18347 11.0173 7.02923 11.0779 6.86923 11.0769C6.79103 11.078 6.71339 11.0637 6.64077 11.0346C6.56816 11.0056 6.50201 10.9624 6.44616 10.9077L4.19231 8.75384C4.1298 8.6993 4.07896 8.63268 4.04285 8.55799C4.00674 8.4833 3.9861 8.40208 3.98218 8.31922C3.97826 8.23635 3.99113 8.15354 4.02003 8.07578C4.04893 7.99801 4.09325 7.92689 4.15034 7.86669C4.20742 7.80649 4.27609 7.75846 4.35221 7.72548C4.42834 7.69249 4.51034 7.67524 4.5933 7.67476C4.67626 7.67428 4.75846 7.69057 4.83496 7.72267C4.91146 7.75477 4.98068 7.802 5.03846 7.86153L6.86923 9.60769L10.9615 5.70769C11.0812 5.6033 11.2366 5.5492 11.3952 5.5567C11.5538 5.56421 11.7034 5.63273 11.8126 5.74796C11.9219 5.86318 11.9824 6.01618 11.9815 6.17497C11.9806 6.33376 11.9183 6.48605 11.8077 6.6Z" fill="#32936F" />
        </svg>
    )
}

export const CheckIconSvg = () => {
    return (
        <svg width="12px" height="12px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" className="active-checkmark iconify iconify--twemoji">
        <path fill="#31373D" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z" />
    </svg>
    )
}

export const PenIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <g clip-path="url(#clip0_23547_48025)">
                <path d="M10.625 1.87519C10.7892 1.71104 10.984 1.58082 11.1985 1.49199C11.413 1.40315 11.6429 1.35742 11.875 1.35742C12.1071 1.35742 12.337 1.40315 12.5515 1.49199C12.766 1.58082 12.9608 1.71104 13.125 1.87519C13.2892 2.03934 13.4194 2.23422 13.5082 2.44869C13.597 2.66317 13.6428 2.89304 13.6428 3.12519C13.6428 3.35734 13.597 3.58721 13.5082 3.80168C13.4194 4.01616 13.2892 4.21104 13.125 4.37519L4.6875 12.8127L1.25 13.7502L2.1875 10.3127L10.625 1.87519Z" stroke="#002DCB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_23547_48025">
                    <rect width="15" height="15" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}

export const JobsStateIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building2 w-5 h-5 text-primary" data-lov-id="src/components/HeroSection.tsx:43:18" data-lov-name="Building2" data-component-path="src/components/HeroSection.tsx" data-component-line="43" data-component-file="HeroSection.tsx" data-component-name="Building2" data-component-content="%7B%22className%22%3A%22w-5%20h-5%20text-primary%22%7D">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
            <path d="M10 6h4"></path>
            <path d="M10 10h4"></path>
            <path d="M10 14h4"></path>
            <path d="M10 18h4"></path>
        </svg>
    )
}
export const LogoutIcon = () => {
    return (
        <svg width="18px" height="18px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" transform="matrix(-1, 0, 0, 1, 0, 0)" stroke="#ffffff">

            <g id="SVGRepo_bgCarrier" stroke-width="0" />

            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

            <g id="SVGRepo_iconCarrier"> <path d="M12.9999 2C10.2385 2 7.99991 4.23858 7.99991 7C7.99991 7.55228 8.44762 8 8.99991 8C9.55219 8 9.99991 7.55228 9.99991 7C9.99991 5.34315 11.3431 4 12.9999 4H16.9999C18.6568 4 19.9999 5.34315 19.9999 7V17C19.9999 18.6569 18.6568 20 16.9999 20H12.9999C11.3431 20 9.99991 18.6569 9.99991 17C9.99991 16.4477 9.55219 16 8.99991 16C8.44762 16 7.99991 16.4477 7.99991 17C7.99991 19.7614 10.2385 22 12.9999 22H16.9999C19.7613 22 21.9999 19.7614 21.9999 17V7C21.9999 4.23858 19.7613 2 16.9999 2H12.9999Z" fill="#2d2c2c" /> <path d="M13.9999 11C14.5522 11 14.9999 11.4477 14.9999 12C14.9999 12.5523 14.5522 13 13.9999 13V11Z" fill="#2d2c2c" /> <path d="M5.71783 11C5.80685 10.8902 5.89214 10.7837 5.97282 10.682C6.21831 10.3723 6.42615 10.1004 6.57291 9.90549C6.64636 9.80795 6.70468 9.72946 6.74495 9.67492L6.79152 9.61162L6.804 9.59454L6.80842 9.58848C6.80846 9.58842 6.80892 9.58778 5.99991 9L6.80842 9.58848C7.13304 9.14167 7.0345 8.51561 6.58769 8.19098C6.14091 7.86637 5.51558 7.9654 5.19094 8.41215L5.18812 8.41602L5.17788 8.43002L5.13612 8.48679C5.09918 8.53682 5.04456 8.61033 4.97516 8.7025C4.83623 8.88702 4.63874 9.14542 4.40567 9.43937C3.93443 10.0337 3.33759 10.7481 2.7928 11.2929L2.08569 12L2.7928 12.7071C3.33759 13.2519 3.93443 13.9663 4.40567 14.5606C4.63874 14.8546 4.83623 15.113 4.97516 15.2975C5.04456 15.3897 5.09918 15.4632 5.13612 15.5132L5.17788 15.57L5.18812 15.584L5.19045 15.5872C5.51509 16.0339 6.14091 16.1336 6.58769 15.809C7.0345 15.4844 7.13355 14.859 6.80892 14.4122L5.99991 15C6.80892 14.4122 6.80897 14.4123 6.80892 14.4122L6.804 14.4055L6.79152 14.3884L6.74495 14.3251C6.70468 14.2705 6.64636 14.1921 6.57291 14.0945C6.42615 13.8996 6.21831 13.6277 5.97282 13.318C5.89214 13.2163 5.80685 13.1098 5.71783 13H13.9999V11H5.71783Z" fill="#2d2c2c" /> </g>

        </svg>
    )
}

export const CompaniesStateIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-5 h-5 text-primary" data-lov-id="src/components/HeroSection.tsx:52:18" data-lov-name="Users" data-component-path="src/components/HeroSection.tsx" data-component-line="52" data-component-file="HeroSection.tsx" data-component-name="Users" data-component-content="%7B%22className%22%3A%22w-5%20h-5%20text-primary%22%7D">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    )
}

export const RateStateIcon = ({ className = "" }) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class={`lucide lucide-trending-up w-5 h-5 ${className}`} data-lov-id="src/components/HeroSection.tsx:61:18" data-lov-name="TrendingUp" data-component-path="src/components/HeroSection.tsx" data-component-line="61" data-component-file="HeroSection.tsx" data-component-name="TrendingUp" data-component-content="%7B%22className%22%3A%22w-5%20h-5%20text-primary%22%7D">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
        </svg>
    )
}

export const SmartJobAlertsIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bell w-6 h-6" data-lov-id="src/components/Features.tsx:60:20" data-lov-name="Icon" data-component-path="src/components/Features.tsx" data-component-line="60" data-component-file="Features.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-6%20h-6%20text-white%22%7D"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
    )
}

export const PrecisionMatchingIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-target w-6 h-6" data-lov-id="src/components/Features.tsx:60:20" data-lov-name="Icon" data-component-path="src/components/Features.tsx" data-component-line="60" data-component-file="Features.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-6%20h-6%20text-white%22%7D"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
    )
}

export const VerifiedCompaniesIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield w-6 h-6" data-lov-id="src/components/Features.tsx:60:20" data-lov-name="Icon" data-component-path="src/components/Features.tsx" data-component-line="60" data-component-file="Features.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-6%20h-6%20text-white%22%7D"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>
    )
}

export const ProductCompaniesIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building2 w-6 h-6" data-lov-id="src/components/Features.tsx:60:20" data-lov-name="Icon" data-component-path="src/components/Features.tsx" data-component-line="60" data-component-file="Features.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-6%20h-6%20text-white%22%7D"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
    )
}

export const RemoteJobsIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe w-6 h-6" data-lov-id="src/components/Features.tsx:60:20" data-lov-name="Icon" data-component-path="src/components/Features.tsx" data-component-line="60" data-component-file="Features.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-6%20h-6%20text-white%22%7D"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
    )
}

export const CareerGrowthIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up w-6 h-6" data-lov-id="src/components/Features.tsx:60:20" data-lov-name="Icon" data-component-path="src/components/Features.tsx" data-component-line="60" data-component-file="Features.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-6%20h-6%20text-white%22%7D"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
    )
}

export const LinkAccountIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2 w-10 h-10 text-white" data-lov-id="src/pages/Index.tsx:162:22" data-lov-name="Icon" data-component-path="src/pages/Index.tsx" data-component-line="162" data-component-file="Index.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-10%20h-10%20text-white%22%7D">
            <path d="M9 17H7A5 5 0 0 1 7 7h2"></path>
            <path d="M15 7h2a5 5 0 1 1 0 10h-2"></path>
            <line x1="8" x2="16" y1="12" y2="12"></line>
        </svg>
    )
}

export const BrowseJobsIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search w-10 h-10 text-white" data-lov-id="src/pages/Index.tsx:162:22" data-lov-name="Icon" data-component-path="src/pages/Index.tsx" data-component-line="162" data-component-file="Index.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-10%20h-10%20text-white%22%7D">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
        </svg>
    )
}

export const ActivateAgentIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mouse-pointer w-10 h-10 text-white" data-lov-id="src/pages/Index.tsx:162:22" data-lov-name="Icon" data-component-path="src/pages/Index.tsx" data-component-line="162" data-component-file="Index.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-10%20h-10%20text-white%22%7D">
            <path d="M12.586 12.586 19 19"></path>
            <path d="M3.688 3.037a.497.497 0 0 0-.651.651l6.5 15.999a.501.501 0 0 0 .947-.062l1.569-6.083a2 2 0 0 1 1.448-1.479l6.124-1.579a.5.5 0 0 0 .063-.947z"></path>
        </svg>
    )
}

export const OutreachAgentIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot w-10 h-10 text-white" data-lov-id="src/pages/Index.tsx:162:22" data-lov-name="Icon" data-component-path="src/pages/Index.tsx" data-component-line="162" data-component-file="Index.tsx" data-component-name="Icon" data-component-content="%7B%22className%22%3A%22w-10%20h-10%20text-white%22%7D">
            <path d="M12 8V4H8"></path>
            <rect width="16" height="12" x="4" y="8" rx="2"></rect>
            <path d="M2 14h2"></path>
            <path d="M20 14h2"></path>
            <path d="M15 13v2"></path>
            <path d="M9 13v2"></path>
        </svg>
    )
}

export const ToolTipSVG = ({ width = '20px', height = '20px', color = '#6B6B6B' }) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <g clip-path="url(#clip0_2540_58743)">
                <path
                    d="M9.99935 18.3337C14.6017 18.3337 18.3327 14.6027 18.3327 10.0003C18.3327 5.39795 14.6017 1.66699 9.99935 1.66699C5.39698 1.66699 1.66602 5.39795 1.66602 10.0003C1.66602 14.6027 5.39698 18.3337 9.99935 18.3337Z"
                    stroke={color}
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M10 13.3333V10"
                    stroke={color}
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="M10 6.66699H10.0083"
                    stroke={color}
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </g>
            {/* <defs>
                <clipPath id="clip0_2540_58743">
                    <rect width="20" height="20" fill="white" />
                </clipPath>
            </defs> */}
        </svg >
    );
};

export const RecommendedStarIcon = ({ height = '1rem', width = '1rem', fill = '#000000' }) => {
    return (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill={fill} />
        </svg>
    )
}

export const ResumeFileIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.49984 10H12.4998M7.49984 13.3333H12.4998M14.1665 17.5H5.83317C5.39114 17.5 4.96722 17.3244 4.65466 17.0118C4.3421 16.6993 4.1665 16.2754 4.1665 15.8333V4.16667C4.1665 3.72464 4.3421 3.30072 4.65466 2.98816C4.96722 2.67559 5.39114 2.5 5.83317 2.5H10.4882C10.7092 2.50005 10.9211 2.58788 11.0773 2.74417L15.589 7.25583C15.7453 7.41208 15.8331 7.624 15.8332 7.845V15.8333C15.8332 16.2754 15.6576 16.6993 15.345 17.0118C15.0325 17.3244 14.6085 17.5 14.1665 17.5Z" stroke="#4A5565" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const WhiteArrowDropDownIcon = () => {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L8 10L12 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const GreenCheckCircleIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z" fill="#009966" />
            <path d="M5.33325 10.666L7.99992 13.3327L14.6666 6.66602" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const WarningCircleIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z" fill="#FBBF24" />
            <path d="M10.5156 5.31818L10.4162 12.6364H9.26278L9.16335 5.31818H10.5156ZM9.83949 15.5795C9.59422 15.5795 9.38376 15.4917 9.2081 15.3161C9.03243 15.1404 8.9446 14.9299 8.9446 14.6847C8.9446 14.4394 9.03243 14.2289 9.2081 14.0533C9.38376 13.8776 9.59422 13.7898 9.83949 13.7898C10.0848 13.7898 10.2952 13.8776 10.4709 14.0533C10.6465 14.2289 10.7344 14.4394 10.7344 14.6847C10.7344 14.8471 10.6929 14.9962 10.6101 15.1321C10.5305 15.268 10.4228 15.3774 10.2869 15.4602C10.1544 15.5398 10.0052 15.5795 9.83949 15.5795Z" fill="#5B3D05" />
        </svg>
    )
}

export const CancelCircleIcon = () => {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z" fill="#FFBEB1" />
            <path d="M13.9961 6L5.99609 14" stroke="#B60707" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M5.99609 6L13.9961 14" stroke="#B60707" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const WhiteArrowRightIcon = () => {
    return (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5415 8.5H13.4582" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8.5 3.54199L13.4583 8.50033L8.5 13.4587" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const TailorResumePaymentLogoBG = () => {
    return (
        <svg width="219" height="142" viewBox="0 0 219 142" fill="none" xmlns="http://www.w3.org/2000/svg" className="tailor-resume-payment-logo-bg">
            <circle cx="112.172" cy="112.172" r="112.172" transform="matrix(0.026788 0.999641 0.999641 -0.026788 12.999 -82.9902)" fill="url(#paint0_radial_25175_115016)" fill-opacity="0.8" />
            <g filter="url(#filter0_d_25175_115016)">
                <path d="M131.343 -19.8193C142.483 -22.9132 154.465 -19.8195 162.663 -11.7754C170.861 -3.73127 174.013 8.02592 171.28 19.3701L163.294 50.1025C162.873 51.9585 162.452 53.8149 161.821 55.6709L161.612 56.084V56.29C161.402 56.7025 161.192 57.3213 160.981 57.9395C152.363 85.1656 131.974 111.567 93.5068 96.7168C67.442 86.8162 32.9693 57.9396 22.249 31.9512C11.9495 7.40652 68.0722 -3.52456 90.3535 -9.2998L131.343 -19.8193ZM143.961 6.37695C142.49 4.93317 140.388 4.52025 138.286 4.93262L98.5576 15.0391C95.825 15.6578 93.9337 18.1332 93.9336 20.8145C94.1434 22.2583 94.7742 23.7021 95.8252 24.7334C96.6663 25.5584 97.7169 26.1775 98.9775 26.3838L115.794 29.6836C117.055 29.8899 118.107 30.509 118.947 31.334C119.788 32.3652 120.419 33.3965 120.629 34.4277L123.992 50.9287C124.413 53.8161 126.934 55.8787 129.667 55.8789C132.4 55.8789 134.712 54.0221 135.553 51.3408L145.643 12.3584C146.273 10.2958 145.643 8.23328 143.961 6.37695Z" fill="url(#paint1_linear_25175_115016)" fill-opacity="0.88" />
            </g>
            <defs>
                <filter id="filter0_d_25175_115016" x="0" y="-37.9995" width="197.243" height="168" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dx="2" dy="6" />
                    <feGaussianBlur stdDeviation="11.5" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_25175_115016" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_25175_115016" result="shape" />
                </filter>
                <radialGradient id="paint0_radial_25175_115016" cx="0" cy="0" r="1" gradientTransform="matrix(-31.1778 96.529 -96.1165 -49.4328 109.768 98.6605)" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#F7CF67" stop-opacity="0.8" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </radialGradient>
                <linearGradient id="paint1_linear_25175_115016" x1="20.999" y1="35.814" x2="219.61" y2="95.9158" gradientUnits="userSpaceOnUse">
                    <stop stop-color="white" />
                    <stop offset="1" stop-color="white" stop-opacity="0" />
                </linearGradient>
            </defs>
        </svg>
    )
}

export const WhiteEyeViewIcon = () => {
    return (
        <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.833496 9.99967C0.833496 9.99967 4.16683 3.33301 10.0002 3.33301C15.8335 3.33301 19.1668 9.99967 19.1668 9.99967" fill="white" />
            <path d="M0.833496 9.99967C0.833496 9.99967 4.16683 3.33301 10.0002 3.33301C15.8335 3.33301 19.1668 9.99967 19.1668 9.99967" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M0.833496 10C0.833496 10 4.16683 16.6667 10.0002 16.6667C15.8335 16.6667 19.1668 10 19.1668 10" fill="white" />
            <path d="M0.833496 10C0.833496 10 4.16683 16.6667 10.0002 16.6667C15.8335 16.6667 19.1668 10 19.1668 10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61925 11.3807 7.5 10 7.5C8.61925 7.5 7.5 8.61925 7.5 10C7.5 11.3807 8.61925 12.5 10 12.5Z" fill="#2D4FFB" stroke="#2D4FFB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const BlueFileIcon = () => {
    return (
        <svg width="1.6875rem" height="1.6875rem" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.4167 2.20215H6.60717C6.02306 2.20215 5.46287 2.43418 5.04985 2.84721C4.63682 3.26024 4.40479 3.82042 4.40479 4.40453V22.0236C4.40479 22.6077 4.63682 23.1679 5.04985 23.5809C5.46287 23.9939 6.02306 24.226 6.60717 24.226H19.8215C20.4056 24.226 20.9657 23.9939 21.3788 23.5809C21.7918 23.1679 22.0238 22.6077 22.0238 22.0236V8.80929L15.4167 2.20215Z" stroke="#6B76F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17.6191 18.7207H8.80957" stroke="#6B76F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M17.6191 14.3154H8.80957" stroke="#6B76F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M11.012 9.91113H9.91076H8.80957" stroke="#6B76F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M15.4165 2.20215V8.80929H22.0236" stroke="#6B76F1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    )
}

export const QuestionCircleIcon = () => {
    return (
        <svg viewBox="64 64 896 896" focusable="false" data-icon="question-circle" width="14px" height="14px" fill="currentColor" aria-hidden="true">
            <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
            <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z"></path>
        </svg>
    )
}

export const WarningTriangleIcon = ({ expired = false }) => {
    return (
        <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_25991_10061)">
                <path d="M8.57502 3.21635L1.51668 14.9997C1.37116 15.2517 1.29416 15.5374 1.29334 15.8284C1.29253 16.1195 1.36793 16.4056 1.51204 16.6585C1.65615 16.9113 1.86396 17.122 2.11477 17.2696C2.36559 17.4171 2.65068 17.4965 2.94168 17.4997H17.0583C17.3493 17.4965 17.6344 17.4171 17.8853 17.2696C18.1361 17.122 18.3439 16.9113 18.488 16.6585C18.6321 16.4056 18.7075 16.1195 18.7067 15.8284C18.7059 15.5374 18.6289 15.2517 18.4834 14.9997L11.425 3.21635C11.2765 2.97144 11.0673 2.76895 10.8177 2.62842C10.5681 2.48789 10.2865 2.41406 10 2.41406C9.71357 2.41406 9.43196 2.48789 9.18235 2.62842C8.93275 2.76895 8.72358 2.97144 8.57502 3.21635Z" fill={expired ? "#93411B" : "#935D1B"} stroke={expired ? "#93411B" : "#935D1B"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M10 7.5V10.8333" stroke="#F7E1BD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M10 14.166H10.007" stroke="#F7E1BD" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </g>
            <defs>
                <clipPath id="clip0_25991_10061">
                    <rect width="20" height="20" fill="white" />
                </clipPath>
            </defs>
        </svg>
    )
}

export const TailorPromoSparklesIcon = () => {
    return (
        <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.83325 11.6673C9.05492 11.6673 11.6666 9.05565 11.6666 5.83398C11.6666 9.05565 14.2783 11.6673 17.4999 11.6673C14.2783 11.6673 11.6666 14.279 11.6666 17.5007C11.6666 14.279 9.05492 11.6673 5.83325 11.6673Z" fill="url(#paint0_linear_26380_17665)" stroke="url(#paint1_linear_26380_17665)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2.5 5.41667C4.11082 5.41667 5.41667 4.11082 5.41667 2.5C5.41667 4.11082 6.72252 5.41667 8.33333 5.41667C6.72252 5.41667 5.41667 6.72252 5.41667 8.33333C5.41667 6.72252 4.11082 5.41667 2.5 5.41667Z" fill="url(#paint2_linear_26380_17665)" stroke="url(#paint3_linear_26380_17665)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
            <linearGradient id="paint0_linear_26380_17665" x1="8.40243" y1="-13.5259" x2="18.7514" y2="-11.8701" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F613A9"/>
            <stop offset="1" stop-color="#6833FF"/>
            </linearGradient>
            <linearGradient id="paint1_linear_26380_17665" x1="8.40243" y1="-13.5259" x2="18.7514" y2="-11.8701" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F613A9"/>
            <stop offset="1" stop-color="#6833FF"/>
            </linearGradient>
            <linearGradient id="paint2_linear_26380_17665" x1="3.78459" y1="-7.17996" x2="8.95908" y2="-6.35203" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F613A9"/>
            <stop offset="1" stop-color="#6833FF"/>
            </linearGradient>
            <linearGradient id="paint3_linear_26380_17665" x1="3.78459" y1="-7.17996" x2="8.95908" y2="-6.35203" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F613A9"/>
            <stop offset="1" stop-color="#6833FF"/>
            </linearGradient>
            </defs>
        </svg>
    )
}
export const WhiteStarsIcon = () => {
    return (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.27912 1.9218C5.54457 1.24872 6.49714 1.24872 6.76259 1.9218L7.58522 4.00759C7.66626 4.21309 7.82893 4.37575 8.03442 4.45679L10.1202 5.27942C10.7933 5.54488 10.7933 6.49744 10.1202 6.7629L8.03442 7.58552C7.82893 7.66657 7.66626 7.82923 7.58522 8.03472L6.76259 10.1205C6.49714 10.7936 5.54457 10.7936 5.27911 10.1205L4.45649 8.03472C4.37544 7.82923 4.21278 7.66657 4.00729 7.58552L1.92149 6.7629C1.24842 6.49744 1.24842 5.54488 1.92149 5.27942L4.00729 4.45679C4.21278 4.37575 4.37544 4.21309 4.45649 4.00759L5.27912 1.9218Z" fill="white"/>
            <path d="M11.9882 9.48542C12.1341 9.11554 12.6576 9.11554 12.8034 9.48542L13.4414 11.103C13.486 11.216 13.5753 11.3054 13.6883 11.3499L15.3059 11.9879C15.6758 12.1338 15.6758 12.6572 15.3059 12.8031L13.6883 13.4411C13.5753 13.4857 13.486 13.575 13.4414 13.688L12.8034 15.3056C12.6576 15.6755 12.1341 15.6755 11.9882 15.3056L11.3502 13.688C11.3057 13.575 11.2163 13.4857 11.1033 13.4411L9.48573 12.8031C9.11584 12.6572 9.11584 12.1338 9.48573 11.9879L11.1033 11.3499C11.2163 11.3054 11.3057 11.216 11.3502 11.103L11.9882 9.48542Z" fill="white"/>
        </svg>
    )
}

export const FireIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flame h-6 w-6 text-orange-500"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
    )
}

export const ResumeFlashIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap h-5 w-5 text-amber-500"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>
    )
}

export const GlobalJobsIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe h-6 w-6 text-blue-500"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
    )
}

export const ExpIcon = () => (
    <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.99967 9.99935C10.577 9.99935 12.6663 7.91001 12.6663 5.33268C12.6663 2.75535 10.577 0.666016 7.99967 0.666016C5.42235 0.666016 3.33301 2.75535 3.33301 5.33268C3.33301 7.91001 5.42235 9.99935 7.99967 9.99935Z" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M5.47366 9.26057L4.66699 15.3339L8.00033 13.3339L11.3337 15.3339L10.527 9.25391" stroke="#6B6B6B" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
)

export const CorrectIcon = () => (
    <svg width="0.9375rem" height="0.9375rem" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 3.75L5.625 10.625L2.5 7.5" stroke="#56735C" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
)

export const RedirectIcon = ({ height = '1.0625rem', width = '1.0625rem' }) => (
    <svg style={{ width: width, height: height }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#FFFFFF">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
)

export const Clock = () => (
    <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.667969 2.66797V6.66797H4.66797" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.3413 9.99964C2.77356 11.2266 3.59286 12.2798 4.67574 13.0006C5.75862 13.7214 7.04642 14.0707 8.34511 13.996C9.6438 13.9212 10.883 13.4264 11.8761 12.5861C12.8691 11.7459 13.5621 10.6056 13.8508 9.33722C14.1394 8.06881 14.008 6.74094 13.4764 5.55371C12.9447 4.36647 12.0417 3.38417 10.9032 2.75482C9.76473 2.12546 8.45257 1.88315 7.16442 2.06438C5.87627 2.24562 4.68191 2.84059 3.7613 3.75964L0.667969 6.66631" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6.10547V9.15915L10.0358 10.177" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const EyeIconPreview = (props) => (
    <svg width={20} height={20} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M1.58337 19C1.58337 19 7.91671 6.33334 19 6.33334C30.0834 6.33334 36.4167 19 36.4167 19C36.4167 19 30.0834 31.6667 19 31.6667C7.91671 31.6667 1.58337 19 1.58337 19Z" stroke="#232323" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 23.75C21.6234 23.75 23.75 21.6234 23.75 19C23.75 16.3766 21.6234 14.25 19 14.25C16.3766 14.25 14.25 16.3766 14.25 19C14.25 21.6234 16.3766 23.75 19 23.75Z" stroke="#232323" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const ResumeDownload = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="#7A6501" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12L12 16L16 12" stroke="#7A6501" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8L12 16" stroke="#7A6501" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

export const FilterIcon = () => (
    <svg width="1.25rem" height="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M18.3327 2.5H1.66602L8.33268 10.3833V15.8333L11.666 17.5V10.3833L18.3327 2.5Z"
            stroke="#232323"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const MapPin = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 6.66675C14 11.3334 8 15.3334 8 15.3334C8 15.3334 2 11.3334 2 6.66675C2 5.07545 2.63214 3.54933 3.75736 2.42411C4.88258 1.29889 6.4087 0.666748 8 0.666748C9.5913 0.666748 11.1174 1.29889 12.2426 2.42411C13.3679 3.54933 14 5.07545 14 6.66675Z" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 8.66675C9.10457 8.66675 10 7.77132 10 6.66675C10 5.56218 9.10457 4.66675 8 4.66675C6.89543 4.66675 6 5.56218 6 6.66675C6 7.77132 6.89543 8.66675 8 8.66675Z" stroke="#232323" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const GreenCheck = () => (
    <svg width="28" height="25" viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="11" r="8" fill="white" />
        <path d="M15 9L11.1702 12.5L9 10.1667" stroke="#32936F" strokeWidth="1.5" />
    </svg>
);

export const ArrowLeftRounded = () => (
    <svg width="28" height="25" viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="11" r="8" fill="white" />
        <path d="M10.5 8.25L13.2172 10.9672C13.3734 11.1234 13.3734 11.3766 13.2172 11.5328L10.5 14.25" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

export const LinkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.4987 5.8335H14.9987C16.5459 5.8335 18.1654 9.45299 18.1654 10.0002C18.1654 10.5473 17.0987 13.6403 16.5932 13.8497C16.0877 14.0591 15.5459 14.1668 14.9987 14.1668H12.4987M7.4987 14.1668H4.9987C3.89363 14.1668 2.83382 13.3334 2.05242 12.9464C1.27102 12.165 0.832031 11.1052 0.832031 10.0002C0.832031 8.89509 1.27102 7.83529 2.05242 7.05388C2.83382 6.27248 3.89363 5.8335 4.9987 5.8335H7.4987" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.66797 10H13.3346" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);