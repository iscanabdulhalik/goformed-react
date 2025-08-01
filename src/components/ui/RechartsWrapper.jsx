// src/components/ui/RechartsWrapper.jsx - Recharts için wrapper component
import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Recharts componentlerini lazy load et
const LineChart = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.LineChart }))
);
const AreaChart = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.AreaChart }))
);
const BarChart = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.BarChart }))
);
const PieChart = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.PieChart }))
);
const XAxis = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.XAxis }))
);
const YAxis = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.YAxis }))
);
const CartesianGrid = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.CartesianGrid }))
);
const Tooltip = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.Tooltip }))
);
const Legend = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.Legend }))
);
const ResponsiveContainer = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.ResponsiveContainer }))
);
const Line = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.Line }))
);
const Area = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.Area }))
);
const Bar = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.Bar }))
);
const Pie = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.Pie }))
);
const Cell = React.lazy(() =>
  import("recharts").then((module) => ({ default: module.Cell }))
);

// Loading component
const ChartLoader = () => (
  <div className="flex items-center justify-center w-full h-64">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

// Wrapper components
export const LazyLineChart = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <LineChart {...props} />
  </Suspense>
);

export const LazyAreaChart = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <AreaChart {...props} />
  </Suspense>
);

export const LazyBarChart = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <BarChart {...props} />
  </Suspense>
);

export const LazyPieChart = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <PieChart {...props} />
  </Suspense>
);

export const LazyXAxis = (props) => (
  <Suspense fallback={null}>
    <XAxis {...props} />
  </Suspense>
);

export const LazyYAxis = (props) => (
  <Suspense fallback={null}>
    <YAxis {...props} />
  </Suspense>
);

export const LazyCartesianGrid = (props) => (
  <Suspense fallback={null}>
    <CartesianGrid {...props} />
  </Suspense>
);

export const LazyTooltip = (props) => (
  <Suspense fallback={null}>
    <Tooltip {...props} />
  </Suspense>
);

export const LazyLegend = (props) => (
  <Suspense fallback={null}>
    <Legend {...props} />
  </Suspense>
);

export const LazyResponsiveContainer = (props) => (
  <Suspense fallback={<ChartLoader />}>
    <ResponsiveContainer {...props} />
  </Suspense>
);

export const LazyLine = (props) => (
  <Suspense fallback={null}>
    <Line {...props} />
  </Suspense>
);

export const LazyArea = (props) => (
  <Suspense fallback={null}>
    <Area {...props} />
  </Suspense>
);

export const LazyBar = (props) => (
  <Suspense fallback={null}>
    <Bar {...props} />
  </Suspense>
);

export const LazyPie = (props) => (
  <Suspense fallback={null}>
    <Pie {...props} />
  </Suspense>
);

export const LazyCell = (props) => (
  <Suspense fallback={null}>
    <Cell {...props} />
  </Suspense>
);

// Export all as default for easy importing
export default {
  LineChart: LazyLineChart,
  AreaChart: LazyAreaChart,
  BarChart: LazyBarChart,
  PieChart: LazyPieChart,
  XAxis: LazyXAxis,
  YAxis: LazyYAxis,
  CartesianGrid: LazyCartesianGrid,
  Tooltip: LazyTooltip,
  Legend: LazyLegend,
  ResponsiveContainer: LazyResponsiveContainer,
  Line: LazyLine,
  Area: LazyArea,
  Bar: LazyBar,
  Pie: LazyPie,
  Cell: LazyCell,
};
