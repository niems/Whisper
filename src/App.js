import React, { Component } from 'react';
import Login from './login/login'
import Chat from './chat/chat'
import './App.css';

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
    //alert(`${data.username}: ${data.pass}`);

    //test login attempt against server here

    this.setState({ isLoggedIn: true });
    BrowserWindow.getAllWindows()[0].setSize(750, 500);
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
