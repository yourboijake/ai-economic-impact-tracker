import { useState, useEffect } from "react";
import type { Series } from "./types/api";

export default function App() {
  const [data, setData] = useState<Series | null>(null);

  useEffect(() => {
    fetch("/api/test")
      .then((response) => response.json())
      .then((data: Series) => setData(data))
      .catch((error) => {
        console.error("Error fetching greeting:", error);
        setData(null);
      });
  }, []);

  return (
    <div>
      <h1>AI Economic Impact Tracker</h1>
      <p>Backend says: {JSON.stringify(data) ?? "Loading..."}</p>
    </div>
  );
}
