import React from "react";
import StatusBadge from "./StatusBadge";
import { FaEye } from "react-icons/fa";

const SubmissionTable = ({ submissions, loading, showFormType, onRowClick, onViewClick }) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading submissions...</p>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No submissions found
      </div>
    );
  }

  const getName = (submission) => {
    switch (submission.form_type) {
      case "passport_applications":
        return `${submission.first_name} ${submission.surname}`;
      case "birth_certificates":
        return `${submission.first_name} ${submission.surname}`;
      case "company_applications":
      case "sole_proprietorship_applications":
        return submission.business_name_1;
      default:
        return "N/A";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showFormType && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Form Type
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name/Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {submissions.map((submission) => (
            <tr 
              key={submission.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick(submission)}
            >
              {showFormType && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.formatted_form_type}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {getName(submission)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {submission.created_at ? new Date(submission.created_at).toLocaleString() : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={submission.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewClick(submission);
                  }}
                  className="text-blue-600 hover:text-blue-900 flex items-center"
                >
                  <FaEye className="mr-1" /> View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;