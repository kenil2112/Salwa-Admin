import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import OfficeStationaryService, {
  type OfficeStationaryParams,
  type DoctorUniformRecord,
  type DoctorUniformStatus,
} from "../services/OfficeStationaryService";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../components/common/ComanTable";
import { useToast } from "../components/ToastProvider";
import {
  getStatusBadgeClass,
  getStatusName,
  StatusEnum,
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

// Status action labels for doctor uniform clothing
export const StatusActionLabel = {
  approve: "Approve",
  reject: "Reject",
  markInProgress: "Mark In Progress",
  markCompleted: "Mark Completed",
  markCancelled: "Cancel",
  reopen: "Reopen",
};

// Status badge classes for doctor uniform clothing
export const STATUS_BADGE_CLASSES: Record<DoctorUniformStatus, string> = {
  Pending: "border border-amber-200 bg-amber-50 text-amber-700",
  Approved: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  Rejected: "border border-rose-200 bg-rose-50 text-rose-700",
  InProgress: "border border-blue-200 bg-blue-50 text-blue-700",
  Completed: "border border-green-200 bg-green-50 text-green-700",
  Cancelled: "border border-gray-200 bg-gray-50 text-gray-700",
  Published: "border border-purple-200 bg-purple-50 text-purple-700",
};

// Action button classes
export const PRIMARY_ACTION_CLASSES =
  "rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white shadow transition hover:bg-[#030447]";
export const DANGER_ACTION_CLASSES =
  "rounded-full bg-red-600 px-4 py-1 text-xs font-semibold text-white shadow transition hover:bg-red-700";
export const OUTLINE_ACTION_CLASSES =
  "rounded-full border border-gray-300 px-4 py-1 text-xs font-semibold text-gray-700 shadow transition hover:bg-gray-50";
export const SUCCESS_ACTION_CLASSES =
  "rounded-full bg-green-600 px-4 py-1 text-xs font-semibold text-white shadow transition hover:bg-green-700";

interface LocationState {
  category?: Category;
  service?: Service;
}

const Service3ManagementPage = () => {
  const { categoryId, serviceId, action } = useParams<{
    categoryId: string;
    serviceId: string;
    action: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { showToast } = useToast();

  const [category, setCategory] = useState<Category | null>(null);
  const [uniforms, setUniforms] = useState<DoctorUniformRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortState, setSortState] = useState<SortState[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // API call to fetch doctor uniform clothing data
  const fetchDoctorUniformData = async (
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
        await OfficeStationaryService.GetDoctorUniformClothingGetAll(params);

      if (response?.success && response?.data) {
        const data = response.data;

        // Handle different response structures
        let uniformsData = data;
        if (Array.isArray(data)) {
          uniformsData = data;
        } else if (data.data && Array.isArray(data.data)) {
          uniformsData = data.data;
        } else if (data.result && Array.isArray(data.result)) {
          uniformsData = data.result;
        }

        setUniforms(uniformsData || []);
        setTotalCount(uniformsData?.length || 0);
        setTotalPages(Math.ceil((uniformsData?.length || 0) / currentPageSize));
      } else {
        console.error("API Response Error:", response);
        throw new Error(
          response?.message || "Failed to fetch doctor uniform data"
        );
      }
    } catch (err) {
      console.error("Error fetching doctor uniform data:", err);
      setError("Failed to load doctor uniform data");
      setUniforms([]);
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

        // Fetch doctor uniform data
        await fetchDoctorUniformData(1, searchText, pageSize);
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
    fetchDoctorUniformData(page, searchText, pageSize);
  };

  // Handle search
  const handleSearch = () => {
    setPageNumber(1);
    fetchDoctorUniformData(1, searchText, pageSize);
  };

  // Handle sort change
  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
    fetchDoctorUniformData(1, searchText, size);
  };

  // Handle status update
  const handlePublishAction = async (uniform: DoctorUniformRecord) => {
    try {
      // Map status to correct status ID

      const response =
        await OfficeStationaryService.UpdateDoctorUniformClothingStatus({
          RequestId: uniform.RequestId || uniform.requestId || 0,
          NewStatusId: StatusEnum?.PUBLISHED,
          RequestNumber: uniform.RequestNumber || uniform.requestNumber || "",
          Reason: ``,
        });

      if (response?.success) {
        showToast(`Status updated to Published`, "success");
        // Refresh the data
        await fetchDoctorUniformData(pageNumber, searchText, pageSize);
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Failed to update status", "error");
    }
  };

  // Table columns configuration - updated to match API response
  const tableColumns: TableColumn<DoctorUniformRecord>[] = [
    {
      label: "Order No",
      value: (row) => (
        <span className="font-semibold text-primary">
          #{String(row.requestId || row.RequestId || "0000").padStart(4, "0")}
        </span>
      ),
      sortKey: "requestId",
      isSort: true,
    },
    {
      label: "Order Title",
      value: (row) => (
        <span className="text-gray-700">
          {row.orderTitle || row.OrderTitle || "N/A"}
        </span>
      ),
      sortKey: "orderTitle",
      isSort: true,
    },
    {
      label: "Uniform Type",
      value: (row) => (
        <span className="text-gray-700">
          {row.uniformTypeName || row.UniformTypeName || "N/A"}
        </span>
      ),
      sortKey: "uniformTypeName",
      isSort: true,
    },
    {
      label: "Gender",
      value: (row) => (
        <span className="text-gray-700">
          {row.genderName || row.GenderName || "N/A"}
        </span>
      ),
      sortKey: "genderName",
      isSort: true,
    },
    {
      label: "Size",
      value: (row) => (
        <span className="text-gray-700">{row.size || row.Size || "N/A"}</span>
      ),
      sortKey: "size",
      isSort: true,
    },
    {
      label: "Color",
      value: (row) => (
        <span className="text-gray-700">{row.color || row.Color || "N/A"}</span>
      ),
      sortKey: "color",
      isSort: true,
    },
    {
      label: "Contact Person",
      value: (row) => (
        <span className="text-gray-700">
          {row.contactPersonName || row.ContactPersonName || "N/A"}
        </span>
      ),
      sortKey: "contactPersonName",
      isSort: true,
    },
    {
      label: "Country",
      value: (row) => (
        <span className="text-gray-700">
          {row.country || row.Country || "N/A"}
        </span>
      ),
      sortKey: "country",
      isSort: true,
    },
    {
      label: "Region",
      value: (row) => (
        <span className="text-gray-700">
          {row.region || row.Region || "N/A"}
        </span>
      ),
      sortKey: "region",
      isSort: true,
    },
    {
      label: "City",
      value: (row) => (
        <span className="text-gray-700">{row.city || row.City || "N/A"}</span>
      ),
      sortKey: "city",
      isSort: true,
    },
    {
      label: "Status",
      value: (row) => {
        const statusName = row.statusName || row.StatusName;
        const statusId = row.statusId || row.StatusId || 1; // Default to 1 (Pending) if undefined
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
              statusId
            )}`}
          >
            {statusName || getStatusName(statusId)}
          </span>
        );
      },
      sortKey: "statusId",
      isSort: true,
    },
  ];

  // Action buttons configuration - updated with proper conditions
  const actionButtons: ActionButton<DoctorUniformRecord>[] = [
    {
      label: "View",
      iconType: "view",
      onClick: (row) => {
        // Navigate to uniform detail page
        navigate(`/service3-detail/${row.RequestNumber || row.requestNumber}`, {
          state: { uniformData: row },
        });
      },
      isVisible: () => true, // View button always visible
    },

    {
      label: "Publish",
      iconType: "publish",
      onClick: (row) => handlePublishAction(row),
      isVisible: (row) => row.StatusId === StatusEnum.APPROVED,
    },
  ];

  if (loading && uniforms.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading uniform data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && uniforms.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchDoctorUniformData(1, searchText, pageSize)}
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
                Doctor Uniform Clothing Management
              </h1>
              <p className="text-sm text-gray-500">
                {category?.title} - Service Index 3 - {action?.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="search"
                    placeholder="Search uniforms..."
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
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-8 w-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              {
                uniforms.filter(
                  (uniform) =>
                    (uniform.statusName || uniform.StatusName) === "Pending"
                ).length
              }
            </h3>
            <p className="text-sm text-gray-600">Pending Orders</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
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
                uniforms.filter(
                  (uniform) =>
                    (uniform.statusName || uniform.StatusName) === "Approved"
                ).length
              }
            </h3>
            <p className="text-sm text-gray-600">Approved</p>
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              {
                uniforms.filter(
                  (uniform) =>
                    (uniform.statusName || uniform.StatusName) === "InProgress"
                ).length
              }
            </h3>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
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
                uniforms.filter(
                  (uniform) =>
                    (uniform.statusName || uniform.StatusName) === "Completed"
                ).length
              }
            </h3>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>

        {/* Uniforms Table using ComanTable */}
        <ComanTable
          columns={tableColumns}
          data={uniforms}
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

export default Service3ManagementPage;
