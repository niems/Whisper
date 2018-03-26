import React, { Component } from 'react';
import Login from './login/login'
import Chat from './chat/chat'
import './App.css';

const io = require('socket.io-client');
const {BrowserWindow} = window.require('electron').remote;

function DisplayAppView({ isLoggedIn, loginAttempt, closeApp }) {
  if (isLoggedIn) { //if the user successfully logged in
    return (
      <Chat closeApp={closeApp} />
    );
  }

  return (
    <Login loginAttempt={loginAttempt} closeApp={closeApp} />
  );
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {isLoggedIn: false};

    this.loginAttempt = this.loginAttempt.bind(this);
    this.closeApp = this.closeApp.bind(this);
  }

  //checks login data against server
  loginAttempt(data) {
    try {
      //test login attempt against server here
      this.socket = io('localhost:8080', {
        query: {
          userData: JSON.stringify(data) //passes user data - {newUser(true/false), email(if newUser is true), username, pass}
        }
      });

      //navigate to chat page if login is accepted
      this.setState({ isLoggedIn: true });
      BrowserWindow.getAllWindows()[0].setSize(750, 500); //chat ui screen size update


    }
    catch(e) {
      console.log(`ERR loginAttempt(): ${e.message}`);
    }    
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
        <DisplayAppView isLoggedIn={this.state.isLoggedIn} loginAttempt={this.loginAttempt} closeApp={this.closeApp} />
      </div>
    );
  }    
}

export default App;
