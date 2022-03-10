import React, { useEffect, useState } from 'react';
import Post from '../components/Posts';
import Share from '../components/Share';
import './TimelineFeed.css';
import { useSelector } from 'react-redux';
import { useHttp } from '../hooks/useHttp';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { userToken } from '../slices/authSlice';

const TimelineFeed = props => {
  const token = useSelector(userToken);
  const authUser = useSelector(state => state.auth.user);
  const [allPosts, setAllPosts] = useState([]);
  const { loading, error, sendRequest, clearError } = useHttp();

  useEffect(() => {
    const fetchAllPosts = async () => {
      const res = await sendRequest(`http://localhost:8000/api/posts`, 'GET', {
        Authorization: `Bearer ${token}`,
      });
      setAllPosts(
        res.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    };
    fetchAllPosts();
  }, [sendRequest, token]);

  useEffect(() => {
    const storage = localStorage.getItem('feed');
    if (storage) setAllPosts(JSON.parse(storage));
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
            <Post key={p._id} post={p} user={p.userId} />
          ))}
        </div>
      </div>
    </React.Fragment>
  );
};

export default TimelineFeed;
