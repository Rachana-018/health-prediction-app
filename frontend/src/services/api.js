
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.errors?.join(" | ") || `Error ${res.status}`);
  return json;
}

export const getPatients  = (q = "") => request(`/patients${q ? `?search=${encodeURIComponent(q)}` : ""}`);
export const getPatient   = (id)     => request(`/patients/${id}`);
export const createPatient = (data)  => request("/patients", { method: "POST", body: JSON.stringify(data) });
export const updatePatient = (id, d) => request(`/patients/${id}`, { method: "PUT",  body: JSON.stringify(d) });
export const deletePatient = (id)    => request(`/patients/${id}`, { method: "DELETE" });
