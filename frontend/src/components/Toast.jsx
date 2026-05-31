
import { useEffect } from "react";
import styles from "./Toast.module.css";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span>{type === "success" ? "✅" : "❌"}</span>
      <span>{message}</span>
      <button onClick={onClose} className={styles.close}>×</button>
    </div>
  );
}
