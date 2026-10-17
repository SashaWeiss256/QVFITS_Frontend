/* Report Sales Chart */
import { useMemo } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Panel from "@/AdminDashboard/components/Panel";

const compact = new Intl.NumberFormat("en-UG", { notation: "compact", maximumFractionDigits: 1 });
const monthName = (ym) => new Date(`${ym}-01T00:00:00`).toLocaleDateString("en-UG", { month: "short", year: "2-digit" });
const theme = createTheme({ typography: { fontFamily: "inherit" } });

/** Total sales per month in the period, one solid brand bar each. */
export default function SalesChart({ rows, money }) {
  // SVG fills cannot read CSS variables, so the bar gets the resolved brand colour.
  const brand = useMemo(() => getComputedStyle(document.documentElement).getPropertyValue("--brand-500").trim() || "#96306e", []);

  return (
    <Panel title="Sales by month" hint="Paid orders, delivery included">
      <div className="h-[260px] min-w-0">
        <ThemeProvider theme={theme}>
          <BarChart
            dataset={rows}
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
