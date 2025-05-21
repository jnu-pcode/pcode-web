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

const LoginForm = styled.form`
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
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
`;

const Subtitle = styled.h2`
  color: #34495e;
  margin-bottom: 2rem;
  font-size: 1.4rem;
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

const RegisterLink = styled.p`
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

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username,
        password
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        window.location.href = '/village';
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <Container>
      <LoginForm onSubmit={handleSubmit}>
        <Title>🏡 Welcome to</Title>
        <Subtitle>🎮 p.code Village</Subtitle>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit">🔐 로그인</Button>
        <RegisterLink>
          👤 아직 회원이 아니신가요?<a href="/register">회원가입 하기</a>
        </RegisterLink>
      </LoginForm>
    </Container>
  );
};

export default Login; 