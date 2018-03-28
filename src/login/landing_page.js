import React, {Component} from 'react'
import './style/landing_page.css'

class LandingPage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id='landing-page-container'>

                <div className='landing-page-section-container' id='landing-page-sign-in-container'>
                    <h4 className='landing-page-selection-header'>Sign In</h4>
                </div>
                <div className='landing-page-section-container' id='landing-page-sign-up-container'>
                    <h4 className='landing-page-selection-header'>Sign Up</h4>
                </div>

            </div>
        );
    }
}

export default LandingPage;