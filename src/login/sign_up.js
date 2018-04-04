import React, {Component} from 'react'
import './style/sign_up.css'

function DisplaySignInPane({ onSignIn }) {
    return (
        <div id='_sign-in-pane' onClick={onSignIn}>
            <img id='_sign-in-pane-img' src='/images/user_36.png' alt='cannot load user_36.png' />
        </div>
    );
}

function DisplayInput({ formId, inputType, inputId, placeholder, value, onChange, onSubmit }) {
    return (
        <form className='sign-up-input-form' id={formId} onSubmit={onSubmit}>
            <input type={inputType} className='sign-up-input' id={inputId} value={value} onChange={onChange} placeholder={placeholder} />
        </form>
    );
}

function DisplaySignUpPane({ email, username, password, confirmPassword, onChange, onSubmit }) {
    return (
        <div id='_sign-up-pane'>
            <h2 className='_sign-up-pane-header'>Sign Up</h2>

            <DisplayInput formId='email-input-form' inputType='text' inputId='sign-up-email'
                          placeholder='EMAIL' value={email} onChange={onChange} onSubmit={onSubmit} />

            <DisplayInput formId='username-input-form' inputType='text' inputId='sign-up-username'
                          placeholder='USERNAME' value={username} onChange={onChange} onSubmit={onSubmit} />

            <DisplayInput formId={'password-input-form'} inputType={'password'} inputId={'sign-up-password'}
                          placeholder='PASSWORD' value={password} onChange={onChange} onSubmit={onSubmit} />      

            {
                password !== '' ?
                (
                    <DisplayInput formId='confirm-password-input-form' inputType='password' inputId='sign-up-confirm-password'
                          placeholder='CONFIRM PASSWORD' value={confirmPassword} onChange={onChange} onSubmit={onSubmit} />
                ) :
                null
            }      

            <button id='sign-up-connect' onClick={onSubmit}>Connect</button>
        </div>
    );
}

class SignUp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            username: '',
            password: '',
            confirmPassword: ''
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.emailDOM = document.getElementById('sign-up-email');
        this.usernameDOM = document.getElementById('sign-up-username');
        this.passwordDOM = document.getElementById('sign-up-password');
        this.connectDOM = document.getElementById('sign-up-connect');

        this.emailDOM.focus();
    }

    onChange(e) {
        try {
            e.preventDefault();
            let target = e.currentTarget.id;

            if ( target === 'sign-up-email' ) {
                this.setState({ email: e.currentTarget.value.trim() });
            }

            else if ( target === 'sign-up-username' ) {
                this.setState({ username: e.currentTarget.value.trim() });
            }

            else if ( target === 'sign-up-password' ) {
                this.setState({ password: e.currentTarget.value.trim() });
            }

            else if ( target === 'sign-up-confirm-password' ) {
                this.setState({ confirmPassword: e.currentTarget.value.trim() });
            }
        }
        catch(err) {
            console.log(`ERR sign_up.js - onChange(): ${err.message}`);
        }        
    }

    onSubmit(e) {
        e.preventDefault();
        let element = e.currentTarget.id;

        if ( element === 'email-input-form' && this.state.email !== '' ) {
            this.usernameDOM.focus();
        }

        else if ( element === 'username-input-form' && this.state.username !== '') {
            this.passwordDOM.focus();
        }

        else if ( element === 'password-input-form' && this.state.password !== '' ) {
            document.getElementById('sign-up-confirm-password').focus();
        }

        else if ( element === 'confirm-password-input-form' && this.state.confirmPassword !== '' ) {
            this.connectDOM.focus();
        }

        else if ( element === 'sign-up-connect' ) {
            if ( this.state.email !== '' ) {
                if ( this.state.username !== '' ) {
                    if ( this.state.password !== '' ) {
                        if ( this.state.confirmPassword !== '' ) {
                            if ( this.state.confirmPassword === this.state.password ) { //confirms passwords match
                                let data = {
                                    newUser: true,
                                    email: this.state.email.trim(),
                                    username: this.state.username.trim(),
                                    pass: this.state.password.trim()
                                };
                                
                                //document.cookie='username=' + this.state.username;
                                document.cookie='username=' + this.state.username + '; path=/';
                                this.props.loginAttempt(data);
                            }

                            else { //pass & confirm pass don't match
                                document.getElementById('sign-up-confirm-password').focus();
                                alert('Your password & confirm password do not match');
                            }
                        }

                        else {
                            document.getElementById('sign-up-confirm-password').focus(); //focus confirm pass field - not filled out
                            alert('The confirm password field is blank');
                        }
                    }

                    else {
                        this.passwordDOM.focus(); //focus password field - not filled out
                        alert('The password field is blank');
                    }
                }

                else {
                    this.usernameDOM.focus(); //focus username field - not filled out
                    alert('The username field is blank');
                }
            }

            else {
                this.emailDOM.focus(); //focus email field - not filled out
                alert('The email field is blank');
            }
        }
    }

    render() {
        return (
            <div id='_sign-up-container'>
                <DisplaySignInPane onSignIn={this.props.onSignIn} />

                <img id='navigate-back-img' src='/images/back_arrow.png' onClick={this.props.onBack} alt='cannot load back_arrow.png' />
                <DisplaySignUpPane email={this.state.email} username={this.state.username} password={this.state.password}
                                   confirmPassword={this.state.confirmPassword} onChange={this.onChange} onSubmit={this.onSubmit} />
            </div>
        );
    }
}

export default SignUp;