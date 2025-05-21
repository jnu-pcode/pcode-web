import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
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

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #5a6268;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const HouseContent = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  gap: 2rem;
`;

const ProfileSection = styled.section`
  flex: 1;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ItemsSection = styled.section`
  flex: 2;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #333;
`;

const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ItemCard = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const ItemIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const ItemName = styled.div`
  font-weight: bold;
  margin-bottom: 0.25rem;
`;

const ItemDescription = styled.div`
  font-size: 0.875rem;
  color: #6c757d;
`;

const House = ({ onLogout }) => {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    points: 0,
    solved_problems: 0,
    collected_items: 0
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = location.state?.token || localStorage.getItem('token');
    console.log('House - Received token from location state:', location.state?.token);
    console.log('House - Token from localStorage:', localStorage.getItem('token'));
    console.log('House - Final token being used:', token);

    if (!token) {
      console.log('House - No token found, logging out');
      onLogout();
      return;
    }

    const fetchData = async () => {
      try {
        console.log('House - Fetching profile data with token');
        // 프로필 정보 조회
        const profileResponse = await axios.get('http://localhost:3001/api/house/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('House - Profile data received:', profileResponse.data);
        const profileData = profileResponse.data;
        setUser({
          username: profileData.username,
          nickname: profileData.nickname,
          isMember: profileData.is_member
        });
        
        setStats({
          points: profileData.points,
          solved_problems: profileData.solved_problems,
          collected_items: profileData.collected_items
        });

        // 아이템 목록 조회
        console.log('House - Fetching items data');
        const itemsResponse = await axios.get('http://localhost:3001/api/house/items', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('House - Items data received:', itemsResponse.data);
        setItems(itemsResponse.data);
      } catch (error) {
        console.error('House - Error fetching data:', error);
        if (error.response?.status === 401) {
          console.log('House - 401 error, logging out');
          onLogout();
        }
      }
    };

    fetchData();
  }, [navigate, onLogout, location.state]);

  const handleBack = () => {
    navigate('/village');
  };

  if (!user) {
    return null;
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBack}>← 마을로 돌아가기</BackButton>
        <Title>내 집</Title>
        <div style={{ width: '100px' }}></div>
      </Header>
      <HouseContent>
        <ProfileSection>
          <ProfileHeader>
            <Avatar>{user.nickname[0]}</Avatar>
            <ProfileInfo>
              <ProfileName>{user.nickname}</ProfileName>
              <div>@{user.username}</div>
            </ProfileInfo>
          </ProfileHeader>
          <ProfileStats>
            <StatItem>
              <StatValue>{stats.collected_items || 0}</StatValue>
              <StatLabel>수집한 아이템</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.solved_problems || 0}</StatValue>
              <StatLabel>해결한 문제</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.points || 0}</StatValue>
              <StatLabel>포인트</StatLabel>
            </StatItem>
          </ProfileStats>
        </ProfileSection>
        <ItemsSection>
          <h2>수집한 아이템</h2>
          <ItemsGrid>
            {items.map((item) => (
              <ItemCard key={item.id}>
                <ItemIcon>{item.icon}</ItemIcon>
                <ItemName>{item.name}</ItemName>
                <ItemDescription>{item.description}</ItemDescription>
              </ItemCard>
            ))}
          </ItemsGrid>
        </ItemsSection>
      </HouseContent>
    </Container>
  );
};

export default House; 