import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabaseClient } from "../../supabase/client";
import SubmissionTable from "./SubmissionTable";
import { FaArrowLeft, FaFilter } from "react-icons/fa";
import SubmissionDetailModal from "./SubmissionDetailModal";
import { toast } from "react-toastify";

const FormSubmissionsPage = () => {
  const { formType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Function to format form type for display
  const formatFormType = (type) => {
    const formTypes = {
      passport_applications: "Passport",
      birth_certificates: "Birth Certificate",
      company_applications: "Company Registration",
      sole_proprietorship_applications: "Sole Proprietorship"
    };
    return formTypes[type] || type.replace(/_/g, ' ');
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (formType === "all") {
        // Fetch all submissions from all tables
        const [passports, birthCerts, companies, soleProps] = await Promise.all([
          supabaseClient.from("passport_applications").select("*").order("updated_at", { ascending: false }),
          supabaseClient.from("birth_certificates").select("*").order("updated_at", { ascending: false }),
          supabaseClient.from("company_applications").select("*").order("updated_at", { ascending: false }),
          supabaseClient.from("sole_proprietorship_applications").select("*").order("updated_at", { ascending: false }),
        ]);

        const allSubmissions = [
          ...(passports.data?.map(item => ({ 
            ...item, 
            form_type: "passport_applications",
            formatted_form_type: formatFormType("passport_applications")
          })) || []),
          ...(birthCerts.data?.map(item => ({ 
            ...item, 
            form_type: "birth_certificates",
            formatted_form_type: formatFormType("birth_certificates")
          })) || []),
          ...(companies.data?.map(item => ({ 
            ...item, 
            form_type: "company_applications",
            formatted_form_type: formatFormType("company_applications")
          })) || []),
          ...(soleProps.data?.map(item => ({ 
            ...item, 
            form_type: "sole_proprietorship_applications",
            formatted_form_type: formatFormType("sole_proprietorship_applications")
          })) || []),
        ];

        // Sort all submissions by updated_at in descending order
        allSubmissions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setSubmissions(allSubmissions);
      } else {
        // Fetch submissions for a specific form type
        const { data, error } = await supabaseClient
          .from(formType)
          .select("*")
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setSubmissions(data.map(item => ({ 
          ...item, 
          form_type: formType,
          formatted_form_type: formatFormType(formType)
        })));
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setError("Failed to load submissions. Please try again.");
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, [formType]);

  useEffect(() => {
    fetchData();
  }, [formType, location.state?.refresh, fetchData]);

  useEffect(() => {
    if (location.state?.approvedId) {
      setSubmissions(prev =>
        prev.map(sub => 
          sub.id === location.state.approvedId && sub.form_type === location.state.formType
            ? { ...sub, status: "approved" }
            : sub
        )
      );
      if (statusFilter === "approved") {
        setPage(1);
      }
    }
  }, [location.state, statusFilter]);

  const handleApprove = async (updatedSubmission) => {
    try {
      // Update in Supabase
      const { error: updateError } = await supabaseClient
        .from(updatedSubmission.form_type)
        .update({ 
          status: "approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", updatedSubmission.id);

      if (updateError) throw updateError;

      // Fetch updated record
      const { data, error: fetchError } = await supabaseClient
        .from(updatedSubmission.form_type)
        .select("*")
        .eq("id", updatedSubmission.id)
        .single();

      if (fetchError) throw fetchError;

      setSubmissions(prev => prev.map(sub => 
        sub.id === updatedSubmission.id ? { 
          ...data, 
          form_type: updatedSubmission.form_type,
          formatted_form_type: formatFormType(updatedSubmission.form_type)
        } : sub
      ));
      setSelectedSubmission(null);
      toast.success("Submission approved successfully");
    } catch (err) {
      console.error("Error approving submission:", err);
      toast.error(`Failed to approve submission: ${err.message}`);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => 
    statusFilter === "all" || sub.status === statusFilter
  );

  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const formTitle = {
    passport_applications: "Passport Applications",
    birth_certificates: "Birth Certificate Requests",
    company_applications: "Company Registrations",
    sole_proprietorship_applications: "Sole Proprietorship Registrations",
    all: "All Submissions",
  }[formType];

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => navigate("/console/form_submits")}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <button
        onClick={() => navigate("/console/form_submits")}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
      >
        <FaArrowLeft className="mr-2" /> Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">{formTitle}</h2>
          <p className="text-gray-500">
            {filteredSubmissions.length} submissions found
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400" />
            <select
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      </div>

      <SubmissionTable
        submissions={paginatedSubmissions}
        loading={false}
        showFormType={formType === "all"}
        onRowClick={(submission) => 
          navigate(`${submission.id}`, { 
            state: { formType: submission.form_type },
            relative: "path" 
          })
        }
        onViewClick={handleViewSubmission}
      />

      {filteredSubmissions.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApprove={handleApprove}
        />
      )}
    </div>
  );
};

export default FormSubmissionsPage;