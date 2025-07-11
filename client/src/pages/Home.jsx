import { io } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const socket = io.connect('http://localhost:4000');

const groupRooms = ['general', 'tech', 'random'];

const Home = () => {
  const { username } = useParams();

  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(''); // Either room or username
  const [chatType, setChatType] = useState('');
  const [unread, setUnread] = useState({});

  const navigate = useNavigate();

  // Fetching user data from local storage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);

      socket.emit('user_join', parsedUser.username);

      // Emit join again if socket reconnects
      socket.on('connect', () => {
        socket.emit('user_join', parsedUser.username);
      });
    }
  }, []);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      const key = msg.room || (msg.sender === userData?.username ? msg.recipient : msg.sender);
      setMessages((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), msg],
      }));

      // If the message is NOT for the current chat, mark it as unread
      if (key !== activeChat) {
        setUnread((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + 1,
        }));

        if (Notification.permission === 'granted') {
          new Notification(`New message from ${msg.sender}`, {
            body: msg.message,
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    });

    socket.on('typing_users', (users) => {
      setTypingUsers(users.filter((u) => u !== username));
    });

    socket.on('user_list', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing_users');
      socket.off('user_list');
    };
  }, [userData]);

  // Send a message
  const handleSendMessage = () => {
    if (!message.trim()) return;

    const payload = {
      message,
      sender: userData.username,
      timestamp: new Date().toISOString(),
    };

    if (chatType === 'group') {
      payload.room = activeChat;
      socket.emit('send_message', payload);
    } else {
      payload.recipient = activeChat;
      socket.emit('send_message', payload);
    }

    setMessage('');
    socket.emit('typing', false);
  };

  // Handles typing vlaue
  const handleTyping = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', {
      isTyping: e.target.value.length > 0,
      room: chatType === 'group' ? activeChat : null,
      recipient: chatType === 'private' ? activeChat : null,
    });
  };

  // handles logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setOnlineUsers([]);
    socket.disconnect();
    navigate('/');
  };

  const chatMessages = activeChat ? messages[activeChat] || [] : [];

  // Start private chat
  const startPrivateChat = (recipient) => {
    setActiveChat(recipient);
    setChatType('private');
    setUnread((prev) => ({ ...prev, [recipient]: 0 }));
  };

  // Start group chat
  const startGroupChat = (room) => {
    setActiveChat(room);
    setChatType('group');
    socket.emit('join_room', room);
    setUnread((prev) => ({ ...prev, [room]: 0 }));
  };

  return (
    <div className="w-screen flex items-center p-5">
      <div className="w-2/4 bg-gray-100 p-4 rounded-2xl shadow-lg">
        <div className="flex justify-between mb-4">
          <strong>Welcome, {userData?.username}</strong>
          <button onClick={handleLogout}>Logout</button>
        </div>

        {!activeChat ? (
          <>
            <div className="mb-4 flex flex-col items-center">
              <h3 className="font-medium mb-2">Chats</h3>
              <div className="w-1/4 flex flex-col  gap-2">
                {onlineUsers
                  .filter((u) => u.username !== userData?.username)
                  .map((user) => (
                    <button
                      key={user.username}
                      className="bg-blue-500 text-white px-3 py-1 rounded relative"
                      onClick={() => startPrivateChat(user.username)}
                    >
                      {user.username}
                      {unread[user.username] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                          {unread[user.username]}
                        </span>
                      )}
                    </button>
                  ))}
                  {groupRooms.map((room) => (
                  <button
                    key={room}
                    className="bg-green-500 text-white px-3 py-1 rounded relative"
                    onClick={() => startGroupChat(room)}
                  >
                    #{room}
                    {unread[room] > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {unread[room]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* <div>
              <h3 className="font-medium mb-2">Users</h3>
              <div className="flex gap-2">
                {groupRooms.map((room) => (
                  <button
                    key={room}
                    className="bg-green-500 text-white px-3 py-1 rounded relative"
                    onClick={() => startGroupChat(room)}
                  >
                    #{room}
                    {unread[room] > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {unread[room]}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div> */}
          </>
        ) : (
          <>
            <div className="mb-3">
              <h3 className="text-md font-semibold mb-1">
                Chatting with {chatType === 'group' ? `#${activeChat}` : `@${activeChat}`}
              </h3>
              <button
                onClick={() => {
                  setActiveChat(null);
                  setChatType(null);
                }}
                className="text-sm text-blue-600 underline"
              >
                ← Back to chat options
              </button>
            </div>

            <div className="h-80 bg-white overflow-scroll border p-3 mb-3">
              {chatMessages.map((msg, index) => (
                <div key={index} className="mb-2">
                  <strong>{msg.sender === userData.username ? 'You' : msg.sender}</strong>
                  {msg.recipient && <em> (Private)</em>}: {msg.message}
                  <small className="ml-2 text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </small>
                </div>
              ))}
              {typingUsers.length > 0 && (
                <p className="italic text-sm text-gray-600">
                  {typingUsers.join(', ')} is typing...
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                value={message}
                onChange={handleTyping}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message"
                className="flex-1 px-2 py-1 rounded border"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;