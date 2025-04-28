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
  FaArrowRight
} from "react-icons/fa";

// Components
import ErrorBoundary from "../../components/submissions/ErrorBoundary";
import LoadingSkeleton from "../../components/submissions/LoadingSkeleton";
import MetricCard from "../../components/submissions/MetricCard";
import SubmissionTable from "../../components/submissions/SubmissionTable";
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
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleViewAll = () => {
    if (activeCard) {
      const formTypeMap = {
        'passport': 'passport_applications',
        'birth': 'birth_certificates',
        'company': 'company_applications',
        'sole': 'sole_proprietorship_applications'
      };
      navigate(`/console/form_submits/${formTypeMap[activeCard]}`);
    } else {
      navigate('/console/form_submits/all');
    }
  };

  const handleRowClick = (submission) => {
    navigate(`/submissions/detail/${submission.id}`, {
      state: { formType: submission.form_type }
    });
  };

  // Real-time subscription
  useEffect(() => {
    const subscription = supabaseClient
      .channel('submissions_changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        fetchData(); // Refresh data when changes occur
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(subscription);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const results = await Promise.all([
        supabaseClient.from('passport_applications').select('*'),
        supabaseClient.from('birth_certificates').select('*'),
        supabaseClient.from('company_applications').select('*'),
        supabaseClient.from('sole_proprietorship_applications').select('*')
      ]);
  
      const allSubmissions = results.flatMap((result, index) => {
        const formTypes = [
          'passport_applications',
          'birth_certificates',
          'company_applications',
          'sole_proprietorship_applications'
        ];
        
        return result.data?.map(item => ({ 
          ...item, 
          form_type: formTypes[index],
          status: item.status || "pending"
        })) || [];
      });
  
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
      // Clear the navigation state
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

  // Pagination logic
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const recentSubmissions = [...submissions]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Filter recent submissions by active card if one is selected
  const filteredRecentSubmissions = activeCard 
    ? recentSubmissions.filter(sub => {
        switch(activeCard) {
          case 'passport': return sub.form_type === 'passport_applications';
          case 'birth': return sub.form_type === 'birth_certificates';
          case 'company': return sub.form_type === 'company_applications';
          case 'sole': return sub.form_type === 'sole_proprietorship_applications';
          default: return true;
        }
      })
    : recentSubmissions;

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
      alert('Export failed. Please try again.');
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
    setActiveCard(cardType === activeCard ? null : cardType);
    
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
              onClick={null}
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
                  onChange={(e) => setFormFilter(e.target.value)}
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

          {/* Analytics Dashboard */}
          <AnalyticsDashboard submissions={submissions} />

          {/* Recent Submissions */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Submissions
                {activeCard && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({activeCard === 'total' ? 'All Forms' : 
                      activeCard === 'passport' ? 'Passport' :
                      activeCard === 'birth' ? 'Birth Certificate' :
                      activeCard === 'company' ? 'Company' : 'Sole Proprietorship'})
                  </span>
                )}
              </h2>
              <button
                onClick={handleViewAll}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                View All <FaArrowRight className="ml-1" />
              </button>
            </div>
            <div className="space-y-4">
              {filteredRecentSubmissions.map((submission) => (
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
              ))}
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <SubmissionTable
              submissions={paginatedSubmissions}
              loading={loading}
              onRowClick={handleRowClick}
            />
            
            {/* Pagination Controls */}
            {filteredSubmissions.length > itemsPerPage && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
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