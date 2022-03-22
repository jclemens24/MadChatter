import React, { useState } from 'react';
import './Profile.css';
import { Outlet, useNavigate } from 'react-router-dom';
import LeftBar from '../components/LeftBar';
import RightBar from '../components/RightBar';
import UserFeed from '../components/UserFeed';
import ErrorModal from '../UI/ErrorModal';
import LoadingSpinner from '../UI/LoadingSpinner';
import Modal from '../UI/Modal';
import { useSelector, useDispatch } from 'react-redux';
import { PhotoCamera, PhotoSizeSelectActual } from '@mui/icons-material';
import { useHttp } from '../hooks/useHttp';
import {
  authAction,
  userToken,
  authorizedUser,
  authError,
} from '../slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const authUser = useSelector(authorizedUser);
  const token = useSelector(userToken);
  const appError = useSelector(authError);
  const navigate = useNavigate();
  const { loading, error, sendRequest, clearError } = useHttp();
  const { status } = useSelector(state => state.auth);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const grabImageHandler = event => {
    setShowModal(true);
    event.preventDefault();
    const chosenFile = event.target.files[0];
    setPreviewUrl(window.URL.createObjectURL(chosenFile));
    setFile(event.target.files[0]);
  };

  const grabCoverImageHandler = event => {
    setShowModal(true);
    event.preventDefault();
    const chosenFile = event.target.files[0];
    setCoverPreviewUrl(window.URL.createObjectURL(chosenFile));
    setCoverPhotoFile(event.target.files[0]);
  };

  const handleComponentError = () => {
    dispatch(authAction.acknowledgeError());
  };

  const submitPhotoHandler = async event => {
    setShowModal(false);
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', file);
    const res = await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/users/${authUser._id}/photos`,
      'POST',
      { Authorization: `Bearer ${token}` },
      formData
    );
    dispatch(authAction.setProfilePic({ photo: res.photo }));
    dispatch(authAction.updatePhotos(res.photo));
  };

  const submitCoverPhotoHandler = async event => {
    setShowModal(false);
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', coverPhotoFile);
    const res = await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/users/${authUser._id}/photos`,
      'PATCH',
      { Authorization: `Bearer ${token}` },
      formData
    );
    dispatch(authAction.updateCoverPic({ photo: res.photo }));
  };

  const handlePhotoModal = () => {
    setShowModal(false);
    navigate(-2);
  };

  if (status === 'pending') {
    return <LoadingSpinner asOverlay />;
  }

  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }

  if (status === 'failed') {
    return <ErrorModal error={appError} onClear={handleComponentError} />;
  }

  return (
    <React.Fragment>
      <div className="profile">
        <LeftBar user={authUser} />
        <div className="profile__right">
          <div className="profile__top">
            <div className="profile__cover-pic">
              <form>
                {!coverPhotoFile && (
                  <input
                    className="visually-hidden"
                    type="file"
                    id="coverimage"
                    name="coverimage"
                    accept="image/*"
                    onChange={grabCoverImageHandler}
                  />
                )}
                <label
                  className="visually-hidden__label-hidden-cover-image"
                  htmlFor="coverimage"
                >
                  <PhotoSizeSelectActual />
                </label>
                {!coverPhotoFile && (
                  <img
                    className="profile__cover-image"
                    src={`${process.env.REACT_APP_ASSETS}/${authUser.coverPic}`}
                    alt={`${authUser.firstName} profile`}
                  />
                )}
                {coverPreviewUrl && (
                  <React.Fragment>
                    <img
                      className="profile__cover-image"
                      src={coverPreviewUrl}
                      alt="Upload new cover"
                    />
                    <Modal
                      show={showModal}
                      header="Upload This Photo?"
                      onSubmit={submitCoverPhotoHandler}
                      footer={
                        <div className="photo__modal--actions">
                          <button type="sumbit">Submit</button>
                          <button onClick={handlePhotoModal} type="button">
                            Cancel
                          </button>
                        </div>
                      }
                      contentClass={'photo_submit'}
                    >
                      {loading && <LoadingSpinner />}
                      {<img src={coverPreviewUrl} alt="" />}
                    </Modal>
                  </React.Fragment>
                )}
                {!file && (
                  <input
                    className="visually-hidden"
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={grabImageHandler}
                  />
                )}
                <label className="visually-hidden__label" htmlFor="image">
                  <PhotoCamera />
                </label>
                {!file && (
                  <img
                    className="profile__user-image"
                    src={`${process.env.REACT_APP_ASSETS}/${authUser.profilePic}`}
                    alt=""
                  />
                )}
                {previewUrl && (
                  <React.Fragment>
                    <img
                      className="profile__user-image"
                      src={previewUrl}
                      alt=""
                    />
                    <Modal
                      show={showModal}
                      header="Upload This Photo?"
                      onSubmit={submitPhotoHandler}
                      footer={
                        <div className="photo__modal--actions">
                          <button type="sumbit">Submit</button>
                          <button onClick={handlePhotoModal} type="button">
                            Cancel
                          </button>
                        </div>
                      }
                      contentClass={'photo_submit'}
                    >
                      {loading && <LoadingSpinner />}
                      {<img src={previewUrl} alt="" />}
                    </Modal>
                  </React.Fragment>
                )}
              </form>
            </div>
            <div className="profile__info">
              <h4 className="profile__info--name">{`${authUser.firstName} ${authUser.lastName}`}</h4>
              <span className="profile__info--desc">
                {authUser.catchPhrase}
              </span>
            </div>
          </div>
          <div className="profile__right--bottom">
            <UserFeed user={authUser} />
            <RightBar user={authUser} />
          </div>
          <Outlet />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Profile;
