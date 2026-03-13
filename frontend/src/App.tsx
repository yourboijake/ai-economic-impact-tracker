import { useEffect, useState } from "react";

export default function App() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data: { message: string }) => setMessage(data.message))
      .catch(() => setMessage("Failed to reach backend"));
  }, []);

  return (
    <div>
      <h1>AI Economic Impact Tracker</h1>
      <p>Backend says: {message ?? "Loading..."}</p>
    </div>
  );
}
