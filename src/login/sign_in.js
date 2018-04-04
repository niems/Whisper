import React, {Component} from 'react'
import './style/sign_in.css'

function DisplayInput({ formId, inputType, inputId, placeholder, value, onChange, onSubmit }) {
    return (
        <form className='sign-in-input-form' id={formId} onSubmit={onSubmit}>
            <input type={inputType} className='sign-in-input' id={inputId} value={value} onChange={onChange} placeholder={placeholder} />
        </form>
    );
}

function DisplaySignInPane({ username, password, onChange, onSubmit }) {
    return (
        <div id='sign-in-pane'>
            <h2 className='sign-in-pane-header'>Sign In</h2>

            <DisplayInput formId={'username-input-form'} inputType={'text'} inputId={'sign-in-username'}
                          placeholder='USERNAME' value={username} onChange={onChange} onSubmit={onSubmit} />

            <DisplayInput formId={'password-input-form'} inputType={'password'} inputId={'sign-in-password'}
                          placeholder='PASSWORD' value={password} onChange={onChange} onSubmit={onSubmit} />            

            <button id='sign-in-connect' onClick={onSubmit}>Connect</button>
        </div>
    );
}

function DisplaySignUpPane({ onSignUp }) {
    return (
        <div id='sign-up-pane' onClick={onSignUp}>
            <img id='sign-up-pane-img' src='/images/user_add_36.png' alt='cannot load user_add_36.png' />                    
        </div>
    );
}

class SignIn extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: ''
        };

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentDidMount() {
        this.usernameDOM = document.getElementById('sign-in-username');
        this.passwordDOM = document.getElementById('sign-in-password');
        this.connectDOM = document.getElementById('sign-in-connect');

        this.usernameDOM.focus();
    }

    onChange(e) {
        e.preventDefault();
        let target = e.currentTarget.id;

        if ( target === 'sign-in-username' ) {
            this.setState({ username: e.currentTarget.value });
        }

        else if ( target === 'sign-in-password' ) {
            this.setState({ password: e.currentTarget.value });
        }
    }

    onSubmit(e) {
        e.preventDefault();
        let element = e.currentTarget.id;

        if ( element === 'username-input-form' ) {
            if ( this.state.username !== '' ) {
                this.passwordDOM.focus();
            }            
        }

        else if ( element === 'password-input-form' ) {
            if ( this.state.password !== '' ) {
                this.connectDOM.focus();
            }
        }

        else if ( element === 'sign-in-connect' ) {
            if ( this.state.username !== '' ) {
                if ( this.state.password !== '' ) {
                    let data = {
                        newUser: false,
                        username: this.state.username,
                        pass: this.state.password
                    };

                    document.cookie='username=' + this.state.username + '; path=/';
                    this.props.loginAttempt(data);
                }

                else {
                    this.passwordDOM.focus();
                    alert('The password field is blank');
                }
            }

            else {
                this.usernameDOM.focus();
                alert('The username field is blank');
            }
        }

    }

    render() {
        return (
            <div id='sign-in-container'>
                <img id='navigate-back-img' src='/images/back_arrow.png' onClick={this.props.onBack} alt='cannot load back_arrow.png' />
                <DisplaySignInPane username={this.state.username} password={this.state.password} onChange={this.onChange} onSubmit={this.onSubmit} />
                <DisplaySignUpPane onSignUp={this.props.onSignUp} />
            </div>
        );
    }
}

export default SignIn;