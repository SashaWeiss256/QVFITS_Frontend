/* Report Sales Chart */
import { useMemo } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Panel from "@/AdminDashboard/components/Panel";

const compact = new Intl.NumberFormat("en-UG", { notation: "compact", maximumFractionDigits: 1 });
// A padding slot has no real month, so it has no label.
const monthName = (ym) => (/^\d{4}-\d{2}$/.test(ym) ? new Date(`${ym}-01T00:00:00`).toLocaleDateString("en-UG", { month: "short", year: "2-digit" }) : "");
// A bar chart spreads its bars across the width, so a period with one or two months would draw a slab. Blank slots on both sides keep a bar a normal width.
const MIN_SLOTS = 6;
const padded = (rows) => {
  const extra = Math.max(0, MIN_SLOTS - rows.length);
  const before = Math.floor(extra / 2);
  const blank = (i) => ({ month: `pad-${i}`, total: null });
  return [...Array.from({ length: before }, (_, i) => blank(`a${i}`)), ...rows, ...Array.from({ length: extra - before }, (_, i) => blank(`b${i}`))];
};
const theme = createTheme({ typography: { fontFamily: "inherit" } });

/** Total sales per month in the period, one solid brand bar each. */
export default function SalesChart({ rows, money }) {
  // SVG fills cannot read CSS variables, so the bar gets the resolved brand colour.
  const data = useMemo(() => padded(rows), [rows]);
  const brand = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue("--brand-500").trim() || "#96306e", []);

  return (
    <Panel title="Sales by month" hint="Paid orders, delivery included">
      <div className="h-[260px] min-w-0">
        <ThemeProvider theme={theme}>
          <BarChart
            dataset={data}
            height={260}
            margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
            hideLegend
            grid={{ horizontal: true }}
            borderRadius={5}
            xAxis={[{ scaleType: "band", dataKey: "month", disableTicks: true, valueFormatter: monthName, categoryGapRatio: 0.45 }]}
            yAxis={[{ width: 48, disableLine: true, disableTicks: true, valueFormatter: (v) => compact.format(v) }]}
            series={[{ dataKey: "total", label: "Sales", color: brand, valueFormatter: (v) => money(v ?? 0) }]}
            sx={{
              "& .MuiChartsAxis-tickLabel": { fill: "var(--ink-4)", fontSize: "11px !important" },
              "& .MuiChartsAxis-line": { stroke: "var(--line-2)" },
              "& .MuiChartsGrid-line": { stroke: "var(--line)", strokeDasharray: "3 4" },
              "& .MuiChartsAxisHighlight-root": { fill: "var(--brand-50)" },
            }}
          />
        </ThemeProvider>
      </div>
    </Panel>
  );
}
