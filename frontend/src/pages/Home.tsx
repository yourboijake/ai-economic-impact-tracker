import { useState, useEffect } from "react";
import type { SeriesObservationsAPIResponse } from "../types/api";
import { TimeSeriesGraph } from "../components/custom/time-series-graph";

export default function Home() {
  const [data, setData] = useState<SeriesObservationsAPIResponse | null>(null);

  useEffect(() => {
    fetch("/api/test")
      .then((response) => response.json())
      .then((data: SeriesObservationsAPIResponse) => setData(data))
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData(null);
      });
  }, []);

  return (
    <>
      <h1 className="text-4xl font-semibold mb-4">
        AI Economic Impact Tracker
      </h1>

      {data && <TimeSeriesGraph data={data} />}
    </>
  );
}
