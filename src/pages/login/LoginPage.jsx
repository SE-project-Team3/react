import React, { useState } from 'react';
import '../../App.css';
import restaurantImage from '../../assets/restaurant_login.jpg';
import { useNavigate } from 'react-router-dom';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error /*, setError*/] = useState(''); // -> 백엔드 설정 후 주석 취소
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // 백엔드 전 바로 홈페이지로 이동
    navigate('/home');
  };

  return (
    <div className="auth-page">
      <div className="auth-image">
        <img src={restaurantImage} alt="레스토랑" />
      </div>
      <div className="auth-container">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>이메일</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="이메일 입력"
            required
          />
          <label>비밀번호</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">로그인</button>
        </form>
        <button className="signup-full" onClick={() => navigate('/signup')}>
          회원가입
          </button>
      </div>
    </div>
  );
};

export default LoginPage;