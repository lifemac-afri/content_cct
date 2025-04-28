// SubmissionDetailModal.js
import React, { useState } from "react";
import { FaFileAlt, FaDownload, FaTimes, FaSpinner } from "react-icons/fa";
import { supabaseClient } from "../../supabase/client";
import jsPDF from "jspdf";
import "jspdf-autotable";
import StatusBadge from "./StatusBadge";
import { toast } from "react-toastify";

const SubmissionDetailModal = ({ submission, onClose, onApprove }) => {
  const [loading, setLoading] = useState(false);

  const renderField = (label, value) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="mt-1 text-sm text-gray-900">{value || "Not provided"}</p>
    </div>
  );

  const renderFile = (label, fileUrl) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      {fileUrl ? (
        <a
          href={
            supabaseClient.storage.from("uploads").getPublicUrl(fileUrl)
              .publicUrl
          }
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline flex items-center"
        >
          <FaFileAlt className="inline mr-1" />
          View File
        </a>
      ) : (
        <p className="text-sm text-gray-500">No file uploaded</p>
      )}
    </div>
  );

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(
      submission.form_type === "passport_applications"
        ? "Passport Application Details"
        : submission.form_type === "birth_certificates"
        ? "Birth Certificate Request Details"
        : submission.form_type === "company_applications"
        ? "Company Registration Details"
        : "Sole Proprietorship Registration Details",
      14,
      20
    );

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Status: ${submission.status}`, 14, 30);
    doc.text(
      `Submission Date: ${new Date(submission.created_at).toLocaleString()}`,
      14,
      36
    );

    const tableData = [];
    const tableColumns = [
      { header: "Field", dataKey: "field" },
      { header: "Value", dataKey: "value" },
    ];

    if (submission.form_type === "passport_applications") {
      tableData.push(
        {
          field: "Full Name",
          value: `${submission.first_name || ""} ${submission.surname || ""}`,
        },
        { field: "Date of Birth", value: submission.date_of_birth },
        { field: "Gender", value: submission.gender }
      );
    }

    doc.autoTable({
      startY: 45,
      head: [tableColumns.map((col) => col.header)],
      body: tableData.map((row) => [row.field, row.value]),
      theme: "grid",
      headStyles: { fillColor: [52, 152, 219] },
      margin: { top: 40 },
    });

    doc.save(`${submission.form_type}_${submission.id}.pdf`);
  };

  const handleApprove = async () => {
    if (submission.status === "approved") {
      toast.warning("This submission is already approved");
      return;
    }

    setLoading(true);
    try {
      // Update in Supabase
      const { error: updateError } = await supabaseClient
        .from(submission.form_type)
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", submission.id)
        .select() // Return the updated record
        .single();

      if (updateError) throw updateError;

      // Call the onApprove callback with updated data
      const updatedSubmission = {
        ...submission,
        status: "approved",
        updated_at: new Date().toISOString(),
      };

      onApprove(updatedSubmission);
      toast.success("Submission approved successfully");
    } catch (err) {
      console.error("Error approving submission:", err);
      toast.error(`Failed to approve submission: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">
                {submission.form_type.replace(/_/g, " ")}
              </h2>
              <div className="flex items-center mt-1">
                <StatusBadge status={submission.status} />
                <span className="ml-2 text-sm text-gray-500">
                  Submitted on{" "}
                  {new Date(submission.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-1 bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                <FaDownload size={12} />
                <span>Export PDF</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField(
              "Submission Date",
              new Date(submission.created_at).toLocaleString()
            )}

            {submission.form_type === "passport_applications" && (
              <>
                {renderField(
                  "Full Name",
                  `${submission.first_name || ""} ${submission.surname || ""}`
                )}
                {renderField("Date of Birth", submission.date_of_birth)}
                {renderField("Gender", submission.gender)}
                {renderFile("Ghana Card", submission.ghana_card)}
              </>
            )}
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end">
            <button
              onClick={handleApprove}
              disabled={submission.status === "approved" || loading}
              className={`px-4 py-2 rounded-lg flex items-center ${
                submission.status === "approved"
                  ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Approving...
                </>
              ) : (
                "Approve"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailModal;
