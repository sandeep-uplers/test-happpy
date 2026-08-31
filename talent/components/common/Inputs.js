'use client';

import React from 'react';
import { NumericFormat } from 'react-number-format';

import { useEffect, useState } from "react";

export function RangeInput({
    value,
    onChange,
    min = 0,
    max = 100,
    showValue = false,
    label,
    lineSpacing = false
}) {
    const [pct, setPct] = useState(0);

    useEffect(() => {
        const percentage = ((value - min) / (max - min)) * 100;
        setPct(percentage);
    }, [value, min, max]);

    const tooltipLeft = pct == 0 ? '16px' : pct > 50 ? `calc(${pct}% - 16px )` : `calc(${pct}% + 8px )`;

    return (
        <div className="range-input-wrapper">
            <div
                className={`range-tooltip ${pct > 50 ? 'right-of-center' : ''}`}
                style={{ left: tooltipLeft }}
            >
                {lineSpacing ? `${value - 8}` : `${value} pt`}
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={onChange}
                style={{
                    background: `linear-gradient(90deg, var(--range-accent) ${pct}%, var(--range-track-bg) ${pct}%)`
                }}
                className="range-input"
            />
        </div>
    );
}
export function Checkbox({ name, onChange, checked, ...others }) {
    return (
        <label className="checkboxDiv">
            <input className='checkbox' type={"checkbox"} name={name} checked={checked} onChange={onChange} {...others} />
            <span className="checkmark"></span>
        </label>
    )
}

export function CheckboxInput({ name, inputId, onChange, checked, label = null, ...others }) {
    return (
        <label className="checkboxInput">
            <input className='checkbox' type={"checkbox"} name={name} id={inputId} checked={checked} onChange={onChange} {...others} />
            <span className='name'>{label ?? name}</span>
            <span className="checkmark"></span>
        </label>
    )
}

export function RadioInput({ checked, onChange, id, name, label, ...rest }) {
    return (
        <label className="radioInput">
            <input id={id} name={name} className='radio' type={"radio"} {...rest} checked={checked} onChange={onChange} />
            <span className='name'>{label ?? name}</span>
            <span className="checkmark"></span>
        </label>
    )
}

export function Radiobox({ checked, onChange, id, name, ...rest }) {
    return (
        <label className="radiobox">
            <input id={id} name={name} className='radio' type={"radio"} {...rest} checked={checked} onChange={onChange} />
            {name}
            <span className="checkmark"></span>
        </label>
    )
}


export function MoneyInput({ value, onChange, isFixLeadingZero = true, ...rest }) {
    const fixLeadingZero = (e) => {
        if (!e.target.value) { return e; }
        e.target.value = e.target.value.replace(/^0+/, '') || '0';
        return e
    }

    const isAllowed = (values) => {
        const { formattedValue, floatValue } = values;
        return formattedValue === "" || floatValue < 1000;
    }

    return (
        <div className='money-input'>
            <NumericFormat isAllowed={isAllowed} value={value}
                decimalScale={2}
                allowNegative={false}
                allowLeadingZeros={false}
                onChange={(e) => onChange(isFixLeadingZero ? fixLeadingZero(e) : e)} thousandSeparator={false}
                thousandsGroupStyle="none" {...rest}
                data-hj-allow
            />
        </div>
    )
}

export function SwitchInput({ checked, onChange, ...rest }) {
    return (
        <div class="switch-input">
            <input id="switch" type="checkbox" checked={checked} onChange={onChange} {...rest} />
            <label for="switch"></label>
        </div>
    )
}