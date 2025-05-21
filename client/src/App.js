import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import Village from './components/Village';
import House from './components/House';
import Board from './components/Board';
import BoardDetail from './components/BoardDetail';
import SecurityIsland from './components/SecurityIsland';
import ProblemDetail from './components/ProblemDetail';
import GameWrapper from './components/GameWrapper';

const AppContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  background: #f0f2f5;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.id,
          username: payload.username,
          nickname: payload.nickname,
          isMember: payload.isMember
        });
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing token:', error);
        handleLogout();
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/village" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login onLoginSuccess={(userData) => {
                  setUser(userData);
                  setIsAuthenticated(true);
                }} />
              ) : (
                <Navigate to="/village" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <Register />
              ) : (
                <Navigate to="/village" replace />
              )
            }
          />
          <Route
            path="/game"
            element={
              isAuthenticated ? (
                <Game onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/village"
            element={
              isAuthenticated ? (
                <GameWrapper />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/house"
            element={
              isAuthenticated ? (
                <House onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/board"
            element={
              isAuthenticated ? (
                <Board />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/board/:id"
            element={
              isAuthenticated ? (
                <BoardDetail />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route 
            path="/security-island"
            element={
              isAuthenticated ? (
                <SecurityIsland />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route 
            path="/problems/:id"
            element={
              isAuthenticated ? (
                <ProblemDetail />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App; 