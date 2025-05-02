import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabaseClient } from "../../supabase/client";
import { FaArrowLeft, FaSpinner, FaFilePdf, FaImage, FaTimes, FaRedo } from "react-icons/fa";
import StatusBadge from "./StatusBadge";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";

const FormDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoadError, setImageLoadError] = useState({});
  const [retryCount, setRetryCount] = useState(0);

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

  const getBucketName = () => {
    switch(formType) {
      case "passport_applications": return "passport_uploads";
      case "company_applications": return "company_uploads";
      case "sole_proprietorship_applications": return "sole_proprietorship_uploads";
      default: return "uploads";
    }
  };

  const getPublicUrl = (filePath) => {
    if (!filePath || typeof filePath !== 'string') return null;
    
    if (!filePath.includes('/') && !filePath.includes('.') && !filePath.includes('supabase.co')) {
      return null;
    }

    const bucketName = getBucketName();
    
    let cleanPath = filePath;
    if (filePath.includes('supabase.co/storage/v1/object/public/')) {
      const parts = filePath.split(`/public/${bucketName}/`);
      cleanPath = parts.length > 1 ? parts[1] : filePath;
    }
    
    cleanPath = cleanPath.replace(/^\//, '').trim();
    
    try {
      const { data: { publicUrl } } = supabaseClient.storage
        .from(bucketName)
        .getPublicUrl(cleanPath);
      return publicUrl;
    } catch (error) {
      console.error("URL Generation Error:", error);
      return null;
    }
  };

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
  }, [id, formType, retryCount]);

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    setRetryCount(prev => prev + 1);
  };

  const handleApprove = async () => {
    if (submission?.status === "approved") {
      toast.warning("This submission is already approved");
      return;
    }

    setApproving(true);
    try {
      if (!submission.id) {
        throw new Error("Missing submission ID");
      }

      const { error: updateError } = await supabaseClient
        .from(formType)
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", submission.id);

      if (updateError) throw updateError;

      setSubmission(prev => ({
        ...prev,
        status: "approved",
        updated_at: new Date().toISOString(),
      }));

      toast.success("Submission approved successfully");
      navigate(-1, { state: { shouldRefresh: true } });
    } catch (err) {
      console.error("Approval error:", err);
      let errorMsg = "Approval failed";
      if (err.code === '23502') errorMsg = "Missing required fields";
      else if (err.message) errorMsg = err.message;
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setApproving(false);
    }
  };

  const handleImageError = (field) => {
    console.error(`Image load failed for field: ${field}`);
    setImageLoadError(prev => ({ ...prev, [field]: true }));
  };

  const formatPDFValue = (key, value) => {
    if (value === null || value === undefined) return "N/A";
    
    if (key.includes("date") && !isNaN(new Date(value).getTime())) {
      return new Date(value).toLocaleDateString();
    }
    
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  const exportToPDF = () => {
    if (!submission) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 30;
  
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(`${formType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Submission Details`, pageWidth / 2, 20, { align: "center" });
  
    const capitalizeFieldName = (str) => {
      return str.replace(/\b\w/g, char => char.toUpperCase());
    };
  
    const fields = Object.entries(submission)
      .filter(([key]) => {
        const excludedFields = [
          'id', 
          'created_at', 
          'updated_at', 
          'status', 
          'form_type',
          'ghana_card',
          'ghana_card_number',
          'ghana_card_front',
          'ghana_card_back',
          'birth_certificate',
          'old_birth_certificate',
          'signature',
          'director_signature',
          'applicant_signature',
          'owner_signature',
          ...Object.keys(submission).filter(key => 
            key.includes("file") || 
            key.includes("document") || 
            key.includes("image")
          ),
          ...(formType === 'passport_applications' ? [
            'old_passport',
            'proof_of_occupation'
          ] : [])
        ];
        return !excludedFields.includes(key);
      })
      .map(([key, value]) => ({
        key: capitalizeFieldName(key.replace(/_/g, " ")),
        value: formatPDFValue(key, value)
      }));
  
    fields.forEach((field, index) => {
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = 20;
      }
  
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin - 2, yPos - 4, pageWidth - 2 * margin, 18, 'F');
      }
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      const fieldText = `${field.key}:`;
      doc.text(fieldText, margin, yPos + 5);
  
      const fieldWidth = doc.getStringUnitWidth(fieldText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      const valueXPos = margin + fieldWidth + 6;
  
      doc.setFont("helvetica", "normal");
      const text = doc.splitTextToSize(String(field.value), pageWidth - valueXPos - margin);
      doc.text(text, valueXPos, yPos + 5);
  
      yPos += Math.max(15, 5 + (text.length * 5));
    });
  
    doc.save(`${formType}_${id}.pdf`);
  };

  const renderFieldValue = (key, value) => {
    if (value === null || value === undefined) return "N/A";

    const formImageFields = {
      passport_applications: ['ghana_card', 'birth_certificate', 'old_passport', 'proof_of_occupation'],
      company_applications: ['ghana_card_front', 'ghana_card_back', 'signature'],
      sole_proprietorship_applications: ['ghana_card_front', 'ghana_card_back', 'signature'],
      birth_certificates: []
    };

    const imageFields = formImageFields[formType] || [];

    if (imageFields.includes(key)) {
      if (typeof value !== 'string' || (!value.includes('/') && !value.includes('.') && !value.includes('supabase.co'))) {
        return "No image uploaded";
      }

      const imageUrl = getPublicUrl(value);
      if (!imageUrl) return <div className="text-red-500">Invalid image path</div>;
      
      const isSignature = key.includes('signature');
      
      return (
        <div className="mt-2">
          <button 
            onClick={() => {
              setSelectedImage(imageUrl);
              setImageLoadError(prev => ({ ...prev, preview: false }));
            }}
            className="group relative"
          >
            <div className={`${isSignature ? 'w-32 h-16' : 'w-24 h-24'} bg-gray-100 rounded-md overflow-hidden flex items-center justify-center border border-gray-200`}>
              {imageLoadError[key] ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <FaImage className="text-gray-400 text-xl" />
                  <span className="text-xs text-gray-500">Failed to load</span>
                </div>
              ) : (
                <img 
                  src={imageUrl}
                  alt={key.replace(/_/g, " ")}
                  className={`object-contain ${isSignature ? 'max-h-[50px]' : 'max-h-full'} max-w-full`}
                  onError={() => handleImageError(key)}
                  onLoad={() => setImageLoadError(prev => ({ ...prev, [key]: false }))}
                />
              )}
            </div>
          </button>
          <div className="text-xs text-gray-500 mt-1">
            <p>Click to enlarge</p>
          </div>
        </div>
      );
    }

    if (key.includes("file") || key.includes("document")) {
      const fileUrl = getPublicUrl(value);
      return fileUrl ? (
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
          <FaFilePdf className="mr-1" /> View Document
        </a>
      ) : "No file uploaded";
    }

    if (key.includes("date") && !isNaN(new Date(value).getTime())) {
      return new Date(value).toLocaleDateString();
    }

    if (typeof value === "object") {
      return <pre className="text-sm">{JSON.stringify(value, null, 2)}</pre>;
    }

    return String(value);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <FaSpinner className="animate-spin text-2xl text-blue-500 mr-2" />
      <span>Loading submission details...</span>
    </div>
  );

  if (error) return (
    <div className="p-6 text-center">
      <div className="text-red-500 mb-4">{error}</div>
      <div className="flex justify-center gap-2">
        <button onClick={retryFetch} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center">
          <FaRedo className="mr-2" /> Try Again
        </button>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center">
          <FaArrowLeft className="mr-2" /> Back
        </button>
      </div>
    </div>
  );

  if (!submission) return (
    <div className="p-6 text-center">
      <p className="mb-4">Submission not found</p>
      <button onClick={() => navigate(-1)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
        <FaArrowLeft className="inline mr-2" /> Back to submissions
      </button>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl mx-auto">
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            {imageLoadError.preview ? (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <FaImage className="text-4xl mb-2" />
                <p>Could not load image</p>
              </div>
            ) : (
              <img 
                src={selectedImage} 
                alt="Document Preview" 
                className="max-w-full max-h-[80vh] object-contain mx-auto"
                onClick={(e) => e.stopPropagation()}
                onError={() => setImageLoadError(prev => ({ ...prev, preview: true }))}
              />
            )}
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2">
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <FaArrowLeft className="mr-2" /> Back to submissions
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {formType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Submission
          </h1>
          <p className="text-gray-500">
            ID: {id} | Created: {new Date(submission.created_at).toLocaleString()}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {Object.entries(submission)
          .filter(([key]) => !["id", "created_at", "updated_at", "status", "form_type"].includes(key))
          .map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 capitalize">{key.replace(/_/g, " ")}</h3>
              <div className="mt-2 text-gray-900 break-words">
                {renderFieldValue(key, value)}
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-end space-x-4">
        {submission.status === "pending" ? (
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
        ) : (
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            <FaFilePdf className="mr-2" />
            Export as PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default FormDetailPage;