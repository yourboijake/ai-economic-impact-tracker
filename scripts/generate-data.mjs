#!/usr/bin/env node
/**
 * Converts CSV files from backend/ingestion_files/ into a static
 * frontend/public/data.json file for GitHub Pages deployment.
 *
 * Run with: bun run generate:data
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function parseCSV(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row = {};
    for (let i = 0; i < headers.length; i++) {
      row[headers[i]] = values[i]?.trim() ?? "";
    }
    return row;
  });
}

/** Converts a Go time layout date string to an ISO date string */
function parseDate(dateStr, layout) {
  if (layout === "2006-01-02") {
    return new Date(`${dateStr}T00:00:00.000Z`).toISOString();
  }
  if (layout === "1/1/2006") {
    // M/D/YYYY
    const [m, d, y] = dateStr.split("/");
    const iso = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    return new Date(`${iso}T00:00:00.000Z`).toISOString();
  }
  throw new Error(`Unknown date layout: ${layout}`);
}

/**
 * A single CSV with multiple value columns — one per series.
 * All series share the same dates.
 *
 * @typedef {{ type: "single-csv", file: string, dateCol: string, dateLayout: string, seriesColumns: Record<string, string> }} SingleCsvSource
 *
 * Multiple CSVs, one per series, merged by date union.
 *
 * @typedef {{ type: "multi-csv", series: Record<string, { file: string, dateCol: string, valueCol: string, dateLayout: string }> }} MultiCsvSource
 */

