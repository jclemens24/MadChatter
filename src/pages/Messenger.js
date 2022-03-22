import React, { useEffect, useState, useRef } from 'react';
import './Messenger.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Message from '../components/Message';
import Conversation from '../components/Conversation';
import ChatOnline from '../components/ChatOnline';
import { useHttp } from '../hooks/useHttp';
import { userToken, authorizedUser } from '../slices/authSlice';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { DoneAll } from '@mui/icons-material';

const Messenger = () => {
  const authUser = useSelector(authorizedUser);
  const token = useSelector(userToken);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { loading, error, sendRequest, clearError } = useHttp();
  const socket = useRef();
  const scrollRef = useRef();
  const { _id, firstName } = authUser;

  const handleCurrentChat = chat => {
    setCurrentChat(chat);
  };

  useEffect(() => {
    localStorage.setItem('currentChat', JSON.stringify(currentChat));
  }, [currentChat]);

  useEffect(() => {
    const storedCurrentChat = JSON.parse(localStorage.getItem('currentChat'));
    if (storedCurrentChat) {
      handleCurrentChat(storedCurrentChat);
    }
  }, []);

  useEffect(() => {
    socket.current = io(`${process.env.REACT_APP_ASSETS}`, {
      auth: {
        _id: _id,
        userId: _id,
        username: firstName,
      },
    });

    socket.current.on('session', ({ sessionId, userId }) => {
      socket.current.auth = { sessionId };

      localStorage.setItem('sessionId', sessionId);

      socket.current.userId = userId;
    });

    socket.current.on('private message', data => {
      console.log(data);
      setArrivalMessage({
        sender: data.from,
        text: data.content,
        reciever: data.to,
        createdAt: Date.now(),
      });
      setMessages(prevMessages => {
        return [
          ...prevMessages,
          { sender: data.from, text: data.content, createdAt: Date.now() },
        ];
      });
    });
    return () => {
      socket.current.close();
    };
  }, [token, messages, _id, firstName, authUser, arrivalMessage]);

  useEffect(() => {
    const sessionId = localStorage.getItem('sessionId');

    if (sessionId) {
      socket.current.auth = { sessionId };
      socket.current.connect();
    }
  }, []);

  useEffect(() => {
    const getConversations = async () => {
      const res = await sendRequest(
        `${process.env.REACT_APP_BACKEND_URL}/conversations`,
        'GET',
        {
          Authorization: `Bearer ${token}`,
        }
      );
      setConversations(res.conversations);
    };
    getConversations();
  }, [token, sendRequest]);

  const getCurrentChatroom = async id => {
    const res = await axios({
      url: `${process.env.REACT_APP_BACKEND_URL}/messages/${id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.data;
    setMessages(data.messages);
    setCurrentChat(data.messages[0].conversationId);
    scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMessageSubmit = async event => {
    event.preventDefault();
    const reciever = currentChat.members.find(
      member => member._id !== authUser._id
    );
    const message = {
      sender: authUser._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    socket.current.emit('private message', {
      to: reciever,
      content: newMessage,
      from: authUser,
    });

    const res = await sendRequest(
      `${process.env.REACT_APP_BACKEND_URL}/messages`,
      'POST',
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      message
    );
    setMessages(prevMessages => {
      return [...prevMessages, res.messages];
    });
    setNewMessage('');
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return <LoadingSpinner asOverlay />;
  }

  if (error) {
    return <ErrorModal error={error} onClear={clearError} />;
  }

  return (
    <React.Fragment>
      <div className="messenger">
        <div className="chatMenu">
          <div className="chatMenuWrapper">
            <input
              placeholder="Search for friends"
              className="chatMenuInput"
              type="text"
            />
            {conversations &&
              conversations.map(conv => (
                <div
                  key={conv._id}
                  onClick={getCurrentChatroom.bind(null, conv._id)}
                >
                  <Conversation conversation={conv} user={authUser} />
                </div>
              ))}
          </div>
        </div>
        <div className="chatBox">
          <div className="chatBoxWrapper">
            {currentChat ? (
              <>
                <div className="chatBoxTop">
                  {messages.map(m => (
                    <div key={uuidv4()} ref={scrollRef}>
                      <Message
                        message={m}
                        own={authUser._id === m.sender._id ? true : false}
                        picture={m.sender}
                      />
                    </div>
                  ))}
                  {messages.every(message => message.read === true) && (
                    <DoneAll fontSize="small" />
                  )}
                </div>
                <div className="chatBoxBottom">
                  <input
                    className="chatMessageInput"
                    placeholder="Start Typing..."
                    onChange={e => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></input>
                  <button
                    className="chatSubmitButton"
                    onClick={handleMessageSubmit}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start a chat
              </span>
            )}
          </div>
        </div>
        <div className="chatOnline">
          <div className="chatOnlineWrapper">
            <ChatOnline
              onlineUsers={onlineUsers}
              user={authUser}
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Messenger;
