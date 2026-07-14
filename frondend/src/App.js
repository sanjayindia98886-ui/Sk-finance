import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import ForgotPassword from './ForgotPassword'; 
import StatusPage from './StatusPage'; // 🟢 [नया एडिशन] स्टेटस और पेमेंट स्क्रीन को इम्पोर्ट किया

// यह आपका पुराना सुरक्षा कंपोनेंट है जो चेक करेगा कि टोकन है या नहीं (सुरक्षित)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* 🟢 [नया एडिशन] पेंडिंग अप्रूवल और पेमेंट पेंडिंग के लिए नया रास्ता */}
        <Route path="/status" element={<StatusPage />} />
        
        {/* डैशबोर्ड आपके पुराने ProtectedRoute के अंदर लपेटा हुआ है */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;