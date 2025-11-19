import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../../components/common/ComanTable";
import IndividualClinicService from "../../services/IndividualClinicService";
import { useToast } from "../../components/ToastProvider";

interface DashboardRecord {
  requestId: number;
  requestNumber: string;
  orderTitle: string;
  rentPeriod: number;
  rentValue: number;
  createdDate: string;
  country: string;
  region: string;
  city: string;
  statusId: number;
  serviceId: number;
  serviceType: number;
  address: string;
  ownerName: string;
  clinicType: number;
  categoryId: number;
  buildingConstructionLicenseNumber: string;
  medicalLicenseNumber: string;
  unifiedNationalNumber: string;
  nationalAddress: string;
  governmentRegistrationLandNumber: string;
  propertyType: string;
  numberOfRooms: number;
  numberOfStreetsAroundClinic: number;
  isInsideHospital: boolean;
  isParkingAvailable: boolean;
  hasElectricityOnSite: boolean;
  hasWaterService: boolean;
  hasSewageExtension: boolean;
  hasTelephoneExtension: boolean;
  hasInternetFiberOptic: boolean;
  latitude: string;
  longitude: string;
  equipmentAvailable: string;
  equipmentDamageInfo: string;
  otherTermsAndConditions: string;
  rentHours: string;
  discountType: boolean;
  discountValue: number;
  needSecurityDeposit: boolean;
  isCommissionObligation: boolean;
  isOwnerRepairObligation: boolean;
  isOwnerConfirmed: boolean;
  commitmentHygienePractices: boolean;
  complianceWithHealthRegulations: boolean;
  isTermCondition: boolean;
  sendSMSOnContractOver: boolean;
  provideLabServices: boolean;
  provideMaintenanceServices: boolean;
  provideMedicalSupplies: boolean;
  provideNurseService: boolean;
  providePharmacy: boolean;
  provideReceptionService: boolean;
  provideSurgicalRoom: boolean;
  provideXRayServices: boolean;
  doctorConsultationPercentage: number;
  district: string;
  mediaFilePath: string;
  isActive: boolean;
  isAdminApprove: string;
  isClinic: number;
  createdBy: number;
  updatedBy: number;
  updatedDate: string;
  deletedBy: number | null;
  deletedDate: string | null;
  businessName: string | null;
  deviceApprovalNumber: string | null;
  deviceName: string | null;
  deviceType: string | null;
  fdaNumber: string | null;
  leftDays: number | null;
}

const Service22Dashboard = () => {
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

  const fetchDataFromAPI = async (): Promise<DashboardRecord[]> => {
    try {
      const response =
        await IndividualClinicService.GetAllClinicRentalServices(
          {
            pageNumber: pageNumber,
            pageSize: pageSize,
            orderByColumn: sortState.length > 0 ? sortState[0].key : "createdDate",
            orderDirection:
              sortState.length > 0 ? sortState[0].order.toUpperCase() : "DESC",
          }
        );

      if (response && response.success) {
        const responseData = (response as any).data;
        setTotalCount(responseData?.totalCount || 0);
        setTotalPages(responseData?.totalPages || Math.ceil((responseData?.totalCount || 0) / pageSize) || 1);
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
  }, [pageNumber, pageSize, sortState]);

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

  const handlePublishAction = async (row: DashboardRecord) => {
    try {
      setLoading(true);

      const response = await IndividualClinicService.ClinicRentalServicesApproveRejectByAdmin({
        requestId: row.requestId,
        newStatusId: 101, // Published status (assuming 101 is published)
        requestNumber: row.requestNumber,
        reason: "Order published by admin",
      });

      if (response && response.success) {
        // Refresh the data after successful publish
        const apiData = await fetchDataFromAPI();
        setRecords(apiData);
        showToast(
          `Order ${row.requestNumber} has been published successfully!`,
          "success"
        );
      } else {
        throw new Error(
          (response as any)?.message || "Failed to publish order"
        );
      }
    } catch (error) {
      console.error("Error publishing order:", error);
      showToast(
        `Failed to publish order ${row.requestNumber}. Please try again.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };


  const tableColumns: TableColumn<DashboardRecord>[] = [
    {
      label: "Order No",
      value: (row) => (
        <span className="font-semibold text-primary">#{row.requestId}</span>
      ),
      sortKey: "requestId",
      isSort: true,
    },
    {
      label: "Order Title",
      value: (row) => <span className="text-gray-700">{row.orderTitle}</span>,
      sortKey: "orderTitle",
      isSort: true,
    },
    {
      label: "Rent Period",
      value: (row) => (
        <span className="text-gray-500">{row.rentPeriod} {row.rentPeriod === 1 ? 'day' : 'days'}</span>
      ),
      sortKey: "rentPeriod",
      isSort: true,
    },
    {
      label: "Rent Value",
      value: (row) => (
        <span className="text-green-600 font-semibold">
          ${row.rentValue}
        </span>
      ),
      sortKey: "rentValue",
      isSort: true,
    },
    {
      label: "Date",
      value: (row) => (
        <span className="text-gray-500">
          {new Date(row.createdDate).toLocaleDateString()}
        </span>
      ),
      sortKey: "createdDate",
      isSort: true,
    },
    {
      label: "Country",
      value: (row) => <span className="text-gray-500">{row.country}</span>,
      sortKey: "country",
      isSort: true,
    },
    {
      label: "Region",
      value: (row) => (
        <span className="text-gray-500">{row.region}</span>
      ),
      sortKey: "region",
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
      label: "Status",
      value: (row) => {
        const getStatusBadgeClass = (statusId: number) => {
          switch (statusId) {
            case 100: return 'bg-yellow-100 text-yellow-800'; // Pending
            case 101: return 'bg-blue-100 text-blue-800'; // Approved
            case 102: return 'bg-green-100 text-green-800'; // Active
            case 103: return 'bg-red-100 text-red-800'; // Rejected
            case 104: return 'bg-gray-100 text-gray-800'; // Cancelled
            default: return 'bg-gray-100 text-gray-800';
          }
        };

        const getStatusName = (statusId: number) => {
          switch (statusId) {
            case 100: return 'Pending';
            case 101: return 'Approved';
            case 102: return 'Active';
            case 103: return 'Rejected';
            case 104: return 'Cancelled';
            default: return 'Unknown';
          }
        };

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(row.statusId)}`}
          >
            {getStatusName(row.statusId)}
          </span>
        );
      },
      sortKey: "statusId",
      isSort: true,
    },
  ];

  const actionButtons: ActionButton<DashboardRecord>[] = [
    {
      label: "View",
      iconType: "view",
      onClick: (row) => {
        navigate(`/service2-2/${row.requestId}`);
      },
      isVisible: () => true,
    },
    {
      label: "Publish",
      iconType: "publish",
      onClick: (row) => handlePublishAction(row),
      isVisible: (row) => row.statusId === 102, // Only show for Active status
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
              Clinic Rental Services Dashboard
            </h1>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">{totalCount}</h3>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">
              {records.filter(r => r.statusId === 102).length}
            </h3>
            <p className="text-sm text-gray-600">Active Orders</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">
              {records.filter(r => r.statusId === 100).length}
            </h3>
            <p className="text-sm text-gray-600">Pending Orders</p>
          </div>
        </div>

        <div className="mb-8">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
              Orders By Month
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
    </DashboardLayout>
  );
};

export default Service22Dashboard;

