import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Use onSnapshot for real-time profile updates
        const profileRef = doc(db, 'profiles', currentUser.uid);
        const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as Profile);
          } else {
            // Fallback profile if document doesn't exist yet
            const adminEmails = ['gayatrimulik22@gmail.com', 'riddhijadhav204@gmail.com', 'sawantsamruddhi395@gmail.com'];
            const role = adminEmails.includes(currentUser.email?.toLowerCase() || '') ? 'admin' : 'user';
            
            setProfile({
              id: currentUser.uid,
              username: currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              role: role,
              created_at: new Date().toISOString()
            });
          }
          setLoading(false);
        }, (error) => {
          console.error('Profile snapshot error:', error);
          setLoading(false);
        });

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const adminEmails = ['gayatrimulik22@gmail.com', 'riddhijadhav204@gmail.com', 'sawantsamruddhi395@gmail.com'];
  const isAdmin = profile?.role === 'admin' || adminEmails.includes(user?.email?.toLowerCase() || '');

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAdmin,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
