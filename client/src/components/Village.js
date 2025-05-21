import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background-color: #fff;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c82333;
  }
`;

const VillageContent = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const VillageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1200px;
  width: 100%;
`;

const VillageItem = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Village = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // 토큰에서 사용자 정보 추출
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        username: payload.username,
        nickname: payload.nickname,
        isMember: payload.isMember
      });
    } catch (error) {
      console.error('Error parsing token:', error);
      onLogout();
    }
  }, [navigate, onLogout]);

  const handleVillageItemClick = (item) => {
    const token = localStorage.getItem('token');
    console.log('Village - Current token:', token);

    if (!token) {
      console.log('Village - No token found, logging out');
      onLogout();
      return;
    }

    switch (item) {
      case 'house':
        console.log('Village - Navigating to house with token');
        navigate('/house', { state: { token } });
        break;
      case 'island':
        navigate('/security-island');
        break;
      case 'shop':
        // TODO: 상점 구현
        console.log('상점으로 이동');
        break;
      case 'board':
        navigate('/board');
        break;
      default:
        console.log('Unknown item:', item);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>Security Learning Community</Title>
        <UserInfo>
          <span>Welcome, {user.nickname}!</span>
          <LogoutButton onClick={onLogout}>로그아웃</LogoutButton>
        </UserInfo>
      </Header>
      <VillageContent>
        <VillageGrid>
          <VillageItem onClick={() => handleVillageItemClick('house')}>
            <h2>🏠 내 집</h2>
            <p>나만의 공간을 꾸며보세요</p>
          </VillageItem>
          <VillageItem onClick={() => handleVillageItemClick('island')}>
            <h2>🏝️ 보안 섬</h2>
            <p>다양한 보안 문제를 풀어보세요</p>
          </VillageItem>
          <VillageItem onClick={() => handleVillageItemClick('shop')}>
            <h2>🛍️ 상점</h2>
            <p>아이템을 구매하고 수집하세요</p>
          </VillageItem>
          <VillageItem onClick={() => handleVillageItemClick('board')}>
            <h2>💬 게시판</h2>
            <p>다른 주민들과 소통해보세요</p>
          </VillageItem>
        </VillageGrid>
      </VillageContent>
    </Container>
  );
};

export default Village; 