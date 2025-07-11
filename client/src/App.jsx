import RegisterForm from './pages/Register';
import Home from './pages/Home';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="register" element={<RegisterForm />} />
        <Route path="/" element={<Login />} />
        <Route path="home/:username" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
