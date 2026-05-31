from flask import Flask, request, jsonify  # type: ignore
from flask_cors import CORS  # type: ignore
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from datetime import datetime, date
import re, os, logging

app = Flask(__name__)
CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///patients.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ── Model ─────────────────────────────────────────────────────────────────────
class Patient(db.Model):
    __tablename__ = "patients"
    id           = db.Column(db.Integer, primary_key=True)
    full_name    = db.Column(db.String(120), nullable=False)
    date_of_birth= db.Column(db.Date, nullable=False)
    email        = db.Column(db.String(200), nullable=False, unique=True)
    glucose      = db.Column(db.Float, nullable=False)
    haemoglobin  = db.Column(db.Float, nullable=False)
    cholesterol  = db.Column(db.Float, nullable=False)
    remarks      = db.Column(db.Text, nullable=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "date_of_birth": self.date_of_birth.isoformat(),
            "email": self.email,
            "glucose": self.glucose,
            "haemoglobin": self.haemoglobin,
            "cholesterol": self.cholesterol,
            "remarks": self.remarks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# ── Validation ────────────────────────────────────────────────────────────────
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def validate_patient_data(data, is_update=False):
    errors, cleaned = [], {}

    if "full_name" in data or not is_update:
        name = (data.get("full_name") or "").strip()
        if len(name) < 2:
            errors.append("Full name must be at least 2 characters.")
        else:
            cleaned["full_name"] = name

    if "date_of_birth" in data or not is_update:
        try:
            dob = date.fromisoformat(data.get("date_of_birth", ""))
            if dob >= date.today():
                errors.append("Date of birth cannot be today or a future date.")
            else:
                cleaned["date_of_birth"] = dob
        except (ValueError, TypeError):
            errors.append("Date of birth must be YYYY-MM-DD.")

    if "email" in data or not is_update:
        email = (data.get("email") or "").strip().lower()
        if not EMAIL_REGEX.match(email):
            errors.append("Email address is not valid.")
        else:
            cleaned["email"] = email

    for field, label, lo, hi in [
        ("glucose", "Glucose", 0, 2000),
        ("haemoglobin", "Haemoglobin", 0, 30),
        ("cholesterol", "Cholesterol", 0, 1000),
    ]:
        if field in data or not is_update:
            try:
                val = float(data.get(field))
                if not (lo <= val <= hi):
                    errors.append(f"{label} must be between {lo} and {hi}.")
                else:
                    cleaned[field] = val
            except (ValueError, TypeError):
                errors.append(f"{label} must be numeric.")

    return errors, cleaned


# ── AI Prediction ─────────────────────────────────────────────────────────────
def predict_health(glucose, haemoglobin, cholesterol):
    findings, risk = [], "Low"
    rank = ["Low", "Moderate", "High"]

    if glucose < 70:
        findings.append("Hypoglycemia (Glucose < 70 mg/dL). Risk of low blood sugar.")
        risk = "High"
    elif glucose <= 99:
        findings.append("Glucose normal (70–99 mg/dL).")
    elif glucose <= 125:
        findings.append("Pre-diabetic glucose (100–125 mg/dL). Lifestyle changes advised.")
        risk = rank[max(rank.index(risk), 1)]
    else:
        findings.append(f"Elevated glucose ({glucose:.1f} mg/dL) — possible Diabetes. Consult endocrinologist.")
        risk = "High"

    if haemoglobin < 8:
        findings.append(f"Severe Anaemia (Hb {haemoglobin:.1f} g/dL). Immediate attention needed.")
        risk = "High"
    elif haemoglobin < 12:
        findings.append(f"Mild-moderate Anaemia (Hb {haemoglobin:.1f} g/dL). Iron/B12 review advised.")
        risk = rank[max(rank.index(risk), 1)]
    elif haemoglobin <= 17.5:
        findings.append(f"Haemoglobin normal ({haemoglobin:.1f} g/dL).")
    else:
        findings.append(f"Elevated Haemoglobin ({haemoglobin:.1f} g/dL) — possible Polycythemia.")
        risk = rank[max(rank.index(risk), 1)]

    if cholesterol < 200:
        findings.append(f"Cholesterol desirable ({cholesterol:.1f} mg/dL).")
    elif cholesterol <= 239:
        findings.append(f"Borderline high cholesterol ({cholesterol:.1f} mg/dL). Diet review advised.")
        risk = rank[max(rank.index(risk), 1)]
    else:
        findings.append(f"High cholesterol ({cholesterol:.1f} mg/dL) — elevated CV risk. Consult cardiologist.")
        risk = "High"

    return (
        f"[Overall Risk: {risk}] " + " | ".join(findings) +
        " | NOTE: AI-generated assessment — always consult a physician."
    )


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/api/health")
def health_check():
    return jsonify({"status": "ok"})

@app.route("/api/patients", methods=["POST"])
def create_patient():
    data = request.get_json(silent=True) or {}
    errors, cleaned = validate_patient_data(data)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    if Patient.query.filter_by(email=cleaned["email"]).first():
        return jsonify({"success": False, "errors": ["Email already exists."]}), 409
    p = Patient(**cleaned, remarks=predict_health(cleaned["glucose"], cleaned["haemoglobin"], cleaned["cholesterol"]))
    db.session.add(p)
    db.session.commit()
    return jsonify({"success": True, "data": p.to_dict()}), 201

@app.route("/api/patients", methods=["GET"])
def get_patients():
    search = request.args.get("search", "")
    q = Patient.query
    if search:
        like = f"%{search}%"
        q = q.filter(db.or_(Patient.full_name.ilike(like), Patient.email.ilike(like)))
    patients = q.order_by(Patient.created_at.desc()).all()
    return jsonify({"success": True, "data": [p.to_dict() for p in patients], "total": len(patients)})

@app.route("/api/patients/<int:pid>", methods=["GET"])
def get_patient(pid):
    return jsonify({"success": True, "data": Patient.query.get_or_404(pid).to_dict()})

@app.route("/api/patients/<int:pid>", methods=["PUT"])
def update_patient(pid):
    patient = Patient.query.get_or_404(pid)
    data = request.get_json(silent=True) or {}
    errors, cleaned = validate_patient_data(data, is_update=True)
    if errors:
        return jsonify({"success": False, "errors": errors}), 400
    if "email" in cleaned:
        existing = Patient.query.filter_by(email=cleaned["email"]).first()
        if existing and existing.id != pid:
            return jsonify({"success": False, "errors": ["Email already used."]}), 409
    for k, v in cleaned.items():
        setattr(patient, k, v)
    patient.remarks = predict_health(patient.glucose, patient.haemoglobin, patient.cholesterol)
    patient.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"success": True, "data": patient.to_dict()})

@app.route("/api/patients/<int:pid>", methods=["DELETE"])
def delete_patient(pid):
    patient = Patient.query.get_or_404(pid)
    name = patient.full_name
    db.session.delete(patient)
    db.session.commit()
    return jsonify({"success": True, "message": f"Deleted '{name}'."})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)