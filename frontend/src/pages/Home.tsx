import { useState, useEffect } from "react";
import type { Series } from "../types/api";

export default function Home() {
  const [data, setData] = useState<Series | null>(null);

  useEffect(() => {
    fetch("/api/test")
      .then((response) => response.json())
      .then((data: Series) => setData(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData(null);
      });
  }, []);

  return (
    <>
      <h1 className="text-4xl font-semibold mb-4">AI Economic Impact Tracker</h1>
      <p className="text-lg text-gray-600">
        Backend says: {JSON.stringify(data) ?? "Loading..."}
      </p>
    </>
  );
}
