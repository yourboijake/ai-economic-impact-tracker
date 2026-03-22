import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ObservationGranularities =
  | "Daily"
  | "Weekly"
  | "Monthly"
  | "Quarterly"
  | "Yearly";

export function generateDates(
  startDate: Date,
  endDate: Date,
  granularity: ObservationGranularities,
): Date[] {
  console.log("calling gen dates with: ", startDate, endDate, granularity);
  const dates: Date[] = [];
  if (granularity === "Daily" || granularity === "Weekly") {
    const currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(currentDate);
      currentDate.setDate(
        currentDate.getDate() + (granularity === "Daily" ? 1 : 7),
      );
    }
    return dates;
  } else if (granularity === "Monthly" || granularity === "Quarterly") {
    const currentDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      1,
    );
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setMonth(
        currentDate.getMonth() + (granularity === "Monthly" ? 1 : 3),
      );
    }
    return dates;
  } else if (granularity === "Yearly") {
    const currentDate = new Date(startDate.getFullYear(), 0, 1);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    }
    return dates;
  }
  throw new Error(`Unsupported granularity: ${granularity}`);
}
