import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';  // Import the Axios instance

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhoneNumber] = useState('');
  const [address, setAddress] = useState(''); // New state for address
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/users/register', { username, email, password, phone, address }); // Include address
      if (response.status === 201) {
        navigate('/login');
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container className="register-container">
      <Container as={Link} to="/">
        <h1 className="fw-bold text-center fs-1">
          MATA<span>ELANG</span>
        </h1>
      </Container>

      <Card className="p-4 border-0 shadow">
        <h3 className="pb-3">Register</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleRegister}>
          <Form.Group controlId="formBasicUsername">
            <Form.Label>Nama Lengkap</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan Nama Lengkap"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mb-2"
              required
            />
          </Form.Group>
          <Form.Group controlId="formBasicEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Masukkan Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-2"
              required
            />
          </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-2"
              required
            />
          </Form.Group>
          <Form.Group controlId="formBasicPhoneNumber">
            <Form.Label>Nomor Telpon Aktif</Form.Label>
            <Form.Control
              type="tel"
              placeholder="Masukkan Nomor Telpon terdaftar di WhatsApp"
              value={phone}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mb-2"
              required
            />
          </Form.Group>
          <Form.Group controlId="formBasicAddress"> {/* New address field */}
            <Form.Label>Alamat</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan Alamat Lengkap"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mb-2"
              required
            />
          </Form.Group>
          <div className="d-flex justify-content-between mt-3">
            <Button variant="primary" type="submit">
              Register
            </Button>
          </div>
        </Form>
        <div className="mt-3 text-center">
          Sudah memiliki akun?
          <Button variant="link" as={Link} to="/login">
            Masuk
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default Register;
