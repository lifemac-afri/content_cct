import { useEffect, useState } from "react";
import { supabaseClient } from "../../supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaFileAlt,
  FaPassport,
  FaCertificate,
  FaBuilding,
  FaUserTie,
  FaArrowRight,
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
  const [setFormFilter] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Date error";
    }
  };

  const handleViewAll = () => {
    if (activeCard) {
      const formTypeMap = {
        passport: "passport_applications",
        birth: "birth_certificates",
        company: "company_applications",
        sole: "sole_proprietorship_applications",
      };
      navigate(`/console/form_submits/${formTypeMap[activeCard]}`);
    } else {
      navigate("/console/form_submits/all");
    }
  };

  // Real-time subscription
  useEffect(() => {
    const subscription = supabaseClient
      .channel("submissions_changes")
      .on("postgres_changes", { event: "*", schema: "public" }, () => {
        fetchData();
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
        supabaseClient.from("passport_applications").select("*"),
        supabaseClient.from("birth_certificates").select("*"),
        supabaseClient.from("company_applications").select("*"),
        supabaseClient.from("sole_proprietorship_applications").select("*"),
      ]);

      const allSubmissions = results.flatMap((result, index) => {
        const formTypes = [
          "passport_applications",
          "birth_certificates",
          "company_applications",
          "sole_proprietorship_applications",
        ];

        return (
          result.data?.map((item) => ({
            ...item,
            form_type: formTypes[index],
            status: item.status || "pending",
            created_at: item.created_at || new Date().toISOString(),
          })) || []
        );
      });

      // Sort by created_at with fallback to current date if missing
      allSubmissions.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA; // Newest first
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
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === location.state.approvedId &&
          sub.form_type === location.state.formType
            ? { ...sub, status: "approved" }
            : sub
        )
      );
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);


  const getRecentSubmissions = (type = null) => {
    let filtered = [...submissions];
    if (type) {
      const formTypeMap = {
        passport: "passport_applications",
        birth: "birth_certificates",
        company: "company_applications",
        sole: "sole_proprietorship_applications",
      };
      filtered = filtered.filter((sub) => sub.form_type === formTypeMap[type]);
    }
    return filtered
      .sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
        const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 5);
  };

  const recentSubmissions = getRecentSubmissions(activeCard);


  const handleCardClick = (cardType) => {
    setActiveCard(cardType === activeCard ? null : cardType);
    const formTypeMap = {
      passport: "passport_applications",
      birth: "birth_certificates",
      company: "company_applications",
      sole: "sole_proprietorship_applications",
    };
    setFormFilter(formTypeMap[cardType] || "all");
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
              <h1 className="text-2xl font-bold text-gray-900">
                Form Submissions Dashboard
              </h1>
              <p className="text-gray-500">
                Track and analyze all form submissions
              </p>
            </div>
            <div className="flex space-x-3">
              {/* <button
                onClick={() => navigate("/forms/new")}
                className="flex items-center space-x-2 bg-primary_green text-white px-4 py-2 rounded-lg hover:bg-dark_green transition-colors duration-200"
              >
                <FaPlusCircle />
                <span>New Form</span>
              </button> */}
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
              onClick={() => setActiveCard(null)}
              isActive={!activeCard}
            />
            <MetricCard
              icon={FaPassport}
              title="Passport Forms"
              value={
                submissions.filter(
                  (s) => s.form_type === "passport_applications"
                ).length
              }
              onClick={() => handleCardClick("passport")}
              isActive={activeCard === "passport"}
            />
            <MetricCard
              icon={FaCertificate}
              title="Birth Certificates"
              value={
                submissions.filter((s) => s.form_type === "birth_certificates")
                  .length
              }
              onClick={() => handleCardClick("birth")}
              isActive={activeCard === "birth"}
            />
            <MetricCard
              icon={FaBuilding}
              title="Company Forms"
              value={
                submissions.filter(
                  (s) => s.form_type === "company_applications"
                ).length
              }
              onClick={() => handleCardClick("company")}
              isActive={activeCard === "company"}
            />
            <MetricCard
              icon={FaUserTie}
              title="Sole Proprietorships"
              value={
                submissions.filter(
                  (s) => s.form_type === "sole_proprietorship_applications"
                ).length
              }
              onClick={() => handleCardClick("sole")}
              isActive={activeCard === "sole"}
            />
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
                    (
                    {activeCard === "passport"
                      ? "Passport"
                      : activeCard === "birth"
                      ? "Birth Certificate"
                      : activeCard === "company"
                      ? "Company"
                      : "Sole Proprietorship"}
                    )
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
              {recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {submission.form_type.replace("_", " ")}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(submission.created_at)}
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
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SubmissionsDashboard;
