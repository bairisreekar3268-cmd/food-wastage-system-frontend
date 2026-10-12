import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const links = [
  ["/", "Dashboard"],
  ["/records", "Food Records"],
  ["/records/new", "Add Food"],
  ["/reports", "Reports"]
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="shell">
      <header className="topbar">
        <button className="menu" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">☰</button>
        <b>🍽️ Food Wastage Management</b>
      </header>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          🍽️ Food Wastage
          <small>Management System</small>
        </div>
        <nav>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
