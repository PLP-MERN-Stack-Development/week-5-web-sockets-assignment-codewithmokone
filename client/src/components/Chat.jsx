import { useEffect } from "react";
import { useState } from "react";

const Chat = ({socket, username}) => {
    const [userData, setUserData] = useState(null);
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Socket io api's
    useEffect(() => {
        socket.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('typing_users', (users) => {
            setTypingUsers(users.filter((user) => user !== username));
        });

        socket.on('user_list', (users) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off('receive_message');
            socket.off('typing_users');
            socket.off('user_list');
        };

    }, [socket, username]);

    // Send message function
    const handleSendMessage = () => {
        if (message.trim()) {
            socket.emit('send_message', { message });
            setMessage('');
            socket.emit('typing', false);
        }
    };

    // Handles input value
    const handleTyping = (e) => {
        setMessage(e.target.value);
        socket.emit('typing', e.target.value.length > 0);
    };

    // Handles logout
    const handleLogout = () => {
        localStorage.removeItem('user');
        setOnlineUsers([]);
        socket.disconnect();
        navigate('/');
    }

    return (
        <div className='p-5'>
            <div className='bg-gray-500 p-4 rounded-2xl'>
                {/* <h2>Global Chat</h2> */}
                <div className='flex items-center justify-between'>
                    <div className='flex gap-1'>
                        <strong className='mr-2'>Online Users:</strong>
                        <ul className='flex gap-2'>
                            {onlineUsers.map((u) => (
                                <li key={u.id}>{u.username === userData?.username ? 'You' : u.username}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                <div className='h-80 bg-white overflow-scroll border-1 border-gray-200 p-2.5 mt-2.5'>
                    {messages.map((msg, index) => (
                        <div key={msg.id || index}>
                            <strong>{msg.sender === userData?.username ? 'You' : msg.sender}</strong>: {msg.message}
                            <small style={{ marginLeft: 10, color: 'gray' }}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </small>
                        </div>
                    ))}
                    {typingUsers.length > 0 && (
                        <p><em>{typingUsers.join(', ')} is typing...</em></p>
                    )}
                </div>

                <div className='mt-2'>
                    <input
                        value={message}
                        className='w-[89%] py-1 px-1 bg-white rounded'
                        onChange={handleTyping}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message"
                    // style={{ width: '80%' }}
                    />
                    <button className=' bg-blue-500 px-6 py-1 ml-2 rounded' onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    )
}

export default Chat;