import React from 'react';
import Modal from './Modal';
import './ErrorModal.css';

const ErrorModal = props => {
  return (
    <Modal
      onCancel={props.onClear}
      header="An Error Occurred!"
      show={!!props.error}
      footer={<button onClick={props.onClear}>Okay</button>}
      style={{ textAlign: 'center' }}
    >
      <p>{props.error}</p>
    </Modal>
  );
};

export default ErrorModal;
