
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { shorthandTimeText } from '../../../components/Helper';
import { formatDistanceToNow } from 'date-fns';
import { IMAGE_URL } from '../../../components/Constant';

export default function TransformedResumeSlider({ sortedGoogleDocUrls, onClickUseTemplate }) {

    const sliderSettings = {
        dots: true,
        infinite: true,
        arrows: false,
        speed: 2000,
        autoplaySpeed: 6000,
        autoplay: true,
        slidesToShow: 1,
        slidesToScroll: 1,

        centerMode: true,
        // className: 'center'
    };

    return (
        <div className="templates">
            <div className="templateSlider">
                <Slider {...sliderSettings}>
                    {sortedGoogleDocUrls.map((item, index) => (
                        <div className="templateSlide">
                            <div className="template" onClick={e => onClickUseTemplate(index)}>
                                {item.viewed_at &&
                                    <div className="template-header">
                                        <span className="template-name">{(item.template_name || "classic") + ' Template'}</span>
                                        <span className="viewed-at">
                                            Opened {shorthandTimeText(formatDistanceToNow(new Date(item.viewed_at), { addSuffix: true }))}
                                        </span>
                                        {item.latest_viewed_at &&
                                            <div className="last-viewed">
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M0.5 6C0.5 6 2.5 2 6 2C9.5 2 11.5 6 11.5 6C11.5 6 9.5 10 6 10C2.5 10 0.5 6 0.5 6Z" stroke="#03661A" stroke-linecap="round" stroke-linejoin="round" />
                                                    <path d="M6 7.5C6.82843 7.5 7.5 6.82843 7.5 6C7.5 5.17157 6.82843 4.5 6 4.5C5.17157 4.5 4.5 5.17157 4.5 6C4.5 6.82843 5.17157 7.5 6 7.5Z" stroke="#03661A" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                                Last viewed
                                            </div>
                                        }
                                    </div>
                                }
                                <img src={IMAGE_URL + "resume/" + "transformed_resume_template" + item.template_name + ".png"} />
                                <button className={`primaryBtn ${item.viewed_at ? 'viewed' : ''}`}>
                                    {item.viewed_at ? 'View Resume' : ('See ' + (item.template_name || "classic") + ' Template')}
                                </button>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    )
}