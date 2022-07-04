import React, { useEffect, useState } from 'react';
import Feed from '../components/Feed';
import Share from '../components/Share';
import './TimelineFeed.css';
import { useSelector } from 'react-redux';
import { useHttp } from '../hooks/useHttp';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { userToken, authorizedUser } from '../slices/authSlice';

const TimelineFeed = () => {
  const token = useSelector(userToken);
  const authUser = useSelector(authorizedUser);
  const [allPosts, setAllPosts] = useState([]);
  const { loading, error, sendRequest, clearError } = useHttp();

  useEffect(() => {
    const fetchAllPosts = async () => {
      const res = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/posts`,
        'GET',
        {
          Authorization: `Bearer ${token}`,
        }
      );
      setAllPosts(
        res.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    };
    fetchAllPosts();
  }, [sendRequest, token]);

  useEffect(() => {
    const storage = JSON.parse(localStorage.getItem('feed'));
    if (storage) setAllPosts(storage);
  }, []);

  if (loading) {
    return <LoadingSpinner asOverlay />;
  }
  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }
  return (
    <React.Fragment>
      <div className="timeline__feed">
        <div className="timeline__feed__wrapper">
          {authUser._id && authUser.firstName && <Share user={authUser} />}
          {allPosts?.map(p => (
            <Feed key={p._id} post={p} user={p.toUser} />
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default TimelineFeed;