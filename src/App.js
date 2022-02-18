import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar.js';
import Register from './pages/Register.js';
import Login from './pages/Login.js';
import Profile from './pages/Profile';
import Messenger from './pages/Messenger';
import FriendProfile from './pages/FriendProfile';
import './App.css';

function App() {
  const [loginMode, setLoginMode] = useState(false);

  const switchLoginMode = () => {
    setLoginMode(prevState => {
      return !prevState;
    });
  };
  return (
    <div className="App">
      <BrowserRouter>
        <TopBar />
        <Routes>
          <Route
            path="/"
            element={
              loginMode ? (
                <Login onSwitch={switchLoginMode} />
              ) : (
                <Register onSwitch={switchLoginMode} />
              )
            }
          />
          <Route path="/:userId/profile" element={<Profile />} />
          <Route path="/messenger" element={<Messenger />} />
          <Route path="/:userId/profile/friend" element={<FriendProfile />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
