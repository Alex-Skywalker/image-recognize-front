import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register'
import Home from './pages/Home'
import Profile from './pages/Profile.jsx'
import Test from './components/Test.jsx'
import ModelManagement from './components/ModelManagement.jsx'
import ResourceManagement from './components/ResourceManagement.jsx'
import Dashboard from './components/Dashboard.jsx'
import ResultsVisualization from './components/ResultsVisualization.jsx'
import ForgetPassword from './pages/ForgetPassword.jsx'
import TrainManagement from './components/TrainManagement.jsx'
import Train from './components/Train.jsx'
import TaskManagement from './components/TaskManagement.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/home" element={<Home />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="test" element={<Test />} />
          <Route path="train" element={<Train />}>
            <Route index element={<TrainManagement />} />
            <Route path="trainManagement" element={<TrainManagement />} />
            <Route path="taskManagement" element={<TaskManagement />} />
          </Route>
          <Route path="visualization" element={<ResultsVisualization />} />
          <Route path="modelManagement" element={<ModelManagement />} />
          <Route path="resourceManagement" element={<ResourceManagement />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App
