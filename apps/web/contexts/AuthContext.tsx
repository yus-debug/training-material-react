'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import {type User,onAuthStateChanged,signInWithPopup,signOut,setPersistence,browserLocalPersistence,} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

type Ctx = {
  user: User | null;
  loading: boolean;
  loginGoogle: (opts?: { forceAccountPicker?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthCtx = createContext<Ctx | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);


  const loginGoogle = async (opts?: { forceAccountPicker?: boolean }) => {
    //avoid auto reusing
    if (opts?.forceAccountPicker) {
      await signOut(auth).catch(() => {});
    }
    await signInWithPopup(auth, googleProvider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthCtx.Provider value={{ user, loading, loginGoogle, logout }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
