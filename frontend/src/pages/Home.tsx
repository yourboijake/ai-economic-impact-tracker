import { useState, useEffect } from "react";
import type { SeriesWithObservations } from "../types/api";
import { TimeSeriesGraph } from "../components/custom/time-series-graph";

export default function Home() {
  const [allData, setAllData] = useState<SeriesWithObservations[] | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((res) => res.json())
      .then((data: SeriesWithObservations[]) => setAllData(data))
      .catch((err) => console.error("Error loading data:", err));
  }, []);

  return (
    <>
      <h1 className="text-4xl font-semibold mb-4">
        AI Economic Impact Tracker
      </h1>

      {allData && <TimeSeriesGraph data={allData[0]} />}
    </>
  );
}
