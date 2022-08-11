import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFoundImg.css';
import img from '../assets/page_not_found.png';

const NotFoundImg = () => {
  const isActive = useRef();

  useEffect(() => {
    isActive.current = true;

    return () => {
      isActive.current = false;
    };
  }, []);
  const navigate = useNavigate();

  const handleOnClick = () => {
    navigate('/');
  };
  return (
    <React.Fragment>
      <button className="not_found_btn" onClick={handleOnClick} type="button">
        Go Back Home
      </button>
      {isActive && <img src={img} alt="resource not found" />}
    </React.Fragment>
  );
};

export default NotFoundImg;
