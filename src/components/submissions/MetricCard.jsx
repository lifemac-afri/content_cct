import PropTypes from 'prop-types';

const MetricCard = ({ 
  icon: Icon, 
  title, 
  value, 
  trend, 
  className = "", 
  onClick,
  isActive = false
}) => (
  <div 
    className={`p-6 bg-white rounded-xl shadow-sm border-2 transition-colors duration-200 ${className} ${
      onClick ? "cursor-pointer hover:bg-gray-50" : ""
    } ${
      isActive ? "border-dark_green" : "border-transparent"
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          {Icon && <Icon className="text-2xl" />}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      {trend && (
        <span className={`text-sm font-medium ${
          trend > 0 ? "text-green-500" : "text-red-500"
        }`}>
          {trend > 0 ? "+" : ""}{trend}%
        </span>
      )}
    </div>
  </div>
);

MetricCard.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]).isRequired,
  trend: PropTypes.number,
  className: PropTypes.string,
  onClick: PropTypes.func,
  isActive: PropTypes.bool
};

MetricCard.defaultProps = {
  trend: null,
  className: "",
  onClick: null,
  isActive: false
};

export default MetricCard;