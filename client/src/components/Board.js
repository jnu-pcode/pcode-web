import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Table, Input, Space, Modal, Form, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, HomeOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { TextArea } = Input;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Board = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingPost, setEditingPost] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const apiUrl = process.env.REACT_APP_API_URL || '';
    console.log('API URL:', apiUrl);

    const fetchPosts = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiUrl}/api/board`, {
                params: { page, limit: 10, search },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setPosts(response.data.posts);
            setTotalPosts(response.data.totalPosts);
            setCurrentPage(response.data.currentPage);
        } catch (error) {
            message.error('게시글을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSearch = () => {
        fetchPosts(1, searchText);
    };

    const handleCreatePost = () => {
        setEditingPost(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        form.setFieldsValue({
            title: post.title,
            content: post.content
        });
        setIsModalVisible(true);
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(`${apiUrl}/api/board/${postId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            message.success('게시글이 삭제되었습니다.');
            fetchPosts(currentPage, searchText);
        } catch (error) {
            message.error('게시글 삭제에 실패했습니다.');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingPost) {
                await axios.put(
                    `${apiUrl}/api/board/${editingPost.id}`,
                    values,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                message.success('게시글이 수정되었습니다.');
            } else {
                await axios.post(
                    `${apiUrl}/api/board`,
                    values,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                message.success('게시글이 작성되었습니다.');
            }
            setIsModalVisible(false);
            fetchPosts(currentPage, searchText);
        } catch (error) {
            message.error(editingPost ? '게시글 수정에 실패했습니다.' : '게시글 작성에 실패했습니다.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post(
                `${apiUrl}/api/board`,
                { title, content },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setTitle('');
            setContent('');
            fetchPosts();
        } catch (err) {
            setError('게시글 작성에 실패했습니다.');
        }
    };

    const columns = [
        {
            title: '제목',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <a onClick={() => navigate(`/board/${record.id}`)}>{text}</a>
            ),
        },
        {
            title: '작성자',
            dataIndex: 'nickname',
            key: 'nickname',
        },
        {
            title: '작성일',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => new Date(text).toLocaleDateString(),
        },
        {
            title: '댓글',
            dataIndex: 'comment_count',
            key: 'comment_count',
        },
        {
            title: '작업',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEditPost(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeletePost(record.id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <PageHeader>
                <Button 
                    type="primary" 
                    icon={<HomeOutlined />}
                    onClick={() => navigate('/village')}
                >
                    빌리지로 돌아가기
                </Button>
                <Space>
                    <Input
                        placeholder="검색어를 입력하세요"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: '200px' }}
                    />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleSearch}
                    >
                        검색
                    </Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreatePost}
                    >
                        글쓰기
                    </Button>
                </Space>
            </PageHeader>

            <Table
                columns={columns}
                dataSource={posts}
                rowKey="id"
                loading={loading}
                pagination={{
                    current: currentPage,
                    total: totalPosts,
                    pageSize: 10,
                    onChange: (page) => fetchPosts(page, searchText),
                }}
            />

            <Modal
                title={editingPost ? '게시글 수정' : '게시글 작성'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                >
                    <Form.Item
                        name="title"
                        label="제목"
                        rules={[{ required: true, message: '제목을 입력해주세요' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="content"
                        label="내용"
                        rules={[{ required: true, message: '내용을 입력해주세요' }]}
                    >
                        <TextArea rows={10} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default Board; 