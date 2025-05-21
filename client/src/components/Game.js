import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import io from 'socket.io-client';

// Game scenes
import VillageScene from '../scenes/VillageScene';
import HouseScene from '../scenes/HouseScene';
import IslandScene from '../scenes/IslandScene';

const GameContainer = styled.div`
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

const GameContent = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Game = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const gameRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // 토큰 확인
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // TODO: 사용자 정보 가져오기
    // 임시로 토큰에서 사용자 정보 추출
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        username: payload.username,
        id: payload.id
      });
    } catch (error) {
      console.error('Error parsing token:', error);
      navigate('/login');
    }

    // Initialize socket connection
    socketRef.current = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3000');

    // Game configuration
    const config = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: [VillageScene, HouseScene, IslandScene]
    };

    // Initialize game
    gameRef.current = new Phaser.Game(config);

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <GameContainer>
      <Header>
        <Title>Security Learning Community</Title>
        <UserInfo>
          <span>Welcome, {user.username}!</span>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </UserInfo>
      </Header>
      <GameContent>
        <h2>게임 준비 중...</h2>
        <p>곧 게임 기능이 추가될 예정입니다.</p>
      </GameContent>
    </GameContainer>
  );
};

export default Game; 