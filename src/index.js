import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.js';
import { store } from './store/Store';
import { Provider } from 'react-redux';
import { initializeUser } from './slices/authThunks';

store.dispatch(initializeUser(JSON.parse(localStorage.getItem('user'))));

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
