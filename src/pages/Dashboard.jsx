import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import useAsync from "../hooks/useAsync";
import { getSummary } from "../services/foodService";
import { EmptyState, ErrorBox, LevelBadge, Loading, StatCard } from "../components/ui.jsx";

const COLORS = ["#e57373", "#ffb74d", "#64b5f6", "#81c784", "#ba68c8", "#4db6ac", "#a1887f", "#90a4ae"];

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(() => getSummary(), []);
  const [view, setView] = useState("daily");

  if (loading) return <Loading text="Loading dashboard..." />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const { totals, daily, monthly, foods, categories, suggestions } = data;
  if (totals.records === 0) {
    return (
      <EmptyState title="No food records yet">
        <p>Add your first record to see statistics and charts.</p>
        <Link className="btn" to="/records/new">Add first record</Link>
      </EmptyState>
    );
  }

  const series = view === "daily" ? daily : monthly;
  const pie = foods.filter((f) => f.wasted > 0);

  return (
    <>
      <h1>Dashboard</h1>

      <div className="cards">
        <StatCard label="Food wasted" value={`${totals.wastePercent}%`} tone={totals.level} />
        <StatCard label="Prepared" value={`${totals.prepared} kg`} />
        <StatCard label="Served" value={`${totals.served} kg`} />
        <StatCard label="Donated" value={`${totals.donated} kg`} />
        <StatCard label="Wasted" value={`${totals.wasted} kg`} tone={totals.level} />
      </div>

      {totals.level !== "Normal" && (
        <div className={`alert ${totals.level}`}>
          ⚠️ {totals.level.toUpperCase()} WASTAGE: overall waste is {totals.wastePercent}%.
          {foods[0] && <> Highest: <b>{foods[0].name}</b> ({foods[0].wasted} kg).</>}
        </div>
      )}

      <div className="grid2">
        <section className="panel">
          <div className="row between">
            <h3>Prepared vs wasted (kg)</h3>
            <div className="tabs">
              <button className={view === "daily" ? "on" : ""} onClick={() => setView("daily")}>Daily</button>
              <button className={view === "monthly" ? "on" : ""} onClick={() => setView("monthly")}>Monthly</button>
            </div>
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickFormatter={(v) => (view === "daily" ? v.slice(5) : v)} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="prepared" name="Prepared" fill="#81c784" />
                <Bar dataKey="wasted" name="Wasted" fill="#e57373" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <h3>Waste by food (kg)</h3>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="wasted" nameKey="name" outerRadius={90} label>
                  {pie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid2">
        <section className="panel">
          <h3>Food category statistics</h3>
          <div className="scroll">
            <table>
              <thead>
                <tr><th>Category</th><th>Prepared</th><th>Wasted</th><th>%</th><th>Status</th></tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td><td>{c.prepared}</td><td>{c.wasted}</td><td>{c.wastePercent}</td>
                    <td><LevelBadge level={c.level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h3>💡 Smart suggestions (last 7 days)</h3>
          {suggestions.length === 0 && <p>No problems detected this week. Keep it up!</p>}
          {suggestions.map((s, i) => (
            <p key={i} className={`tip ${s.level}`}>{s.text}</p>
          ))}
        </section>
      </div>
    </>
  );
}
