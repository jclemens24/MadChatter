import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/useHttp';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PhotoItem from '../components/PhotoItem';
import PhotoModal from '../UI/PhotoModal';
import './Photos.css';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { userToken, authorizedUser } from '../slices/authSlice';

export default function Photos() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);
  const [photos, setPhotos] = useState([]);
  const token = useSelector(userToken);
  const authUser = useSelector(authorizedUser);
  const { loading, error, sendRequest, clearError } = useHttp();

  useEffect(() => {
    const fetchPhotos = async () => {
      const res = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/users/${userId}/photos`,
        'GET',
        { Authorization: `Bearer ${token}` }
      );
      setPhotos(res.photos.photos);
    };
    fetchPhotos();
  }, [sendRequest, token, userId]);

  const closeModal = () => {
    setModalOpen(prevState => {
      return !prevState;
    });
    navigate(`/${authUser._id}/profile`);
  };

  if (loading) {
    return <LoadingSpinner asOverlay></LoadingSpinner>;
  }

  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }

  return (
    <PhotoModal show={modalOpen} onClear={closeModal}>
      <ul className="photo-list">
        {photos?.map(pic => (
          <PhotoItem key={pic} photo={pic} onClear={closeModal} />
        ))}
      </ul>
    </PhotoModal>
  );
}
