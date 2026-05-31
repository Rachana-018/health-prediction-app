import { useState, useEffect } from "react";
import styles from "./PatientForm.module.css";

const EMPTY = { full_name:"", date_of_birth:"", email:"", glucose:"", haemoglobin:"", cholesterol:"" };

export default function PatientForm({ initial = EMPTY, onSubmit, onCancel, isLoading }) {
  const [form, setForm]   = useState(initial);
  const [errors, setErrors] = useState({});
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => { setForm(initial); setErrors({}); }, [initial]);

  function validate() {
    const e = {};
    if (!form.full_name.trim() || form.full_name.trim().length < 2) e.full_name = "Min 2 characters.";
    if (!form.date_of_birth) e.date_of_birth = "Required.";
    else if (form.date_of_birth >= today) e.date_of_birth = "Cannot be today or future.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email.";
    for (const [f, label, lo, hi] of [["glucose","Glucose",0,2000],["haemoglobin","Haemoglobin",0,30],["cholesterol","Cholesterol",0,1000]]) {
      const v = parseFloat(form[f]);
      if (form[f]==="" || isNaN(v)) e[f] = `${label} must be a number.`;
      else if (v < lo || v > hi) e[f] = `${label}: ${lo}–${hi}.`;
    }
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSubmit({ ...form, glucose: parseFloat(form.glucose), haemoglobin: parseFloat(form.haemoglobin), cholesterol: parseFloat(form.cholesterol) });
  }

  const isEdit = !!initial.id;

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>{isEdit ? "Edit Patient" : "Add New Patient"}</h2>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Personal Information</legend>
        <div className={styles.row}>
          <Field label="Full Name" error={errors.full_name}>
            <input name="full_name" value={form.full_name} onChange={handleChange}
              placeholder="e.g. Priya Sharma" className={errors.full_name ? styles.inputError : ""} />
          </Field>
          <Field label="Date of Birth" error={errors.date_of_birth}>
            <input type="date" name="date_of_birth" value={form.date_of_birth}
              onChange={handleChange} max={today} className={errors.date_of_birth ? styles.inputError : ""} />
          </Field>
        </div>
        <Field label="Email Address" error={errors.email}>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="e.g. priya@example.com" className={errors.email ? styles.inputError : ""} />
        </Field>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Blood Test Results</legend>
        <div className={styles.row}>
          {[["glucose","Glucose (mg/dL)","Normal: 70–99","90"],
            ["haemoglobin","Haemoglobin (g/dL)","Normal: 12–17.5","13.5"],
            ["cholesterol","Cholesterol (mg/dL)","Normal: <200","180"]].map(([name,label,hint,ph]) => (
            <Field key={name} label={label} hint={hint} error={errors[name]}>
              <input type="number" name={name} value={form[name]} onChange={handleChange}
                step="0.1" placeholder={`e.g. ${ph}`} className={errors[name] ? styles.inputError : ""} />
            </Field>
          ))}
        </div>
      </fieldset>

      <div className={styles.actions}>
        <button type="button" className={styles.btnCancel} onClick={onCancel} disabled={isLoading}>Cancel</button>
        <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
          {isLoading ? "Saving…" : isEdit ? "Update Patient" : "Add Patient"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, hint, error, children }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {hint && <span className={styles.hint}>{hint}</span>}
      {children}
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  );
}
