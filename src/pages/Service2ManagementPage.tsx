import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { useToast } from "../components/ToastProvider";
import OfficeStationaryService, {
  type OfficeStationaryParams,
  type UpdateHealthMarketPlaceStatusParams,
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
  id: number | string;
  requestId: number | string;
  itemName: string;
  itemQuantity: number;
  weight: number;
  RequestNumber: string;
  status: number; // Status ID from StatusEnum
  createdDate?: string;
  updatedDate?: string;
}

interface LocationState {
  category?: Category;
  service?: Service;
}

const Service2ManagementPage = () => {
  const { categoryId, serviceId, action } = useParams<{
    categoryId: string;
    serviceId: string;
    action: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const state = location.state as LocationState;

  const [category, setCategory] = useState<Category | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortState, setSortState] = useState<SortState[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // API call to fetch service 2 data
  const fetchService2Data = async (
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
        await OfficeStationaryService.HealthMarketPlaceServicesGetAll(params);

      if (response?.success && response?.data) {
        const data = response.data?.data;

        if (Array.isArray(data)) {
          // Transform API data to match our OrderRecord interface
          const transformedOrders: OrderRecord[] = data.map(
            (item: any, index: number) => {
              const order = {
                id: item.id || item.requestId || index + 1,
                requestId:
                  item.requestId || `#${String(index + 1).padStart(4, "0")}`,
                itemName:
                  item.itemName || item.name || item.itemTitle || "Office Item",
                RequestNumber: item.RequestNumber,
                itemQuantity:
                  item.quantity ||
                  item.itemQuantity ||
                  Math.floor(Math.random() * 1000) + 100,
                weight:
                  item.weight || parseFloat((Math.random() * 100).toFixed(1)),
                status: item.StatusId,
                createdDate: item.createdDate || item.date || item.requestDate,
                updatedDate: item.updatedDate || item.modifiedDate,
              };

              return order;
            }
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
        throw new Error(response?.message || "Failed to fetch service 2 data");
      }
    } catch (err) {
      console.error("Error fetching health marketplace services data:", err);
      setError("Failed to load health marketplace services data");
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
          setCategory(state.category);
        }

        // Fetch service 2 data
        await fetchService2Data(1, searchText, pageSize);
      } catch (err) {
        console.error("Error fetching health marketplace services data:", err);
        setError("Failed to load health marketplace services data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, serviceId, state]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setPageNumber(page);
    fetchService2Data(page, searchText, pageSize);
  };

  // Handle search
  const handleSearch = () => {
    setPageNumber(1);
    fetchService2Data(1, searchText, pageSize);
  };

  // Handle sort change
  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
    fetchService2Data(1, searchText, size);
  };

  // Handle publish action
  const handlePublish = async (order: OrderRecord) => {
    try {
      console.log("Publishing order:", order.requestId);

      // Prepare API payload
      const payload: UpdateHealthMarketPlaceStatusParams = {
        requestId: order.id, // Use the order ID
        newStatusId: StatusEnum.PUBLISHED, // 102
        userId: 0, // You may need to get this from user context
        requestNumber: order.RequestNumber, // Use RequestNumber as requestNumber
        reason: "", // Empty reason as specified
      };

      // Call the API
      const response =
        await OfficeStationaryService.UpdateHealthMarketPlaceServicesStatus(
          payload
        );

      if (response?.success) {
        showToast(
          `Order ${order.requestId} published successfully!`,
          "success"
        );
        // Refresh the data
        await fetchService2Data(pageNumber, searchText, pageSize);
      } else {
        const errorMessage =
          response && "message" in response
            ? response.message
            : "Failed to publish order";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error publishing order:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to publish order. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  // Table columns configuration
  const tableColumns: TableColumn<OrderRecord>[] = [
    {
      label: "Order No",
      value: (row) => (
        <span className="font-semibold text-primary">{row.requestId}</span>
      ),
      sortKey: "requestId",
      isSort: true,
    },
    {
      label: "Item Name",
      value: (row) => <span className="text-gray-700">{row.itemName}</span>,
      sortKey: "itemName",
      isSort: true,
    },
    {
      label: "Item Quantity",
      value: (row) => <span className="text-gray-500">{row.itemQuantity}</span>,
      sortKey: "itemQuantity",
      isSort: true,
    },
    {
      label: "Weight",
      value: (row) => <span className="text-gray-500">{row.weight} kg</span>,
      sortKey: "weight",
      isSort: true,
    },
    {
      label: "Status",
      value: (row) => {
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
              row.status
            )}`}
          >
            {getStatusName(row.status)}
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
      onClick: (row: OrderRecord) => {
        // Navigate to service detail page
        navigate(`/service2-detail/${row.RequestNumber}`, {
          state: { serviceData: row },
        });
      },
    },

    {
      label: "Publish",
      iconType: "publish",
      onClick: (row: OrderRecord) => handlePublish(row),
      isVisible: (row: OrderRecord) => {
        const isVisible = row.status === StatusEnum.APPROVED;
        return isVisible;
      },
    },
  ];

  if (loading && orders.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">
              Loading health marketplace services data...
            </p>
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
              onClick={() => fetchService2Data(1, searchText, pageSize)}
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Health Marketplace Services Management
              </h1>
              <p className="text-sm text-gray-500">
                {category?.title} - Service Index 2 - {action?.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search health marketplace services..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-64 rounded-full border border-slate-200 bg-white px-5 py-2 pl-10 pr-4 text-sm text-gray-600 shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-primary/70">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]"
                >
                  Search
                </button>
              </div>
              <button
                type="button"
                className="rounded-full border border-gray-200 px-6 py-2 text-sm font-semibold text-primary shadow-sm transition hover:border-primary"
                onClick={() => navigate("/service-dashboard")}
              >
                Back to Service Category
              </button>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              {
                orders.filter(
                  (order) =>
                    order.status === StatusEnum.APPROVED ||
                    order.status === StatusEnum.APPROVED_BY_GOVERNMENT
                ).length
              }
            </h3>
            <p className="text-sm text-gray-600">Total Approved</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <svg
                className="h-8 w-8 text-rose-600"
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
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              {
                orders.filter(
                  (order) =>
                    order.status === StatusEnum.REJECTED ||
                    order.status === StatusEnum.REJECTED_BY_GOVERNMENT
                ).length
              }
            </h3>
            <p className="text-sm text-gray-600">Total Rejected</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              {totalCount}
            </h3>
            <p className="text-sm text-gray-600">Total Items</p>
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

export default Service2ManagementPage;
