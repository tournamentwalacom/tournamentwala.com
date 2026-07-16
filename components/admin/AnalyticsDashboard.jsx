"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { computeRazorpayCharge, RAZORPAY_CATEGORY, RAZORPAY_FEE_PERCENT } from "@/lib/expenses";

// Fixed hue order (validated for colorblind-safe adjacent separation) —
// never cycled or reassigned by rank, see the dataviz skill's color-formula.
const CATEGORICAL = [
  "#2a78d6", // blue
  "#008300", // green
  "#e87ba4", // magenta
  "#eda100", // yellow
  "#1baf7a", // aqua
  "#eb6834", // orange
  "#4a3aa7", // violet
  "#e34948", // red
];
const SEQUENTIAL_BLUE = "#2a78d6";
const TREND_INCOME = "#2a78d6";
const TREND_PROFIT = "#008300";
const TREND_EXPENSE = "#e87ba4";
const STATUS_GOOD = "#0ca30c";
const STATUS_CRITICAL = "#d03b3b";

const INK = "#0e1b33";
const STEEL = "#5b6b85";
const LINE = "#dfe4ec";
const CHALK = "#ffffff";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const INCOME_STATUSES = new Set(["live", "completed"]);

function formatMoney(n) {
  const v = Math.round(Number(n) || 0);
  if (Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (Math.abs(v) >= 1000) return `₹${(v / 1000).toFixed(1)}k`;
  return `₹${v.toLocaleString("en-IN")}`;
}

function formatMoneyFull(n) {
  return `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
}

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d) {
  return d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

function tooltipStyle() {
  return {
    background: CHALK,
    border: `1px solid ${LINE}`,
    borderRadius: 10,
    fontSize: 12,
    color: INK,
    boxShadow: "0 10px 30px rgba(14, 27, 51, 0.1)",
  };
}

function ChartCard({ title, hint, children }) {
  return (
    <div className="admin-chart-card">
      <div className="admin-chart-card-head">
        <h3>{title}</h3>
        {hint && <span className="admin-chart-card-hint">{hint}</span>}
      </div>
      <div className="admin-chart-scroll">{children}</div>
    </div>
  );
}

export default function AnalyticsDashboard({ tournaments, expenses }) {
  const stats = useMemo(() => computeStats(tournaments, expenses), [tournaments, expenses]);

  const {
    kpis,
    monthlyTrend,
    byDayOfWeek,
    byHour,
    revenueByPackage,
    statusBreakdown,
    topSports,
    topCities,
  } = stats;

  return (
    <div className="admin-analytics">
      <div className="admin-card-grid admin-kpi-grid">
        <div className="admin-card admin-card-income">
          <h3>Total income</h3>
          <div className="stat">{formatMoneyFull(kpis.totalIncome)}</div>
          <p className="admin-card-hint">Live + completed tournament packages</p>
        </div>
        <div className="admin-card">
          <h3>This month vs last</h3>
          <div className="stat">{formatMoneyFull(kpis.thisMonthIncome)}</div>
          <p
            className="admin-card-hint"
            style={{ color: kpis.momChange >= 0 ? STATUS_GOOD : STATUS_CRITICAL }}
          >
            {kpis.momChange >= 0 ? "▲" : "▼"} {Math.abs(kpis.momChange).toFixed(0)}% vs last month
          </p>
        </div>
        <div className="admin-card">
          <h3>Total orders</h3>
          <div className="stat">{kpis.totalOrders}</div>
          <p className="admin-card-hint">{kpis.freeOrders} free via offers</p>
        </div>
        <div className="admin-card">
          <h3>Avg order value</h3>
          <div className="stat">{formatMoneyFull(kpis.avgOrderValue)}</div>
        </div>
        <div className="admin-card admin-card-expense">
          <h3>Total expenses</h3>
          <div className="stat">{formatMoneyFull(kpis.totalExpenses)}</div>
          <p className="admin-card-hint">
            Incl. {formatMoneyFull(kpis.totalRazorpay)} Razorpay ({RAZORPAY_FEE_PERCENT}%, auto)
          </p>
        </div>
        <div className={`admin-card ${kpis.netProfit >= 0 ? "admin-card-profit" : "admin-card-loss"}`}>
          <h3>Net profit (all-time)</h3>
          <div className="stat">{formatMoneyFull(kpis.netProfit)}</div>
        </div>
      </div>

      <ChartCard title="Income, expenses &amp; profit" hint="Last 12 months">
        <ResponsiveContainer width="100%" minWidth={520} height={300}>
          <AreaChart data={monthlyTrend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={LINE} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: STEEL }} axisLine={{ stroke: LINE }} tickLine={false} />
            <YAxis
              tick={{ fontSize: 12, fill: STEEL }}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatMoney}
              width={56}
            />
            <Tooltip contentStyle={tooltipStyle()} formatter={(v) => formatMoneyFull(v)} />
            <Legend wrapperStyle={{ fontSize: 12, color: STEEL }} />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={TREND_INCOME}
              fill={TREND_INCOME}
              fillOpacity={0.12}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={TREND_EXPENSE}
              fill={TREND_EXPENSE}
              fillOpacity={0.12}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="profit"
              name="Net profit"
              stroke={TREND_PROFIT}
              fill={TREND_PROFIT}
              fillOpacity={0.12}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="admin-chart-row">
        <ChartCard title="Orders by day of week">
          <ResponsiveContainer width="100%" minWidth={320} height={260}>
            <BarChart data={byDayOfWeek} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: STEEL }} axisLine={{ stroke: LINE }} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: STEEL }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
              <Bar dataKey="orders" name="Orders" fill={SEQUENTIAL_BLUE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders by hour of day">
          <ResponsiveContainer width="100%" minWidth={320} height={260}>
            <BarChart data={byHour} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: STEEL }}
                axisLine={{ stroke: LINE }}
                tickLine={false}
                interval={2}
              />
              <YAxis tick={{ fontSize: 12, fill: STEEL }} axisLine={false} tickLine={false} width={30} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
              <Bar dataKey="orders" name="Orders" fill={SEQUENTIAL_BLUE} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="admin-chart-row">
        <ChartCard title="Revenue by package" hint="Live + completed orders">
          <ResponsiveContainer width="100%" minWidth={320} height={280}>
            <PieChart>
              <Pie
                data={revenueByPackage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={92}
                paddingAngle={2}
                stroke={CHALK}
                strokeWidth={2}
              >
                {revenueByPackage.map((entry, i) => (
                  <Cell key={entry.name} fill={CATEGORICAL[i % CATEGORICAL.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle()} formatter={(v) => formatMoneyFull(v)} />
              <Legend wrapperStyle={{ fontSize: 12, color: STEEL }} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tournament status breakdown">
          <ResponsiveContainer width="100%" minWidth={320} height={280}>
            <PieChart>
              <Pie
                data={statusBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={92}
                paddingAngle={2}
                stroke={CHALK}
                strokeWidth={2}
              >
                {statusBreakdown.map((entry, i) => (
                  <Cell key={entry.name} fill={CATEGORICAL[i % CATEGORICAL.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle()} />
              <Legend wrapperStyle={{ fontSize: 12, color: STEEL }} layout="vertical" verticalAlign="middle" align="right" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="admin-chart-row">
        <ChartCard title="Top sports">
          <ResponsiveContainer width="100%" minWidth={320} height={Math.max(180, topSports.length * 36)}>
            <BarChart data={topSports} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid stroke={LINE} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: STEEL }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: INK }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
              <Bar dataKey="count" name="Tournaments" fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Top cities">
          <ResponsiveContainer width="100%" minWidth={320} height={Math.max(180, topCities.length * 36)}>
            <BarChart data={topCities} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid stroke={LINE} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: STEEL }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: INK }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip contentStyle={tooltipStyle()} cursor={{ fill: "rgba(42,120,214,0.06)" }} />
              <Bar dataKey="count" name="Tournaments" fill={CATEGORICAL[4]} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function computeStats(tournaments, expenses) {
  const now = new Date();

  const incomeRows = tournaments.filter((t) => INCOME_STATUSES.has(t.status));
  const totalIncome = incomeRows.reduce((sum, t) => sum + Number(t.promotion_total || 0), 0);
  const totalManualExpenses = expenses
    .filter((e) => e.category !== RAZORPAY_CATEGORY)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalRazorpay = computeRazorpayCharge(totalIncome);
  const totalExpenses = totalManualExpenses + totalRazorpay;
  const netProfit = totalIncome - totalExpenses;

  const freeOrders = tournaments.filter(
    (t) => Array.isArray(t.promotions) && t.promotions.length > 0 && Number(t.promotion_total || 0) === 0
  ).length;

  const totalOrders = tournaments.length;
  const avgOrderValue = incomeRows.length ? totalIncome / incomeRows.length : 0;

  // Month-over-month income comparison
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  let thisMonthIncome = 0;
  let lastMonthIncome = 0;
  for (const t of incomeRows) {
    const d = new Date(t.created_at);
    if (d >= thisMonthStart) thisMonthIncome += Number(t.promotion_total || 0);
    else if (d >= lastMonthStart) lastMonthIncome += Number(t.promotion_total || 0);
  }
  const momChange = lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : thisMonthIncome > 0 ? 100 : 0;

  // Monthly trend, last 12 months
  const monthBuckets = new Map();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.set(monthKey(d), { month: monthLabel(d), income: 0, manual: 0, key: monthKey(d) });
  }
  for (const t of incomeRows) {
    const d = new Date(t.created_at);
    const key = monthKey(d);
    if (monthBuckets.has(key)) monthBuckets.get(key).income += Number(t.promotion_total || 0);
  }
  for (const e of expenses) {
    if (e.category === RAZORPAY_CATEGORY) continue;
    const d = new Date(e.expense_date);
    const key = monthKey(d);
    if (monthBuckets.has(key)) monthBuckets.get(key).manual += Number(e.amount || 0);
  }
  const monthlyTrend = [...monthBuckets.values()].map((m) => {
    const razorpay = computeRazorpayCharge(m.income);
    const expensesTotal = m.manual + razorpay;
    return {
      month: m.month,
      income: Math.round(m.income),
      expenses: Math.round(expensesTotal),
      profit: Math.round(m.income - expensesTotal),
    };
  });

  // Orders by day of week / hour (all statuses — submission timing, not revenue)
  const dayCounts = new Array(7).fill(0);
  const hourCounts = new Array(24).fill(0);
  for (const t of tournaments) {
    const d = new Date(t.created_at);
    dayCounts[d.getDay()] += 1;
    hourCounts[d.getHours()] += 1;
  }
  const byDayOfWeek = DAY_LABELS.map((label, i) => ({ label, orders: dayCounts[i] }));
  const byHour = hourCounts.map((orders, h) => ({ label: `${h}:00`, orders }));

  // Revenue by package (income orders only)
  const packageTotals = new Map();
  for (const t of incomeRows) {
    for (const p of t.promotions || []) {
      const key = p.name || "Unknown";
      packageTotals.set(key, (packageTotals.get(key) || 0) + Number(p.subtotal || 0));
    }
  }
  const sortedPackages = [...packageTotals.entries()].sort((a, b) => b[1] - a[1]);
  const revenueByPackage = sortedPackages.slice(0, 7).map(([name, value]) => ({ name, value: Math.round(value) }));
  const otherTotal = sortedPackages.slice(7).reduce((sum, [, v]) => sum + v, 0);
  if (otherTotal > 0) revenueByPackage.push({ name: "Other", value: Math.round(otherTotal) });

  // Status breakdown
  const statusCounts = new Map();
  for (const t of tournaments) {
    statusCounts.set(t.status, (statusCounts.get(t.status) || 0) + 1);
  }
  const statusBreakdown = [...statusCounts.entries()].map(([name, value]) => ({ name, value }));

  // Top sports / cities
  function topGrouped(key, limit) {
    const counts = new Map();
    for (const t of tournaments) {
      const v = t[key] || "Unknown";
      counts.set(v, (counts.get(v) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  }

  return {
    kpis: {
      totalIncome,
      thisMonthIncome,
      momChange,
      totalOrders,
      freeOrders,
      avgOrderValue,
      totalExpenses,
      totalRazorpay,
      netProfit,
    },
    monthlyTrend,
    byDayOfWeek,
    byHour,
    revenueByPackage,
    statusBreakdown,
    topSports: topGrouped("sport", 6),
    topCities: topGrouped("city", 6),
  };
}
