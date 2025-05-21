import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Button, Input, List, Space, message, Typography, Divider, Avatar } from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { TextArea } = Input;
const { Title, Text } = Typography;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f0f2f5;
  padding: 24px;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PostHeader = styled.div`
  margin-bottom: 24px;
`;

const PostContent = styled.div`
  margin: 24px 0;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 200px;
  white-space: pre-wrap;
`;

const CommentSection = styled.div`
  margin-top: 32px;
`;

const CommentForm = styled.form`
  margin-bottom: 24px;
`;

const CommentItem = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const BoardDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const apiUrl = process.env.REACT_APP_API_URL;
            const res = await axios.get(`${apiUrl}/api/board/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPost(res.data.post);
            setComments(res.data.comments);
        } catch (err) {
            setError('게시글을 불러오지 못했습니다.');
            navigate('/board');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const handleDeletePost = async () => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/board/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            message.success('게시글이 삭제되었습니다.');
            navigate('/board');
        } catch (error) {
            message.error('게시글 삭제에 실패했습니다.');
        }
    };

    const handleEditPost = () => {
        navigate(`/board/edit/${id}`);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            await axios.post(
                `${apiUrl}/api/board/${id}/comments`,
                { content: comment },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setComment('');
            fetchPost();
            message.success('댓글이 작성되었습니다.');
        } catch (err) {
            setError('댓글 작성에 실패했습니다.');
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/board/comments/${commentId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            message.success('댓글이 삭제되었습니다.');
            fetchPost();
        } catch (error) {
            message.error('댓글 삭제에 실패했습니다.');
        }
    };

    if (!post) return <div>로딩 중...</div>;

    return (
        <PageWrapper>
            <Container>
                <Header>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => navigate('/board')}
                    >
                        목록으로
                    </Button>
                    <Space>
                        <Button 
                            icon={<EditOutlined />} 
                            onClick={handleEditPost}
                        >
                            수정
                        </Button>
                        <Button 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={handleDeletePost}
                        >
                            삭제
                        </Button>
                    </Space>
                </Header>

                <PostHeader>
                    <Title level={2}>{post.title}</Title>
                    <Space>
                        <Avatar icon={<UserOutlined />} />
                        <Text strong>{post.nickname}</Text>
                        <Text type="secondary">
                            {new Date(post.created_at).toLocaleString()}
                        </Text>
                    </Space>
                </PostHeader>

                <PostContent>
                    {post.content}
                </PostContent>

                <CommentSection>
                    <Title level={4}>댓글 {comments.length}개</Title>
                    <CommentForm onSubmit={handleCommentSubmit}>
                        <TextArea
                            placeholder="댓글을 입력하세요"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            required
                            rows={4}
                            style={{ marginBottom: 16 }}
                        />
                        <Button type="primary" htmlType="submit">
                            댓글 작성
                        </Button>
                    </CommentForm>

                    {error && <Text type="danger">{error}</Text>}

                    <List
                        dataSource={comments}
                        renderItem={comment => (
                            <CommentItem>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Space>
                                        <Avatar icon={<UserOutlined />} />
                                        <Text strong>{comment.nickname}</Text>
                                        <Text type="secondary">
                                            {new Date(comment.created_at).toLocaleString()}
                                        </Text>
                                    </Space>
                                    <Text>{comment.content}</Text>
                                    <div style={{ textAlign: 'right' }}>
                                        <Button 
                                            type="text" 
                                            danger 
                                            size="small"
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            삭제
                                        </Button>
                                    </div>
                                </Space>
                            </CommentItem>
                        )}
                    />
                </CommentSection>
            </Container>
        </PageWrapper>
    );
};

export default BoardDetail; 