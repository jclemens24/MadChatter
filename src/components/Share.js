import React, { useState, useRef } from 'react';
import { PermMedia, Label, Room, Cancel } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import './Share.css';
import { makeAPost } from '../slices/postThunks';
import { userToken, authorizedUser } from '../slices/authSlice';
import InputEmojiWithRef from 'react-input-emoji';
import { makeAPostOnFriendsWall } from '../slices/friendSlice';

const Share = props => {
  const token = useSelector(userToken);
  const authUser = useSelector(authorizedUser);
  const filePicker = useRef();
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState('');

  const sendPostRequestOnOwnWall = async formData => {
    await dispatch(makeAPost({ token, formData }))
      .unwrap()
      .then(() => {
        setText('');
        setPreviewUrl(null);
        setFile(null);
      });
  };

  const sendPostRequestOnFriendsWall = async formData => {
    await dispatch(makeAPostOnFriendsWall({ token, formData }))
      .unwrap()
      .then(() => {
        setText('');
        setPreviewUrl(null);
        setFile(null);
      });
  };

  const submitHandler = event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('desc', text);
    formData.append('image', file);
    formData.append('to', props.user._id);
    formData.append('from', authUser._id);

    props.user._id === authUser._id
      ? sendPostRequestOnOwnWall(formData)
      : sendPostRequestOnFriendsWall(formData);
  };

  const grabImageHandler = event => {
    event.preventDefault();
    const chosenFile = event.target.files[0];
    setPreviewUrl(window.URL.createObjectURL(chosenFile));
    setFile(event.target.files[0]);
  };
  const pickImageHandler = () => {
    filePicker.current.click();
  };

  return (
    <div className="share">
      <div className="shareWrapper">
        <form onSubmit={submitHandler} encType="multipart/form-data">
          <div className="shareTop">
            <img
              className="shareProfileImg"
              src={`${process.env.REACT_APP_ASSETS}/${authUser.profilePic}`}
              alt={`${authUser.firstName}`}
            />
            <InputEmojiWithRef
              placeholder={
                props.user._id === authUser._id
                  ? "What's on your mind " + props.user.firstName + '?'
                  : `Share a post on ${props.user.firstName}'s wall`
              }
              className="shareInput"
              onChange={setText}
              value={text}
              fontFamily={'Open Sans'}
            />
          </div>
          <hr className="shareHr" />
          {file && (
            <div className="shareImgContainer">
              <img className="shareImg" src={previewUrl} alt="" />
              <Cancel
                className="shareCancelImg"
                onClick={() => setFile(null)}
              />
            </div>
          )}
          <div className="shareOptions">
            <label htmlFor="image" className="shareOption">
              <PermMedia
                htmlColor="#2f9e44"
                className="shareIcon"
                onClick={pickImageHandler}
              />
              <span className="shareOptionText">Photo or Video</span>
              <input
                style={{ display: 'none' }}
                ref={filePicker}
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={grabImageHandler}
              />
            </label>
            <div className="shareOption">
              <Label htmlColor="#c2255c" className="shareIcon" />
              <span className="shareOptionText">Tag</span>
            </div>
            <div className="shareOption">
              <Room htmlColor="#3b5bdb" className="shareIcon" />
              <span className="shareOptionText">Location</span>
            </div>
            <button className="shareButton" type="submit">
              Share
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Share;
