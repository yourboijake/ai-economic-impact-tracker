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

const SERIES_CONFIG = [
  {
    title: "Young Workers Unemployment Rate",
    description:
      "Unemployment rates of young workers (age 22-27 without a bachelor's degree)",
    unit: "Percentage",
    source:
      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
    source_url:
      "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
    frequency: "Monthly",
    notes:
      "Rates are seasonally adjusted and smoothed with a three-month moving average. Young workers are those aged 22 to 27 without a bachelor's degree. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
    csv: {
      path: "backend/ingestion_files/unemployment-by-career-stage.csv",
      dateCol: "Date",
      valueCol: "Young workers",
      dateLayout: "1/1/2006",
    },
  },
  {
    title: "All Workers Unemployment Rate",
    description: "Unemployment rates of all workers",
    unit: "Percentage",
    source:
      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
    source_url:
      "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
    frequency: "Monthly",
    notes:
      "Rates are seasonally adjusted and smoothed with a three-month moving average. All workers are those aged 16 to 65. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
    csv: {
      path: "backend/ingestion_files/unemployment-by-career-stage.csv",
      dateCol: "Date",
      valueCol: "All workers",
      dateLayout: "1/1/2006",
    },
  },
  {
    title: "Recent Graduates Unemployment Rate",
    description: "Unemployment rates of recent college graduates",
    unit: "Percentage",
    source:
      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
    source_url:
      "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
    frequency: "Monthly",
    notes:
      "Rates are seasonally adjusted and smoothed with a three-month moving average. Recent college graduates are those aged 22 to 27 with a bachelor's degree or higher. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
    csv: {
      path: "backend/ingestion_files/unemployment-by-career-stage.csv",
      dateCol: "Date",
      valueCol: "Recent graduates",
      dateLayout: "1/1/2006",
    },
  },
  {
    title: "College Graduates Unemployment Rate",
    description: "Unemployment rates of all college graduates",
    unit: "Percentage",
    source:
      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
    source_url:
      "https://www.newyorkfed.org/research/college-labor-market#--:explore:unemployment",
    frequency: "Monthly",
    notes:
      "Rates are seasonally adjusted and smoothed with a three-month moving average. College graduates are those aged 22 to 65 with a bachelor's degree or higher. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
    csv: {
      path: "backend/ingestion_files/unemployment-by-career-stage.csv",
      dateCol: "Date",
      valueCol: "College graduates",
      dateLayout: "1/1/2006",
    },
  },
  {
    title: "Recent Graduates Underemployment Rate",
    description: "Underemployment rates of recent college graduates",
    unit: "Percentage",
    source:
      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
    source_url:
      "https://www.newyorkfed.org/research/college-labor-market#--:explore:underemployment",
    frequency: "Monthly",
    notes:
      "Rates are seasonally adjusted and smoothed with a three-month moving average. Recent college graduates are those aged 22 to 27 with a bachelor's degree or higher. Underemployment includes those working part-time for economic reasons or in jobs that do not require a college degree. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
    csv: {
      path: "backend/ingestion_files/underemployment-by-career-stage.csv",
      dateCol: "Date",
      valueCol: "Recent graduates",
      dateLayout: "1/1/2006",
    },
  },
  {
    title: "College Graduates Underemployment Rate",
    description: "Underemployment rates of all college graduates",
    unit: "Percentage",
    source:
      "U.S. Census Bureau and U.S. Bureau of Labor Statistics, Current Population Survey (IPUMS)",
    source_url:
      "https://www.newyorkfed.org/research/college-labor-market#--:explore:underemployment",
    frequency: "Monthly",
    notes:
      "Rates are seasonally adjusted and smoothed with a three-month moving average. College graduates are those aged 22 to 65 with a bachelor's degree or higher. Underemployment includes those working part-time for economic reasons or in jobs that do not require a college degree. All figures exclude those currently enrolled in school. October 2025 results are estimated due to missing data.",
    csv: {
      path: "backend/ingestion_files/underemployment-by-career-stage.csv",
      dateCol: "Date",
      valueCol: "College graduates",
      dateLayout: "1/1/2006",
    },
  },
  {
    title: "IT & Help Desk Job Postings Index",
    description:
      "Index of online job postings in IT operations and help desk occupations",
    unit: "Index (Feb 1, 2020 = 100)",
    source:
      "Indeed Hiring Lab via Federal Reserve Bank of St. Louis (FRED), Series IHLIDXUSTPITOPHE",
    source_url: "https://fred.stlouisfed.org/series/IHLIDXUSTPITOPHE",
    frequency: "Daily",
    notes:
      "Indeed calculates the index change in seasonally-adjusted job postings since February 1, 2020, the pre-pandemic baseline. Indeed seasonally adjusts each series based on historical patterns in 2017, 2018, and 2019. Each series, including the national trend, occupational sectors, and sub-national geographies, is seasonally adjusted separately. Indeed switched to this new methodology in December 2022 and now reports all historical data using this new methodology. Historical numbers have been revised and may differ significantly from originally reported values. The new methodology applies a detrended seasonal adjustment factor to the index change in job postings.",
    csv: {
      path: "backend/ingestion_files/it_ops_help_desk_job_listings.csv",
      dateCol: "observation_date",
      valueCol: "IHLIDXUSTPITOPHE",
      dateLayout: "2006-01-02",
    },
  },
  {
    title: "Software Developer Job Postings Index",
    description:
      "Index of online job postings in software development occupations",
    unit: "Index (Feb 1, 2020 = 100)",
    source:
      "Indeed Hiring Lab via Federal Reserve Bank of St. Louis (FRED), Series IHLIDXUSTPSOFTDEVE",
    source_url: "https://fred.stlouisfed.org/series/IHLIDXUSTPSOFTDEVE#",
    frequency: "Daily",
    notes:
      "Indeed calculates the index change in seasonally-adjusted job postings since February 1, 2020, the pre-pandemic baseline. Indeed seasonally adjusts each series based on historical patterns in 2017, 2018, and 2019. Each series, including the national trend, occupational sectors, and sub-national geographies, is seasonally adjusted separately. Indeed switched to this new methodology in December 2022 and now reports all historical data using this new methodology. Historical numbers have been revised and may differ significantly from originally reported values. The new methodology applies a detrended seasonal adjustment factor to the index change in job postings.",
    csv: {
      path: "backend/ingestion_files/fred_software_dev_job_listings.csv",
      dateCol: "observation_date",
      valueCol: "IHLIDXUSTPSOFTDEVE",
      dateLayout: "2006-01-02",
    },
  },
  {
    title: "Customer Service Job Postings Index",
    description:
      "Index of online job postings in customer service occupations",
    unit: "Index (Feb 1, 2020 = 100)",
    source:
      "Indeed Hiring Lab via Federal Reserve Bank of St. Louis (FRED), Series IHLIDXUSTPCUSTSERV",
    source_url: "https://fred.stlouisfed.org/series/IHLIDXUSTPCUSTSERV",
    frequency: "Daily",
    notes:
      "Indeed calculates the index change in seasonally-adjusted job postings since February 1, 2020, the pre-pandemic baseline. Indeed seasonally adjusts each series based on historical patterns in 2017, 2018, and 2019. Each series, including the national trend, occupational sectors, and sub-national geographies, is seasonally adjusted separately. Indeed switched to this new methodology in December 2022 and now reports all historical data using this new methodology. Historical numbers have been revised and may differ significantly from originally reported values. The new methodology applies a detrended seasonal adjustment factor to the index change in job postings.",
    csv: {
      path: "backend/ingestion_files/fred_cust_service_job_listings.csv",
      dateCol: "observation_date",
      valueCol: "IHLIDXUSTPCUSTSERV",
      dateLayout: "2006-01-02",
    },
  },
];

const output = [];

for (const config of SERIES_CONFIG) {
  const { csv, ...seriesMeta } = config;
  const csvPath = resolve(ROOT, csv.path);
  const rows = parseCSV(csvPath);

  const observations = [];
  for (const row of rows) {
    const dateStr = row[csv.dateCol];
    const valueStr = row[csv.valueCol];
    if (!dateStr || !valueStr || valueStr === ".") continue;

    try {
      const date = parseDate(dateStr, csv.dateLayout);
      const value = parseFloat(valueStr.replace(",", ""));
      if (!isNaN(value)) {
        observations.push({ date, value });
      }
    } catch {
      // skip unparseable rows
    }
  }

  output.push({
    series: { ...seriesMeta, observations: [] },
    observations,
  });

  console.log(`${config.title}: ${observations.length} observations`);
}

const outDir = resolve(ROOT, "frontend/public");
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, "data.json");
writeFileSync(outPath, JSON.stringify(output));
console.log(`\nWrote ${output.length} series to ${outPath}`);
