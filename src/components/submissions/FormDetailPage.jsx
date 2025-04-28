// FormDetailPage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabaseClient } from "../../supabase/client";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import { toast } from "react-toastify";

const FormDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);

  const getFormType = () => {
    if (location.state?.formType) return location.state.formType;

    const pathParts = location.pathname.split("/");
    const validForms = [
      "passport_applications",
      "birth_certificates",
      "company_applications",
      "sole_proprietorship_applications",
    ];

    return pathParts.find((part) => validForms.includes(part));
  };

  const formType = getFormType();

  const fetchSubmission = async () => {
    try {
      if (!formType) {
        throw new Error("Form type not specified");
      }

      const { data, error } = await supabaseClient
        .from(formType)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Submission not found");

      setSubmission({ ...data, form_type: formType });
    } catch (err) {
      console.error("Error fetching submission:", err);
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [id, formType]);

  const handleApprove = async () => {
    if (submission?.status === "approved") {
      toast.warning("This submission is already approved");
      return;
    }

    setApproving(true);
    try {
      // Update in Supabase
      const { error: updateError } = await supabaseClient
        .from(formType)
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select() // Return the updated record
        .single();

      if (updateError) throw updateError;

      // Update local state
      setSubmission((prev) => ({
        ...prev,
        status: "approved",
        updated_at: new Date().toISOString(),
      }));

      toast.success("Submission approved successfully");

      // Navigate back with refresh flag
      navigate(-1, {
        state: {
          shouldRefresh: true,
          approvedId: id,
          formType: formType,
        },
      });
    } catch (err) {
      console.error("Approval error:", err);
      toast.error(`Approval failed: ${err.message}`);
      setError(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-500 mr-2" />
        <span>Loading submission details...</span>
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          <FaArrowLeft className="inline mr-2" />
          Back to submissions
        </button>
      </div>
    );

  if (!submission)
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Submission not found</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          <FaArrowLeft className="inline mr-2" />
          Back to submissions
        </button>
      </div>
    );

  const formatFormType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to submissions
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {formatFormType(formType)} Submission
          </h1>
          <p className="text-gray-500">
            ID: {id} | Created:{" "}
            {new Date(submission.created_at).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {Object.entries(submission)
          .filter(
            ([key]) =>
              ![
                "id",
                "created_at",
                "updated_at",
                "status",
                "form_type",
              ].includes(key)
          )
          .map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 capitalize">
                {key.replace(/_/g, " ")}
              </h3>
              <div className="mt-2 text-gray-900 break-words">
                {renderFieldValue(key, value)}
              </div>
            </div>
          ))}
      </div>

      {submission.status === "pending" && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleApprove}
            disabled={approving}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 flex items-center"
          >
            {approving ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Approving...
              </>
            ) : (
              "Approve Submission"
            )}
          </button>
        </div>
      )}
    </div>
  );
};

const renderFieldValue = (key, value) => {
  if (value === null || value === undefined) return "N/A";

  if (key.includes("file") || key.includes("document")) {
    return (
      <a
        href={
          supabaseClient.storage.from("documents").getPublicUrl(value).data
            .publicUrl
        }
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        View Document
      </a>
    );
  }

  if (key.includes("date") && !isNaN(new Date(value).getTime())) {
    return new Date(value).toLocaleDateString();
  }

  if (typeof value === "object") {
    return <pre className="text-sm">{JSON.stringify(value, null, 2)}</pre>;
  }

  return String(value);
};

export default FormDetailPage;
