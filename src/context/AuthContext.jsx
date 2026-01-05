import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    // Check for guest mode first
    const checkGuestMode = () => {
      const guestMode = localStorage.getItem('tiffin_guest_mode');
      if (guestMode === 'true') {
        setUser({
          id: 'guest',
          uid: 'guest',
          name: 'Guest User',
          displayName: 'Guest User',
          email: null,
          photoURL: null,
          isGuest: true
        });
      }
      setIsLoading(false);
    };

    if (!isFirebaseConfigured()) {
      checkGuestMode();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Clear guest mode when signing in
        localStorage.removeItem('tiffin_guest_mode');
        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          isGuest: false
        });
      } else {
        // Check for guest mode
        const guestMode = localStorage.getItem('tiffin_guest_mode');
        if (guestMode === 'true') {
          setUser({
            id: 'guest',
            uid: 'guest',
            name: 'Guest User',
            displayName: 'Guest User',
            email: null,
            photoURL: null,
            isGuest: true
          });
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured()) {
      return { error: { message: 'Firebase not configured. Please add your Firebase credentials.' } };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { user: null, error: { message: error.message } };
    }
  };

  // Email Sign Up
  const signUpWithEmail = async (email, password, name) => {
    if (!isFirebaseConfigured()) {
      return { error: { message: 'Firebase not configured. Please add your Firebase credentials.' } };
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with name
      if (name) {
        await updateProfile(result.user, { displayName: name });
      }
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Email sign-up error:', error);
      let message = error.message;
      if (error.code === 'auth/email-already-in-use') {
        message = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      }
      return { user: null, error: { message } };
    }
  };

  // Email Sign In
  const signInWithEmail = async (email, password) => {
    if (!isFirebaseConfigured()) {
      return { error: { message: 'Firebase not configured. Please add your Firebase credentials.' } };
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Email sign-in error:', error);
      let message = error.message;
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      }
      return { user: null, error: { message } };
    }
  };

  // Continue as Guest
  const continueAsGuest = () => {
    localStorage.setItem('tiffin_guest_mode', 'true');
    setUser({
      id: 'guest',
      uid: 'guest',
      name: 'Guest User',
      displayName: 'Guest User',
      email: null,
      photoURL: null,
      isGuest: true
    });
  };

  // Sign Out
  const signOut = async () => {
    localStorage.removeItem('tiffin_guest_mode');

    if (!isFirebaseConfigured()) {
      setUser(null);
      return { error: null };
    }

    try {
      await firebaseSignOut(auth);
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Sign-out error:', error);
      return { error: { message: error.message } };
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isGuest: user?.isGuest || false,
    isFirebaseConfigured: isFirebaseConfigured(),
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    continueAsGuest,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
