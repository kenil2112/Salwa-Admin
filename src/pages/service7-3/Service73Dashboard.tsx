import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../../components/common/ComanTable";
import MedicalRealEstateService from "../../services/MedicalRealEstateService";
import MedicalEquipmentAndFacilitiesService from "../../services/MedicalEquipmentAndFacilitiesService";
import { useToast } from "../../components/ToastProvider";
import {
  getStatusBadgeClass,
  getStatusName,
  StatusEnum,
} from "../../utils/statusEnum";

interface DashboardRecord {
  requestId: number;
  categoryId: number;
  serviceId: number;
  propertyCategory: string;
  transactionAction: string;
  governmentRegistrationLandNumber: string;
  type: string;
  ownerName: string;
  unifiedNationalNumber: string;
  propertyType: string;
  period: string;
  rentValue: number;
  internetFiberOptic: boolean;
  electricityService: boolean;
  sewageService: boolean;
  waterService: boolean;
  telephoneInternetService: boolean;
  landSizeSqMeter: number;
  numberOfStreets: number;
  buildingConstructionLicense: boolean;
  landSoilTestsCompleted: boolean;
  locationId: number;
  mediaFilePath: string;
  mediaFilesArray: any;
  isTermCondition: boolean;
  serviceType: string;
  statusId: number;
  createdBy: number;
  createdDate: string;
  updatedBy: number;
  updatedDate: string;
  deletedBy: number | null;
  deletedDate: string | null;
  isActive: boolean;
  country: string;
  region: string;
  city: string;
  district: string;
  nationalAddress: string;
  address: string;
  latitude: string;
  longitude: string;
  isAdminApprove: boolean | null;
  businessName: string | null;
}

