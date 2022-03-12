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

const Share = props => {
  const token = useSelector(userToken);
  const desc = useRef();
  const filePicker = useRef();
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const submitHandler = async event => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('desc', desc.current.value);
    formData.append('image', file);
    await dispatch(makeAPost({ token, formData })).unwrap();
    desc.current.value = '';
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
          <input
            placeholder={"What's on your mind " + props.user.firstName + '?'}
            className="shareInput"
            ref={desc}
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
                htmlColor="tomato"
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
              <Label htmlColor="blue" className="shareIcon" />
              <span className="shareOptionText">Tag</span>
            </div>
            <div className="shareOption">
              <Room htmlColor="green" className="shareIcon" />
              <span className="shareOptionText">Location</span>
            </div>
            <div className="shareOption">
              <EmojiEmotions htmlColor="goldenrod" className="shareIcon" />
              <span className="shareOptionText">Feelings</span>
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
