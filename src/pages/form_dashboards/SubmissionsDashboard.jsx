import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaFileAlt,
  FaFilter,
  FaDownload,
  FaSearch,
  FaCalendarAlt,
  FaPlusCircle,
  FaPassport,
  FaCertificate,
  FaBuilding,
  FaUserTie,
  FaArrowRight,
  FaEye
} from "react-icons/fa";

// Components
import ErrorBoundary from "../../components/submissions/ErrorBoundary";
import LoadingSkeleton from "../../components/submissions/LoadingSkeleton";
import MetricCard from "../../components/submissions/MetricCard";
import AnalyticsDashboard from "../../components/submissions/AnalyticsDashboard";
import SubmissionDetailModal from "../../components/submissions/SubmissionDetailModal";
import StatusBadge from "../../components/submissions/StatusBadge";
import ErrorDisplay from "../../components/submissions/ErrorDisplay";

const SubmissionsDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("week");
  const [searchTerm, setSearchTerm] = useState("");
  const [formFilter, setFormFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState("total");
  const navigate = useNavigate();
  const location = useLocation();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleViewAll = () => {
    const formTypeMap = {
      'total': 'all',
      'passport': 'passport_applications',
      'birth': 'birth_certificates',
      'company': 'company_applications',
      'sole': 'sole_proprietorship_applications'
    };
    
    navigate(`/console/form_submits/${formTypeMap[activeCard]}`);
  };

  // Improved data fetching with error handling
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch each table separately with proper error handling
      const fetchTable = async (tableName) => {
        try {
          const { data, error } = await supabaseClient
            .from(tableName)
            .select('*');
          
          if (error) {
            console.error(`Error fetching ${tableName}:`, error);
            return [];
          }
          return data?.map(item => ({ 
            ...item, 
            form_type: tableName,
            status: item.status || "pending"
          })) || [];
        } catch (err) {
          console.error(`Error with ${tableName}:`, err);
          return [];
        }
      };

      const tables = [
        'passport_applications',
        'birth_certificates',
        'company_applications',
        'sole_proprietorship_applications'
      ];

      // Fetch all tables in parallel but handle each one individually
      const results = await Promise.all(tables.map(table => fetchTable(table)));
      
      // Combine all results
      const allSubmissions = results.flat();
  
      // Sort by created_at in descending order
      allSubmissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
      setSubmissions(allSubmissions);
    } catch (error) {
      console.error("Error in fetchData:", error);
      setError("Failed to load submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle status updates from navigation
  useEffect(() => {
    if (location.state?.approvedId) {
      setSubmissions(prev =>
        prev.map(sub => 
          sub.id === location.state.approvedId && sub.form_type === location.state.formType
            ? { ...sub, status: "approved" }
            : sub
        )
      );
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const filteredSubmissions = submissions
    .filter(submission => {
      if (formFilter === 'all') return true;
      return submission.form_type === formFilter;
    })
    .filter(submission => {
      const searchLower = searchTerm.toLowerCase();
      const formType = submission.form_type.replace('_', ' ');
      const name = 
        submission.form_type === 'passport_applications' ? `${submission.first_name} ${submission.surname}` :
        submission.form_type === 'birth_certificates' ? `${submission.first_name} ${submission.surname}` :
        submission.form_type === 'company_applications' ? submission.business_name_1 :
        submission.business_name_1;
      
      return (
        formType.toLowerCase().includes(searchLower) ||
        (name || '').toLowerCase().includes(searchLower) ||
        JSON.stringify(submission).toLowerCase().includes(searchLower)
      );
    });

  // Get recent submissions based on active card
  const getRecentSubmissions = () => {
    let filtered = [...submissions]; // Already sorted by date

    if (activeCard !== 'total') {
      const formTypeMap = {
        'passport': 'passport_applications',
        'birth': 'birth_certificates',
        'company': 'company_applications',
        'sole': 'sole_proprietorship_applications'
      };
      filtered = filtered.filter(sub => sub.form_type === formTypeMap[activeCard]);
    }

    return filtered.slice(0, 5);
  };

  const recentSubmissions = getRecentSubmissions();

  const handleExport = async () => {
    try {
      const csvContent = [
        ['Form Type', 'Submitted At', 'Name/Title', 'Status', 'Details'],
        ...filteredSubmissions.map(sub => [
          sub.form_type.replace('_', ' '),
          new Date(sub.created_at).toLocaleString(),
          sub.form_type === 'passport_applications' ? `${sub.first_name} ${sub.surname}` :
          sub.form_type === 'birth_certificates' ? `${sub.first_name} ${sub.surname}` :
          sub.business_name_1,
          sub.status,
          JSON.stringify(sub, null, 2)
        ])
      ].map(e => e.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed. Please try again.');
    }
  };

  const handleApprove = (submissionId) => {
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId ? { ...sub, status: 'approved' } : sub
      )
    );
    setSelectedSubmission(prev => 
      prev && prev.id === submissionId ? { ...prev, status: 'approved' } : prev
    );
  };

  const handleCardClick = (cardType) => {
    setActiveCard(cardType);
    const formTypeMap = {
      'total': 'all',
      'passport': 'passport_applications',
      'birth': 'birth_certificates',
      'company': 'company_applications',
      'sole': 'sole_proprietorship_applications'
    };
    setFormFilter(formTypeMap[cardType] || 'all');
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} onRetry={fetchData} />;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Submissions Dashboard</h1>
              <p className="text-gray-500">Track and analyze all form submissions</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate("/forms/new")}
                className="flex items-center space-x-2 bg-primary_green text-white px-4 py-2 rounded-lg hover:bg-dark_green transition-colors duration-200"
              >
                <FaPlusCircle />
                <span>New Form</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
              <button 
                onClick={fetchData}
                className="ml-4 text-blue-600 hover:text-blue-800"
              >
                Retry
              </button>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard
              icon={FaFileAlt}
              title="Total Submissions"
              value={submissions.length}
              onClick={() => handleCardClick('total')}
              isActive={activeCard === 'total'}
            />
            <MetricCard
              icon={FaPassport}
              title="Passport Forms"
              value={submissions.filter(s => s.form_type === 'passport_applications').length}
              onClick={() => handleCardClick('passport')}
              isActive={activeCard === 'passport'}
            />
            <MetricCard
              icon={FaCertificate}
              title="Birth Certificates"
              value={submissions.filter(s => s.form_type === 'birth_certificates').length}
              onClick={() => handleCardClick('birth')}
              isActive={activeCard === 'birth'}
            />
            <MetricCard
              icon={FaBuilding}
              title="Company Forms"
              value={submissions.filter(s => s.form_type === 'company_applications').length}
              onClick={() => handleCardClick('company')}
              isActive={activeCard === 'company'}
            />
            <MetricCard
              icon={FaUserTie}
              title="Sole Proprietorships"
              value={submissions.filter(s => s.form_type === 'sole_proprietorship_applications').length}
              onClick={() => handleCardClick('sole')}
              isActive={activeCard === 'sole'}
            />
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <select
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  value={formFilter}
                  onChange={(e) => {
                    setFormFilter(e.target.value);
                    const cardTypeMap = {
                      'all': 'total',
                      'passport_applications': 'passport',
                      'birth_certificates': 'birth',
                      'company_applications': 'company',
                      'sole_proprietorship_applications': 'sole'
                    };
                    setActiveCard(cardTypeMap[e.target.value] || 'total');
                  }}
                >
                  <option value="all">All Forms</option>
                  <option value="passport_applications">Passport</option>
                  <option value="birth_certificates">Birth Certificate</option>
                  <option value="company_applications">Company</option>
                  <option value="sole_proprietorship_applications">Sole Proprietorship</option>
                </select>
                <select
                  className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
                <button 
                  onClick={handleExport}
                  className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  <FaDownload />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard - shows all submissions */}
          <AnalyticsDashboard submissions={submissions} />

          {/* Recent Submissions */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Submissions
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({activeCard === 'total' ? 'All Forms' : 
                    activeCard === 'passport' ? 'Passport' :
                    activeCard === 'birth' ? 'Birth Certificate' :
                    activeCard === 'company' ? 'Company' : 'Sole Proprietorship'})
                </span>
              </h2>
              <button
                onClick={handleViewAll}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                View All <FaArrowRight className="ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {submission.form_type.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(submission.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <StatusBadge status={submission.status} />
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        View
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No recent submissions found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submission Detail Modal */}
        {selectedSubmission && (
          <SubmissionDetailModal 
            submission={selectedSubmission} 
            onClose={() => setSelectedSubmission(null)}
            onApprove={handleApprove}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SubmissionsDashboard;