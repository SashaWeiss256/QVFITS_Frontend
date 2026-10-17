/* Overview Revenue Chart */
import { useMemo } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Panel from "@/AdminDashboard/components/Panel";

const compact = new Intl.NumberFormat("en-UG", { notation: "compact", maximumFractionDigits: 1 });
const short = (day) => new Date(`${day}T00:00:00`).toLocaleDateString("en-UG", { day: "numeric", month: "short" });
const long = (day) => new Date(`${day}T00:00:00`).toLocaleDateString("en-UG", { weekday: "short", day: "numeric", month: "short" });

// SVG fill attributes cannot read CSS variables, so the chart gets the
// resolved brand colour; the token stays the one source of truth.
function token(name, fallback) {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

// MUI's own type and colour, set to follow the page rather than Roboto.
const theme = createTheme({ typography: { fontFamily: "inherit" } });

/**
 * Revenue per day as solid brand bars on a light grid, with the amount on
 * the left axis. Hovering a day shows its date, takings and order count.
 */
export default function RevenueChart({ byDay = [], loading, money }) {
  const brand = useMemo(() => token("--brand-500", "#96306e"), []);
  const total = byDay.reduce((s, d) => s + d.revenue, 0);
  const best = byDay.reduce((b, d) => (d.revenue > (b?.revenue ?? 0) ? d : b), null);
  const ordersOn = useMemo(() => new Map(byDay.map((d) => [d.day, d.orders])), [byDay]);
  // About six date labels on the axis, whatever the range.
  const step = Math.max(1, Math.ceil(byDay.length / 6));

  return (
    <Panel
      title="Revenue by day"
      hint={best ? `Best day ${long(best.day)}, ${money(best.revenue)}` : "Each bar is one day's paid orders"}
      action={
        <div className="text-right">
          <p className="m-0 text-[.7rem] font-semibold uppercase tracking-[0.16em] text-ink-4">Total</p>
          <p className="m-0 font-display text-[1.25rem] font-bold tabular-nums">{money(total)}</p>
        </div>
      }
      className="min-w-0"
    >
      <div className="relative h-[300px] min-w-0">
        <ThemeProvider theme={theme}>
          <BarChart
            loading={loading}
            dataset={byDay}
            height={300}
            margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
            hideLegend
            grid={{ horizontal: true }}
            borderRadius={5}
            xAxis={[{
              scaleType: "band",
              dataKey: "day",
              categoryGapRatio: byDay.length > 40 ? 0.25 : 0.4,
              tickLabelInterval: (_v, i) => i % step === 0,
              disableTicks: true,
              valueFormatter: (day, ctx) => (ctx.location === "tooltip" ? `${long(day)}, ${ordersOn.get(day) ?? 0} orders` : short(day)),
            }]}
            yAxis={[{ width: 48, disableLine: true, disableTicks: true, valueFormatter: (v) => compact.format(v) }]}
            series={[{ dataKey: "revenue", label: "Revenue", color: brand, valueFormatter: (v) => money(v ?? 0) }]}
            sx={{
              "& .MuiChartsAxis-tickLabel": { fill: "var(--ink-4)", fontSize: "11px !important" },
              "& .MuiChartsAxis-line": { stroke: "var(--line-2)" },
              "& .MuiChartsGrid-line": { stroke: "var(--line)", strokeDasharray: "3 4" },
              "& .MuiChartsAxisHighlight-root": { fill: "var(--brand-50)" },
            }}
          />
        </ThemeProvider>
        {!loading && byDay.length > 0 && total === 0 && (
          <p className="absolute inset-0 m-0 grid place-items-center text-sm text-ink-3">No paid orders in this period yet.</p>
        )}
      </div>
    </Panel>
  );
}
