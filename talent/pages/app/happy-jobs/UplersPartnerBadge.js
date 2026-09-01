import { useEffect } from "react";

export default function UplersPartnerBadge({ data, parentId = null, index = '', fullText, isTooltip = true }) {
    const isElementAtExtreme = (element) => {
        const elementRect = element.getBoundingClientRect();
        let parentRect;
        if (parentId) {
            let parent = document.getElementById(parentId);
            parentRect = parent.getBoundingClientRect();
        }
        if (elementRect.left <= 120) {
            return 'left';
        }
        if ((elementRect.x + 156) >= window.innerWidth || (parentRect && (elementRect.x + 156) >= parentRect.right)) {
            return 'right';
        }
        return false;
    }

    const modifyClass = () => {
        const myElement = document.getElementById('partner' + data.HR_Number + index);
        const position = isElementAtExtreme(myElement);
        if (position === 'left') {
            myElement.classList.add('left-edge'); // Add a CSS class for styling
            myElement.classList.remove('right-edge');
        } else if (position === 'right') {
            myElement.classList.add('right-edge'); // Add a CSS class for styling
            myElement.classList.remove('left-edge');
        } else {
            myElement.classList.remove('left-edge', 'right-edge'); // Remove edge classes
        }
    }


    useEffect(() => {
        const myElement = document.getElementById('partner' + data.HR_Number + index);
        myElement?.addEventListener('mouseenter', modifyClass);

    }, [])

    return (
        <div className="uplersPartnerBadge" id={'partner' + data.HR_Number + index} onClick={e => e.stopPropagation()}>
            <div className="partenerIcon">
                <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="8" r="8" fill="#CAFBDD" />
                    <path d="M7.07571 9.72207C7.27665 9.87541 7.55926 9.85986 7.74215 9.68539L10.4354 7.11613C10.6408 6.92024 10.6485 6.59497 10.4526 6.38964C10.2567 6.18429 9.93141 6.17662 9.72606 6.37252L7.35033 8.63884L6.28168 7.8233C6.05608 7.65113 5.73361 7.69444 5.56144 7.92004C5.38928 8.14565 5.43259 8.46811 5.65819 8.64028L7.07571 9.72207Z" fill="#186644" />
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.3595 2.31913C8.59127 1.66446 7.46137 1.66446 6.69315 2.31914L6.18507 2.75211C6.02047 2.89238 5.81581 2.97715 5.60024 2.99436L4.93481 3.04746C3.92867 3.12775 3.12971 3.92671 3.04941 4.93286L2.99631 5.59828C2.97911 5.81386 2.89433 6.01851 2.75406 6.18312L2.32108 6.6912C1.66641 7.45942 1.66641 8.58932 2.32109 9.35755L2.75406 9.86562C2.89433 10.0302 2.97911 10.2349 2.99631 10.4505L3.04941 11.1159C3.12971 12.122 3.92867 12.921 4.93481 13.0012L5.60024 13.0544C5.81581 13.0716 6.02047 13.1563 6.18507 13.2966L6.69315 13.7296C7.46137 14.3843 8.59127 14.3843 9.3595 13.7296L9.86758 13.2966C10.0322 13.1563 10.2368 13.0716 10.4524 13.0544L11.1179 13.0012C12.124 12.921 12.9229 12.122 13.0032 11.1159L13.0563 10.4505C13.0736 10.2349 13.1583 10.0302 13.2985 9.86562L13.7315 9.35755C14.3863 8.58932 14.3863 7.45942 13.7315 6.6912L13.2985 6.18312C13.1583 6.01851 13.0736 5.81386 13.0563 5.59828L13.0032 4.93286C12.9229 3.92671 12.124 3.12775 11.1179 3.04746L10.4524 2.99436C10.2368 2.97715 10.0322 2.89238 9.86758 2.75211L9.3595 2.31913ZM7.35973 3.10133C7.74385 2.774 8.3088 2.774 8.69291 3.10133L9.20099 3.53431C9.53019 3.81486 9.93951 3.9844 10.3706 4.01881L11.0361 4.07191C11.5391 4.11205 11.9386 4.51153 11.9788 5.0146L12.0319 5.68003C12.0663 6.11119 12.2358 6.52051 12.5164 6.8497L12.9493 7.35778C13.2767 7.74189 13.2767 8.30684 12.9493 8.69096L12.5164 9.19903C12.2358 9.52824 12.0663 9.93755 12.0319 10.3687L11.9788 11.0341C11.9386 11.5372 11.5391 11.9366 11.0361 11.9768L10.3706 12.03C9.93951 12.0644 9.53019 12.2338 9.20099 12.5144L8.69291 12.9474C8.3088 13.2747 7.74385 13.2747 7.35973 12.9474L6.85165 12.5144C6.52246 12.2338 6.11315 12.0644 5.68198 12.03L5.01655 11.9768C4.51349 11.9366 4.114 11.5372 4.07386 11.0341L4.02076 10.3687C3.98635 9.93755 3.81681 9.52824 3.53627 9.19903L3.10329 8.69096C2.77595 8.30684 2.77595 7.74189 3.10329 7.35778L3.53627 6.8497C3.81681 6.52051 3.98635 6.11119 4.02076 5.68003L4.07386 5.0146C4.114 4.51154 4.51348 4.11205 5.01655 4.07191L5.68198 4.01881C6.11315 3.9844 6.52246 3.81486 6.85165 3.53431L7.35973 3.10133Z" fill="#186644" />
                </svg>
                {fullText && "Partnered Job"}
                {isTooltip && (
                    <div class="tooltiptext">
                        <h5>Uplers' partnered job</h5>
                        <div className="what">
                            <h6>What is a partnered job?</h6>
                            <span>These jobs are posted directly on Uplers by clients partnering with us for their hiring needs. The entire application process will be managed through Uplers, allowing you to track and view all the application updates in one place.</span>
                        </div>
                        <span className="joinedText">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.5 2V5H3.5" stroke="#8B8989" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M1.755 7.49924C2.0792 8.41943 2.69367 9.20933 3.50583 9.74993C4.31799 10.2905 5.28384 10.5525 6.25786 10.4965C7.23187 10.4404 8.16129 10.0693 8.90606 9.43912C9.65084 8.80891 10.1706 7.95373 10.3871 7.00242C10.6036 6.05112 10.505 5.05522 10.1063 4.16479C9.70758 3.27436 9.03026 2.53764 8.17642 2.06562C7.32257 1.59361 6.33845 1.41187 5.37234 1.5478C4.40623 1.68373 3.51046 2.12995 2.82 2.81924L0.5 4.99924" stroke="#8B8989" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M6 4.57812V6.86839L7.52684 7.63181" stroke="#8B8989" stroke-width="0.75" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            {data.company.company_name} joined Uplers in {data.is_partner_company}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}