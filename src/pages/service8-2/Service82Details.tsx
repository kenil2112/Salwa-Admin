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
  BuildingLicenseNumber: string;
  MedicalLicenseNumber: string;
  WorkingEmp: number;
  ContactPersonName: string;
  ContactEmail: string;
  ClinicHours: string;
  RentPeriod: number;
  RentPeriodType: string;
  ServiceType: string;
  ProvideWith: string;
  StatusId: number;
  StatusName: string;
  CreatedDate: string;
  UpdatedDate: string;
  CreatedBy: number;
  UpdatedBy: number;
  ClinicSiteId: number;
  CategoryId: number;
  SerevieceId: number;
  ConfirmedFlag: boolean;
  IsActive: boolean;
  IsAdminApprove: boolean;
  SterilizationEquipmentFlag: boolean;
  OtherTermsAndCon: string;
  Reason: string;
  Media: string;
  ValidityTime: number;
  TransactionId: string | null;
  Quotation: string | null;
  DeletedBy: number | null;
  DeletedDate: string | null;
  RowNum: number;
  Address?: string;
  City?: string;
  Region?: string;
  Country?: string;
}

const sampleImages = [
  "/img/hospital_img.jpg",
  "/img/hospital_img (2).jpg",
  "/img/hospital_img (3).jpg",
  "/img/hospital_img (4).jpg",
  "/img/hospital_img (5).jpg",
];

const Service82Details = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [serviceDetails, setServiceDetails] = useState<ServiceDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState<string[]>(sampleImages);

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

        if (response.data.Media) {
          try {
            const mediaUrls = JSON.parse(response.data.Media);
            if (Array.isArray(mediaUrls) && mediaUrls.length > 0) {
              setImages(mediaUrls);
            }
          } catch (e) {
            console.log("Could not parse media, using sample images");
          }
        }
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

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
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Service 8-2 Details
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
            <div className="relative">
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={images[currentImageIndex]}
                  alt={`Service image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/img/hospital_img.jpg";
                  }}
                />

                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex gap-2 mt-4 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex
                        ? "border-primary"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/img/hospital_img.jpg";
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {serviceDetails.OrderTitle}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-gray-700">Jeddah, Saudi Arabia</span>
                  <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {serviceDetails.ValidityTime} Days Left
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request Number:</span>
                    <span className="font-medium">
                      {serviceDetails.RequestNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Building License Number:
                    </span>
                    <span className="font-medium">
                      {serviceDetails.BuildingLicenseNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Medical License Number:
                    </span>
                    <span className="font-medium">
                      {serviceDetails.MedicalLicenseNumber}
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
                    <span className="text-gray-600">Working Employees:</span>
                    <span className="font-medium">
                      {serviceDetails.WorkingEmp}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rent Period:</span>
                    <span className="font-medium">
                      {serviceDetails.RentPeriod}{" "}
                      {serviceDetails.RentPeriodType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clinic Hours:</span>
                    <span className="font-medium">
                      {serviceDetails.ClinicHours}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Type:</span>
                    <span className="font-medium">
                      {serviceDetails.ServiceType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Sterilization Equipment:
                    </span>
                    <span className="font-medium">
                      {serviceDetails.SterilizationEquipmentFlag ? "Yes" : "No"}
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
                  <svg
                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-gray-500 mb-2">Riyadh Medical Center</p>
                  <p className="text-sm text-gray-400">
                    123 Healthcare Avenue, Riyadh, MD 10001
                  </p>
                  <button className="mt-4 px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800 transition-colors">
                    Redirect to location
                  </button>
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

export default Service82Details;

