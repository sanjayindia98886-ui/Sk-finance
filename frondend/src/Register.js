import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  // formData में phone फील्ड भी जोड़ दी है
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // यह अब पूरा डेटा बैकएंड को भेजेगा
      await axios.post('http://192.168.29.83:5000/api/auth/register', formData);
      setSuccess('Registration Successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input type="text" name="name" placeholder="Enter Name" value={formData.name} onChange={handleChange} required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" name="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required style={styles.input} />
          </div>

          {/* यह रहा वो 'phone' फील्ड जिसकी बैकएंड को जरूरत है */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone</label>
            <input type="text" name="phone" placeholder="Enter Phone" value={formData.phone} onChange={handleChange} required style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Enter Password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                style={styles.input} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button}>Register</button>
        </form>

        {/* ---> यहाँ पर आपका नया "Login here" वाला लिंक जोड़ दिया गया है <--- */}
        <p style={styles.loginLinkText}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} style={styles.loginSpan}>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif' },
  card: { background: 'rgba(255, 255, 255, 0.05)', padding: '30px', borderRadius: '15px', width: '350px', textAlign: 'center', border: '1px solid #334155' },
  title: { marginBottom: '20px' },
  form: { textAlign: 'left' },
  inputGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontSize: '14px', color: '#94a3b8' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #334155', background: '#1e293b', color: '#fff', boxSizing: 'border-box' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  eyeButton: { position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px' },
  button: { width: '100%', padding: '10px', marginTop: '10px', borderRadius: '5px', border: 'none', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontWeight: 'bold' },
  error: { color: '#f87171', fontSize: '12px', marginBottom: '10px' },
  success: { color: '#4ade80', fontSize: '12px', marginBottom: '10px' },
  
  // नए लिंक की स्टाइलिंग यहाँ है भाई
  loginLinkText: { textAlign: 'center', marginTop: '20px', color: '#cbd5e1', fontSize: '14px' },
  loginSpan: { color: '#3b82f6', cursor: 'pointer', textDecoration: 'underline', fontWeight: '500' }
};

export default Register;