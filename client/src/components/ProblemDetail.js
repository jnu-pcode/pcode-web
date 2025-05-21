import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, 
    Button, 
    Input, 
    Space, 
    Typography, 
    Tag, 
    message, 
    Divider,
    Modal,
    Alert
} from 'antd';
import { 
    ArrowLeftOutlined, 
    TrophyOutlined, 
    LockOutlined,
    FlagOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    HomeOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Container = styled.div`
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ProblemInfo = styled.div`
  margin-bottom: 24px;
`;

const SubmitSection = styled.div`
  margin-top: 24px;
`;

const HintSection = styled.div`
  margin-top: 24px;
`;

const ProblemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [flag, setFlag] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [hintModalVisible, setHintModalVisible] = useState(false);
    const [hintCost, setHintCost] = useState(0);

    const fetchProblem = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/problems/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            console.log('Problem data:', response.data);
            setProblem(response.data);
        } catch (error) {
            message.error('문제를 불러오는데 실패했습니다.');
            navigate('/security-island');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblem();
    }, [id]);

    const handleSubmit = async () => {
        if (!flag.trim()) {
            message.warning('플래그를 입력해주세요.');
            return;
        }

        try {
            setSubmitting(true);
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/problems/${id}/submit`,
                { flag },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            if (response.data.correct) {
                message.success('정답입니다!');
                Modal.success({
                    title: '축하합니다!',
                    content: (
                        <div>
                            <p>{response.data.message}</p>
                            {!problem.solved && <p>획득한 점수: {problem.points}점</p>}
                        </div>
                    ),
                    onOk: () => navigate('/security-island')
                });
            } else {
                message.error(response.data.message || '틀렸습니다. 다시 시도해보세요.');
            }
        } catch (error) {
            message.error('제출 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleHintRequest = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/problems/${id}/hint`,
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setHintCost(response.data.cost);
            setHintModalVisible(true);
        } catch (error) {
            message.error('힌트를 불러오는데 실패했습니다.');
        }
    };

    const confirmHint = async () => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/problems/${id}/hint`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setShowHint(true);
            setHintModalVisible(false);
            message.success('힌트가 적용되었습니다.');
        } catch (error) {
            message.error('힌트를 구매하는데 실패했습니다.');
        }
    };

    if (loading || !problem) {
        return <div>Loading...</div>;
    }

    return (
        <Container>
            <Title level={2} style={{ margin: 0 }}>{problem.title}</Title>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '16px 0 32px 0' }}>
                <Space>
                    <Tag color={problem.difficulty === 1 ? 'green' : problem.difficulty === 2 ? 'orange' : problem.difficulty === 3 ? 'red' : 'default'}>
                        {problem.difficulty === 1 ? '쉬움' : problem.difficulty === 2 ? '보통' : problem.difficulty === 3 ? '어려움' : problem.difficulty}
                    </Tag>
                    <Tag icon={<TrophyOutlined />} color="gold">
                        {problem.points}점
                    </Tag>
                    <Tag icon={problem.solved ? <CheckCircleOutlined /> : <ClockCircleOutlined />} color={problem.solved ? 'success' : 'default'}>
                        {problem.solved ? '풀이 완료' : '미해결'}
                    </Tag>
                </Space>
                <Button 
                    type="primary" 
                    icon={<HomeOutlined />}
                    onClick={() => navigate('/security-island')}
                >
                    보안섬으로 돌아가기
                </Button>
            </div>

            <Card>
                <ProblemInfo>
                    <Paragraph>
                        플래그 형식: <b>flag&#123;...&#125;</b><br />
                    </Paragraph>
                    {problem.attachments && (
                        <Alert
                            message="첨부파일"
                            description={
                                <ul>
                                    {problem.attachments.map((file, index) => (
                                        <li key={index}>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                {file.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            }
                            type="info"
                            showIcon
                        />
                    )}
                    <Button 
                        type="primary" 
                        href={problem.html_path ? `/problems/${problem.html_path}` : undefined}
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ marginTop: '16px' }}
                    >
                        문제 환경으로 이동
                    </Button>
                </ProblemInfo>

                <Divider />

                <SubmitSection>
                    <Title level={4}>플래그 제출</Title>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Input
                            prefix={<FlagOutlined />}
                            placeholder="플래그를 입력하세요"
                            value={flag}
                            onChange={(e) => setFlag(e.target.value)}
                            onPressEnter={handleSubmit}
                        />
                        <Button
                            type="primary"
                            onClick={handleSubmit}
                            loading={submitting}
                            block
                        >
                            제출하기
                        </Button>
                    </Space>
                </SubmitSection>

                {!showHint && (
                    <HintSection>
                        <Button
                            icon={<LockOutlined />}
                            onClick={handleHintRequest}
                            disabled={!problem.hint || problem.hint.trim() === ''}
                        >
                            힌트 보기
                        </Button>
                    </HintSection>
                )}

                {showHint && (
                    <HintSection>
                        <Alert
                            message="힌트"
                            description={problem.hint}
                            type="info"
                            showIcon
                        />
                    </HintSection>
                )}
            </Card>

            <Modal
                title="힌트 구매"
                open={hintModalVisible}
                onOk={confirmHint}
                onCancel={() => setHintModalVisible(false)}
                okText="구매하기"
                cancelText="취소"
            >
                <p>이 힌트를 구매하시겠습니까?</p>
                <p>비용: {hintCost}점</p>
            </Modal>
        </Container>
    );
};

export default ProblemDetail;