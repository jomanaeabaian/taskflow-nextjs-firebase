"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";

const AuthContext = createContext(null);

function fallbackName(firebaseUser) {
  return firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User";
}

async function loadOrCreateProfile(firebaseUser) {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { uid: firebaseUser.uid, ...snap.data() };

  const data = {
    displayName: fallbackName(firebaseUser),
    email: (firebaseUser.email ?? "").toLowerCase(),
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, data);
  return { uid: firebaseUser.uid, displayName: data.displayName, email: data.email };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const registering = useRef(false);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!active) return;
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      if (registering.current) {
        setLoading(false);
        return;
      }
      try {
        const nextProfile = await loadOrCreateProfile(currentUser);
        if (active) setProfile(nextProfile);
      } catch (error) {
        console.error("Failed to load user profile:", error);
        
        if (active) {
          setProfile({
            uid: currentUser.uid,
            displayName: fallbackName(currentUser),
            email: (currentUser.email ?? "").toLowerCase(),
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback((email, password) => signInWithEmailAndPassword(auth, email.trim(), password), []);

  const register = useCallback(async (name, email, password) => {
    const displayName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    registering.current = true;
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const newProfile = { uid: credential.user.uid, displayName, email: cleanEmail };
      try {
        await updateProfile(credential.user, { displayName }); // name stored in Firebase Auth
        await setDoc(doc(db, "users", credential.user.uid), {
          displayName,
          email: cleanEmail,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        // console.error("Account created, but saving the profile failed:", error);
         console.error("Firebase signup error:", error.code, error.message);
      }

      setProfile(newProfile);
      return credential;
    } finally {
      registering.current = false;
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      displayName: profile?.displayName || user?.displayName || user?.email || "",
      login,
      register,
      logout,
    }),
    [user, profile, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
