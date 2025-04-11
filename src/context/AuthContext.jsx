import { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db 
} from '../firebase';
import { 
  onAuthStateChanged, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    role: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // Configurar persistencia al detectar cambios de autenticación
        await setPersistence(auth, browserLocalPersistence);
        
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAuthState({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || userData.name,
                // Añadir más datos del usuario si es necesario
                ...userData
              },
              role: userData.role || 'user',
              isLoading: false,
              error: null
            });
          } else {
            setAuthState({
              user: null,
              role: null,
              isLoading: false,
              error: "Usuario no registrado correctamente"
            });
            await signOut(auth);
          }
        } else {
          setAuthState({
            user: null,
            role: null,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        console.error("Auth error:", error);
        setAuthState({
          user: null,
          role: null,
          isLoading: false,
          error: error.message
        });
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser: authState.user,
    userRole: authState.role,
    loading: authState.isLoading,
    error: authState.error,
    // Añadir función para actualizar datos del usuario
    updateUserData: (newData) => {
      setAuthState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...newData
        }
      }));
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}