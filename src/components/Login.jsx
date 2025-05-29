import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // const response = await axios.post('https://payment-link-server-v2.vercel.app/api/auth/login', {
            const response = await axios.post('http://172.17.1.11:3001/api/auth/login', {
                username,
                password,
            });
            const { token } = response.data;
            localStorage.setItem('token', token);
            onLogin();
            navigate('/admin');
        } catch (err) {
            alert('Login inválido');
        } finally {
            setLoading(false);
        }
    };

    const handleMouseOver = (e) => {
        e.target.style.backgroundColor = '#0052cc';
        e.target.style.boxShadow = '0 8px 16px rgba(0, 99, 247, 0.6)';
        e.target.style.transform = 'translateY(-2px)';
    };

    const handleMouseOut = (e) => {
        e.target.style.backgroundColor = '#0063F7';
        e.target.style.boxShadow = '0 4px 8px rgba(0, 99, 247, 0.4)';
        e.target.style.transform = 'translateY(0)';
    };

    return (
        <div style={pageStyle}>
            <header style={headerStyle}>
                <h1 style={headerTitleStyle}>Guaraci</h1>
                <p style={headerSubtitleStyle}>Área Administrativa</p>
            </header>
            <main style={mainStyle}>
                <form style={formStyle} onSubmit={handleSubmit}>
                    <h2 style={titleStyle}>Login do Administrador</h2>

                    <div style={fieldContainer}>
                        <label style={labelStyle}>Usuário</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Digite seu usuário"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <div style={fieldContainer}>
                        <label style={labelStyle}>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Digite sua senha"
                            style={inputStyle}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...buttonStyle,
                            backgroundColor: loading ? '#ccc' : '#0063F7',
                            cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </main>
        </div>
    );
}

// Styles
const pageStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f9f9f9',
    fontFamily: 'Arial, sans-serif',
};

const headerStyle = {
    backgroundColor: '#0063F7',
    color: '#ffffff',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    width: '90%',
    maxWidth: '800px',
    margin: '20px auto 40px',
    borderRadius: '16px',
};

const headerTitleStyle = {
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold',
};

const headerSubtitleStyle = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'normal',
};

const mainStyle = {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
};

const formStyle = {
    width: '100%',
    maxWidth: '400px',
    padding: '30px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
};

const titleStyle = {
    color: '#0063F7',
    textAlign: 'center',
    marginBottom: '10px',
    fontSize: '22px',
};

const buttonStyle = {
    padding: '14px',
    backgroundColor: '#0063F7',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    boxShadow: '0 8px 20px rgba(0, 99, 247, 0.4)'
};

const fieldContainer = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
};

const labelStyle = {
    fontSize: '14px',
    color: '#000000',
    fontWeight: 'bold',
};

const inputStyle = {
    padding: '12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    backgroundColor: '#ffffff',
    color: '#000000',
    outlineColor: '#0063F7',
};
