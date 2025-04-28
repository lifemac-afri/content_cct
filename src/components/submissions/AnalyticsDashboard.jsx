import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const AnalyticsDashboard = ({ submissions }) => {
  // Process data for all form types
  const formDistribution = [
    { name: 'Passport', value: submissions.filter(s => s.form_type === 'passport_applications').length, color: '#4f46e5' },
    { name: 'Birth Certificate', value: submissions.filter(s => s.form_type === 'birth_certificates').length, color: '#10b981' },
    { name: 'Company', value: submissions.filter(s => s.form_type === 'company_applications').length, color: '#f59e0b' },
    { name: 'Sole Proprietorship', value: submissions.filter(s => s.form_type === 'sole_proprietorship_applications').length, color: '#ef4444' }
  ];

  // Group by date and form type for grouped bar chart
  const getBarChartData = () => {
    const dateMap = submissions.reduce((acc, submission) => {
      const date = new Date(submission.created_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = {
          date,
          passport_applications: 0,
          birth_certificates: 0,
          company_applications: 0,
          sole_proprietorship_applications: 0
        };
      }
      acc[date][submission.form_type]++;
      return acc;
    }, {});

    return Object.values(dateMap)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7); // Last 7 days
  };

  const barChartData = getBarChartData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Form Submissions Grouped Bar Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Daily Submissions by Form Type</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="passport_applications" 
                name="Passport" 
                fill="#4f46e5" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="birth_certificates" 
                name="Birth Certificate" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="company_applications" 
                name="Company" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="sole_proprietorship_applications" 
                name="Sole Proprietorship" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Form Distribution Pie Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Form Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {formDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;