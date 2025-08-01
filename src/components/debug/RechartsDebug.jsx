// src/components/debug/RechartsDebug.jsx - Grafikleri test et
import React, { Suspense, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

// Test data
const testData = [
  { month: "Jan", users: 120, companies: 15, revenue: 2400 },
  { month: "Feb", users: 150, companies: 20, revenue: 3200 },
  { month: "Mar", users: 180, companies: 25, revenue: 4100 },
  { month: "Apr", users: 220, companies: 30, revenue: 4800 },
  { month: "May", users: 280, companies: 35, revenue: 5600 },
  { month: "Jun", users: 320, companies: 42, revenue: 6400 },
];

// Chart loading component
const ChartLoader = ({ error = null }) => (
  <div className="flex flex-col items-center justify-center w-full h-64 bg-gray-50 rounded-lg">
    {error ? (
      <>
        <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-sm text-red-600 text-center max-w-xs">
          Chart loading failed: {error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-xs text-blue-600 underline"
        >
          Refresh page
        </button>
      </>
    ) : (
      <>
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p className="text-sm text-gray-600">Loading chart...</p>
      </>
    )}
  </div>
);

// Error boundary for charts
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chart Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ChartLoader error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Direct import test (sync)
const DirectRechartsTest = () => {
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [recharts, setRecharts] = useState(null);

  useEffect(() => {
    const loadRecharts = async () => {
      try {
        console.log("🔄 Loading Recharts directly...");
        const rechartsModule = await import("recharts");
        console.log("✅ Recharts loaded:", Object.keys(rechartsModule));
        setRecharts(rechartsModule);
        setChartsLoaded(true);
      } catch (err) {
        console.error("❌ Failed to load Recharts:", err);
        setError(err);
      }
    };

    loadRecharts();
  }, []);

  if (error) {
    return <ChartLoader error={error} />;
  }

  if (!chartsLoaded || !recharts) {
    return <ChartLoader />;
  }

  const {
    LineChart,
    AreaChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
  } = recharts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Direct Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Direct Line Chart Test</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartErrorBoundary>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={testData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartErrorBoundary>
        </CardContent>
      </Card>

      {/* Direct Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Direct Area Chart Test</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartErrorBoundary>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={testData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="companies"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
};

// Lazy loading test
const LazyRechartsTest = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lazy Loading Test</h3>
      <Suspense fallback={<ChartLoader />}>
        <DirectRechartsTest />
      </Suspense>
    </div>
  );
};

// Console debug info
const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const checkEnvironment = () => {
      const info = {
        nodeEnv: process.env.NODE_ENV,
        isDev: import.meta.env.DEV,
        mode: import.meta.env.MODE,
        rechartsAvailable: false,
        lodashAvailable: false,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Check if recharts is loadable
      import("recharts")
        .then(() => {
          info.rechartsAvailable = true;
          setDebugInfo({ ...info });
        })
        .catch((err) => {
          info.rechartsError = err.message;
          setDebugInfo({ ...info });
        });

      // Check lodash-es
      import("lodash-es")
        .then(() => {
          info.lodashAvailable = true;
          setDebugInfo({ ...info });
        })
        .catch((err) => {
          info.lodashError = err.message;
          setDebugInfo({ ...info });
        });
    };

    checkEnvironment();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Environment:</strong> {debugInfo.mode || "unknown"}
          </div>
          <div>
            <strong>Dev Mode:</strong> {debugInfo.isDev ? "✅" : "❌"}
          </div>
          <div>
            <strong>Recharts:</strong>{" "}
            {debugInfo.rechartsAvailable ? "✅" : "❌"}
            {debugInfo.rechartsError && (
              <div className="text-red-600 text-xs mt-1">
                {debugInfo.rechartsError}
              </div>
            )}
          </div>
          <div>
            <strong>Lodash-ES:</strong>{" "}
            {debugInfo.lodashAvailable ? "✅" : "❌"}
            {debugInfo.lodashError && (
              <div className="text-red-600 text-xs mt-1">
                {debugInfo.lodashError}
              </div>
            )}
          </div>
          <div className="col-span-2">
            <strong>Updated:</strong> {debugInfo.timestamp}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main debug component
const RechartsDebug = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Recharts Debug Panel</h2>
        <p className="text-gray-600">Testing chart loading and functionality</p>
      </div>

      <DebugInfo />
      <LazyRechartsTest />

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">
          Debug Instructions:
        </h4>
        <ol className="text-sm text-blue-800 list-decimal list-inside space-y-1">
          <li>Open browser console (F12)</li>
          <li>Look for "Loading Recharts directly..." messages</li>
          <li>Check for any error messages in red</li>
          <li>Verify charts are rendering properly</li>
        </ol>
      </div>
    </div>
  );
};

export default RechartsDeb;
