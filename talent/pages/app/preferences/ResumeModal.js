'use client';

import React, { useCallback, useEffect, useState } from "react";
import Modal from 'react-modal';
import { checkIfFilePasswordProtected } from "../../../components/Helper";
import { renderAsync } from 'docx-preview';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { ResumeDownload } from "../../../assets/IconSVG";

if (typeof document !== 'undefined' && document.getElementById('happpy-root')) {
    Modal.setAppElement('#happpy-root');
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ResumeModal({ isOpen, setOpen, data, onDownloadClick, showDownloadOption = true }) {

    const [resume, setResume] = useState({ type: '', url: "", content: "" })
    const [numPages, setNumPages] = useState(1)
    const [fileLoaded, setFileLoaded] = useState(false)


    function base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, { type: mimeType });
    }

    function onDocumentLoadSuccess(numPages) {
        setNumPages(numPages.numPages);
        setFileLoaded(true)
    }

    const synchronizeLayers = () => {
        const canvases = document.querySelectorAll('.react-pdf__Page__canvas');
        const textContents = document.querySelectorAll('.react-pdf__Page__textContent');

        canvases.forEach((canvas, index) => {
            const textLayer = textContents[index];
            if (canvas && textLayer) {
                textLayer.style.height = `${canvas.offsetHeight}px`;
                textLayer.style.width = `${canvas.offsetWidth}px`;
                textLayer.style.position = 'absolute'; // Ensure text layer overlaps canvas
                // textLayer.style.transform = `scale(${resumeScale})`;     //may be uncommented
                // textLayer.style.transformOrigin = 'top left';            //may be uncommented
            }
        });
    };

    const resumeScale = 1;
    const [resumeWidth, setResumeWidth] = useState(1200)
    const handleWindowResize = useCallback(() => {
        if (window.innerWidth <= 767) {
            setResumeWidth(window.innerWidth - 90)
        } else if (window.innerWidth <= 991) {
            setResumeWidth(window.innerWidth - 202)
        } else if (window.innerWidth <= 1100) {
            setResumeWidth(window.innerWidth - 224)
        } else if (window.innerWidth < 1484) {
            setResumeWidth(window.innerWidth - (window.innerWidth <= 1366 ? 268 : 284))
        } else {
            setResumeWidth(1200)
        }
    }, []);

    useEffect(() => {
        handleWindowResize()
        setTimeout(() => {
            window.addEventListener('resize', handleWindowResize);
        }, 500)
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);
    const getResumeData = async (resumeData) => {
        let url = resumeData?.data;
        let resumeUrl = url;
        let content = ""
        let urlType = ""
        const type = resumeData?.ext;

        if (type === 'pdf') {
            try {
                const result = await checkIfFilePasswordProtected(base64ToBlob(resumeData?.blob, 'application/pdf'));
            } catch (error) {
                setResume({ url: resumeUrl, type: 'protected', content: content });
                return;
            }

            urlType = 'pdf'
            const blob = resumeData?.blob;
            let docxBlob = base64ToBlob(blob, 'application/pdf');
            docxBlob.name = "resume.pdf";
            content = docxBlob;
        }
        else if (type === 'docx') {
            try {
                const result = await checkIfFilePasswordProtected(base64ToBlob(resumeData?.blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
            } catch (error) {
                setResume({ url: resumeUrl, type: 'protected', content: content });
                return;
            }

            urlType = "docx"

            const blob = resumeData?.blob;
            let docxBlob = base64ToBlob(blob, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            docxBlob.name = "resume.docx";

            await renderAsync(docxBlob, document.getElementById("resume_preview"))

            content = document.getElementById('resume_preview').innerHTML
            // content = highlighterDocx(content)
        }
        else {
            urlType = "download"
        }
        setResume({ url: resumeUrl, type: urlType, content: content });
    }

    useEffect(() => {
        if (data) {
            getResumeData(data);
        }
    }, [data])

    return (
        <>
            <Modal
                isOpen={isOpen}
                onRequestClose={() => setOpen(false)}
                portalClassName="react-modal-portal"
                className={`modal commonModalWrap commonModal resumeModal fade ${isOpen && "show"}`}
            >

                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => setOpen(false)}>
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M24 8L8 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 8L24 24" stroke="#6B6B6B" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <div className="modal-body">
                            {resume.type == "docx" && resume.content != "" &&
                                <>
                                    <div id="actual_resume_preview" dangerouslySetInnerHTML={{ __html: resume.content }}></div>
                                </>
                            }
                            {resume.type == "pdf" && resume.content != "" &&
                                <>
                                    <Document file={resume.content} onLoadSuccess={onDocumentLoadSuccess}
                                        externalLinkTarget="_blank"
                                    // renderMode="none"
                                    >
                                        {fileLoaded &&
                                            Array.from(
                                                new Array(numPages),
                                                (el, index) => (
                                                    <div className='pdf-page-wrapper'>
                                                        <Page
                                                            key={`page_${index + 1}`}
                                                            pageNumber={index + 1}
                                                            width={resumeWidth}
                                                            customTextRenderer={({ str, itemIndex }) => str}
                                                            scale={resumeScale}
                                                            onRenderSuccess={synchronizeLayers}
                                                        />
                                                    </div>
                                                ),
                                            )}
                                    </Document>
                                </>
                            }
                            {showDownloadOption && (
                            resume.type && resume.type != "pdf" && resume.type != "docx" &&
                                <h5> {resume.type == 'protected'
                                    ? <>Resume cannot be previewed due to being password protected
                                        <button
                                            type='button'
                                            className="downloadBtn"
                                            title="Download Resume"
                                            onClick={e => onDownloadClick(e, data)}
                                        >
                                            <ResumeDownload /> Download Resume
                                        </button></>
                                    : <>Resume cannot be previewed due to it's unsupported type. Kindly download the resume to view. <button
                                        type='button'
                                        className="downloadBtn"
                                        title="Download Resume"
                                        onClick={e => onDownloadClick(e, data)}
                                    >
                                        <ResumeDownload /> Download Resume
                                    </button></>}</h5>
                            )}
                            {!showDownloadOption && resume.type && resume.type != "pdf" && resume.type != "docx" && (
                                <h5>Resume cannot be previewed due to it's unsupported type.</h5>
                            )}
                            <div id='resume_preview' style={{ display: "none" }}></div>
                        </div>
                    </div>
                </div>
            </Modal >

        </>
    )
}
