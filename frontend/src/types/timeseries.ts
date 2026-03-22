export interface SeriesInfo {
  title: string;
  description: string;
  unit: string;
  source: string;
  source_url: string;
  notes?: string;
}

export interface SeriesMetadata {
  title: string;
  description: string;
  frequency: string;
  series: Record<string, SeriesInfo>;
}

export interface TimeSeriesObservation {
  date: string;
  [seriesKey: string]: number | string | null;
}

export interface TimeSeriesData {
  metadata: SeriesMetadata;
  observations: TimeSeriesObservation[];
}
