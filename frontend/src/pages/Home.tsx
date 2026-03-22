import { useState, useEffect } from "react";
import type { TimeSeriesData } from "../types/timeseries";
import { TimeSeriesGraph } from "../components/custom/time-series-graph";

export default function Home() {
  const [data, setData] = useState<TimeSeriesData[] | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((res) => res.json())
      .then((data: TimeSeriesData[]) => {
        setData(data);
      })
      .catch((err) => console.error("Error loading data:", err));
  }, []);

  return (
    <>
      <h1 className="text-4xl font-semibold mb-4">
        AI Economic Impact Tracker
      </h1>

      {data &&
        data.map((series, i) => <TimeSeriesGraph key={i} data={series} />)}
    </>
  );
}
