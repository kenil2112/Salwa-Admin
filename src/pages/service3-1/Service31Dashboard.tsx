import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../../components/common/ComanTable";
import MedicalEquipmentAndFacilitiesService from "../../services/MedicalEquipmentAndFacilitiesService";
import { useToast } from "../../components/ToastProvider";
import {
  getStatusBadgeClass,
  getStatusName,
  StatusEnum,
} from "../../utils/statusEnum";

interface DashboardRecord {
  RequestId: number;
  RequestNumber: string;
  OrderTitle: string;
  BusinessName: string;
  DeviceName: string;
  DeviceTypeName: string;
  FDANumber: string;
  DeviceApprovalNumber: string;
  SellValue: number;
  CreatedDate: string;
  UpdatedDate: string;
  Country: string | null;
  Region: string | null;
  City: string | null;
  StatusId: number;
  StatusName: string;
  DayLeft: string;
  ContactPersonName: string;
  ContactPersonEmail: string;
  CategoryId: number;
  ServiceId: number;
  ServiceType: number;
  DeviceServiceType: number;
  DiscountType: boolean;
  DiscountValue: number;
  EquipmentDamageInfo: string;
  IsActive: boolean;
  IsAdminApprove: boolean;
  IsConfirmedOwner: boolean;
  IsSterilizationConfirmed: boolean;
  IsTermCondition: boolean;
  MediaFilePath: string;
  OrderPostValidityTime: number;
  OrderPostValidityTimeName: string;
  OtherTermsAndConditions: string;
  PostValidityTime: number;
  PostValidityTimeName: string;
  CreatedBy: number;
  UpdatedBy: number;
  DeletedBy: number | null;
  DeletedDate: string | null;
  RowNum: number;
}

const Service31Dashboard = () => {
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

  console.log(records);

  const fetchDataFromAPI = async (): Promise<DashboardRecord[]> => {
    try {
      const response =
        await MedicalEquipmentAndFacilitiesService.GetAllMedicalSellServices(
          {
            pageNumber: pageNumber,
            pageSize: pageSize,
            orderByColumn: sortState.length > 0 ? sortState[0].key : "CreatedDate",
            orderDirection:
              sortState.length > 0 ? sortState[0].order.toUpperCase() : "DESC",
          }
        );

      if (response && response.success) {
        console.log(response);

        const responseData = (response as any).data;
        const totalCount = responseData?.totalCount || 0;
        const apiTotalPages = responseData?.totalPages;

        const calculatedTotalPages =
          apiTotalPages || Math.ceil(totalCount / pageSize) || 1;

        setTotalCount(totalCount);
        setTotalPages(calculatedTotalPages);
        console.log(responseData, "dsfsd");

        return responseData || [];
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

      const response = await MedicalEquipmentAndFacilitiesService.UpdateMedicalSellServiceStatus({
        requestId: row.RequestId,
        newStatusId: StatusEnum.PUBLISHED,
        requestNumber: row.RequestNumber,
        reason: "Request published by admin",
      });

      if (response && response.success) {
        await fetchDataFromAPI();
        showToast(
          `Request ${row.RequestNumber} has been published successfully!`,
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
        `Failed to publish request ${row.RequestNumber}. Please try again.`,
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
        <span className="font-semibold text-primary">#{String(row.RequestId).padStart(4, '0')}</span>
      ),
      sortKey: "RequestId",
      isSort: true,
    },
    {
      label: "Order Title",
      value: (row) => <span className="text-gray-700">{row.OrderTitle}</span>,
      sortKey: "OrderTitle",
      isSort: true,
    },
    {
      label: "Device Name",
      value: (row) => (
        <span className="text-gray-700">{row.DeviceName}</span>
      ),
      sortKey: "DeviceName",
      isSort: true,
    },
    {
      label: "Device Type",
      value: (row) => <span className="text-gray-500">{row.DeviceTypeName}</span>,
      sortKey: "DeviceTypeName",
      isSort: true,
    },
    {
      label: "FDA Number",
      value: (row) => <span className="text-gray-500">{row.FDANumber}</span>,
      sortKey: "FDANumber",
      isSort: true,
    },
    {
      label: "Device Approval Number",
      value: (row) => <span className="text-gray-500">{row.DeviceApprovalNumber}</span>,
      sortKey: "DeviceApprovalNumber",
      isSort: true,
    },
    {
      label: "Sell Value",
      value: (row) => (
        <span className="text-gray-500 font-semibold">SAR {row.SellValue}</span>
      ),
      sortKey: "SellValue",
      isSort: true,
    },
    {
      label: "Date",
      value: (row) => (
        <span className="text-gray-500">
          {new Date(row.CreatedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
          })}
        </span>
      ),
      sortKey: "CreatedDate",
      isSort: true,
    },
    {
      label: "Country",
      value: (row) => (
        <span className="text-gray-500">{row.Country || 'N/A'}</span>
      ),
      sortKey: "Country",
      isSort: true,
    },
    {
      label: "Region",
      value: (row) => (
        <span className="text-gray-500">{row.Region || 'N/A'}</span>
      ),
      sortKey: "Region",
      isSort: true,
    },
    {
      label: "City",
      value: (row) => (
        <span className="text-gray-500">{row.City || 'N/A'}</span>
      ),
      sortKey: "City",
      isSort: true,
    },
    {
      label: "Status",
      value: (row) => {
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
              row.StatusId
            )}`}
          >
            {getStatusName(row.StatusId)}
          </span>
        );
      },
      sortKey: "StatusName",
      isSort: true,
    },
  ];

  const actionButtons: ActionButton<DashboardRecord>[] = [
    {
      label: "View",
      iconType: "view",
      onClick: (row) => {
        console.log(row);
        navigate(`/service3-1/${row.RequestNumber}`);
      },
      isVisible: () => true,
    },
    {
      label: "Publish",
      iconType: "publish",
      onClick: (row) => handlePublishAction(row),
      isVisible: (row) => row.StatusId === StatusEnum.APPROVED,
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
              Service 3-1 Dashboard
            </h1>
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

export default Service31Dashboard;

