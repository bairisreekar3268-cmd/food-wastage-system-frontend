import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAsync from "../hooks/useAsync";
import { deleteFood, getCategories, getFood } from "../services/foodService";
import { errorMessage } from "../services/api";
import { useToast } from "../components/Toast.jsx";
import { EmptyState, ErrorBox, LevelBadge, Loading } from "../components/ui.jsx";

export default function Records() {
  const notify = useToast();
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // wait 300 ms after typing before calling the API
  useEffect(() => {
    const t = setTimeout(() => setSearch(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const records = useAsync(() => getFood({ q: search, category, start, end }), [search, category, start, end]);
  const cats = useAsync(() => getCategories(), []);

  async function remove(r) {
    if (!window.confirm(`Delete ${r.name} (${r.date})?`)) return;
    try {
      await deleteFood(r.id);
      notify("success", "Record deleted.");
      records.reload();
      cats.reload();
    } catch (e) {
      notify("error", errorMessage(e));
    }
  }

  function clearFilters() {
    setQ(""); setSearch(""); setCategory(""); setStart(""); setEnd("");
  }

  return (
    <>
      <div className="row between">
        <h1>Food Records</h1>
        <Link className="btn" to="/records/new">+ Add food</Link>
      </div>

      <div className="panel filters">
        <label>Search<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Food or category" /></label>
        <label>Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All</option>
            {(cats.data || []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>From<input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>To<input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <button className="btn alt" onClick={clearFilters}>Clear</button>
      </div>

      {records.loading && <Loading text="Loading records..." />}
      {records.error && <ErrorBox message={records.error} onRetry={records.reload} />}
      {!records.loading && !records.error && records.data && records.data.length === 0 && (
        <EmptyState title="No records found">
          <p>Try changing the filters or add a new record.</p>
        </EmptyState>
      )}
      {!records.loading && !records.error && records.data && records.data.length > 0 && (
        <div className="panel scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Food</th><th>Category</th><th>Prepared</th><th>Served</th>
                <th>Donated</th><th>Wasted</th><th>%</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {records.data.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td><td>{r.name}</td><td>{r.category}</td><td>{r.prepared}</td>
                  <td>{r.served}</td><td>{r.donated}</td><td>{r.wasted}</td><td>{r.wastePercent}</td>
                  <td><LevelBadge level={r.level} /></td>
                  <td className="actions">
                    <Link to={`/records/${r.id}/edit`}>Edit</Link>
                    <button className="link danger" onClick={() => remove(r)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
