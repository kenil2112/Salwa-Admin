import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import IndividualClinicService from "../../services/IndividualClinicService";
import { useToast } from "../../components/ToastProvider";
import {
  getStatusBadgeClass,
  getStatusName,
  StatusEnum,
} from "../../utils/statusEnum";

interface ServiceDetails {
  RequestId: number;
  RequestNumber: string;
  OrderTitle: string;
  ContactPersonName: string;
  ContactEmail: string;
  ServiceType: string;
  StatusId: number;
  StatusName: string;
  CreatedDate: string;
  ValidityTime: number;
  OtherTermsAndCon: string;
}

const Service22Details = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceDetails = async () => {
    if (!id) {
      setError("Request ID not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response: any =
        await IndividualClinicService.GetIndividualClinicServiceRequestById(
          parseInt(id)
        );

      if (response && response.success) {
        setServiceDetails(response.data);
      } else {
        throw new Error(
          (response as any)?.message || "Failed to fetch service details"
        );
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
      setError("Failed to load service details");
      showToast("Failed to load service details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, [id, showToast]);

  const handleApprove = async () => {
    if (!serviceDetails) return;

    const confirmed = window.confirm(
      `Are you sure you want to approve request ${serviceDetails.RequestNumber}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await IndividualClinicService.UpdateStatus({
        requestId: serviceDetails.RequestId,
        statusId: StatusEnum.APPROVED,
        reason: "Request approved by admin",
      });

      if (response && response.success) {
        await fetchServiceDetails();
        showToast(
          `Request ${serviceDetails.RequestNumber} has been approved successfully!`,
          "success"
        );
      } else {
        throw new Error(
          (response as any)?.message || "Failed to approve request"
        );
      }
    } catch (error) {
      console.error("Error approving request:", error);
      showToast(
        `Failed to approve request ${serviceDetails.RequestNumber}. Please try again.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!serviceDetails) return;

    const confirmed = window.confirm(
      `Are you sure you want to reject request ${serviceDetails.RequestNumber}?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await IndividualClinicService.UpdateStatus({
        requestId: serviceDetails.RequestId,
        statusId: StatusEnum.REJECTED,
        reason: "Request rejected by admin",
      });

      if (response && response.success) {
        await fetchServiceDetails();
        showToast(
          `Request ${serviceDetails.RequestNumber} has been rejected`,
          "success"
        );
      } else {
        throw new Error(
          (response as any)?.message || "Failed to reject request"
        );
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast(
        `Failed to reject request ${serviceDetails.RequestNumber}. Please try again.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading service details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !serviceDetails) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">
              {error || "Service details not found"}
            </p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Go Back
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Service 2-2 Details
              </h1>
              <div className="flex items-center gap-2">
                <div className="h-6 w-px bg-gray-300"></div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                    serviceDetails.StatusId
                  )}`}
                >
                  {getStatusName(serviceDetails.StatusId)}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {serviceDetails.OrderTitle}
              </h2>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request Number:</span>
                    <span className="font-medium">
                      {serviceDetails.RequestNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact Person:</span>
                    <span className="font-medium">
                      {serviceDetails.ContactPersonName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact Email:</span>
                    <span className="font-medium">
                      {serviceDetails.ContactEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Type:</span>
                    <span className="font-medium">
                      {serviceDetails.ServiceType}
                    </span>
                  </div>
                </div>

                {serviceDetails.OtherTermsAndCon && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Terms & Conditions:
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {serviceDetails.OtherTermsAndCon}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 h-96">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Location
              </h3>
              <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">Riyadh Medical Center</p>
                  <p className="text-sm text-gray-400">
                    123 Healthcare Avenue, Riyadh, MD 10001
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handleReject}
            disabled={
              loading || serviceDetails.StatusId === StatusEnum.REJECTED
            }
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
          <button
            onClick={handleApprove}
            disabled={
              loading || serviceDetails.StatusId === StatusEnum.APPROVED
            }
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Service22Details;

