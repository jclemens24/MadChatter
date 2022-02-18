import React, { useState } from 'react';
import LeftBar from '../components/LeftBar';
import RightBar from '../components/RightBar';
import UserFeed from '../components/UserFeed';
import './Profile.css';
import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import LoadingSpinner from '../UI/LoadingSpinner';

const Profile = props => {
  const authUser = useSelector(state => state.auth.user);
  const posts = useSelector(state => state.post.posts);
  const { status } = useSelector(state => state.auth);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [file, setFile] = useState(null);

  const changeImageHandler = () => {
    document.querySelector('.profile__user-image').setAttribute('type', 'file');
  };

  const grabImageHandler = async event => {
    const chosenFile = event.target.files[0];
    setPreviewUrl(window.URL.createObjectURL(chosenFile));
    setFile(event.target.files[0]);
    console.log(event.target.files[0]);
  };

  const submitHandler = event => {
    event.preventDefault();
  };

  if (status === 'pending') {
    return <LoadingSpinner asOverlay />;
  }

  return (
    <React.Fragment>
      <div className="profile">
        <LeftBar user={authUser} />
        <div className="profile__right">
          <div className="profile__top">
            <div className="profile__cover-pic">
              <img
                className="profile__cover-image"
                src={`${authUser.coverPic}`}
                alt={`${authUser.firstName} profile`}
              />
              <form onSubmit={submitHandler}>
                {!file && (
                  <input
                    className="profile__user-image"
                    src={
                      authUser.profilePic.startsWith('https')
                        ? `${authUser.profilePic}`
                        : `http://localhost:8000/${authUser.profilePic}`
                    }
                    alt=""
                    type="image"
                    onClick={changeImageHandler}
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={grabImageHandler}
                  />
                )}{' '}
                {file && (
                  <img
                    className="profile__user-image"
                    src={previewUrl}
                    alt=""
                  />
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
