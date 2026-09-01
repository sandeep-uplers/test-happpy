import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from 'react-modal';
import { ensureModalAppElement } from '@/talent/helpers/setModalAppElement';
ensureModalAppElement();
import { useDispatch } from 'react-redux';
import { CloseModalIcon, MenuResumeUpload } from '../../assets/IconSVG';
import UploadResumeLoader from '../../pages/app/resume/payment/UploadResumeLoader';
import { uploadTailoredResume } from '../../store/actions/resumeActions';

export default function UploadResumeModal({ isOpen, setIsOpen, fetchTailoredResumeList }) {
    const dispatch = useDispatch();
    const inputRef = useRef(null);
    const [uploadLoader, setUploadLoader] = useState(false);

    const handleUploadResume = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size should be less than 2MB');
            return;
        }

        const newFormData = new FormData();
        newFormData.append("resume", file);

        setUploadLoader(true);
        uploadTailoredResume(newFormData)(dispatch)
            .then((res) => {
                if (res.data.status == 200) {
                    toast.success('Resume uploaded successfully');
                    fetchTailoredResumeList();

                    setTimeout(() => {
                        fetchTailoredResumeList();
                    }, 60000); // 1 minute
                } else {
                    toast.error(res.data?.errors?.resume?.[0] || 'Resume upload failed');
                }
            }).catch((err) => {
                console.log(err);
                toast.error('Resume upload failed');
            }).finally(() => {
                setIsOpen(false);
                setUploadLoader(false);
            })
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            portalClassName="react-modal-portal"
            className="modal commonModal upload-tailored-resume-modal"
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <button type="button" className="modalCloseBtn" aria-label="Close" onClick={() => setIsOpen(false)}>
                        <CloseModalIcon />
                    </button>
                    <div className='content'>
                        <h1>{uploadLoader ? 'Uploading Resume to Get Started' : 'Upload Resume to Get Started'}</h1>
                        {uploadLoader ?
                            <UploadResumeLoader />
                            :
                            <MenuResumeUpload width="5rem" height="5rem" />
                        }
                        {!uploadLoader && (
                            <>
                                <span>Files should be in PDF or Word format and must not exceed 2MB in size.</span>
                                <button className='primaryBtn upload-resume-btn' onClick={() => inputRef.current.click()}>
                                    <input type="file" accept=".pdf,.docx" onChange={(e) => handleUploadResume(e)} hidden ref={inputRef} />
                                    Upload
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
}