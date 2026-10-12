import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createFood, getCategories, getFoodById, getPrediction, updateFood } from "../services/foodService";
import { errorMessage } from "../services/api";
import { useToast } from "../components/Toast.jsx";
import { ErrorBox, Loading } from "../components/ui.jsx";

const todayLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const blank = () => ({ date: todayLocal(), name: "", category: "General", prepared: "", served: "", donated: "0" });
const DEFAULT_CATEGORIES = ["General", "Main course", "Side dish", "Bread", "Snacks", "Dessert", "Beverage"];

function validate(f) {
  const e = {};
  const p = parseFloat(f.prepared);
  const s = parseFloat(f.served);
  const d = f.donated === "" ? 0 : parseFloat(f.donated);
  if (!f.date) e.date = "Date is required.";
  if (!f.name.trim()) e.name = "Food name is required.";
  if (!(p > 0)) e.prepared = "Prepared must be greater than 0.";
  if (!(s >= 0)) e.served = "Served must be 0 or more.";
  if (Number.isNaN(d) || d < 0) e.donated = "Donated must be 0 or more.";
  if (!e.prepared && !e.served && !e.donated && s + d > p) e.served = "Served + donated cannot exceed prepared.";
  return e;
}

export default function FoodForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const notify = useToast();

  const [form, setForm] = useState(blank());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [hint, setHint] = useState("");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    getCategories()
      .then((list) => setCategories([...new Set([...DEFAULT_CATEGORIES, ...list])]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!editing) { setForm(blank()); setLoading(false); return; }
    setLoading(true);
    getFoodById(id)
      .then((r) => setForm({
        date: r.date, name: r.name, category: r.category,
        prepared: String(r.prepared), served: String(r.served), donated: String(r.donated)
      }))
      .catch((e) => setLoadError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [id, editing]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const p = parseFloat(form.prepared) || 0;
  const s = parseFloat(form.served) || 0;
  const d = parseFloat(form.donated) || 0;
  const wasted = Math.max(p - s - d, 0);
  const pct = p > 0 ? (wasted / p) * 100 : 0;
  const level = pct < 10 ? "Normal" : pct < 20 ? "Moderate" : "High";

  function checkPrediction() {
    if (editing || !form.name.trim()) return;
    getPrediction(form.name.trim())
      .then((r) => setHint(r.recommended
        ? `🤖 Suggested preparation for tomorrow: ${r.recommended} kg (based on ${r.basedOnRecords} records)`
        : "Not enough past data for a prediction yet (need 3+ records)."))
      .catch(() => setHint(""));
  }

  async function submit(e) {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;
    const body = {
      date: form.date,
      name: form.name.trim(),
      category: form.category.trim() || "General",
      prepared: parseFloat(form.prepared),
      served: parseFloat(form.served),
      donated: form.donated === "" ? 0 : parseFloat(form.donated)
    };
    setSaving(true);
    try {
      if (editing) await updateFood(id, body); else await createFood(body);
      notify("success", editing ? "Record updated." : "Record added.");
      navigate("/records");
    } catch (err) {
      notify("error", errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loading text="Loading record..." />;
  if (loadError) return <ErrorBox message={loadError} />;

  return (
    <>
      <h1>{editing ? "Edit Food Record" : "Add Food Record"}</h1>
      <form className="panel form" onSubmit={submit} noValidate>
        <label>Date
          <input type="date" value={form.date} onChange={set("date")} />
          {errors.date && <small className="err">{errors.date}</small>}
        </label>
        <label>Food name
          <input value={form.name} onChange={set("name")} onBlur={checkPrediction} placeholder="e.g. Rice" maxLength={80} />
          {errors.name && <small className="err">{errors.name}</small>}
        </label>
        {hint && <div className="hint">{hint}</div>}
        <label>Category
          <input list="cats" value={form.category} onChange={set("category")} maxLength={40} />
          <datalist id="cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </label>
        <label>Prepared (kg)
          <input type="number" step="0.1" min="0" value={form.prepared} onChange={set("prepared")} />
          {errors.prepared && <small className="err">{errors.prepared}</small>}
        </label>
        <label>Served (kg)
          <input type="number" step="0.1" min="0" value={form.served} onChange={set("served")} />
          {errors.served && <small className="err">{errors.served}</small>}
        </label>
        <label>Donated surplus (kg)
          <input type="number" step="0.1" min="0" value={form.donated} onChange={set("donated")} />
          {errors.donated && <small className="err">{errors.donated}</small>}
        </label>
        <div className={`live ${level}`}>Wasted: {wasted.toFixed(1)} kg ({pct.toFixed(1)}%) - {level}</div>
        <div className="row">
          <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          <button className="btn alt" type="button" onClick={() => navigate("/records")}>Cancel</button>
        </div>
      </form>
    </>
  );
}
