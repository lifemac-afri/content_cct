import React, { useState } from "react";
import { FaFileAlt, FaTimes, FaImage } from "react-icons/fa";
import { supabaseClient } from "../../supabase/client";
import StatusBadge from "./StatusBadge";

const SubmissionDetailModal = ({ submission, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const getBucketName = () => {
    switch(submission?.form_type) {
      case "passport_applications":
        return "passport_uploads";
      case "company_applications":
        return "company_uploads";
      case "sole_proprietorship_applications":
        return "sole_proprietorship_uploads";
      default:
        return "uploads";
    }
  };

  const getPublicUrl = (filePath) => {
    if (!filePath) return null;
    const bucketName = getBucketName();
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    return publicUrl;
  };

  const renderField = (label, value) => (
    <div className="mb-2 px-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <p className="mt-1 text-sm text-gray-900 break-words">
        {value !== null && value !== undefined && value !== '' 
          ? value 
          : "Not provided"}
      </p>
    </div>
  );

  const renderFile = (label, filePath, isImage = false) => {
    const publicUrl = getPublicUrl(filePath);
    
    if (!publicUrl) return (
      <p className="text-sm text-gray-500">No file uploaded</p>
    );

    return (
      <div className="mb-2 px-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {isImage ? (
          <div className="mt-1">
            <button 
              onClick={() => setSelectedImage(publicUrl)}
              className="group relative"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200">
                <img 
                  src={publicUrl} 
                  alt={label}
                  className="object-contain max-h-full max-w-full"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23EEE'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='12' fill='%23000' text-anchor='middle' dominant-baseline='middle'%3EImage%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </button>
          </div>
        ) : (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center text-sm"
          >
            <FaFileAlt className="inline mr-1" size={12} />
            View File
          </a>
        )}
      </div>
    );
  };

  const renderFormFields = () => {
    if (!submission) return null;

    const commonProps = {
      className: "grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2"
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
            {renderFile("Ghana Card", submission.ghana_card, true)}
            {renderFile("Birth Cert", submission.birth_certificate)}
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
            {renderFile("Ghana Card Front", submission.ghana_card_front, true)}
            {renderFile("Ghana Card Back", submission.ghana_card_back, true)}
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
            {renderFile("Ghana Card Front", submission.ghana_card_front, true)}
            {renderFile("Ghana Card Back", submission.ghana_card_back, true)}
          </div>
        );
      default:
        return null;
    }
  };

  if (!submission) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-screen">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="max-w-full max-h-screen object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 text-white text-xl hover:text-gray-300"
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className="bg-white rounded-lg w-full max-w-3xl mx-auto relative">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <FaTimes className="text-gray-600 text-lg" />
        </button>

        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="w-full">
              <h2 className="text-xl font-bold text-gray-800">
                {submission.form_type.replace(/_/g, " ")}
              </h2>
              <div className="flex items-center mt-1">
                <StatusBadge status={submission.status} />
                <span className="ml-2 text-xs text-gray-600">
                  {new Date(submission.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            {renderFormFields()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailModal;