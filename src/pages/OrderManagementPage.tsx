import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import OfficeStationaryService, {
  type OfficeStationaryParams,
} from "../services/OfficeStationaryService";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../components/common/ComanTable";
import {
  StatusEnum,
  getStatusName,
  getStatusBadgeClass,
} from "../utils/statusEnum";
import { useToast } from "../components/ToastProvider";

interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  hasSubServices?: boolean;
  categoryId?: string;
  serviceId?: string;
  serviceTitle?: string;
}

interface Category {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface OrderRecord {
  id: number;
  requestId: string;
  requestNumber: string;
  orderTitle: string;
  buildingConstructionLicenseNumber: string;
  medicalLicenseNumberForBuilding: string;
  numberOfEmployeesOnWorksite: number;
  fdaRegistrationNumber: string;
  rentPeriod: string;
  email: string;
  country: string;
  region: string;
  city: string;
  uploadDate: string;
  status:
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Published"
  | "Expired"
  | "FullFilled"
  | "Approved By Government"
  | "Check In"
  | "Check Out"
  | "Rejected by Government";
  createdDate?: string;
  updatedDate?: string;
}

interface LocationState {
  category?: Category;
  service?: Service;
}

const OrderManagementPage = () => {
  const { categoryId, serviceId } = useParams<{
    categoryId: string;
    serviceId: string;
    action: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { showToast } = useToast();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText] = useState("");
  const [sortState, setSortState] = useState<SortState[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // API call to fetch office stationary data
  const fetchOfficeStationaryData = async (
    page: number = 1,
    query: string = "",
    currentPageSize: number = pageSize
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params: OfficeStationaryParams = {
        searchText: query,
        pageNumber: page,
        pageSize: currentPageSize,
        orderByColumn: "RequestId",
        orderDirection: "DESC",
      };

      const response: any =
        await OfficeStationaryService.OfficeStationarySectorGetAll(params);

      if (response?.success && response?.data) {
        const data = response.data?.data;

        if (Array.isArray(data)) {
          // Transform API data to match our OrderRecord interface
          const transformedOrders: OrderRecord[] = data.map(
            (item: any, index: number) => ({
              id: item.requestId || index + 1,
              requestId:
                item.requestNumber || `#${String(index + 1).padStart(4, "0")}`,
              requestNumber:
                item.requestNumber || `R${item.requestId || index + 1}`,
              orderTitle:
                item.postTimeValidityName ||
                item.otherDetails ||
                "Medical Supplies Request",
              buildingConstructionLicenseNumber:
                item.locationId?.toString() || "7",
              medicalLicenseNumberForBuilding:
                item.serviceId?.toString() || "12",
              numberOfEmployeesOnWorksite: item.totalQuantity || 710,
              fdaRegistrationNumber: item.categoryId?.toString() || "5",
              rentPeriod: `${item.choosePostTimeValidityTime || 30} Days`,
              email: item.contactPersonEmail || "johndoe@example.com",
              country: "India", // Default since not in this data structure
              region: "Gujarat", // Default since not in this data structure
              city: "Ahmedabad", // Default since not in this data structure
              uploadDate: item.createdDate
                ? new Date(item.createdDate).toLocaleDateString()
                : new Date().toLocaleDateString(),
              status: getStatusName(item.statusId) as
                | "Pending"
                | "Approved"
                | "Rejected"
                | "Published"
                | "Expired"
                | "FullFilled"
                | "Approved By Government"
                | "Check In"
                | "Check Out"
                | "Rejected by Government",
              createdDate: item.createdDate || new Date().toISOString(),
              updatedDate: item.updatedDate || new Date().toISOString(),
            })
          );

          setOrders(transformedOrders);
          setTotalCount(response.data.totalRecords);
          setTotalPages(
            Math.ceil(response.data.totalRecords / currentPageSize)
          );
        } else {
          setOrders([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      } else {
        throw new Error(
          response?.message || "Failed to fetch office stationary data"
        );
      }
    } catch (err) {
      console.error("Error fetching office stationary data:", err);
      setError("Failed to load office stationary data");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set category from state
        if (state?.category) {
          // Category is set from state but not used in this component
        }

        // Fetch office stationary data
        await fetchOfficeStationaryData(1, searchText, pageSize);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, serviceId, state]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setPageNumber(page);
    fetchOfficeStationaryData(page, searchText, pageSize);
  };

  // Handle sort change
  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
    fetchOfficeStationaryData(1, searchText, size);
  };

  // Handle publish action
  const handlePublish = async (row: OrderRecord) => {
    try {
      const requestData = {
        requestId: row.id,
        newStatusId: StatusEnum.PUBLISHED, // 102
        userId: 0,
        requestNumber: row.requestNumber,
        reason: "",
      };

      const response =
        await OfficeStationaryService.UpdateOfficeStationaryStatus(requestData);

      if (response?.success) {
        showToast("Order published successfully!", "success");
        // Refresh the data
        fetchOfficeStationaryData(pageNumber, searchText, pageSize);
      } else {
        showToast(
          (response as any)?.message || "Failed to publish order",
          "error"
        );
      }
    } catch (error) {
      console.error("Error publishing order:", error);
      showToast("An error occurred while publishing the order", "error");
    }
  };

  // Table columns configuration
  const tableColumns: TableColumn<OrderRecord>[] = [
    {
      label: "Order No",
      value: (row) => (
        <span className="font-semibold text-primary">{row.requestNumber}</span>
      ),
      sortKey: "requestNumber",
      isSort: true,
    },
    {
      label: "Service Type",
      value: (row) => <span className="text-gray-700">{row.orderTitle}</span>,
      sortKey: "orderTitle",
      isSort: true,
    },
    {
      label: "Location ID",
      value: (row) => (
        <span className="text-gray-500">
          {row.buildingConstructionLicenseNumber}
        </span>
      ),
      sortKey: "buildingConstructionLicenseNumber",
      isSort: true,
    },
    {
      label: "Service ID",
      value: (row) => (
        <span className="text-gray-500">
          {row.medicalLicenseNumberForBuilding}
        </span>
      ),
      sortKey: "medicalLicenseNumberForBuilding",
      isSort: true,
    },
    {
      label: "Total Quantity",
      value: (row) => (
        <span className="text-gray-500">{row.numberOfEmployeesOnWorksite}</span>
      ),
      sortKey: "numberOfEmployeesOnWorksite",
      isSort: true,
    },
    {
      label: "Category ID",
      value: (row) => (
        <span className="text-gray-500">{row.fdaRegistrationNumber}</span>
      ),
      sortKey: "fdaRegistrationNumber",
      isSort: true,
    },
    {
      label: "Validity Period",
      value: (row) => <span className="text-gray-500">{row.rentPeriod}</span>,
      sortKey: "rentPeriod",
      isSort: true,
    },
    {
      label: "Email",
      value: (row) => <span className="text-gray-500">{row.email}</span>,
      sortKey: "email",
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
      value: (row) => <span className="text-gray-500">{row.region}</span>,
      sortKey: "region",
      isSort: true,
    },
    {
      label: "City",
      value: (row) => <span className="text-gray-500">{row.city}</span>,
      sortKey: "city",
      isSort: true,
    },
    {
      label: "Upload Date",
      value: (row) => <span className="text-gray-500">{row.uploadDate}</span>,
      sortKey: "uploadDate",
      isSort: true,
    },
    {
      label: "Status",
      value: (row) => {
        // Get the original statusId from the data to use with enum functions
        const statusId = (() => {
          switch (row.status) {
            case "Pending":
              return 99;
            case "Approved":
              return 100;
            case "Rejected":
              return 101;
            case "Published":
              return 102;
            case "Expired":
              return 103;
            case "FullFilled":
              return 104;
            case "Approved By Government":
              return 105;
            case "Check In":
              return 115;
            case "Check Out":
              return 116;
            case "Rejected by Government":
              return 128;
            default:
              return 99;
          }
        })();

        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
              statusId
            )}`}
          >
            {row.status}
          </span>
        );
      },
      sortKey: "status",
      isSort: true,
    },
  ];

  // Action buttons configuration
  const actionButtons: ActionButton<OrderRecord>[] = [
    {
      label: "View",
      iconType: "view",
      onClick: (row) => {
        // Navigate to order detail page
        navigate(`/order-detail/${row.requestNumber}`, {
          state: { orderData: row },
        });
      },
    },

    {
      label: "Publish",
      iconType: "publish",
      onClick: handlePublish,
      isVisible: (row) => row.status === "Approved", // Only show if status is Approved
    },
  ];

  if (loading && orders.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading order data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && orders.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchOfficeStationaryData(1, searchText, pageSize)}
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

        {/* Orders Table using ComanTable */}
        <ComanTable
          columns={tableColumns}
          data={orders}
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

export default OrderManagementPage;
