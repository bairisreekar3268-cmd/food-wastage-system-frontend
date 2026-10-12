import { useCallback, useEffect, useState } from "react";
import { errorMessage } from "../services/api";

// Runs an async function on mount and whenever deps change; exposes loading / error / reload.
export default function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fn());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, reload: run };
}
