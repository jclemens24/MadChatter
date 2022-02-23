import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/useHttp';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PhotoItem from '../components/PhotoItem';
import PhotoModal from '../UI/PhotoModal';
import './Photos.css';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';

export default function Photos() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(true);
  const [photos, setPhotos] = useState([]);
  const token = useSelector(state => state.auth.token);
  const authUser = useSelector(state => state.auth.user);
  const { loading, error, sendRequest, clearError } = useHttp();

  useEffect(() => {
    const fetchPhotos = async () => {
      const res = await sendRequest(
        `http://localhost:8000/api/users/${userId}/photos`,
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
