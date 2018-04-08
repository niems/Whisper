import React, {Component} from 'react'
import SignIn from './sign_in'
import SignUp from './sign_up'
import './style/landing_page.css'

function DisplayLandingPane({ onSignIn, onSignUp }) {
    return (
        <div id='landing-page-container'>

            <div className='landing-page-section-container' id='landing-page-sign-in-container' onClick={onSignIn}>
                <img className='landing-page-user-img' id='landing-page-sign-in-img' src='/images/page_icons/user-48.svg' alt='/images/placeholder.svg'  />
                <h4 className='landing-page-selection-header'>Sign In</h4>
            </div>
            <div className='landing-page-section-container' id='landing-page-sign-up-container' onClick={onSignUp}>
                <img className='landing-page-user-img' id='landing-page-sign-up-img' src='/images/page_icons/user-add-48.svg'  alt='/images/placeholder.svg'  />
                <h4 className='landing-page-selection-header'>Sign Up</h4>
            </div>

        </div>
    );
}

class LandingPage extends Component {
    constructor(props) {
        super(props);

        this.onSignIn = this.onSignIn.bind(this);
        this.onSignUp = this.onSignUp.bind(this);
        this.onNavBack = this.onNavBack.bind(this);

        this.state = {
            display: <DisplayLandingPane onSignIn={this.onSignIn} onSignUp={this.onSignUp} />
        };
    }

    componentDidMount() {
        try {
            this.signInDOM = document.getElementById('landing-page-sign-in-container');
            this.signUpDOM = document.getElementById('landing-page-sign-up-container');
        }
        catch(e) {
            console.log(`ERR LandingPage - componentDidMount(): ${e.message}`);
        }
    }

    onSignIn(e) {
        try {
            e.preventDefault();

            this.setState({
                display: <SignIn onBack={this.onNavBack} loginAttempt={this.props.loginAttempt} onSignUp={this.onSignUp} />
            });
        }
        catch(err) {
            console.log(`ERR LandingPage - onSignIn(): ${err.message}`);
        }
    }

    onSignUp(e) {
        try {
            e.preventDefault();

            this.setState({
                display: <SignUp onBack={this.onNavBack} loginAttempt={this.props.loginAttempt} onSignIn={this.onSignIn} />
            })
        }
        catch(err) {
            console.log(`ERR LandingPage - onSignUp(): ${err.message}`);
        }
    }

    onNavBack(e) {
        try {
            e.preventDefault();
            
            this.setState({
                display: <DisplayLandingPane onSignIn={this.onSignIn} onSignUp={this.onSignUp} />
            });
        }
        catch(err) {
            console.log(`ERR LandingPage - onNavBack(): ${err.message}`);
        }
    }

    render() {
        return ( this.state.display );
    }
}

export default LandingPage;