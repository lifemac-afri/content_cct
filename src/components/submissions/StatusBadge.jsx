import PropTypes from 'prop-types';
import { FaCheck, FaClock } from "react-icons/fa";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      icon: <FaClock className="mr-1" />,
      text: "Pending",
      className: "bg-yellow-100 text-yellow-800"
    },
    approved: {
      icon: <FaCheck className="mr-1" />,
      text: "Approved",
      className: "bg-green-100 text-green-800"
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-2 py-1 text-xs rounded-full flex items-center ${config.className}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.oneOf(['pending', 'approved']).isRequired,
};

export default StatusBadge;