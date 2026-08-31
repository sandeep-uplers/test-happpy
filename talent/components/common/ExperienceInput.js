'use client';

import { useEffect, useState } from "react";
import { validateNumber } from "../profile/formValidations";

export default function ExperienceInput({ value, onChange, wrapperClass, ...rest }) {
    const [yearValue, setYearValue] = useState('');
    const [monthValue, setMonthValue] = useState('');

    useEffect(() => {
        let formattedValue = value + '';
        setYearValue(formattedValue?.split('.')?.[0] ?? '');
        setMonthValue(formattedValue?.split('.')?.[1] ?? '');
    }, [])

    useEffect(() => {
        let expValue = yearValue;
        if (monthValue && monthValue > 0) {
            expValue = Number(expValue) + "." + Number(monthValue)
        }
        if ((value + '') !== (expValue + '')) {
            onChange(expValue);
        }
    }, [monthValue, yearValue])

    const handleInputNumChange = (value, type) => {
        let newVal = value.replaceAll(' ', '');
        if (newVal != '' && !validateNumber(newVal)) return
        if (type == 'month') {
            if (newVal > 11) return
            setMonthValue(value)
        } else {
            if (newVal > 49) return
            setYearValue(newVal);
        }
    }
    return (
        <div className={`experience-input ${wrapperClass}`} >
            <input
                type={"text"}
                placeholder={'5'}
                value={yearValue}
                maxLength={'2'}
                className={`inlineField`}
                name="total_experience"
                onChange={(e) => {
                    handleInputNumChange(e.target.value, 'year');
                }}
                data-hj-allow
            />
            <span>years</span>
            <input
                type={"text"}
                placeholder={'3'}
                value={monthValue}
                maxLength={'2'}
                className={`inlineField`}
                name="total_experience"
                onChange={(e) => {
                    handleInputNumChange(e.target.value, 'month');
                }}
                data-hj-allow
            />
            <span>months</span>
        </div>
    )
}