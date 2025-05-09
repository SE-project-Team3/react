import React, { useState } from 'react';
import '../../App.css';
import { useNavigate } from 'react-router-dom';
import restaurantImage from '../../assets/restaurant_login.jpg';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

function SignUpPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 11); 
    if (value.length >= 11) {
      value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (value.length >= 7) {
      value = value.replace(/(\d{3})(\d{3,4})(\d{0,4})/, '$1-$2-$3');
    } else if (value.length >= 4) {
      value = value.replace(/(\d{3})(\d{0,4})/, '$1-$2');
    }
    setForm({ ...form, phone: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^010-\d{4}-\d{4}$/;

    if (!emailRegex.test(form.email)) {
      alert('유효한 이메일 주소를 입력하세요.');
      return;
    }
    if (!phoneRegex.test(form.phone)) {
      alert('유효한 전화번호를 입력하세요. 예: 010-1234-5678');
      return;
    }
    if (form.password.length < 6) {
      alert('비밀번호는 최소 6자리 이상이어야 합니다.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    alert('회원가입 성공');
    localStorage.setItem('username', form.name);
    localStorage.setItem('userphone', form.phone);
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-image">
        <img src={restaurantImage} alt="레스토랑" />
      </div>
      <div className="auth-container">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>이름</label>
          <input
            name="name"
            placeholder="이름"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>전화번호</label>
          <input
            name="phone"
            placeholder="010-1234-5678"
            value={form.phone}
            onChange={handlePhoneChange}
            required
          />

          <label>이메일</label>
          <input
            name="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>비밀번호</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
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

          <label>비밀번호 확인</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="비밀번호 확인"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <button type="submit">가입하기</button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
