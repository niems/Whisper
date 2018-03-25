import React, { Component } from 'react';
import Login from './login/login'
import Chat from './chat/chat'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App wrapper">
        <Chat />
      </div>
    );
  }
}

export default App;
