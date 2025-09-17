import { NavLink, useNavigate } from "react-router-dom";
import styles from "../styles/topbar.module.css";
import { useAuth } from "../auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../auth/firebase";

export default function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await signOut(auth);
    navigate("/");
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <NavLink to="/" className={styles.brand}>
          <span className={styles.dot} /> <span>NeoQubit</span>
        </NavLink>
      </div>

      <nav className={styles.nav}>
        <NavLink to="/docs" className={styles.link}>Docs</NavLink>
        <NavLink to="/support" className={styles.link}>Support</NavLink>
        <NavLink to="/console" className={`${styles.link} ${styles.console}`}>Console</NavLink>

        {user ? (
          <>
            <button onClick={onLogout} className={`${styles.linkBtn} ${styles.logout}`}>Logout</button>
            <div className={styles.avatar} title={user.email || "Account"}>
              {(user.email?.[0] || "R").toUpperCase()}
            </div>
          </>
        ) : (
          <>

          </>
        )}
      </nav>
    </header>
  );
}
