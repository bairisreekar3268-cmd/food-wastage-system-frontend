import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import useAsync from "../hooks/useAsync";
import { getSummary } from "../services/foodService";
import {
  EmptyState,
  ErrorBox,
  LevelBadge,
  Loading,
  StatCard,
} from "../components/ui.jsx";

const COLORS = [
  "#e57373",
  "#ffb74d",
  "#64b5f6",
  "#81c784",
  "#ba68c8",
  "#4db6ac",
  "#a1887f",
  "#90a4ae",
];

export default function Dashboard() {
  const { data, loading, error, reload } = useAsync(
    () => getSummary(),
    []
  );

  const [view, setView] = useState("daily");

  // Show loading state while the API request is running.
  if (loading) {
    return <Loading text="Loading dashboard..." />;
  }

  // Show an error instead of crashing if the API request fails.
  if (error) {
    return <ErrorBox message={error} onRetry={reload} />;
  }

  // Prevent errors when the API returns no data.
  if (!data || !data.totals) {
    return (
      <ErrorBox
        message="Dashboard data is missing. Please check the backend API and try again."
        onRetry={reload}
      />
    );
  }

  // Provide safe defaults for optional collections.
  const totals = data.totals;
  const daily = Array.isArray(data.daily) ? data.daily : [];
  const monthly = Array.isArray(data.monthly) ? data.monthly : [];
  const foods = Array.isArray(data.foods) ? data.foods : [];
  const categories = Array.isArray(data.categories)
    ? data.categories
    : [];
  const suggestions = Array.isArray(data.suggestions)
    ? data.suggestions
    : [];

  // Safely handle missing totals fields.
  const records = Number(totals.records ?? 0);
  const prepared = Number(totals.prepared ?? 0);
  const served = Number(totals.served ?? 0);
  const donated = Number(totals.donated ?? 0);
  const wasted = Number(totals.wasted ?? 0);
  const wastePercent = Number(totals.wastePercent ?? 0);
  const level = totals.level ?? "Normal";

  // Show the empty state when no records exist.
  if (records === 0) {
    return (
      <EmptyState title="No food records yet">
        <p>Add your first record to see statistics and charts.</p>
        <Link className="btn" to="/records/new">
          Add first record
        </Link>
      </EmptyState>
    );
  }

  const series = view === "daily" ? daily : monthly;

  const pie = foods.filter(
    (food) => Number(food.wasted ?? 0) > 0
  );

  return (
    <>
      <h1>Dashboard</h1>

      <div className="cards">
        <StatCard
          label="Food wasted"
          value={`${wastePercent}%`}
          tone={level}
        />

        <StatCard
          label="Prepared"
          value={`${prepared} kg`}
        />

        <StatCard
          label="Served"
          value={`${served} kg`}
        />

        <StatCard
          label="Donated"
          value={`${donated} kg`}
        />

        <StatCard
          label="Wasted"
          value={`${wasted} kg`}
          tone={level}
        />
      </div>

      {level !== "Normal" && (
        <div className={`alert ${level}`}>
          ⚠️ {String(level).toUpperCase()} WASTAGE: overall
          waste is {wastePercent}%.
          {foods[0] && (
            <>
              {" "}Highest: <b>{foods[0].name}</b> (
              {foods[0].wasted} kg).
            </>
          )}
        </div>
      )}

      <div className="grid2">
        <section className="panel">
          <div className="row between">
            <h3>Prepared vs wasted (kg)</h3>

            <div className="tabs">
              <button
                className={view === "daily" ? "on" : ""}
                onClick={() => setView("daily")}
              >
                Daily
              </button>

              <button
                className={view === "monthly" ? "on" : ""}
                onClick={() => setView("monthly")}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="label"
                  tickFormatter={(value) =>
                    view === "daily"
                      ? String(value ?? "").slice(5)
                      : value
                  }
                />

                <YAxis />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="prepared"
                  name="Prepared"
                  fill="#81c784"
                />

                <Bar
                  dataKey="wasted"
                  name="Wasted"
                  fill="#e57373"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel">
          <h3>Waste by food (kg)</h3>

          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pie}
                  dataKey="wasted"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {pie.map((food, index) => (
                    <Cell
                      key={food.name ?? index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
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
                <tr>
                  <th>Category</th>
                  <th>Prepared</th>
                  <th>Wasted</th>
                  <th>%</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category, index) => (
                  <tr key={category.name ?? index}>
                    <td>{category.name ?? "Unknown"}</td>
                    <td>{category.prepared ?? 0}</td>
                    <td>{category.wasted ?? 0}</td>
                    <td>{category.wastePercent ?? 0}</td>
                    <td>
                      <LevelBadge
                        level={category.level ?? "Normal"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <h3>💡 Smart suggestions (last 7 days)</h3>

          {suggestions.length === 0 && (
            <p>No problems detected this week. Keep it up!</p>
          )}

          {suggestions.map((suggestion, index) => (
            <p
              key={index}
              className={`tip ${suggestion.level ?? "Normal"}`}
            >
              {suggestion.text ?? ""}
            </p>
          ))}
        </section>
      </div>
    </>
  );
}