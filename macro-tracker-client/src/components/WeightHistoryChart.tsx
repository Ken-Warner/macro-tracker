import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getWeighInDataFromRange } from "../utilities/api";

type RangeMonths = 3 | 6 | 12;

type ChartPoint = {
  date: string;
  weight: number;
  label: string;
};

const RANGE_OPTIONS: { months: RangeMonths; label: string }[] = [
  { months: 3, label: "3 months" },
  { months: 6, label: "6 months" },
  { months: 12, label: "12 months" },
];

const CTA_COLOR_FALLBACK = "#08cfef";

function getLocalToday(): Date {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
}

function subtractMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - months, date.getDate());
}

function getCallToActionColor(): string {
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue("--call-to-action")
    .trim();
  return color || CTA_COLOR_FALLBACK;
}

function formatChartDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function WeightHistoryChart({
  refreshKey = 0,
}: {
  refreshKey?: number;
}) {
  const [selectedRange, setSelectedRange] = useState<RangeMonths>(3);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const lineColor = useMemo(() => getCallToActionColor(), []);

  useEffect(() => {
    let cancelled = false;

    async function fetchWeighInHistory() {
      const toDate = getLocalToday();
      const fromDate = subtractMonths(toDate, selectedRange);

      const result = await getWeighInDataFromRange(fromDate, toDate);

      if (cancelled) return;

      if (!result.ok) {
        setChartData([]);
        return;
      }

      const sorted = [...result.body].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      setChartData(
        sorted.map((point) => ({
          date: point.date,
          weight: point.weight,
          label: formatChartDate(point.date),
        })),
      );
    }

    void fetchWeighInHistory();

    return () => {
      cancelled = true;
    };
  }, [selectedRange, refreshKey]);

  return (
    <>
      <div
        className="create-meal-tab-row"
        role="tablist"
        aria-label="Weight history range"
      >
        {RANGE_OPTIONS.map(({ months, label }) => (
          <button
            key={months}
            type="button"
            role="tab"
            aria-selected={selectedRange === months}
            className={
              "button" +
              (selectedRange === months ? " button-tab-active" : "")
            }
            onClick={() => setSelectedRange(months)}
          >
            {label}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--bg-primary)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--font-color)", fontSize: 12 }}
            stroke="var(--font-color)"
          />
          <YAxis
            dataKey="weight"
            tick={{ fill: "var(--font-color)", fontSize: 12 }}
            stroke="var(--font-color)"
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-header)",
              border: "1px solid var(--call-to-action)",
              color: "var(--font-color)",
            }}
            labelFormatter={(_, payload) => {
              const point = payload?.[0]?.payload as ChartPoint | undefined;
              return point ? formatChartDate(point.date) : "";
            }}
            formatter={(value) => [`${value} lbs`, "Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ fill: lineColor, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
