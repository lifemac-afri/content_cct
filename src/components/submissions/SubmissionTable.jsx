import React from "react";
import { FaEye } from "react-icons/fa";
import StatusBadge from "./StatusBadge";


const SubmissionTable = ({ submissions, loading, onRowClick, onViewClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th> */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date Submitted
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
          {loading ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center">
                Loading...
              </td>
            </tr>
          ) : submissions.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center">
                No submissions found
              </td>
            </tr>
          ) : (
            submissions.map((submission) => (
              <tr 
                key={submission.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onRowClick(submission)}
              >
                {/* <td className="px-6 py-4 whitespace-nowrap">
                  {submission.id}
                </td> */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {submission.first_name || submission.full_name || submission.business_name_1 || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(submission.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={submission.status || 'pending'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewClick(submission);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FaEye />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;