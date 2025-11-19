import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../../components/common/ComanTable";
import IndividualClinicService from "../../services/IndividualClinicService";
import { useToast } from "../../components/ToastProvider";
import {
  getStatusBadgeClass,
  getStatusName,
  StatusEnum,
} from "../../utils/statusEnum";


interface RentalMedicalEquipmentRecord {
  requestId: number;
  requestNumber: string;
  orderTitle: string;
  businessName: string;
  contactPersonName: string;
  contactPersonEmail: string;
  address: string;
  city: string;
  district: string;
  region: string;
  country: string;
  nationalAddress: string;
  latitude: string;
  longitude: string;
  facilityType: number;
  facilityTypeName: string;
  providerType: number;
  providerTypeName: string;
  categoryId: number;
  serviceId: number;
  statusId: number;
  statusName: string;
  createdDate: string;
  rentPeriodId: number;
  rentPeriodName: string;
  rentValue: number;
  discountTypeId: number;
  discountValue: number;
  postValidityTimeId: number;
  postValidityTimeName: string;
  leftDays: string;
  fdaDeviceLicenseNumber: string;
  healthRegistrationNumber: string;
  mediaURL: string;
  otherTermsAndCondition: string;
  isTermCondition: boolean;
  locationId: number;
}

const Service41Dashboard = () => {
  const { subserviceIndex } = useParams<{
    subserviceIndex?: string;
  }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [rentalMedicalEquipmentRecords, setRentalMedicalEquipmentRecords] = useState<
    RentalMedicalEquipmentRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortState, setSortState] = useState<SortState[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRentalMedicalEquipmentDataFromAPI = async (): Promise<
    RentalMedicalEquipmentRecord[]
  > => {
    try {
      const response = await IndividualClinicService.GetAllClinicRentalServices({
        pageNumber: pageNumber,
        pageSize: pageSize,
        orderByColumn: sortState.length > 0 ? sortState[0].key : "CreatedDate",
        orderDirection:
          sortState.length > 0 ? sortState[0].order.toUpperCase() : "DESC",
      });

      if (response && response.success) {
        const responseData = (response as any).data;
        const totalCount = responseData?.totalCount || 0;
        const apiTotalPages = responseData?.totalPages;

        const calculatedTotalPages =
          apiTotalPages || Math.ceil(totalCount / pageSize) || 1;

        setTotalCount(totalCount);
        setTotalPages(calculatedTotalPages);

        return responseData?.data || [];
      } else {
        throw new Error(
          (response as any)?.message || "Failed to fetch rental medical equipment data"
        );
      }
    } catch (error) {
      console.error("Error fetching rental medical equipment data from API:", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiData = await fetchRentalMedicalEquipmentDataFromAPI();
        setRentalMedicalEquipmentRecords(apiData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subserviceIndex, pageNumber, pageSize, sortState]);

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  const handlePublishRentalMedicalEquipmentAction = async (row: RentalMedicalEquipmentRecord) => {
    try {
      setLoading(true);

      const response =
        await IndividualClinicService.ClinicRentalServicesApproveRejectByAdmin({
          requestId: row.requestId,
          newStatusId: StatusEnum.PUBLISHED,
          requestNumber: row.requestNumber,
          reason: "Rental medical equipment published by admin",
        });

      if (response && response.success) {
        await fetchRentalMedicalEquipmentDataFromAPI();

        showToast(
          `Rental medical equipment ${row.requestNumber} has been published successfully!`,
          "success"
        );
      } else {
        throw new Error(
          (response as any)?.message ||
          "Failed to publish rental medical equipment"
        );
      }
    } catch (error) {
      console.error("Error publishing rental medical equipment:", error);
      showToast(
        `Failed to publish rental medical equipment ${row.requestNumber}. Please try again.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const rentalMedicalEquipmentTableColumns: TableColumn<RentalMedicalEquipmentRecord>[] = [
    {
      label: "Request Number",
      value: (row) => (
        <span className="font-semibold text-primary">{row.requestNumber}</span>
      ),
      sortKey: "requestNumber",
      isSort: true,
    },
    {
      label: "Order Title",
      value: (row) => <span className="text-gray-700">{row.orderTitle}</span>,
      sortKey: "orderTitle",
      isSort: true,
    },
    {
      label: "Business Name",
      value: (row) => <span className="text-gray-500">{row.businessName}</span>,
      sortKey: "businessName",
      isSort: true,
    },
    {
      label: "Contact Person",
      value: (row) => <span className="text-gray-500">{row.contactPersonName}</span>,
      sortKey: "contactPersonName",
      isSort: true,
    },
    {
      label: "Contact Email",
      value: (row) => <span className="text-gray-500">{row.contactPersonEmail}</span>,
      sortKey: "contactPersonEmail",
      isSort: true,
    },
    {
      label: "Address",
      value: (row) => <span className="text-gray-500">{row.address}</span>,
      sortKey: "address",
      isSort: true,
    },
    {
      label: "City",
      value: (row) => (
        <span className="text-gray-500">{row.city}</span>
      ),
      sortKey: "city",
      isSort: true,
    },
    {
      label: "District",
      value: (row) => (
        <span className="text-gray-500">{row.district}</span>
      ),
      sortKey: "district",
      isSort: true,
    },
    {
      label: "Facility Type",
      value: (row) => (
        <span className="text-gray-500">{row.facilityTypeName}</span>
      ),
      sortKey: "facilityTypeName",
      isSort: true,
    },
    {
      label: "Provider Type",
      value: (row) => <span className="text-gray-500">{row.providerTypeName}</span>,
      sortKey: "providerTypeName",
      isSort: true,
    },
    {
      label: "Rent Period",
      value: (row) => (
        <span className="text-gray-500">{row.rentPeriodName}</span>
      ),
      sortKey: "rentPeriodName",
      isSort: true,
    },
    {
      label: "Rent Value",
      value: (row) => (
        <span className="text-gray-500 font-semibold">${row.rentValue}</span>
      ),
      sortKey: "rentValue",
      isSort: true,
    },
    {
      label: "Validity",
      value: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${row.leftDays === "Expire"
              ? "bg-red-100 text-red-800"
              : row.leftDays === "Soon"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
        >
          {row.leftDays}
        </span>
      ),
      sortKey: "leftDays",
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
      sortKey: "statusName",
      isSort: true,
    },
  ];

  const rentalMedicalEquipmentActionButtons: ActionButton<RentalMedicalEquipmentRecord>[] = [
    {
      label: "View",
      iconType: "view",
      onClick: (row: any) => {
        navigate(`/service4-1/${row.requestNumber}`);
      },
      isVisible: () => true,
    },
    {
      label: "Publish",
      iconType: "publish",
      onClick: (row) => handlePublishRentalMedicalEquipmentAction(row),
      isVisible: (row) => row.statusId === StatusEnum.APPROVED,
    },
  ];

  // Separate render functions for each table type to handle TypeScript properly

  const renderRentalMedicalEquipmentTable = () => (
    <ComanTable
      columns={rentalMedicalEquipmentTableColumns}
      data={rentalMedicalEquipmentRecords}
      actions={rentalMedicalEquipmentActionButtons}
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
  );

  if (loading && rentalMedicalEquipmentRecords.length === 0) {
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

  if (error && rentalMedicalEquipmentRecords.length === 0) {
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Rental Medical Equipment Dashboard
              </h1>

              {/* Tab Navigation */}
            </div>
          </div>
        </header>

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

        {renderRentalMedicalEquipmentTable()}
      </div>
    </DashboardLayout>
  );
};

export default Service41Dashboard;