const GROUP_CONFIGS = [
  {
    metadata: {
      title: "Unemployment by Career Stage",
      description:
        "Monthly unemployment rates across different career stages, showing how unemployment varies between young workers, all workers, recent graduates, and college graduates.",
      frequency: "Monthly",
      series: {
        youngWorkers: {
          title: "Young Workers",
          description:
            "Unemployment rates of young workers (age 22-27 without a bachelor's degree)",
          unit: "Percentage",
          source:
            "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
          source_url:
            "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
          notes:
            "Rates are seasonally adjusted and smoothed with a three-month moving average. Young workers are those aged 22 to 27 without a bachelor's degree. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
        },
        allWorkers: {
          title: "All Workers",
          description: "Unemployment rates of all workers",
          unit: "Percentage",
          source:
            "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
          source_url:
            "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
          notes:
            "Rates are seasonally adjusted and smoothed with a three-month moving average. All workers are those aged 16 to 65. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
        },
        recentGraduates: {
          title: "Recent Graduates",
          description: "Unemployment rates of recent college graduates",
          unit: "Percentage",
          source:
            "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
          source_url:
            "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
          notes:
            "Rates are seasonally adjusted and smoothed with a three-month moving average. Recent college graduates are those aged 22 to 27 with a bachelor's degree or higher. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
        },
        collegeGraduates: {
          title: "College Graduates",
          description: "Unemployment rates of all college graduates",
          unit: "Percentage",
          source:
            "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
          source_url:
            "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
          notes:
            "Rates are seasonally adjusted and smoothed with a three-month moving average. College graduates are those aged 22 to 65 with a bachelor's degree or higher. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
        },
      },
    },
    source: {
      type: "single-csv",
      file: "ingestion_files/unemployment-by-career-stage.csv",
      dateCol: "Date",
      dateLayout: "1/1/2006",
      seriesColumns: {
        youngWorkers: "Young workers",
        allWorkers: "All workers",
        recentGraduates: "Recent graduates",
        collegeGraduates: "College graduates",
      },
    },
  },
  {
    metadata: {
      title: "Underemployment by Career Stage",
      description:
        "Monthly underemployment rates for recent college graduates and all college graduates, capturing workers employed part-time for economic reasons or in jobs not requiring a college degree.",
      frequency: "Monthly",
      series: {
        recentGraduates: {
          title: "Recent Graduates",
          description: "Underemployment rates of recent college graduates",
          unit: "Percentage",
          source:
            "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
          source_url:
            "https://www.newyorkfed.org/research/college-labor-market#--:explore:underemployment",
          notes:
            "Rates are seasonally adjusted and smoothed with a three-month moving average. Recent college graduates are those aged 22 to 27 with a bachelor's degree or higher. Underemployment includes those working part-time for economic reasons or in jobs that do not require a college degree. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
        },
        collegeGraduates: {
          title: "College Graduates",
          description: "Underemployment rates of all college graduates",
          unit: "Percentage",
          source:
            "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
          source_url:
            "https://www.newyorkfed.org/research/college-labor-market#--:explore:underemployment",
          notes:
            "Rates are seasonally adjusted and smoothed with a three-month moving average. College graduates are those aged 22 to 65 with a bachelor's degree or higher. Underemployment includes those working part-time for economic reasons or in jobs that do not require a college degree. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
        },
      },
    },
    source: {
      type: "single-csv",
      file: "ingestion_files/underemployment-by-career-stage.csv",
      dateCol: "Date",
      dateLayout: "1/1/2006",
      seriesColumns: {
        recentGraduates: "Recent graduates",
        collegeGraduates: "College graduates",
      },
    },
  },
  {
    metadata: {
      title: "Job Postings Index",
      description:
        "Daily index of online job postings for software development, IT operations/help desk, and customer service occupations, indexed to February 1, 2020.",
      frequency: "Daily",
      series: {
        softwareDev: {
          title: "Software Developer",
          description:
            "Index of online job postings in software development occupations",
          unit: "Index (Feb 1, 2020 = 100)",
          source:
            "Indeed Hiring Lab via Federal Reserve Bank of St. Louis (FRED), Series IHLIDXUSTPSOFTDEVE",
          source_url: "https://fred.stlouisfed.org/series/IHLIDXUSTPSOFTDEVE#",
          notes:
            "Indeed calculates the index change in seasonally-adjusted job postings since February 1, 2020, the pre-pandemic baseline. Indeed seasonally adjusts each series based on historical patterns in 2017, 2018, and 2019. Each series, including the national trend, occupational sectors, and sub-national geographies, is seasonally adjusted separately. Indeed switched to this new methodology in December 2022 and now reports all historical data using this new methodology. Historical numbers have been revised and may differ significantly from originally reported values. The new methodology applies a detrended seasonal adjustment factor to the index change in job postings.",
        },
        itHelpDesk: {
          title: "IT & Help Desk",
          description:
            "Index of online job postings in IT operations and help desk occupations",
          unit: "Index (Feb 1, 2020 = 100)",
          source:
            "Indeed Hiring Lab via Federal Reserve Bank of St. Louis (FRED), Series IHLIDXUSTPITOPHE",
          source_url: "https://fred.stlouisfed.org/series/IHLIDXUSTPITOPHE",
          notes:
            "Indeed calculates the index change in seasonally-adjusted job postings since February 1, 2020, the pre-pandemic baseline. Indeed seasonally adjusts each series based on historical patterns in 2017, 2018, and 2019. Each series, including the national trend, occupational sectors, and sub-national geographies, is seasonally adjusted separately. Indeed switched to this new methodology in December 2022 and now reports all historical data using this new methodology. Historical numbers have been revised and may differ significantly from originally reported values. The new methodology applies a detrended seasonal adjustment factor to the index change in job postings.",
        },
        customerService: {
          title: "Customer Service",
          description:
            "Index of online job postings in customer service occupations",
          unit: "Index (Feb 1, 2020 = 100)",
          source:
            "Indeed Hiring Lab via Federal Reserve Bank of St. Louis (FRED), Series IHLIDXUSTPCUSTSERV",
          source_url: "https://fred.stlouisfed.org/series/IHLIDXUSTPCUSTSERV",
          notes:
            "Indeed calculates the index change in seasonally-adjusted job postings since February 1, 2020, the pre-pandemic baseline. Indeed seasonally adjusts each series based on historical patterns in 2017, 2018, and 2019. Each series, including the national trend, occupational sectors, and sub-national geographies, is seasonally adjusted separately. Indeed switched to this new methodology in December 2022 and now reports all historical data using this new methodology. Historical numbers have been revised and may differ significantly from originally reported values. The new methodology applies a detrended seasonal adjustment factor to the index change in job postings.",
        },
      },
    },
    source: {
      type: "multi-csv",
      series: {
        softwareDev: {
          file: "ingestion_files/fred_software_dev_job_listings.csv",
          dateCol: "observation_date",
          valueCol: "IHLIDXUSTPSOFTDEVE",
          dateLayout: "2006-01-02",
        },
        itHelpDesk: {
          file: "ingestion_files/it_ops_help_desk_job_listings.csv",
          dateCol: "observation_date",
          valueCol: "IHLIDXUSTPITOPHE",
          dateLayout: "2006-01-02",
        },
        customerService: {
          file: "ingestion_files/fred_cust_service_job_listings.csv",
          dateCol: "observation_date",
          valueCol: "IHLIDXUSTPCUSTSERV",
          dateLayout: "2006-01-02",
        },
      },
    },
  },
];

