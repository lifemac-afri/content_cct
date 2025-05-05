import { useState, useEffect } from "react";
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
  Legend,
} from "recharts";
import PropTypes from 'prop-types';

const AnalyticsDashboard = ({ submissions = [] }) => {
  // State for top charts
  const [timeRange, setTimeRange] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);

  // State for donut chart
  const [donutTimeRange, setDonutTimeRange] = useState("month");
  const [donutSelectedYear, setDonutSelectedYear] = useState(new Date().getFullYear());
  const [donutSelectedMonth, setDonutSelectedMonth] = useState(new Date().getMonth() + 1);
  const [donutAvailableYears, setDonutAvailableYears] = useState([]);
  const [donutAvailableMonths, setDonutAvailableMonths] = useState([]);
  const [selectedFormType, setSelectedFormType] = useState("all");
  const [statusChartData, setStatusChartData] = useState([]);

  // Generate available years
  useEffect(() => {
    if (!submissions.length) {
      setAvailableYears([]);
      setDonutAvailableYears([]);
      return;
    }

    try {
      const dates = submissions.map(s => new Date(s.created_at));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));

      const years = [];
      for (let year = minDate.getFullYear(); year <= maxDate.getFullYear(); year++) {
        years.push(year);
      }
      
      setAvailableYears(years);
      setDonutAvailableYears([...years]);
      
      if (years.length > 0 && !years.includes(selectedYear)) {
        setSelectedYear(maxDate.getFullYear());
        setDonutSelectedYear(maxDate.getFullYear());
      }
    } catch (error) {
      console.error("Error processing submission dates:", error);
    }
  }, [submissions, selectedYear]);

  // Generate available months for top charts
  useEffect(() => {
    if (timeRange === "month" && selectedYear) {
      try {
        const monthsInYear = new Set();
        submissions.forEach(sub => {
          const subDate = new Date(sub.created_at);
          if (subDate.getFullYear() === selectedYear) {
            monthsInYear.add(subDate.getMonth() + 1);
          }
        });
        const monthsArray = Array.from(monthsInYear).sort((a, b) => a - b);
        setAvailableMonths(monthsArray);
        
        if (monthsArray.length > 0 && !monthsArray.includes(selectedMonth)) {
          setSelectedMonth(monthsArray[monthsArray.length - 1]);
        }
      } catch (error) {
        console.error("Error processing months:", error);
      }
    }
  }, [timeRange, selectedYear, selectedMonth, submissions]);

  // Generate available months for donut chart
  useEffect(() => {
    if (donutTimeRange === "month" && donutSelectedYear) {
      try {
        const monthsInYear = new Set();
        submissions.forEach(sub => {
          const subDate = new Date(sub.created_at);
          if (subDate.getFullYear() === donutSelectedYear) {
            monthsInYear.add(subDate.getMonth() + 1);
          }
        });
        const monthsArray = Array.from(monthsInYear).sort((a, b) => a - b);
        setDonutAvailableMonths(monthsArray);
        
        if (monthsArray.length > 0 && !monthsArray.includes(donutSelectedMonth)) {
          setDonutSelectedMonth(monthsArray[monthsArray.length - 1]);
        }
      } catch (error) {
        console.error("Error processing donut months:", error);
      }
    }
  }, [donutTimeRange, donutSelectedYear, donutSelectedMonth, submissions]);

  // Filter data for top charts
  useEffect(() => {
    if (!submissions.length) {
      setBarChartData([]);
      setPieChartData([]);
      return;
    }

    try {
      let filteredData = submissions;
      
      if (timeRange === "year" && selectedYear) {
        filteredData = submissions.filter(sub => {
          const subDate = new Date(sub.created_at);
          return subDate.getFullYear() === selectedYear;
        });
      } else if (timeRange === "month" && selectedYear && selectedMonth) {
        filteredData = submissions.filter(sub => {
          const subDate = new Date(sub.created_at);
          return (
            subDate.getFullYear() === selectedYear &&
            subDate.getMonth() + 1 === selectedMonth
          );
        });
      }

      // Process bar chart data
      const groupedBarData = filteredData.reduce((acc, submission) => {
        if (!submission.form_type) return acc;
        
        const dateKey = timeRange === "month"
          ? `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
          : new Date(submission.created_at).toLocaleString("default", { month: "short" });

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: dateKey,
            passport_applications: 0,
            birth_certificates: 0,
            company_applications: 0,
            sole_proprietorship_applications: 0,
            total: 0,
          };
        }

        if (acc[dateKey][submission.form_type] !== undefined) {
          acc[dateKey][submission.form_type]++;
          acc[dateKey].total++;
        }
        
        return acc;
      }, {});

      setBarChartData(
        Object.values(groupedBarData).sort((a, b) => {
          if (timeRange === "month") {
            return new Date(a.date) - new Date(b.date);
          } else {
            // For year view, sort by month number (1-12)
            const monthA = new Date(a.date).getMonth() + 1;
            const monthB = new Date(b.date).getMonth() + 1;
            return monthA - monthB;
          }
        })
      );

      // Process pie chart data
      const formTypes = {
        passport_applications: { name: "Passport", color: "#4f46e5", value: 0 },
        birth_certificates: { name: "Birth Certificate", color: "#10b981", value: 0 },
        company_applications: { name: "Company", color: "#f59e0b", value: 0 },
        sole_proprietorship_applications: { name: "Sole Proprietorship", color: "#ef4444", value: 0 },
      };

      filteredData.forEach(sub => {
        if (sub.form_type && formTypes[sub.form_type]) {
          formTypes[sub.form_type].value++;
        }
      });

      setPieChartData(Object.values(formTypes).filter(item => item.value > 0));
    } catch (error) {
      console.error("Error processing chart data:", error);
      setBarChartData([]);
      setPieChartData([]);
    }
  }, [selectedYear, selectedMonth, submissions, timeRange]);

  // Filter data for donut chart
  useEffect(() => {
    if (!submissions.length) {
      setStatusChartData([]);
      return;
    }

    try {
      let filteredData = submissions;

      if (donutTimeRange === "year" && donutSelectedYear) {
        filteredData = filteredData.filter(sub => {
          const subDate = new Date(sub.created_at);
          return subDate.getFullYear() === donutSelectedYear;
        });
      } else if (donutTimeRange === "month" && donutSelectedYear && donutSelectedMonth) {
        filteredData = filteredData.filter(sub => {
          const subDate = new Date(sub.created_at);
          return (
            subDate.getFullYear() === donutSelectedYear &&
            subDate.getMonth() + 1 === donutSelectedMonth
          );
        });
      }

      if (selectedFormType !== "all") {
        filteredData = filteredData.filter(sub => sub.form_type === selectedFormType);
      }

      const statusData = filteredData.reduce((acc, submission) => {
        if (!submission.status) return acc;
        
        if (submission.status.toLowerCase() === "approved") {
          acc.approved = (acc.approved || 0) + 1;
        } else {
          acc.pending = (acc.pending || 0) + 1;
        }
        return acc;
      }, {});

      setStatusChartData([
        { name: "Approved", value: statusData.approved || 0, color: "#10b981" },
        { name: "Pending", value: statusData.pending || 0, color: "#f59e0b" },
      ]);
    } catch (error) {
      console.error("Error processing donut data:", error);
      setStatusChartData([]);
    }
  }, [donutSelectedYear, donutSelectedMonth, selectedFormType, submissions, donutTimeRange]);

  const totalSubmissions = barChartData.reduce((sum, item) => sum + item.total, 0);
  const formTypes = [
    { value: "all", label: "All Forms" },
    { value: "passport_applications", label: "Passport" },
    { value: "birth_certificates", label: "Birth Certificate" },
    { value: "company_applications", label: "Company" },
    { value: "sole_proprietorship_applications", label: "Sole Proprietorship" },
  ];

  return (
    <div className="space-y-6 mt-6">
      {submissions.length === 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <p className="font-bold">Warning</p>
          <p>No submission data available. Charts will not render.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="h-full flex flex-col" style={{ minHeight: "400px" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {timeRange === "month" ? "Monthly" : "Yearly"} Submissions by Form Type
              </h3>
              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="month">Month View</option>
                  <option value="year">Year View</option>
                </select>
                <span className="text-sm text-gray-600">
                  Total: <span className="font-semibold">{totalSubmissions}</span> submissions
                </span>
              </div>
            </div>

            <div className="flex space-x-4 mb-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {timeRange === "month" && (
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  {availableMonths.map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" })}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex-grow">
              {barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={value => timeRange === "month" 
                        ? new Date(value).toLocaleString("default", { month: "long" }) 
                        : value} 
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="passport_applications" name="Passport" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="birth_certificates" name="Birth Certificate" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="company_applications" name="Company" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="sole_proprietorship_applications" name="Sole Proprietorship" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for selected period
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="h-full flex flex-col" style={{ minHeight: "400px" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Form Distribution{" "}
                {timeRange === "month" && selectedMonth
                  ? `(${new Date(2000, selectedMonth - 1, 1).toLocaleString("default", { month: "long" })} ${selectedYear})`
                  : selectedYear
                  ? `(${selectedYear})`
                  : ""}
              </h3>
              <div className="text-sm text-gray-600">
                Total: <span className="font-semibold">{pieChartData.reduce((sum, item) => sum + item.value, 0)}</span> forms
              </div>
            </div>

            <div className="flex-grow">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ percent }) => `${!isNaN(percent) ? `${(percent * 100).toFixed(0)}%` : "0%"}`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available for selected period
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Approval Status</h3>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{statusChartData.reduce((sum, item) => sum + item.value, 0)}</span> forms
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <select
            value={donutTimeRange}
            onChange={(e) => setDonutTimeRange(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="month">Month View</option>
            <option value="year">Year View</option>
          </select>

          <select
            value={donutSelectedYear}
            onChange={(e) => setDonutSelectedYear(parseInt(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {donutAvailableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {donutTimeRange === "month" && (
            <select
              value={donutSelectedMonth}
              onChange={(e) => setDonutSelectedMonth(parseInt(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {donutAvailableMonths.map(month => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" })}
                </option>
              ))}
            </select>
          )}

          <select
            value={selectedFormType}
            onChange={(e) => setSelectedFormType(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {formTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div style={{ height: "400px" }}>
          {statusChartData.some(item => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${!isNaN(percent) ? `${(percent * 100).toFixed(0)}%` : "0%"}`}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No data available for selected filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



AnalyticsDashboard.propTypes = {
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      form_type: PropTypes.string,
      status: PropTypes.string,
      created_at: PropTypes.string, // or PropTypes.instanceOf(Date)
    })
  ),
};

AnalyticsDashboard.defaultProps = {
  submissions: [],
};


export default AnalyticsDashboard;