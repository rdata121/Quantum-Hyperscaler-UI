import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export default function AuthProvider({ children }){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> onAuthStateChanged(auth, u => { setUser(u); setLoading(false); }),[]);
  async function idToken(force=false){ return user ? await user.getIdToken(force) : null; }

  // Expose token function globally for testing
  useEffect(() => {
    window.getFirebaseToken = async (force = false) => {
      if (user) {
        const token = await user.getIdToken(force);
        console.log('Firebase ID Token:', token);
        console.log('Copy this token to test your APIs');
        return token;
      } else {
        console.log('No user logged in');
        return null;
      }
    };
    
    window.getCurrentUser = () => {
      console.log('Current user:', user);
      return user;
    };
  }, [user]);

  return <Ctx.Provider value={{ user, loading, idToken }}>{children}</Ctx.Provider>;
}
