import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Link
} from '@mui/material';

const Sales = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true); // Flag to toggle between sign-up and login
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      console.error("Sign Up Error: ", error);
      setError(`Sign-up failed: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
    } catch (error) {
      console.error("Login Error: ", error);
      setError(`Login failed: ${error.message}`);
    }
  };

  const handleSaveData = async () => {
    setError('');
    try {
      await addDoc(collection(db, 'sales'), {
        userId: user.uid,
        data: 'Sample Data'
      });
      alert('Data saved successfully!');
    } catch (error) {
      console.error("Data Save Error: ", error);
      setError(`Data save failed: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        {!user ? (
          <div>
            <Typography variant="h4" component="h2" gutterBottom>
              {isSignUp ? 'Sign Up' : 'Login'}
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={isSignUp ? handleSignUp : handleLogin}
              style={{ marginTop: '16px' }}
            >
              {isSignUp ? 'Sign Up' : 'Login'}
            </Button>
            <Typography variant="body2" align="center" style={{ marginTop: '16px' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Login here' : 'Sign up here'}
              </Link>
            </Typography>
          </div>
        ) : (
          <div>
            <Typography variant="h4" component="h2" gutterBottom>
              Sales Page
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveData}
              style={{ marginTop: '16px' }}
            >
              Save Data
            </Button>
          </div>
        )}
      </Paper>
    </Container>
  );
};

export default Sales;
