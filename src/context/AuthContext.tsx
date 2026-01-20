import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, // <--- THE KEY FIX (Was signInWithRedirect)
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // --- LOGIN FUNCTION FIX ---
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Force account selection to prevent auto-login loops
      provider.setCustomParameters({ prompt: 'select_account' });

      // FIX: Used signInWithPopup instead of signInWithRedirect
      // This bypasses the 'sessionStorage' partitioning error on mobile
      const result = await signInWithPopup(auth, provider);
      
      const user = result.user;

      // Check if user exists in DB, if not create basic profile
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString(),
          role: 'shopkeeper' // Default role
        });
      }

    } catch (error: any) {
      console.error("Google Login Error:", error);
      // If popup is blocked by browser, alert user
      if (error.code === 'auth/popup-blocked') {
        alert("Please allow popups for this site to sign in.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        // User closed window, ignore
      } else {
        alert("Login Failed: " + error.message);
      }
    }
  };

  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