function processSingleCsv(config) {
  const { source, metadata } = config;
  const rows = parseCSV(resolve(ROOT, source.file));
  const seriesKeys = Object.keys(source.seriesColumns);

  const observations = [];
  for (const row of rows) {
    const dateStr = row[source.dateCol];
    if (!dateStr) continue;

    let date;
    try {
      date = parseDate(dateStr, source.dateLayout);
    } catch {
      continue;
    }

    const obs = { date };
    let hasAnyValue = false;
    for (const [seriesKey, csvCol] of Object.entries(source.seriesColumns)) {
      const valStr = row[csvCol];
      if (valStr && valStr !== ".") {
        const value = parseFloat(valStr.replace(",", ""));
        if (!isNaN(value)) {
          obs[seriesKey] = value;
          hasAnyValue = true;
          continue;
        }
      }
      obs[seriesKey] = null;
    }

    if (hasAnyValue) observations.push(obs);
  }

  console.log(
    `${metadata.title}: ${observations.length} observations, ${seriesKeys.length} series`,
  );
  return { metadata, observations };
}

function processMultiCsv(config) {
  const { source, metadata } = config;

  // Build a Map<isoDateString, value> for each series
  const seriesMaps = {};
  for (const [seriesKey, csvConfig] of Object.entries(source.series)) {
    const rows = parseCSV(resolve(ROOT, csvConfig.file));
    const map = new Map();
    for (const row of rows) {
      const dateStr = row[csvConfig.dateCol];
      const valStr = row[csvConfig.valueCol];
      if (!dateStr || !valStr || valStr === ".") continue;
      try {
        const date = parseDate(dateStr, csvConfig.dateLayout);
        const value = parseFloat(valStr.replace(",", ""));
        if (!isNaN(value)) map.set(date, value);
      } catch {
        // skip unparseable rows
      }
    }
    seriesMaps[seriesKey] = map;
    console.log(`  ${seriesKey}: ${map.size} observations`);
  }

  // Union of all dates, sorted
  const allDates = new Set();
  for (const map of Object.values(seriesMaps)) {
    for (const date of map.keys()) allDates.add(date);
  }
  const sortedDates = [...allDates].sort();

  const observations = sortedDates.map((date) => {
    const obs = { date };
    for (const [seriesKey, map] of Object.entries(seriesMaps)) {
      obs[seriesKey] = map.get(date) ?? null;
    }
    return obs;
  });

  console.log(
    `${metadata.title}: ${observations.length} observations (union of all series dates)`,
  );
  return { metadata, observations };
}

const output = GROUP_CONFIGS.map((config) => {
  if (config.source.type === "single-csv") {
    return processSingleCsv(config);
  } else {
    return processMultiCsv(config);
  }
});

const outDir = resolve(ROOT, "frontend/public");
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, "data.json");
writeFileSync(outPath, JSON.stringify(output));
console.log(`\nWrote ${output.length} groups to ${outPath}`);
