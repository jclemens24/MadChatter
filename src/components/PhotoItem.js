import React, { useState } from 'react';
import Card from '../UI/Card';
import './PhotoItem.css';
import { useHttp } from '../hooks/useHttp';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { authAction, userToken, authorizedUser } from '../slices/authSlice';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';

export default function PhotoItem(props) {
  const token = useSelector(userToken);
  const authUser = useSelector(authorizedUser);
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { loading, error, sendRequest, clearError } = useHttp();
  const [pictureOptions, setPictureOptions] = useState(false);

  const handleProfilePictureSubmit = async () => {
    await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/users/${userId}/photos`,
      'PUT',
      { Authorization: `Bearer ${token}` },
      { photo: props.photo }
    );
    dispatch(authAction.setProfilePic({ photo: props.photo }));
    props.onClear();
  };

  const handleCoverPictureSubmit = async () => {
    await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/users/photos/${props.photo}`,
      'PUT',
      { Authorization: `Bearer ${token}` }
    );
    dispatch(authAction.updateCoverPic({ photo: props.photo }));
    props.onClear();
  };

  const handlePictureDelete = async () => {
    await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/users/photos/${props.photo}`,
      'PATCH',
      { Authorization: `Bearer ${token}` }
    );
    dispatch(authAction.deleteAPhoto(props.photo));
    props.onClear();
  };

  const showDropDownHandler = () => {
    setPictureOptions(prevState => {
      return !prevState;
    });
  };

  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }
  return (
    <li className="photo-item">
      <Card>
        {loading && <LoadingSpinner />}
        <div className="photo-image">
          <img
            className="images"
            src={`${process.env.REACT_APP_ASSETS}/${props.photo}`}
            alt=""
          />
        </div>
        {authUser._id === userId && (
          <div className="photo-actions">
            <button
              type="button"
              className="btn photo-actions"
              onClick={showDropDownHandler}
            >
              Set As...
            </button>
            <div className="dropdown">
              {pictureOptions && (
                <div style={{ display: 'block' }} className="dropdown-content">
                  <span
                    className="dropdown-option"
                    onClick={handleProfilePictureSubmit.bind(null, props.photo)}
                  >
                    Profile Picture
                  </span>
                  <span
                    className="dropdown-option"
                    onClick={handleCoverPictureSubmit.bind(null, props.photo)}
                  >
                    Cover Picture
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn photo-actions"
              onClick={handlePictureDelete}
            >
              Delete
            </button>
          </div>
        )}
      </Card>
    </li>
  );
}
