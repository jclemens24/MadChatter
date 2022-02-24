import React, { useEffect, useState, useRef } from 'react';
import './Messenger.css';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Message from '../components/Message';
import Conversation from '../components/Conversation';
import ChatOnline from '../components/ChatOnline';

const Messenger = () => {
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const authUser = useSelector(state => state.auth.user);
  const token = useSelector(state => state.auth.token);
  const scrollRef = useRef();

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios({
          method: 'GET',
          url: `http://localhost:8000/api/conversations`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.data;
        console.log(data);
        setConversations(data.conversations);
        console.log(conversations);
      } catch (err) {
        console.log(err.response.data.message);
      }
    };
    getConversations();
  }, [conversations, token]);

  const getCurrentChatroom = async id => {
    try {
      const res = await axios({
        method: 'GET',
        url: `http://localhost:8000/api/messages/${id}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.data;
      console.log(data);
      setMessages(data.messages);
      setCurrentChat(data.messages);
    } catch (err) {}
  };

  const handleMessageSubmit = async event => {
    event.preventDefault();
    const recieverId = currentChat[0].conversationId.members.find(
      member => member._id !== authUser._id
    );
    const message = {
      senderId: authUser._id,
      text: newMessage,
      conversationId: currentChat[0].conversationId._id,
      recieverId: recieverId._id,
    };

    try {
      const res = await axios({
        method: 'POST',
        url: `http://localhost:8000/api/messages`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        data: message,
      });
      const data = await res.data;
      setMessages(prevMessages => {
        return [...prevMessages, data.messages];
      });
      setNewMessage('');
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
                    <div key={m._id} ref={scrollRef}>
                      <Message
                        message={m}
                        own={m.sender._id === authUser._id}
                      />
                    </div>
                  ))}
                </div>
                <div className="chatBoxBottom">
                  <textarea
                    className="chatMessageInput"
                    placeholder="Start Typing..."
                    onChange={e => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
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
