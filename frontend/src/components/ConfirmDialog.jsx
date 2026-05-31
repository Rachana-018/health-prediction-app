
import styles from "./ConfirmDialog.module.css";

export default function ConfirmDialog({ patient, onConfirm, onCancel, isLoading }) {
  if (!patient) return null;
  return (
    <div className={styles.overlay} role="dialog">
      <div className={styles.box}>
        <div className={styles.icon}>⚠️</div>
        <h3 className={styles.title}>Delete Patient?</h3>
        <p className={styles.body}>
          Permanently delete <strong>{patient.full_name}</strong>? This cannot be undone.
        </p>
        <div className={styles.actions}>
          <button className={styles.btnCancel}  onClick={onCancel}  disabled={isLoading}>Cancel</button>
          <button className={styles.btnConfirm} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