const Service73Dashboard = () => {
  const { subserviceIndex } = useParams<{
    subserviceIndex?: string;
  }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [records, setRecords] = useState<DashboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortState, setSortState] = useState<SortState[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Reject reason modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedRowForReject, setSelectedRowForReject] =
    useState<DashboardRecord | null>(null);

  // Fetch data from API
  const fetchDataFromAPI = async (): Promise<DashboardRecord[]> => {
    try {
      const response =
        await MedicalRealEstateService.GetAllMedicalRealEstateServices({
          pageNumber: pageNumber,
          pageSize: pageSize,
          orderByColumn:
            sortState.length > 0 ? sortState[0].key : "CreatedDate",
          orderDirection:
            sortState.length > 0 ? sortState[0].order.toUpperCase() : "DESC",
        });

      if (response && response.success) {
        const responseData = (response as any).data;
        const totalCount = responseData?.totalCount || 0;
        const apiTotalPages = responseData?.totalPages;

        // Calculate total pages if not provided by API
        const calculatedTotalPages =
          apiTotalPages || Math.ceil(totalCount / pageSize) || 1;

        setTotalCount(totalCount);
        setTotalPages(calculatedTotalPages);

        return responseData?.data || [];
      } else {
        throw new Error((response as any)?.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data from API:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from API
        const apiData = await fetchDataFromAPI();
        setRecords(apiData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subserviceIndex, pageNumber, pageSize, sortState]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  // Handle sort change
  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  // Handle reject confirmation with reason
  const handleRejectSubmit = async () => {
    if (!selectedRowForReject || !rejectionReason.trim()) {
      showToast("Please provide a reason for rejection", "error");
      return;
    }

    try {
      setLoading(true);

      const response =
        await MedicalEquipmentAndFacilitiesService.UpdateMedicalRealEstateServiceStatus(
          {
            requestId: selectedRowForReject.requestId,
            newStatusId: StatusEnum.REJECTED,
            userId: 1, // You might want to get this from auth context
            requestNumber: selectedRowForReject.requestId.toString(),
            reason: rejectionReason.trim(),
          }
        );

      if (response && response.success) {
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedRowForReject(null);
        const updatedData = await fetchDataFromAPI();
        setRecords(updatedData);

        showToast(
          `Request ${selectedRowForReject.requestId} has been rejected successfully!`,
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
        `Failed to reject request ${selectedRowForReject.requestId}. Please try again.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle reject modal cancel
  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectionReason("");
    setSelectedRowForReject(null);
  };

  // Handle publish action
  const handlePublishAction = async (row: DashboardRecord) => {
    try {
      setLoading(true);

      const response =
        await MedicalEquipmentAndFacilitiesService.UpdateMedicalRealEstateServiceStatus(
          {
            requestId: row.requestId,
            newStatusId: StatusEnum.PUBLISHED,
            userId: 1, // You might want to get this from auth context
            requestNumber: row.requestId.toString(),
            reason: "Request published by admin",
          }
        );

      if (response && response.success) {
        // Refetch the data to get updated information
        const updatedData = await fetchDataFromAPI();
        setRecords(updatedData);

        showToast(
          `Request ${row.requestId} has been published successfully!`,
          "success"
        );
      } else {
        throw new Error(
          (response as any)?.message || "Failed to publish request"
        );
      }
    } catch (error) {
      console.error("Error publishing request:", error);
      showToast(
        `Failed to publish request ${row.requestId}. Please try again.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const tableColumns: TableColumn<DashboardRecord>[] = [
    {
      label: "Request ID",
      value: (row) => (
        <span className="font-semibold text-primary">{row.requestId}</span>
      ),
      sortKey: "requestId",
      isSort: true,
    },
    {
      label: "Owner Name",
      value: (row) => <span className="text-gray-700">{row.ownerName}</span>,
      sortKey: "ownerName",
      isSort: true,
    },
    {
      label: "Property Type",
      value: (row) => <span className="text-gray-500">{row.propertyType}</span>,
      sortKey: "propertyType",
      isSort: true,
    },
    {
      label: "Rent Value",
      value: (row) => (
        <span className="text-gray-500 font-semibold">
          {row.rentValue.toFixed(2)} SAR
        </span>
      ),
      sortKey: "rentValue",
      isSort: true,
    },
    {
      label: "Period",
      value: (row) => <span className="text-gray-500">{row.period}</span>,
      sortKey: "period",
      isSort: true,
    },
    {
      label: "Land Size",
      value: (row) => (
        <span className="text-gray-500">{row.landSizeSqMeter} sq m</span>
      ),
      sortKey: "landSizeSqMeter",
      isSort: true,
    },
    {
      label: "Location",
      value: (row) => (
        <span className="text-gray-500">
          {row.city}, {row.region}
        </span>
      ),
      sortKey: "city",
      isSort: true,
    },
    {
      label: "Address",
      value: (row) => (
        <span className="text-gray-500" title={row.address}>
          {row.address.length > 30
            ? `${row.address.substring(0, 30)}...`
            : row.address}
        </span>
      ),
      sortKey: "address",
      isSort: true,
    },
    {
      label: "Services",
      value: (row) => {
        const services = [];
        if (row.electricityService) services.push("Electricity");
        if (row.waterService) services.push("Water");
        if (row.sewageService) services.push("Sewage");
        if (row.internetFiberOptic) services.push("Internet");
        if (row.telephoneInternetService) services.push("Telephone");

        return (
          <span className="text-gray-500">
            {services.length > 0 ? services.join(", ") : "None"}
          </span>
        );
      },
      sortKey: "electricityService",
      isSort: false,
    },
    {
      label: "Government Registration",
      value: (row) => (
        <span className="text-gray-500">
          {row.governmentRegistrationLandNumber}
        </span>
      ),
      sortKey: "governmentRegistrationLandNumber",
      isSort: true,
    },
    {
      label: "Created Date",
      value: (row) => (
        <span className="text-gray-500">
          {new Date(row.createdDate).toLocaleDateString()}
        </span>
      ),
      sortKey: "createdDate",
      isSort: true,
    },
    {
      label: "Status",
      value: (row) => {
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
              row.statusId
            )}`}
          >
            {getStatusName(row.statusId)}
          </span>
        );
      },
      sortKey: "statusId",
      isSort: true,
    },
  ];

  // Action buttons configuration
  const actionButtons: ActionButton<DashboardRecord>[] = [
    {
      label: "View",
      iconType: "view",
      onClick: (row) => {
        navigate(`/service7-3/${row.requestId}`);
      },
      isVisible: () => true,
    },
    {
      label: "Publish",
      iconType: "publish",
      onClick: (row) => handlePublishAction(row),
      isVisible: (row) => row.statusId === StatusEnum.APPROVED,
    },
  ];

  if (loading && records.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && records.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/service-dashboard")}
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
                <span className="text-sm font-medium">
                  Back to Service Category
                </span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Medical Real Estate Services Dashboard
            </h1>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">244</h3>
            <p className="text-sm text-gray-600">Total Approved</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">22</h3>
            <p className="text-sm text-gray-600">Total Rejected</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">266</h3>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
        </div>

        {/* Bar Chart Section */}
        <div className="mb-8">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
              Report By Month
            </h3>
            <div className="h-64">
              <div className="flex h-full items-end justify-between gap-2">
                {[
                  { month: "Jan", value: 45 },
                  { month: "Feb", value: 67 },
                  { month: "March", value: 117 },
                  { month: "Apr", value: 89 },
                  { month: "May", value: 34 },
                  { month: "June", value: 22 },
                  { month: "July", value: 78 },
                  { month: "Aug", value: 56 },
                  { month: "Sept", value: 91 },
                  { month: "Oct", value: 43 },
                  { month: "Nov", value: 65 },
                  { month: "Dec", value: 38 },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div
                      className="w-8 bg-gray-800 rounded-t"
                      style={{ height: `${(item.value / 120) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-600">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <ComanTable
          columns={tableColumns}
          data={records}
          actions={actionButtons}
          page={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={handlePageChange}
          sortState={sortState}
          onSortChange={handleSortChange}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          loading={loading}
        />
      </div>

      {/* Reject Reason Modal - Same design as Service3DetailPage */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reason for Cancellation
              </h3>
              <button
                onClick={handleRejectCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason*
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Modal Footer */}
            <div className="flex justify-center">
              <button
                onClick={handleRejectSubmit}
                className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Service73Dashboard;
