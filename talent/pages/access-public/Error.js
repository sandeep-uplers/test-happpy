import React, { Component } from 'react';
import { IMAGE_URL } from '../../components/Constant';
import { Link } from '@/talent/navigation/routerCompat';
export default class Error extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <section className="containSection error-section">
                <div className='container'>
                    <div className='row'>
                        <div className='col-12'>
                            <div className='error-content-wrap'>
                                <div className="heading">

                                    {/* <figure className="pb-4">
                                    <img src={IMAGE_URL + "error-img.png" } />
                                    </figure> */}


                                    <Link to='/talent' className='brand-logo'>
                                        <img src={IMAGE_URL + "brand-logo.svg"} />
                                    </Link>

                                    <h2>404</h2>
                                    <span>Oops!</span>
                                    <strong>Page not found</strong>
                                    <p>This page doesn’t exist or was removed! We suggest returning to your homepage</p>
                                    <Link to='/talent' className='back-home-btn'>GO TO HOME</Link>

                                </div>
                                <div className='error-img'>
                                    <img src={IMAGE_URL + "error-img.svg"} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}