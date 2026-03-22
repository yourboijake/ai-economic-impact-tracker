import { useState } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { TimeSeriesData } from "@/types/timeseries";

const SERIES_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
];

function formatDate(d: Date) {
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}

export function TimeSeriesGraph({ data }: { data: TimeSeriesData }) {
  const { metadata, observations } = data;
  const seriesKeys = Object.keys(metadata.series);

  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const parsedObservations = observations.map((obs) => ({
    ...obs,
    date: new Date(obs.date as string),
  }));

  const [range, setRange] = useState<[number, number]>([
    0,
    parsedObservations.length - 1,
  ]);

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const visibleObservations = parsedObservations.slice(range[0], range[1] + 1);
  const startDate = parsedObservations[range[0]]?.date;
  const endDate = parsedObservations[range[1]]?.date;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{metadata.title}</h2>
      <p className="text-md mb-4">{metadata.description}</p>
      <div className="flex flex-wrap gap-3 mb-3">
        {seriesKeys.map((key, i) => {
          const color = SERIES_COLORS[i % SERIES_COLORS.length];
          const hidden = hiddenSeries.has(key);
          return (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => toggleSeries(key)}
              className="gap-1.5 transition-opacity"
              style={{
                borderColor: color,
                opacity: hidden ? 0.4 : 1,
              }}
            >
              <span
                className="inline-block w-4 h-0.5"
                style={{ backgroundColor: color }}
              />
              {metadata.series[key].title}
            </Button>
          );
        })}
      </div>
      <LineChart
        style={{ width: "100%", height: 400 }}
        data={visibleObservations}
        margin={{ top: 20, right: 60, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          angle={60}
          textAnchor="start"
          tickFormatter={(d: Date) => formatDate(d)}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(label) =>
            label instanceof Date ? formatDate(label) : String(label)
          }
        />
        {seriesKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={metadata.series[key].title}
            stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
            dot={false}
            connectNulls={false}
            hide={hiddenSeries.has(key)}
            animationDuration={1200}
          />
        ))}
      </LineChart>
      <div className="flex items-center gap-4 mt-2 px-1">
        <span className="text-sm font-semibold whitespace-nowrap">
          {startDate ? formatDate(startDate) : ""}
        </span>
        <Slider
          min={0}
          max={parsedObservations.length - 1}
          step={1}
          value={range}
          onValueChange={(v) => setRange([v[0], v[1]])}
          className="flex-1"
        />
        <span className="text-sm font-semibold whitespace-nowrap">
          {endDate ? formatDate(endDate) : ""}
        </span>
      </div>
      <RechartsDevtools />
      <div className="mt-4 space-y-1">
        {seriesKeys.map((key) => (
          <p key={key} className="text-sm">
            <span className="font-medium">
              {metadata.series[key].title} Source:
            </span>{" "}
            <a href={metadata.series[key].source_url} className="underline">
              {metadata.series[key].source}
            </a>
          </p>
        ))}
      </div>
      <div className="mt-4 space-y-1">
        {seriesKeys
          .filter((key) => metadata.series[key].notes)
          .map((key) => (
            <p key={key} className="text-sm">
              <span className="font-medium">
                {metadata.series[key].title} Notes:
              </span>{" "}
              {metadata.series[key].notes}
            </p>
          ))}
      </div>
    </div>
  );
}
