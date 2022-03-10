import './UsersNearby.css';
import { AddCircle } from '@mui/icons-material';
import { addAFriend } from '../slices/authThunks';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { userToken } from '../slices/authSlice';

const UsersNearby = props => {
  const token = useSelector(userToken);
  const authUser = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const handleAddFriend = async id => {
    dispatch(addAFriend({ id, userId: authUser._id, token }));
  };
  return (
    <li className="friendsNearbyList">
      <img
        className="friendsNearbyImg"
        src={
          props.user.profilePic.startsWith('https')
            ? `${props.user.profilePic}`
            : `http://localhost:8000/${props.user.profilePic}`
        }
        alt=""
      />
      <h4>
        {props.user.firstName} {props.user.lastName}
      </h4>
      <AddCircle
        className="add_icon"
        onClick={handleAddFriend.bind(null, props.user._id)}
      />
    </li>
  );
};

export default UsersNearby;