import React from 'react';
import Backdrop from './Backdrop';
import ReactDOM from 'react-dom';
import './PhotoModal.css';

const Overlay = props => {
  const content = (
    <div className="wrapper">
      <button className="modalWrapperBtn" onClick={props.onClear}>
        &times;
      </button>
      <div className="photo--modal">{props.children}</div>
    </div>
  );
  return ReactDOM.createPortal(content, document.getElementById('modal'));
};

export default function PhotoModal(props) {
  return (
    <React.Fragment>
      {props.show && <Backdrop onClick={props.onClear} />}
      <Overlay {...props} />
    </React.Fragment>
  );
}
