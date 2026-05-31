import { useState, useEffect, useCallback } from "react";
import { getPatients, createPatient, updatePatient, deletePatient } from "./services/api";
import PatientForm    from "./components/PatientForm";
import PatientTable   from "./components/PatientTable";
import ConfirmDialog  from "./components/ConfirmDialog";
import Toast          from "./components/Toast";
import styles         from "./App.module.css";

export default function App() {
  const [patients,     setPatients]     = useState([]);
  const [search,       setSearch]       = useState("");
  const [view,         setView]         = useState("list");
  const [editTarget,   setEditTarget]   = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isFetching,   setIsFetching]   = useState(false);
  const [isSaving,     setIsSaving]     = useState(false);
  const [toast,        setToast]        = useState(null);

  const fetchPatients = useCallback(async (q = "") => {
    setIsFetching(true);
    try { const r = await getPatients(q); setPatients(r.data); }
    catch (err) { showToast(err.message, "error"); }
    finally { setIsFetching(false); }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);
  useEffect(() => { const t = setTimeout(() => fetchPatients(search), 350); return () => clearTimeout(t); }, [search, fetchPatients]);

  const showToast = (message, type = "success") => setToast({ message, type });
  const openAdd   = () => { setEditTarget(null); setView("form"); };
  const openEdit  = (p) => { setEditTarget(p);   setView("form"); };
  const closeForm = () => { setEditTarget(null); setView("list"); };

  async function handleSubmit(data) {
    setIsSaving(true);
    try {
      if (editTarget) { await updatePatient(editTarget.id, data); showToast(`${data.full_name} updated.`); }
      else            { await createPatient(data);                showToast(`${data.full_name} added.`); }
      closeForm(); fetchPatients(search);
    } catch (err) { showToast(err.message, "error"); }
    finally { setIsSaving(false); }
  }

  async function handleDelete() {
    setIsSaving(true);
    try {
      await deletePatient(deleteTarget.id);
      showToast(`${deleteTarget.full_name} deleted.`);
      setDeleteTarget(null); fetchPatients(search);
    } catch (err) { showToast(err.message, "error"); }
    finally { setIsSaving(false); }
  }

  const formInitial = editTarget ? {
    ...editTarget,
    glucose: String(editTarget.glucose),
    haemoglobin: String(editTarget.haemoglobin),
    cholesterol: String(editTarget.cholesterol),
  } : undefined;

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo}>🩺</span>
          <div>
            <h1 className={styles.appName}>HealthPredict</h1>
            <p className={styles.tagline}>AI-Powered Patient Health Analysis</p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {view === "form" ? (
          <PatientForm initial={formInitial} onSubmit={handleSubmit} onCancel={closeForm} isLoading={isSaving} />
        ) : (
          <>
            <div className={styles.toolbar}>
              <div className={styles.stats}>
                <span className={styles.statNum}>{patients.length}</span>
                <span className={styles.statLabel}>{patients.length === 1 ? "Patient" : "Patients"}</span>
              </div>
              <input className={styles.search} type="search"
                placeholder="🔍  Search by name or email…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <button className={styles.btnAdd} onClick={openAdd}>+ Add Patient</button>
            </div>
            {isFetching
              ? <div className={styles.loading}>Loading…</div>
              : <PatientTable patients={patients} onEdit={openEdit} onDelete={setDeleteTarget} />}
          </>
        )}
      </main>

      {deleteTarget && <ConfirmDialog patient={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} isLoading={isSaving} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <footer className={styles.footer}>
        <p>HealthPredict — AI health assessment tool. Not a substitute for professional medical advice.</p>
      </footer>
    </div>
  );
}
