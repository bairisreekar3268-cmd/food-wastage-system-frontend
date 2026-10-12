import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Records from "./pages/Records.jsx";
import FoodForm from "./pages/FoodForm.jsx";
import Reports from "./pages/Reports.jsx";

function NotFound() {
  return (
    <div className="panel center">
      <h2>Page not found</h2>
      <Link className="btn" to="/">Back to dashboard</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="records" element={<Records />} />
            <Route path="records/new" element={<FoodForm />} />
            <Route path="records/:id/edit" element={<FoodForm />} />
            <Route path="reports" element={<Reports />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
