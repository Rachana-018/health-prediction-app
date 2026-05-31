import styles from "./PatientTable.module.css";

function badge(remarks = "") {
  if (remarks.includes("Overall Risk: High"))     return { label:"High Risk",    cls:styles.badgeHigh };
  if (remarks.includes("Overall Risk: Moderate")) return { label:"Moderate Risk",cls:styles.badgeMod  };
  return { label:"Low Risk", cls:styles.badgeLow };
}
function fmtDate(iso) { if(!iso) return "—"; const [y,m,d]=iso.split("-"); return `${d}/${m}/${y}`; }

export default function PatientTable({ patients, onEdit, onDelete }) {
  if (!patients.length) return (
    <div className={styles.empty}>
      <span className={styles.emptyIcon}>🩺</span>
      <p>No patients found. Click <strong>+ Add Patient</strong> to get started.</p>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead><tr>
          <th>#</th><th>Full Name</th><th>DOB</th><th>Email</th>
          <th>Glucose</th><th>Hb</th><th>Cholesterol</th>
          <th>Risk</th><th>AI Remarks</th><th>Actions</th>
        </tr></thead>
        <tbody>
          {patients.map((p, i) => {
            const b = badge(p.remarks);
            return (
              <tr key={p.id} className={styles.row}>
                <td className={styles.idx}>{i+1}</td>
                <td className={styles.name}>{p.full_name}</td>
                <td>{fmtDate(p.date_of_birth)}</td>
                <td className={styles.email}>{p.email}</td>
                <td className={styles.center}>{p.glucose}</td>
                <td className={styles.center}>{p.haemoglobin}</td>
                <td className={styles.center}>{p.cholesterol}</td>
                <td className={styles.center}><span className={`${styles.badge} ${b.cls}`}>{b.label}</span></td>
                <td><p className={styles.remarks} title={p.remarks}>{p.remarks || "—"}</p></td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit}   onClick={() => onEdit(p)}>✏️ Edit</button>
                    <button className={styles.btnDelete} onClick={() => onDelete(p)}>🗑 Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
