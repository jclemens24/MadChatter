import React, { useEffect, useState, useRef } from 'react';
import './Messenger.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Message from '../components/Message';
import Conversation from '../components/Conversation';
import ChatOnline from '../components/ChatOnline';
import { useHttp } from '../hooks/useHttp';
import { userToken } from '../slices/authSlice';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorModal from '../UI/ErrorModal';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const Messenger = () => {
  const authUser = useSelector(state => state.auth.user);
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

  useEffect(() => {
    socket.current = io('http://localhost:8000', {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    socket.current.on('postMessage', data => {
      console.log(data);
      setArrivalMessage({
        sender: data.sender,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, [token, arrivalMessage]);

  useEffect(() => {
    arrivalMessage &&
      setMessages(prevMessages => {
        return [...prevMessages, arrivalMessage];
      });
  }, [arrivalMessage]);

  useEffect(() => {
    socket.current.emit('addUser', authUser);
  }, [authUser]);

  useEffect(() => {
    const getConversations = async () => {
      const res = await sendRequest(
        `http://localhost:8000/api/conversations`,
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
      url: `http://localhost:8000/api/messages/${id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.data;
    console.log(data.messages);
    setMessages(data.messages);
    setCurrentChat(data.messages[0].conversationId);
  };

  const handleMessageSubmit = async event => {
    event.preventDefault();
    const reciever = currentChat.members.find(
      member => member._id !== authUser._id
    );
    const message = {
      senderId: authUser._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    socket.current.emit('sendMessage', {
      sender: authUser,
      reciever: reciever,
      text: newMessage,
    });

    const res = await sendRequest(
      `http://localhost:8000/api/messages`,
      'POST',
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      message
    );
    setMessages([...messages, res.messages]);
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
                  {messages &&
                    messages.map(m => (
                      <div key={uuidv4()} ref={scrollRef}>
                        <Message
                          message={m}
                          own={authUser._id === m.sender._id}
                          picture={m.sender}
                        />
                      </div>
                    ))}
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
