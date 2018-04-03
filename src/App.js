import React, { Component } from 'react';
import NewChat from './chat/new_chat'
import Chat from './chat/chat'

import Titlebar from './titlebar'
import Settings from './settings'
import LandingPage from './login/landing_page'
import './App.css'

const io = require('socket.io-client');
const {BrowserWindow} = window.require('electron').remote;

function parseCookie() {
  let username = '';
  let cookie = document.cookie;
  let usernameIndex = cookie.indexOf('=', cookie.indexOf('username=') ) + 1; //+1 - don't want the '=' included
  let endUsernameIndex = cookie.indexOf(';', usernameIndex);

  
  //if username cookie exists
  if (endUsernameIndex === -1 && usernameIndex !== -1) {
      username = cookie.replace('username=', '');
  }

  //cookie exists, and is the only cookie (since the end index is -1 that means the ';' wasn't found because it doesn't put one at the end)
  else if ( usernameIndex !== -1 ) {           
      username = cookie.slice(usernameIndex, endUsernameIndex);
  }  

  return username;
}

function DisplayAppView({ userData, isLoggedIn, loginAttempt, loginFailed, loginSuccess }) {
  if (isLoggedIn) { //if the user successfully logged in
    return (
      <NewChat userData={userData} loginFailed={loginFailed} loginSuccess={loginSuccess} />
    );
  }

  return (
    <LandingPage loginAttempt={loginAttempt} />
  );
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displaySettings: false, //CHANGE TO FALSE IF NOT TESTING. determines if settings are being displayed
      isLoggedIn: false,   //CHANGE TO FALSE IF NOT TESTING
      username: ''         //renders in the middle of titlebar once set (after user logs in)
    }; 
    this.userData = undefined; //data provided from user when initially logging in  {newUser, email(if new user), username, pass}

    this.loginAttempt = this.loginAttempt.bind(this);
    this.loginFailed = this.loginFailed.bind(this); //callback for chat.js - if user's login attempt fails
    this.onOpenSettings = this.onOpenSettings.bind(this); //opens the settings modal window
  }

  //checks login data against server
  loginAttempt(data) {
    try {
      //navigate to chat page if login is accepted
      this.userData = data,        //stores the data returned from login verification & initial login attempt data
      
      this.setState({ 
        isLoggedIn: true,       //attempt to login to account provided
        username: parseCookie() //'username' cookie set in login.js, updating titlebar w/username
      });
    }
    catch(e) {
      console.log(`ERR loginAttempt(): ${e.message}`);
    }    
  }

   loginFailed(msg) {
     alert(msg);
     //delete username cookie

     this.setState({
       isLoggedIn: false,     //reset
       username: ''          //reset
      });
   }

  closeApp(e) {
    try {
      BrowserWindow.getAllWindows()[0].close();
    }
    catch(e) {
    console.log(`ERR closeApp(): ${e.message}`);
    }
  }

  onOpenSettings(e) {
    try {
      this.setState({
        displaySettings: !this.state.displaySettings
      });
    }
    catch(e) {
      console.log(`ERR onOpenSettings(): ${e.message}`);
    }
  }

  render() {
    let settingsMenu = null;

    if ( this.state.displaySettings ) {
      settingsMenu = <Settings />;
    }    

    return (
      <div className="App wrapper">
        <Titlebar onOpenSettings={this.onOpenSettings} onClose={this.closeApp} />
        {settingsMenu}
        <DisplayAppView userData={this.userData} isLoggedIn={this.state.isLoggedIn}
                        loginAttempt={this.loginAttempt} loginFailed={this.loginFailed} loginSuccess={this.loginSuccess} />
      </div>
    );
  }    
}

export default App;