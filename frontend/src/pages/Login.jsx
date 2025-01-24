import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, LockKeyhole, EyeOff, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import authService from '../services/authService';

const CURRENT_DATE = '2025-01-24 20:08:46';
const CURRENT_USER = 'gabrielisaacs';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);
      navigate('/'); // Redirect to home page after successful login
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col mx-auto gap-6 relative w-screen h-screen overflow-hidden">
      {/* Animated gradient blur background */}
      <motion.div
        className="w-[300px] h-[300px] lg:w-[600px] lg:h-[600px] bg-gradient-to-r from-purple-500 from-10% via-blue-700 to-sky-500 blur-[100px] lg:blur-[200px] rounded-full -z-20 absolute mt-20 -ml-20 lg:mt-40 lg:-ml-40 opacity-80"
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }}
        initial={{ x: -200, y: -200 }}
      />

      {/* Main content */}
      <div className="grid grid-cols-2 items-center">
        <div className="grid w-92 mt-20 ml-28 overflow-hidden">
          <img src="/logo-grad.png" alt="resonix logo" className="w-[8rem] lg:w-[10rem]" />
          <img src="/user-3d.png" className="w-[25rem] -pb-96" />
        </div>

        {/* Login form */}
        <form className="grid w-96 h-auto -mt-32" onSubmit={handleSubmit}>
          <p className="text-2xl">Sign in</p>
          <p className="text-sm mt-5">
            If you don't have an account, <Link to="/signup" className="text-sky-500">Register here!</Link>
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="mt-10 text-sm">
            <label htmlFor="email" className="mb-4 block">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="w-4" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                className="flex-grow bg-transparent border-b border-slate-50 focus:outline-none pb-1"
                required
              />
            </div>
          </div>

          <div className="mt-10 text-sm">
            <label htmlFor="password" className="mb-4 block">Password</label>
            <div className="flex items-center gap-2 relative">
              <LockKeyhole className="w-4" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="flex-grow bg-transparent border-b border-slate-50 focus:outline-none pb-1"
                required
              />
              <span
                className="ml-auto cursor-pointer absolute right-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye className="w-4" /> : <EyeOff className="w-4" />}
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 text-xs mt-2">
            <input type="checkbox" className="bg-slate-50 w-4 pointer" />
            <p>Remember me</p>
            <Link to="/forgot-password" className="text-right ml-auto cursor-pointer">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 rounded-full text-sm my-8 py-2 relative disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Login'
            )}
          </button>

          <p className="text-center text-xs mb-6">or continue with</p>
          <div className="grid">
            <div className="inline-flex gap-4 mx-auto items-center">
              <a href="#" className="w-8">
                <img src="/src/assets/svg/facebook.svg" alt="Facebook" />
              </a>
              <a href="#" className="w-10">
                <img src="/src/assets/svg/apple.svg" alt="Apple" />
              </a>
              <a href="#" className="w-8">
                <img src="/src/assets/svg/google.svg" alt="Google" />
              </a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;