import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Container, Paper, Typography, TextField, Button, Link } from '@mui/material';
import { useAuth } from '../AuthContext';
import { collection, query, getCountFromServer, addDoc } from 'firebase/firestore';

const Sales = () => {
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const [error, setError] = useState('');
  const [isSignupDisabled, setIsSignupDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSignUpLimit = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getCountFromServer(q);
        if (querySnapshot.data().count >= 2) {
          setIsSignupDisabled(true);
        } else {
          setIsSignupDisabled(false);
        }
      } catch (err) {
        console.error("Error checking sign-up limit: ", err);
      }
    };

    checkSignUpLimit();
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/totalsales');
    }
  }, [user, navigate]);

  const handleSignUp = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      });
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
            {isSignUp && (
              <TextField
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                margin="normal"
              />
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={isSignUp ? handleSignUp : handleLogin}
              style={{ marginTop: '16px' }}
              disabled={isSignUp && isSignupDisabled}
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
        ) : null}
      </Paper>
    </Container>
  );
};

export default Sales;
