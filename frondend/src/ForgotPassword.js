import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      // आपके कंप्यूटर का IP एड्रेस इस्तेमाल कर रहे हैं ताकि मोबाइल पर भी चले
      const res = await axios.put('http://192.168.29.83:5000/api/auth/forgot-password', { email, newPassword });
      alert(res.data.message);
      navigate('/login'); // पासवर्ड बदलने के बाद वापस लॉगिन पेज पर भेज देगा
    } catch (err) {
      setMessage(err.response?.data?.message || "कुछ गड़बड़ हुई!");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>🔒 पासवर्ड रिसेट करें</h2>
        {message && <p style={{ color: '#ef4444' }}>{message}</p>}
        <form onSubmit={handleReset}>
          <input type="email" placeholder="अपनी रजिस्टर्ड ईमेल डालें" onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
          <input type="password" placeholder="नया पासवर्ड" onChange={(e) => setNewPassword(e.target.value)} style={styles.input} required />
          <button type="submit" style={styles.btn}>पासवर्ड अपडेट करें</button>
        </form>
        <button onClick={() => navigate('/login')} style={styles.backBtn}>वापस लॉगिन पर जाएँ</button>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'sans-serif', padding: '10px' },
  card: { background: '#1e293b', padding: '30px', borderRadius: '10px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', boxSizing: 'border-box' },
  input: { width: '100%', padding: '12px', margin: '10px 0', background: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '4px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '12px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', fontSize: '16px', marginTop: '10px' },
  backBtn: { width: '100%', padding: '10px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', cursor: 'pointer', borderRadius: '4px', marginTop: '15px' }
};

export default ForgotPassword;