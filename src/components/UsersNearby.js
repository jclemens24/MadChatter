import './UsersNearby.css';
import { AddCircle } from '@mui/icons-material';

const UsersNearby = props => {
  const handleAddFriend = async id => {
    console.log(id);
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
