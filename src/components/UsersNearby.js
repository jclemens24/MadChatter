import './UsersNearby.css';

const UsersNearby = props => {
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
    </li>
  );
};

export default UsersNearby;
