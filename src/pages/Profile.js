import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import LeftBar from '../components/LeftBar';
import RightBar from '../components/RightBar';
import UserFeed from '../components/UserFeed';
import './Profile.css';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { PhotoCamera } from '@mui/icons-material';
import LoadingSpinner from '../UI/LoadingSpinner';
import Modal from '../UI/Modal';
import { useHttp } from '../hooks/useHttp';
import ErrorModal from '../UI/ErrorModal';
import { authAction } from '../slices/authSlice';

const Profile = props => {
  const authUser = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const posts = useSelector(state => state.post.posts);
  const dispatch = useDispatch();
  const { loading, error, sendRequest, clearError } = useHttp();
  const { status } = useSelector(state => state.auth);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const grabImageHandler = event => {
    setShowModal(true);
    event.preventDefault();
    const chosenFile = event.target.files[0];
    setPreviewUrl(window.URL.createObjectURL(chosenFile));
    setFile(event.target.files[0]);
    console.log(event.target.files[0]);
  };

  const submitPhotoHandler = async event => {
    setShowModal(false);
    event.preventDefault();
    const formData = new FormData();
    formData.append('image', file);
    const res = await sendRequest(
      `http://localhost:8000/api/users/${authUser._id}/photos`,
      'POST',
      { Authorization: `Bearer ${token}` },
      formData
    );
    dispatch(authAction.setProfilePic({ photo: res.photo }));
    dispatch(authAction.updatePhotos(res.photo));
  };

  if (status === 'pending') {
    return <LoadingSpinner asOverlay />;
  }

  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }

  return (
    <React.Fragment>
      <div className="profile">
        <LeftBar user={authUser} />
        <div className="profile__right">
          <div className="profile__top">
            <div className="profile__cover-pic">
              <form>
                <img
                  className="profile__cover-image"
                  src={`${authUser.coverPic}`}
                  alt={`${authUser.firstName} profile`}
                />
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
                {!previewUrl && (
                  <img
                    className="profile__user-image"
                    src={
                      authUser.profilePic.startsWith('https')
                        ? `${authUser.profilePic}`
                        : `http://localhost:8000/${authUser.profilePic}`
                    }
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
                      footer={<button type="sumbit">Submit</button>}
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
              <span className="profile__info--desc">My catch phrase</span>
            </div>
          </div>
          <div className="profile__right--bottom">
            <UserFeed user={authUser} posts={posts} />
            <RightBar user={authUser} />
          </div>
          <Outlet />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Profile;
