import React, { Component } from 'react';
import Login from './login/login'
import Chat from './chat/chat'
import './App.css';

const io = require('socket.io-client');
const {BrowserWindow} = window.require('electron').remote;

function DisplayTitlebar({ onClose }) {
  return (
      <div className='titlebar-container'>
          <img id='titlebar-menu-icon' src='/images/menu_white.png' />
          <img className='titlebar-icon' id='close-app' onClick={onClose} src='/images/close.svg' />
      </div>
  );
}

function DisplayAppView({ loginData, isLoggedIn, loginAttempt, loginFailed, closeApp }) {
  if (isLoggedIn) { //if the user successfully logged in
    return (
      <Chat loginData={loginData} loginFailed={loginFailed} closeApp={closeApp} />
    );
  }

  return (
    <Login loginAttempt={loginAttempt} closeApp={closeApp} />
  );
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {isLoggedIn: false}; /*CHANGE TO FALSE AFTER TESTING IS DONE*/
    this.loginData = undefined; //data provided from user when initially logging in  {newUser, email(if new user), username, pass}

    this.loginAttempt = this.loginAttempt.bind(this);
    this.loginFailed = this.loginFailed.bind(this); //callback for chat.js - if user's login attempt fails
    this.closeApp = this.closeApp.bind(this);
  }

  //checks login data against server
  loginAttempt(data) {
    try {
      this.loginData = data;

      //navigate to chat page if login is accepted
      this.setState({ isLoggedIn: true });
      BrowserWindow.getAllWindows()[0].setSize(750, 500); //chat ui screen size update

    }
    catch(e) {
      console.log(`ERR loginAttempt(): ${e.message}`);
    }    
  }

   loginFailed() {
     alert('login failed');

     this.setState({ isLoggedIn: false });
     BrowserWindow.getAllWindows()[0].setSize(400, 600); //resets screen size based on login page
   }

  closeApp(e) {
    try {
      BrowserWindow.getAllWindows()[0].close();
    }
    catch(e) {
    console.log(`ERR closeApp(): ${e.message}`);
    }
  }

  render() {
    return (
      <div className="App wrapper">
        <DisplayTitlebar onClose={this.closeApp} />
        <DisplayAppView loginData={this.loginData} isLoggedIn={this.state.isLoggedIn} loginAttempt={this.loginAttempt}
                        loginFailed={this.loginFailed} closeApp={this.closeApp} />
      </div>
    );
  }    
}

export default App;
