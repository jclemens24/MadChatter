import Card from '../UI/Card';
import './PhotoItem.css';
import { useHttp } from '../hooks/useHttp';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authAction } from '../slices/authSlice';
import { userToken } from '../slices/authSlice';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';

export default function PhotoItem(props) {
  const token = useSelector(userToken);
  const authUser = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { loading, error, sendRequest, clearError } = useHttp();

  const handlePictureSubmit = async () => {
    await sendRequest(
      `http://localhost:8000/api/users/${userId}/photos`,
      'PUT',
      { Authorization: `Bearer ${token}` },
      { photo: props.photo }
    );
    dispatch(authAction.setProfilePic({ photo: props.photo }));
    props.onClear();
  };
  const handlePictureDelete = async () => {
    await sendRequest(
      `http://localhost:8000/api/users/photos/${props.photo}`,
      'PATCH',
      { Authorization: `Bearer ${token}` }
    );
    dispatch(authAction.deleteAPhoto(props.photo));
    props.onClear();
  };

  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }
  return (
    <li className="photo-item">
      <Card>
        {loading && <LoadingSpinner asOverlay />}
        <div className="photo-image">
          <img
            className="images"
            src={
              props.photo.startsWith('https')
                ? `${props.photo}`
                : `http://localhost:8000/${props.photo}`
            }
            alt=""
          />
        </div>
        {authUser._id === userId && (
          <div className="photo-actions">
            <button
              type="button"
              className="btn photo-actions"
              onClick={handlePictureSubmit.bind(null, props.photo)}
            >
              Set As...
            </button>
            <button
              type="button"
              className="btn photo-actions"
              onClick={handlePictureDelete}
            >
              Delete
            </button>
          </div>
        )}
      </Card>
    </li>
  );
}
