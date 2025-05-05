import PropTypes from 'prop-types';
import { FaTimes } from "react-icons/fa";
import StatusBadge from "./StatusBadge";

const SubmissionDetailModal = ({ submission, onClose }) => {
  const renderField = (label, value) => (
    <div className="mb-4 px-2">
      <label className="block text-base font-medium text-gray-800">
        {label}
      </label>
      <p className="mt-2 text-base text-gray-900 break-words">
        {value !== null && value !== undefined && value !== '' 
          ? value 
          : "Not provided"}
      </p>
    </div>
  );

  const renderFormFields = () => {
    if (!submission) return null;

    const commonProps = {
      className: "grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
    };

    switch (submission.form_type) {
      case "passport_applications":
        return (
          <div {...commonProps}>
            {renderField("Full Name", `${submission.first_name || ''} ${submission.surname || ''}`.trim())}
            {renderField("Date of Birth", submission.date_of_birth)}
            {renderField("Ghana Card", submission.ghana_card_number)}
            {renderField("Mobile", submission.mobile_number)}
            {renderField("Email", submission.email)}
            {renderField("Digital Address", submission.digital_address)}
            {renderField("Occupation", submission.occupation)}
            {renderField("Mother's Name", submission.mother_name)}
            {renderField("Father's Name", submission.father_name)}
            {renderField("Status", submission.marital_status)}
          </div>
        );
      case "birth_certificates":
        return (
          <div {...commonProps}>
            {renderField("Child's Name", `${submission.first_name || ''} ${submission.surname || ''}`.trim())}
            {renderField("Date of Birth", submission.date_of_birth)}
            {renderField("Place of Birth", submission.place_of_birth)}
            {renderField("Father's Name", submission.father_name)}
            {renderField("Mother's Name", submission.mother_maiden_name)}
            {renderField("Address", submission.residential_address)}
            {renderField("Phone", submission.telephone)}
            {renderField("District", submission.district)}
            {renderField("Father's Job", submission.father_occupation)}
            {renderField("Mother's Job", submission.mother_occupation)}
          </div>
        );
      case "company_applications":
        return (
          <div {...commonProps}>
            {renderField("Company Name", submission.business_name_1)}
            {renderField("Business Type", submission.nature_of_business)}
            {renderField("Address", `${submission.business_house_number || ''}, ${submission.business_street_name || ''}`.trim())}
            {renderField("Phone", submission.business_phone_number)}
            {renderField("Director", submission.director_full_name)}
            {renderField("Director Phone", submission.director_phone_number)}
            {renderField("Ghana Card", submission.director_ghana_card_number)}
            {renderField("TIN", submission.director_tin)}
            {renderField("Capital", submission.stated_capital)}
            {renderField("Type", "Company Registration")}
          </div>
        );
      case "sole_proprietorship_applications":
        return (
          <div {...commonProps}>
            {renderField("Business Name", submission.business_name_1)}
            {renderField("Owner", submission.full_name)}
            {renderField("Phone", submission.phone_number)}
            {renderField("Ghana Card", submission.ghana_card_number)}
            {renderField("TIN", submission.tin)}
            {renderField("Address", `${submission.business_house_number || ''}, ${submission.business_street_name || ''}`.trim())}
            {renderField("Digital Address", submission.business_digital_address)}
            {renderField("Business Type", submission.nature_of_business)}
            {renderField("Occupation", submission.occupation)}
            {renderField("Type", "Sole Proprietorship")}
          </div>
        );
      default:
        return null;
    }
  };

  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl mx-auto relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          <FaTimes className="text-2xl" />
        </button>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="w-full">
              <h2 className="text-2xl font-bold text-gray-900">
                {submission.form_type.replace(/_/g, " ")}
              </h2>
              <div className="flex items-center mt-2">
                <StatusBadge status={submission.status} />
                <span className="ml-3 text-sm text-gray-600">
                  {new Date(submission.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            {renderFormFields()}
          </div>
        </div>
      </div>
    </div>
  );
};

SubmissionDetailModal.propTypes = {
  submission: PropTypes.shape({
    form_type: PropTypes.string.isRequired,
    first_name: PropTypes.string,
    surname: PropTypes.string,
    date_of_birth: PropTypes.string,
    ghana_card_number: PropTypes.string,
    mobile_number: PropTypes.string,
    email: PropTypes.string,
    digital_address: PropTypes.string,
    occupation: PropTypes.string,
    mother_name: PropTypes.string,
    father_name: PropTypes.string,
    marital_status: PropTypes.string,
    place_of_birth: PropTypes.string,
    mother_maiden_name: PropTypes.string,
    residential_address: PropTypes.string,
    telephone: PropTypes.string,
    district: PropTypes.string,
    father_occupation: PropTypes.string,
    mother_occupation: PropTypes.string,
    business_name_1: PropTypes.string,
    nature_of_business: PropTypes.string,
    business_house_number: PropTypes.string,
    business_street_name: PropTypes.string,
    business_phone_number: PropTypes.string,
    director_full_name: PropTypes.string,
    director_ghana_card_number: PropTypes.string,
    director_phone_number: PropTypes.string,
    director_tin: PropTypes.string,
    stated_capital: PropTypes.string,
    full_name: PropTypes.string,
    phone_number: PropTypes.string,
    tin: PropTypes.string,
    business_digital_address: PropTypes.string,
    status: PropTypes.string,
    created_at: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

SubmissionDetailModal.defaultProps = {
  submission: null,
};

export default SubmissionDetailModal;