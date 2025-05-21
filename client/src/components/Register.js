import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  background-image: url('/forest-bg.jpg');
  background-size: cover;
  background-position: center;
`;

const RegisterForm = styled.form`
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;

  &:hover {
    background-color: #2980b9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoginLink = styled.p`
  margin-top: 1.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;

  a {
    color: #3498db;
    text-decoration: none;
    font-weight: bold;
    margin-left: 0.5rem;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-bottom: 1rem;
  text-align: center;
  font-size: 0.9rem;
  padding: 0.5rem;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
`;

const InfoMessage = styled.div`
  color: #2c3e50;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    code: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        username: formData.username,
        password: formData.password,
        nickname: formData.nickname,
        code: formData.code || null
      });

      if (response.data.success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <Container>
      <RegisterForm onSubmit={handleSubmit}>
        <Title>🎉 p.code Village에 가입하기</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="text"
          name="username"
          placeholder="아이디"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="비밀번호 확인"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <Input
          type="text"
          name="nickname"
          placeholder="닉네임"
          value={formData.nickname}
          onChange={handleChange}
          required
        />
        <Input
          type="text"
          name="code"
          placeholder="인증 코드 (선택)"
          value={formData.code}
          onChange={handleChange}
        />
        <Button type="submit">✅ 회원가입 완료</Button>
        <InfoMessage>
          ⛵ 인증 코드를 입력하면 집이 생성됩니다.<br />
          🔍 코드 없이 가입하면 마을만 둘러볼 수 있어요.
        </InfoMessage>
        <LoginLink>
          👤 이미 계정이 있으신가요?<a href="/login">로그인 하기</a>
        </LoginLink>
      </RegisterForm>
    </Container>
  );
};

export default Register; 