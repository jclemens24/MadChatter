import './Message.css';
import { format } from 'timeago.js';

export default function Message(props) {
  const picture = props.message.sender.profilePic.startsWith('https')
    ? `${props.message.sender.profilePic}`
    : `http://localhost:8000/${props.message.sender.profilePic}`;

  return (
    <div className={props.own ? 'message own' : 'message'}>
      <div className="messageTop">
        <img className="messageImg" src={picture} alt="" />
        <p className="messageText">{props.message.text}</p>
      </div>
      <div className="messageBottom">{format(props.message.createdAt)}</div>
    </div>
  );
}
