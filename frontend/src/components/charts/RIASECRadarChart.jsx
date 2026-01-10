import PropTypes from "prop-types";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const RIASECRadarChart = ({ scores }) => {
  // Prepare data for radar chart
  const data = [
    {
      category: "Realistic",
      score: scores?.realistic || 0,
      fullMark: 100,
    },
    {
      category: "Investigative",
      score: scores?.investigative || 0,
      fullMark: 100,
    },
    {
      category: "Artistic",
      score: scores?.artistic || 0,
      fullMark: 100,
    },
    {
      category: "Social",
      score: scores?.social || 0,
      fullMark: 100,
    },
    {
      category: "Enterprising",
      score: scores?.enterprising || 0,
      fullMark: 100,
    },
    {
      category: "Conventional",
      score: scores?.conventional || 0,
      fullMark: 100,
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        RIASEC Personality Profile
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Your Holland Code personality assessment across six dimensions
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "#374151", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
          />
          <Radar
            name="Your Score"
            dataKey="score"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>

      {/* Score breakdown */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {data.map((item) => (
          <div
            key={item.category}
            className="flex justify-between items-center"
          >
            <span className="text-sm font-medium text-gray-700">
              {item.category}
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {item.score}/100
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

RIASECRadarChart.propTypes = {
  scores: PropTypes.shape({
    realistic: PropTypes.number,
    investigative: PropTypes.number,
    artistic: PropTypes.number,
    social: PropTypes.number,
    enterprising: PropTypes.number,
    conventional: PropTypes.number,
  }).isRequired,
};

export default RIASECRadarChart;
