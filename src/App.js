import React, { Component } from 'react';
import Login from './login/login'
import Chat from './chat/chat'
import './App.css';

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


function DisplayTitlebar({ username, onClose }) {
    return (
        <div id='display-titlebar-container'>
            <img id='titlebar-menu-icon' src='/images/menu_white.png' />
            <small id='titlebar-username'>{username}</small>
            <img className='titlebar-icon' id='close-app' onClick={onClose} src='/images/close_white.png' />
        </div>
    ); 
}

function DisplayAppView({ loginData, isLoggedIn, loginAttempt, loginFailed, closeApp }) {
  if (isLoggedIn) { //if the user successfully logged in
    return (
      <Chat loginData={loginData} loginFailed={loginFailed} />
    );
  }

  return (
    <Login loginAttempt={loginAttempt} />
  );
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoggedIn: false,   //CHANGE TO FALSE IF NOT TESTING
      username: ''         //renders in the middle of titlebar once set (after user logs in)
    }; 
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
      this.setState({ 
        isLoggedIn: true,       //attempt to login to account provided
        username: parseCookie() //'username' cookie set in login.js, updating titlebar w/username
      });

      BrowserWindow.getAllWindows()[0].setSize(750, 500); //chat ui screen size update
    }
    catch(e) {
      console.log(`ERR loginAttempt(): ${e.message}`);
    }    
  }

   loginFailed() {
     alert('login failed');

     this.setState({
       isLoggedIn: false,     //reset
       username: ''          //reset
      });
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
        <DisplayTitlebar username={this.state.username} onClose={this.closeApp} />
        <DisplayAppView loginData={this.loginData} isLoggedIn={this.state.isLoggedIn} loginAttempt={this.loginAttempt}
                        loginFailed={this.loginFailed} closeApp={this.closeApp} />
      </div>
    );
  }    
}

export default App;
