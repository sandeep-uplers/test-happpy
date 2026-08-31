'use client';

import { MoneyInput } from "./Inputs";
import { IMAGE_URL } from "../Constant";
import { useEffect, useState } from "react";
import { isAllEmpty } from "../Helper";
import { NumericFormat } from "react-number-format";

export default function CTCBreakdown({ ctcBreakdown, handleInputChange, style = "" }) {
    const [totalCTC, setTotalCTC] = useState(0);
    const [breakdownToggle, setBreakdownToggle] = useState(false);
    const [salaryBreakdown, setSalaryBreakdown] = useState({
        ctc_type: 1,
        fixed: "",
        variable: "",
        stock: "",
        vested_across: ""
    });

    const CTCTotal = (value) => {
        const total = parseFloat(value.fixed || 0) + parseFloat(value.variable || 0) + parseFloat(value.stock || 0);
        setTotalCTC(Number(total.toFixed(2)));
    }

    const handleSalaryBreakdownChange = (e) => {
        const { name, value } = e.target;
        const newSalaryBreakdown = { ...salaryBreakdown, [name]: value };
        CTCTotal(newSalaryBreakdown);
        setSalaryBreakdown(newSalaryBreakdown);
        handleInputChange("ctc_breakdown", newSalaryBreakdown);
    }

    useEffect(() => {
        const parent = document.querySelector('.current-ctc');
        const modal = document.querySelector('.signupflow.apply');
        const popup = document.querySelector('.ctc-breakdown-section');
        if (!parent || !popup || !modal) return;

        const parentRect = parent.getBoundingClientRect();
        const modalRect = modal.getBoundingClientRect();
        const popupWidth = popup.offsetWidth;

        const spaceRight = modalRect.right - parentRect.left;

        if (spaceRight >= popupWidth) {
            popup.style.left = "0";
            popup.style.right = "auto";
        } else {
            popup.style.left = "auto";
            popup.style.right = "0";
        }
    }, [breakdownToggle]);

    useEffect(() => {
        if (ctcBreakdown) {
            setSalaryBreakdown(ctcBreakdown);
            CTCTotal(ctcBreakdown);
        }
    }, [ctcBreakdown]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            const breakdownSection = document.querySelector('.ctc-breakdown-section');
            const breakdownButton = document.querySelector('.ctc-breakdown-btn');

            if (breakdownSection && !breakdownSection.contains(e.target) && breakdownButton && !breakdownButton.contains(e.target)) {
                setBreakdownToggle(false);
            }
        }

        if (breakdownToggle) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [breakdownToggle]);

    return (
        <>
            <button type='button' className='ctc-breakdown-btn' onClick={() => setBreakdownToggle(!breakdownToggle)}>
                <img src={IMAGE_URL + "arrowup.svg"} className={breakdownToggle ? "rotateImg" : ""} />
                <span>{breakdownToggle ? "Hide" : isAllEmpty(salaryBreakdown, ["ctc_type"]) ? "Add" : "See"} breakdown</span>
            </button>

            {breakdownToggle &&
                <div className={`ctc-breakdown-section ${style}`}>
                    <div className='breakdown-item'>
                        <div className='breakdown-label'>
                            <h6>Fixed Salary</h6>
                            <span>Base salary</span>
                        </div>
                        <div className='form-input'>
                            <MoneyInput type={"text"}
                                placeholder="7.2"
                                name="fixed"
                                id="fixed"
                                value={salaryBreakdown?.fixed}
                                onChange={handleSalaryBreakdownChange}
                                isFixLeadingZero={false}
                            />
                        </div>
                    </div>
                    <hr />
                    <div className='breakdown-item'>
                        <div className='breakdown-label'>
                            <h6>Variable Pay</h6>
                            <span>Bonus, incentives, commissions</span>
                        </div>
                        <div className='form-input'>
                            <MoneyInput type={"text"}
                                placeholder="1.2"
                                name="variable"
                                id="variable"
                                value={salaryBreakdown?.variable}
                                onChange={handleSalaryBreakdownChange}
                                isFixLeadingZero={false}
                            />
                        </div>
                    </div>
                    <hr />
                    <div className='breakdown-item'>
                        <div className='breakdown-label'>
                            <h6>Stock Options</h6>
                            <span>ESOP, RSU </span>
                        </div>
                        <div className='form-input stock-options-input'>
                            <MoneyInput type={"text"}
                                placeholder="0.6"
                                name="stock"
                                id="stock"
                                value={salaryBreakdown?.stock}
                                onChange={handleSalaryBreakdownChange}
                                isFixLeadingZero={false}
                            />
                        </div>
                    </div>

                    <div className='breakdown-item mt-1'>
                        <div className='breakdown-label'>
                            {/* <h6>Vested Across</h6> */}
                            <span>Vested Across</span>
                        </div>
                        <div className='form-input'>
                            <div className='year-input'>
                                <NumericFormat
                                    type="text"
                                    placeholder="3"
                                    name="vested_across"
                                    id="vested_across"
                                    value={salaryBreakdown?.vested_across}
                                    onChange={handleSalaryBreakdownChange}
                                    decimalScale={0}
                                    allowNegative={false}
                                    allowLeadingZeros={false}
                                    isAllowed={(values) => {
                                        const { formattedValue, floatValue } = values;
                                        return formattedValue === "" || floatValue <= 20;
                                    }}
                                    thousandSeparator={false}
                                    data-hj-allow
                                />
                                <span className="input-suffix">years</span>
                            </div>
                        </div>
                    </div>

                    {(totalCTC > 0) && (
                        <>
                            <hr />
                            <div className='total-ctc'>
                                <span>Total: ₹ {totalCTC} lacs per annum</span>
                            </div>
                        </>
                    )}
                </div>
            }
        </>
    )
}