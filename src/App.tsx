import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import BlogDetail from './pages/BlogDetail';
import AllBlogs from './pages/AllBlogs';
import DashboardHome from './components/dashboard/DashboardHome';
import BlogList from './components/dashboard/BlogList';
import BlogEditor from './components/dashboard/BlogEditor';
import MediaLibrary from './components/dashboard/MediaLibrary';
import UsersManagement from './components/dashboard/UsersManagement';
import AnalyticsDashboard from './components/dashboard/AnalyticsDashboard';
import SettingsPage from './components/dashboard/SettingsPage';
import CategoryManager from './components/dashboard/CategoryManager';
import CategoryPage from './pages/CategoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/blogs" element={<AllBlogs />} />
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="posts" element={<BlogList />} />
          <Route path="create" element={<BlogEditor />} />
          <Route path="edit/:id" element={<BlogEditor />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/all-blogs" element={<AllBlogs />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
