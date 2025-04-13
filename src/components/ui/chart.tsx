
import * as React from "react";
import { Bar, Line, Pie } from "recharts";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  LineChart as RechartsLineChart,
  PieChart as RechartsPieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

interface ChartProps {
  data: any[];
  index: string;
  categories: string[];
  colors?: string[];
  valueFormatter?: (value: number) => string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLegend?: boolean;
  yAxisWidth?: number;
  layout?: "horizontal" | "vertical" | "stacked";
}

interface PieChartProps {
  data: any[];
  index: string;
  category: string;
  colors?: string[];
  valueFormatter?: (value: number) => string;
}

export const BarChart = ({
  data,
  index,
  categories,
  colors = ["#f97316", "#0ea5e9", "#8b5cf6", "#22c55e", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  yAxisWidth = 56,
  layout = "horizontal",
}: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        layout={layout === "vertical" ? "vertical" : "horizontal"}
        stackOffset={layout === "stacked" ? "sign" : "none"}
        margin={{
          top: 16,
          right: 16,
          bottom: 16,
          left: 16,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        {showXAxis && (
          <XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={8}
            hide={!showXAxis}
            type={layout === "vertical" ? "number" : "category"}
          />
        )}
        {showYAxis && (
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={yAxisWidth}
            hide={!showYAxis}
            type={layout === "vertical" ? "category" : "number"}
            tickFormatter={valueFormatter}
          />
        )}
        <Tooltip
          cursor={{ fill: "#f3f4f6", opacity: 0.4 }}
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-white shadow-lg rounded-lg p-3 border text-sm">
                <p className="font-medium">{label}</p>
                <div className="mt-2 space-y-1">
                  {payload.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}:</span>
                      <span className="ml-1">
                        {valueFormatter(item.value as number)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        />
        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
        )}
        {categories.map((category, index) => (
          <Bar
            key={category}
            dataKey={category}
            stackId={layout === "stacked" ? "stack" : undefined}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export const LineChart = ({
  data,
  index,
  categories,
  colors = ["#f97316", "#0ea5e9", "#8b5cf6", "#22c55e", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
  showXAxis = true,
  showYAxis = true,
  showLegend = true,
  yAxisWidth = 56,
}: ChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{
          top: 16,
          right: 16,
          bottom: 16,
          left: 16,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
        {showXAxis && (
          <XAxis
            dataKey={index}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={8}
            hide={!showXAxis}
          />
        )}
        {showYAxis && (
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={yAxisWidth}
            hide={!showYAxis}
            tickFormatter={valueFormatter}
          />
        )}
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload) return null;
            return (
              <div className="bg-white shadow-lg rounded-lg p-3 border text-sm">
                <p className="font-medium">{label}</p>
                <div className="mt-2 space-y-1">
                  {payload.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}:</span>
                      <span className="ml-1">
                        {valueFormatter(item.value as number)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }}
        />
        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
        )}
        {categories.map((category, index) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{
              r: 4,
              strokeWidth: 2,
              fill: "white",
              stroke: colors[index % colors.length],
            }}
            activeDot={{
              r: 6,
              fill: colors[index % colors.length],
            }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export const PieChart = ({
  data,
  index,
  category,
  colors = ["#f97316", "#0ea5e9", "#8b5cf6", "#22c55e", "#ef4444"],
  valueFormatter = (value: number) => value.toString(),
}: PieChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey={category}
          nameKey={index}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label={({ name, percent }) => 
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]} 
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const data = payload[0];
            return (
              <div className="bg-white shadow-lg rounded-lg p-3 border text-sm">
                <p className="font-medium">{data.name}</p>
                <p className="mt-1">
                  {valueFormatter(data.value as number)}
                </p>
              </div>
            );
          }}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12 }}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};
