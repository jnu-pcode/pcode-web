import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Village from './pages/Village';
import MyHouse from './pages/MyHouse';
import Board from './pages/Board';
import BoardDetail from './pages/BoardDetail';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Village />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-house"
          element={
            <PrivateRoute>
              <MyHouse />
            </PrivateRoute>
          }
        />
        <Route
          path="/board"
          element={
            <PrivateRoute>
              <Board />
            </PrivateRoute>
          }
        />
        <Route
          path="/board/:id"
          element={
            <PrivateRoute>
              <BoardDetail />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 