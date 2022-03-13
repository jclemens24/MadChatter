import React, { useState, useRef } from 'react';
import {
  PermMedia,
  Label,
  Room,
  EmojiEmotions,
  Cancel,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import './Share.css';
import { makeAPost } from '../slices/postThunks';
import { userToken } from '../slices/authSlice';
import InputEmojiWithRef from 'react-input-emoji';

const Share = props => {
  const token = useSelector(userToken);
  const desc = useRef();
  const filePicker = useRef();
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState('');
  const submitHandler = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('desc', text);
    formData.append('image', file);
    await dispatch(makeAPost({ token, formData })).unwrap();
    desc.current.value = '';
  };

  const handleOnEnter = text => {
    setText(text);
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

  const picture = props.user.profilePic.startsWith('https')
    ? `${props.user.profilePic}`
    : `http://localhost:8000/${props.user.profilePic}`;

  return (
    <div className="share">
      <div className="shareWrapper">
        <div className="shareTop">
          <img className="shareProfileImg" src={picture} alt="" />
          <InputEmojiWithRef
            placeholder={"What's on your mind " + props.user.firstName + '?'}
            className="shareInput"
            ref={desc}
            onEnter={handleOnEnter}
            onChange={setText}
            cleanOnEnter
            value={text}
          />
        </div>
        <hr className="shareHr" />
        {file && (
          <div className="shareImgContainer">
            <img className="shareImg" src={previewUrl} alt="" />
            <Cancel className="shareCancelImg" onClick={() => setFile(null)} />
          </div>
        )}
        <form
          className="shareBottom"
          onSubmit={submitHandler}
          encType="multipart/form-data"
        >
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
          </div>
          <button className="shareButton" type="submit">
            Share
          </button>
        </form>
      </div>
    </div>
  );
};

export default Share;
