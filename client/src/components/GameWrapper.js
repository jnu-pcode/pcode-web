import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import VillageScene from '../scenes/VillageScene';
import { useNavigate } from 'react-router-dom';
import VillageTopBar from './VillageTopBar';
import axios from 'axios';

const GAME_WIDTH = 1280;
const GAME_HEIGHT = 720;

const GameWrapper = () => {
  const gameRef = useRef(null);
  const navigate = useNavigate();
  const [user, setUser] = useState({ nickname: '', points: 0 });
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${apiUrl}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('User data received:', response.data);
          setUser({
            nickname: response.data.nickname || response.data.username || 'Guest',
            points: response.data.points || 0
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // 토큰이 유효하지 않은 경우 로그인 페이지로 리다이렉트
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUserData();
  }, [navigate, apiUrl]);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent: 'phaser-container',
        scene: [VillageScene],
        physics: { default: 'arcade' }
      });
      // 씬에서 사용할 네비게이션 콜백 등록
      window.__phaserNavigate = (path) => navigate(path);
    }
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      window.__phaserNavigate = undefined;
    };
  }, [navigate]);

  const handleBoardClick = () => {
    navigate('/board');
  };

  return (
    <>
      <VillageTopBar user={user} onBoardClick={handleBoardClick} />
      <div
        id="phaser-container"
        style={{
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'black'
        }}
      />
    </>
  );
};

export default GameWrapper; 