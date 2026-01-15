import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AptitudeBarChart = ({ scores }) => {
  console.log("📊 AptitudeBarChart received scores:", scores);
  console.log("📊 AptitudeBarChart scores.numerical:", scores?.numerical);
  console.log("📊 AptitudeBarChart Object.keys:", Object.keys(scores || {}));

  // Prepare data for bar chart
  const data = [
    {
      name: "Numerical",
      score: scores?.numerical || 0,
      color: "#3b82f6",
    },
    {
      name: "Verbal",
      score: scores?.verbal || 0,
      color: "#8b5cf6",
    },
    {
      name: "Logical",
      score: scores?.logical || 0,
      color: "#ec4899",
    },
    {
      name: "Spatial",
      score: scores?.spatial || 0,
      color: "#10b981",
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Aptitude Assessment
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Your scores across different aptitude dimensions
      </p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#374151", fontSize: 12 }}
            axisLine={{ stroke: "#9ca3af" }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            axisLine={{ stroke: "#9ca3af" }}
            label={{
              value: "Score",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#6b7280" },
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
            cursor={{ fill: "rgba(79, 70, 229, 0.1)" }}
          />
          <Legend />
          <Bar dataKey="score" name="Aptitude Score" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Score summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((item) => (
          <div
            key={item.name}
            className="text-center p-3 rounded-lg"
            style={{ backgroundColor: `${item.color}15` }}
          >
            <div className="text-2xl font-bold" style={{ color: item.color }}>
              {item.score}
            </div>
            <div className="text-xs text-gray-600 mt-1">{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

AptitudeBarChart.propTypes = {
  scores: PropTypes.shape({
    numerical: PropTypes.number,
    verbal: PropTypes.number,
    logical: PropTypes.number,
    spatial: PropTypes.number,
  }),
};

AptitudeBarChart.defaultProps = {
  scores: {},
};

export default AptitudeBarChart;
