import PropTypes from 'prop-types';
import { FaEye } from "react-icons/fa";
import StatusBadge from "./StatusBadge";

const SubmissionTable = ({ 
  submissions, 
  loading, 
  showFormType, 
  onRowClick, 
  onViewClick 
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const getName = (submission) => {
    if (!submission) return 'N/A';
    
    switch (submission.form_type) {
      case "passport_applications":
        return `${submission.first_name || ''} ${submission.surname || ''}`.trim() || 'N/A';
      case "birth_certificates":
        return `${submission.first_name || ''} ${submission.surname || ''}`.trim() || 'N/A';
      case "company_applications":
      case "sole_proprietorship_applications":
        return submission.business_name_1 || 'N/A';
      default:
        return 'N/A';
    }
  };

  const getFormTypeDisplay = (submission) => {
    if (!submission) return 'N/A';
    return submission.formatted_form_type || 
           submission.form_type?.replace(/_/g, ' ') || 
           'N/A';
  };

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
                  {getFormTypeDisplay(submission)}
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {getName(submission)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(submission.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={submission.status || 'pending'} />
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

SubmissionTable.propTypes = {
  submissions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      form_type: PropTypes.string,
      first_name: PropTypes.string,
      surname: PropTypes.string,
      business_name_1: PropTypes.string,
      status: PropTypes.string,
      created_at: PropTypes.string,
      formatted_form_type: PropTypes.string,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  showFormType: PropTypes.bool,
  onRowClick: PropTypes.func,
  onViewClick: PropTypes.func,
};

SubmissionTable.defaultProps = {
  showFormType: false,
  onRowClick: () => {},
  onViewClick: () => {},
};

export default SubmissionTable;