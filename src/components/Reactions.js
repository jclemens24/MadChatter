import './Reactions.css';
import { useDispatch } from 'react-redux';
import { friendAction } from '../slices/friendSlice';
import { postActions } from '../slices/postSlice';

const reactionEmoji = {
  thumbsUp: '👍',
  heart: '💖',
  rocket: '🚀',
  eyes: '👀',
  lol: '😂',
  hooray: '🎉',
  angryFace: '😡',
  sadFace: '😢',
};

export default function Reactions({ comment }) {
  const dispatch = useDispatch();

  const reactionButtons = Object.entries(reactionEmoji).map(([key, value]) => {
    return (
      <button
        key={key}
        type="button"
        className="reaction-button"
        onClick={() =>
          dispatch(
            postActions.reactionAdded({
              commentId: comment._id,
              reaction: key,
            })
          ) &&
          dispatch(
            friendAction.reactionAdded({
              commentId: comment._id,
              reaction: key,
            })
          )
        }
      >
        {value} {comment.reactions[key]}
      </button>
    );
  });
  return <div>{reactionButtons}</div>;
}
