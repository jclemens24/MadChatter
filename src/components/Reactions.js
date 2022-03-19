import './Reactions.css';
import { useDispatch } from 'react-redux';
import { friendAction } from '../slices/friendSlice';

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
            friendAction.reactionAdded({
              commentId: comment._id,
              reaction: key,
            })
          )
        }
      >
        {value} {0}
      </button>
    );
  });
  return <div>{reactionButtons}</div>;
}
