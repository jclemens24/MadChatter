import './Message.css';
import { format } from 'timeago.js';

export default function Message(props) {
  return (
    <div className={props.own ? 'message own' : 'message'}>
      <div className="messageTop">
        <img
          className="messageImg"
          src={`${props.picture.profilePic}`}
          alt=""
        />
        <p className="messageText">{props.message.text}</p>
      </div>
      <div className="messageBottom">{format(props.message.createdAt)}</div>
    </div>
  );
}
