import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Button, Space, Typography, Progress, message } from 'antd';
import { 
    LockOutlined, 
    TrophyOutlined, 
    FireOutlined, 
    HomeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';

const { Title, Text } = Typography;

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const CategorySection = styled.div`
  margin-bottom: 32px;
`;

const ProblemCard = styled(Card)`
  height: 100%;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DifficultyTag = styled(Tag)`
  margin-right: 8px;
`;

const apiUrl = process.env.REACT_APP_API_URL || '';

const SecurityIsland = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userStats, setUserStats] = useState({
        solvedProblems: 0,
        totalPoints: 0,
        rank: 0
    });
    const navigate = useNavigate();

    const fetchProblems = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiUrl}/api/problems`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setProblems(response.data.problems);
        } catch (error) {
            console.error('문제 목록 API 에러:', error);
            message.error('문제 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        try {
            const response = await axios.get(`${apiUrl}/api/users/stats`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setUserStats(response.data.stats);
        } catch (error) {
            console.error('사용자 통계를 불러오는데 실패했습니다.');
        }
    };

    useEffect(() => {
        fetchProblems();
        fetchUserStats();
    }, []);

    const getDifficultyColor = (difficulty) => {
        let diffStr = '';
        if (typeof difficulty === 'string') {
            diffStr = difficulty.toLowerCase();
        } else if (typeof difficulty === 'number') {
            if (difficulty === 1) diffStr = 'easy';
            else if (difficulty === 2) diffStr = 'medium';
            else if (difficulty === 3) diffStr = 'hard';
            else diffStr = 'unknown';
        }
        switch (diffStr) {
            case 'easy': return 'green';
            case 'medium': return 'orange';
            case 'hard': return 'red';
            default: return 'blue';
        }
    };

    const getDifficultyLabel = (difficulty) => {
        if (typeof difficulty === 'string') return difficulty;
        if (difficulty === 1) return 'easy';
        if (difficulty === 2) return 'medium';
        if (difficulty === 3) return 'hard';
        return difficulty;
    };

    const categories = [
        { key: 'web', name: '웹 보안', icon: '🌐' },
        { key: 'crypto', name: '암호화', icon: '🔐' },
        { key: 'forensics', name: '포렌식', icon: '🔍' },
        { key: 'reverse', name: '리버스 엔지니어링', icon: '⚙️' },
        { key: 'pwn', name: '시스템 해킹', icon: '💻' }
    ];

    return (
        <Container>
            <Header>
                <Space>
                    <Button 
                        type="primary" 
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/village')}
                    >
                        빌리지로 돌아가기
                    </Button>
                </Space>
                <Space>
                    <Card>
                        <Space>
                            <TrophyOutlined /> 해결한 문제: {userStats.solvedProblems}개
                        </Space>
                    </Card>
                    <Card>
                        <Space>
                            <FireOutlined /> 총 점수: {userStats.totalPoints}점
                        </Space>
                    </Card>
                </Space>
            </Header>

            {categories.map(category => (
                <CategorySection key={category.key}>
                    <Title level={3}>
                        {category.icon} {category.name}
                    </Title>
                    <Row gutter={[16, 16]}>
                        {problems
                            .filter(problem => problem.category === category.key)
                            .map(problem => (
                                <Col xs={24} sm={12} md={8} lg={6} key={problem.id}>
                                    <ProblemCard
                                        hoverable
                                        onClick={() => navigate(`/problems/${problem.id}`)}
                                    >
                                        <Card.Meta
                                            title={
                                                <Space>
                                                    {problem.title}
                                                </Space>
                                            }
                                            description={
                                                <div style={{ marginTop: 8 }}>
                                                    <Space>
                                                        <Tag color={getDifficultyColor(problem.difficulty)}>
                                                            {getDifficultyLabel(problem.difficulty)}
                                                        </Tag>
                                                        <Tag icon={<TrophyOutlined />} color="gold">
                                                            {problem.points}점
                                                        </Tag>
                                                        {problem.solved ? (
                                                            <Tag icon={<CheckCircleOutlined />} color="success">
                                                                해결됨
                                                            </Tag>
                                                        ) : (
                                                            <Tag icon={<ClockCircleOutlined />} color="default">
                                                                미해결
                                                            </Tag>
                                                        )}
                                                    </Space>
                                                </div>
                                            }
                                        />
                                    </ProblemCard>
                                </Col>
                            ))}
                    </Row>
                </CategorySection>
            ))}
        </Container>
    );
};

export default SecurityIsland; 