import React, { useState } from 'react';

const RentalDetailsModal = ({ rental, onClose, onApprove, onReject, formatPrice }) => {
  const [loading, setLoading] = useState(false);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove(rental.id);
      onClose();
    } catch (error) {
      console.error('Error approving rental:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await onReject(rental.id);
      onClose();
    } catch (error) {
      console.error('Error rejecting rental:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async () => {
    if (!rental.proofOfAddress) return;
    
    setDocumentLoading(true);
    try {
      // If it's a full URL, open in new tab
      if (rental.proofOfAddress.startsWith('http')) {
        window.open(rental.proofOfAddress, '_blank');
      } else {
        // If it's a relative path, construct full URL
        const baseUrl = process.env.REACT_APP_API_URL || 'https://localhost:7056';
        const documentUrl = `${baseUrl}${rental.proofOfAddress}`;
        window.open(documentUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleViewDocument = () => {
    setShowDocumentPreview(true);
  };

  const getDocumentIcon = () => {
    if (!rental.proofOfAddress) return 'fa-file';
    
    const extension = rental.proofOfAddress.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'fa-file-pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'fa-file-image';
      case 'doc':
      case 'docx':
        return 'fa-file-word';
      case 'xls':
      case 'xlsx':
        return 'fa-file-excel';
      default:
        return 'fa-file';
    }
  };

  const getDocumentColor = () => {
    if (!rental.proofOfAddress) return 'text-gray-600';
    
    const extension = rental.proofOfAddress.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'text-red-600';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'text-blue-600';
      case 'doc':
      case 'docx':
        return 'text-blue-800';
      case 'xls':
      case 'xlsx':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isImage = () => {
    if (!rental.proofOfAddress) return false;
    const extension = rental.proofOfAddress.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '');
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Rental Application Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Status Badge */}
            <div className="mb-6 flex items-center justify-between">
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                rental.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                rental.status === 'Approved' ? 'bg-green-100 text-green-800' :
                rental.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {rental.status}
              </span>
              <span className="text-xs text-gray-500">
                Applied: {formatDate(rental.createdAt)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="fas fa-user text-amber-500 mr-2"></i>
                  Customer Information
                </h3>
                <div className="space-y-2">
                  <p className="flex items-start">
                    <span className="text-gray-600 w-24">Name:</span>
                    <span className="text-gray-900 font-medium">
                      {rental.user?.firstName} {rental.user?.lastName}
                    </span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-gray-600 w-24">Email:</span>
                    <span className="text-gray-900 break-all">{rental.user?.email}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-gray-600 w-24">Phone:</span>
                    <span className="text-gray-900">{rental.user?.phoneNumber || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Car Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="fas fa-car text-amber-500 mr-2"></i>
                  Car Information
                </h3>
                <div className="space-y-2">
                  <p className="flex items-start">
                    <span className="text-gray-600 w-24">Make/Model:</span>
                    <span className="text-gray-900">{rental.car?.make} {rental.car?.model}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-gray-600 w-24">Year:</span>
                    <span className="text-gray-900">{rental.car?.year}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-gray-600 w-24">Type:</span>
                    <span className="text-gray-900">{rental.car?.carType}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-gray-600 w-24">Price/Day:</span>
                    <span className="text-gray-900">{formatPrice(rental.car?.pricePerDay)}</span>
                  </p>
                </div>
              </div>

              {/* Rental Details */}
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <i className="fas fa-calendar-alt text-amber-500 mr-2"></i>
                  Rental Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="flex items-start">
                      <span className="text-gray-600 w-32">Pickup Date:</span>
                      <span className="text-gray-900">{rental.pickupDate}</span>
                    </p>
                    <p className="flex items-start">
                      <span className="text-gray-600 w-32">Return Date:</span>
                      <span className="text-gray-900">{rental.returnDate}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-start">
                      <span className="text-gray-600 w-32">Pickup Location:</span>
                      <span className="text-gray-900">{rental.pickupLocation}</span>
                    </p>
                    <p className="flex items-start">
                      <span className="text-gray-600 w-32">Dropoff Location:</span>
                      <span className="text-gray-900">{rental.dropoffLocation}</span>
                    </p>
                  </div>
                  <div className="md:col-span-2 pt-2 border-t border-gray-200">
                    <p className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Total Amount:</span>
                      <span className="font-bold text-2xl text-amber-600">
                        {formatPrice(rental.totalAmount)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Proof of Address / Document Section */}
              {rental.proofOfAddress && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <i className={`fas ${getDocumentIcon()} ${getDocumentColor()} mr-2`}></i>
                    Supporting Document
                  </h3>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-3 ${getDocumentColor().replace('text', 'bg').replace('600', '100')} rounded-lg`}>
                          <i className={`fas ${getDocumentIcon()} ${getDocumentColor()} text-2xl`}></i>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {rental.proofOfAddress.split('/').pop() || 'Document'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Uploaded by customer as proof of address
                          </p>
                          {isImage() && (
                            <p className="text-xs text-blue-600 mt-1">
                              <i className="fas fa-image mr-1"></i>
                              Image document - click View to preview
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {isImage() && (
                          <button
                            onClick={handleViewDocument}
                            disabled={documentLoading}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm flex items-center"
                            title="Preview Document"
                          >
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </button>
                        )}
                        <button
                          onClick={handleDownloadDocument}
                          disabled={documentLoading}
                          className="px-3 py-1.5 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors text-sm flex items-center"
                          title="Download Document"
                        >
                          {documentLoading ? (
                            <i className="fas fa-spinner fa-spin mr-1"></i>
                          ) : (
                            <i className="fas fa-download mr-1"></i>
                          )}
                          {documentLoading ? 'Opening...' : 'Download'}
                        </button>
                      </div>
                    </div>

                    {/* Document Info */}
                    <div className="mt-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
                      <p>
                        <i className="far fa-clock mr-1"></i>
                        This document will be reviewed during the approval process
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* No Document Message */}
              {!rental.proofOfAddress && (
                <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                  <p className="text-sm text-gray-500 flex items-center">
                    <i className="fas fa-info-circle text-gray-400 mr-2"></i>
                    No supporting document was uploaded with this application
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {rental.status === 'Pending' && (
              <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-times mr-2"></i>
                  )}
                  {loading ? 'Processing...' : 'Reject Application'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <i className="fas fa-check mr-2"></i>
                  )}
                  {loading ? 'Processing...' : 'Approve Application'}
                </button>
              </div>
            )}

            {rental.status !== 'Pending' && (
              <div className="mt-6 flex justify-end border-t border-gray-200 pt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
                >
                  <i className="fas fa-times mr-2"></i>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showDocumentPreview && rental.proofOfAddress && isImage() && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Document Preview
              </h3>
              <button
                onClick={() => setShowDocumentPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
              <img
                src={rental.proofOfAddress.startsWith('http') 
                  ? rental.proofOfAddress 
                  : `${process.env.REACT_APP_API_URL || 'https://localhost:7056'}${rental.proofOfAddress}`
                }
                alt="Proof of Address"
                className="max-w-full h-auto mx-auto"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={handleDownloadDocument}
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors flex items-center"
              >
                <i className="fas fa-download mr-2"></i>
                Download
              </button>
              <button
                onClick={() => setShowDocumentPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RentalDetailsModal;