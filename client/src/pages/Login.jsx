import { useState } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom";
import socket from '../socket/socket'

const Login = () => {
    const [username, setUserName] = useState('');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:4000/api/auth/', {
                username: username
            });

            const user = response.data
            console.log(user);
            
            localStorage.setItem('user', JSON.stringify(user));
            
            if (username.trim()) {
                socket.connect();
                socket.emit('user_join', username);
                navigate(`home/${username}`);
            }
        } catch (error) {
            console.log(error);
            setMessage('Login failed.')
            setUserName('')
        }
    }

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-500 ">
            <form className="w-96 h-96 bg-white p-10 rounded" onSubmit={handleLogin}>
                <h2 className="text-3xl font-medium text-center mt-2">Login</h2>
                <p className="mt-6 text-center font-medium">Please sign in to continue.</p>
                <div className="flex flex-col mt-6 gap-2">
                    <input
                        type="text"
                        className="border border-gray-400 rounded-[8px] p-2 "
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Username..."
                        required
                    />
                </div>
                <div className="flex items-center justify-center mt-6">
                    <button className="bg-blue-500 mt-2 px-8 py-1 rounded text-white font-medium" type="submit">Login</button>
                </div>
                <p>{message}</p>
                <p className="mt-6 text-center">Not registered yet? <Link to="register" className="text-blue-500">Register</Link></p>
            </form>
            
        </div>
    )
}

export default Login;