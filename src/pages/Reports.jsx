import { useState } from "react";
import useAsync from "../hooks/useAsync";
import { getFood, getSummary } from "../services/foodService";
import { EmptyState, ErrorBox, LevelBadge, Loading, StatCard } from "../components/ui.jsx";

function exportCsv(rows) {
  const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const head = ["Date", "Food", "Category", "Prepared_kg", "Served_kg", "Donated_kg", "Wasted_kg", "Waste_percent"];
  const lines = [head.join(",")].concat(
    rows.map((r) => [r.date, esc(r.name), esc(r.category), r.prepared, r.served, r.donated, r.wasted, r.wastePercent].join(","))
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
  a.download = "food-waste-report.csv";
  a.click();
}

export default function Reports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const summary = useAsync(() => getSummary({ start, end }), [start, end]);
  const records = useAsync(() => getFood({ start, end }), [start, end]);

  const loading = summary.loading || records.loading;
  const error = summary.error || records.error;

  return (
    <>
      <h1>Wastage Report</h1>
      <div className="panel filters no-print">
        <label>From<input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></label>
        <label>To<input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></label>
        <button className="btn alt" onClick={() => { setStart(""); setEnd(""); }}>Clear</button>
        <button className="btn alt" onClick={() => window.print()}>🖨️ Print</button>
        <button className="btn alt" disabled={!records.data || records.data.length === 0}
                onClick={() => exportCsv(records.data)}>Download CSV</button>
      </div>

      {loading && <Loading text="Building report..." />}
      {!loading && error && <ErrorBox message={error} onRetry={() => { summary.reload(); records.reload(); }} />}
      {!loading && !error && summary.data && records.data && (
        summary.data.totals.records === 0 ? (
          <EmptyState title="No records in this period" />
        ) : (
          <>
            <div className="cards">
              <StatCard label="Prepared" value={`${summary.data.totals.prepared} kg`} />
              <StatCard label="Served" value={`${summary.data.totals.served} kg`} />
              <StatCard label="Donated" value={`${summary.data.totals.donated} kg`} />
              <StatCard label="Wasted" value={`${summary.data.totals.wasted} kg (${summary.data.totals.wastePercent}%)`}
                        tone={summary.data.totals.level} />
            </div>

            <section className="panel">
              <h3>Food-wise analysis</h3>
              <div className="scroll">
                <table>
                  <thead>
                    <tr><th>Food</th><th>Prepared</th><th>Served</th><th>Donated</th><th>Wasted</th><th>%</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {summary.data.foods.map((f) => (
                      <tr key={f.name}>
                        <td>{f.name}</td><td>{f.prepared}</td><td>{f.served}</td><td>{f.donated}</td>
                        <td>{f.wasted}</td><td>{f.wastePercent}</td><td><LevelBadge level={f.level} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel">
              <h3>All records</h3>
              <div className="scroll">
                <table>
                  <thead>
                    <tr><th>Date</th><th>Food</th><th>Category</th><th>Prepared</th><th>Served</th><th>Donated</th><th>Wasted</th><th>%</th></tr>
                  </thead>
                  <tbody>
                    {records.data.map((r) => (
                      <tr key={r.id}>
                        <td>{r.date}</td><td>{r.name}</td><td>{r.category}</td><td>{r.prepared}</td>
                        <td>{r.served}</td><td>{r.donated}</td><td>{r.wasted}</td><td>{r.wastePercent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )
      )}
    </>
  );
}
