import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RegisterForm = () => {
  const [username, setUserName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log(username);
    
    try {
      const response = await axios.post('http://localhost:4000/api/auth/register', {
        username: username
      });

      console.log(response.data);
      setMessage('Registration successful! You can now log in.');
    } catch (error) {
      console.error(error);
      setMessage('Registration failed. Please try again.');
    }
  };

  return (
     <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-500 ">
            <form className="w-96 h-96 bg-white p-10 rounded" onSubmit={handleRegister}>
                <h2 className="text-3xl font-medium text-center mt-2">Register</h2>
                <p className="mt-6 text-center font-medium">Please sign up to continue.</p>
                <div className="flex flex-col mt-6 gap-2">
                    <input
                        type="text"
                        className="border border-gray-400 rounded-[8px] p-2"
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />
                </div>
                
                <div className="flex items-center justify-center mt-6">
                    <button className="bg-blue-500 mt-2 px-8 py-1 rounded text-white font-medium" type="submit">Register</button>
                </div>

                <p>{message}</p>

                <p className="mt-6 text-center">Registered yet? <Link to="/" className="text-blue-500">Sign In</Link></p>
            </form>
        </div>
  );
};

export default RegisterForm;
