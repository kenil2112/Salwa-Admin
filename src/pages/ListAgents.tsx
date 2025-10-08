import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../layouts/DashboardLayout";
import type { AgentRow, TabKey } from "../data/agents";
import AgentServices from "../services/AgentServices";
import { useToast } from "../components/ToastProvider";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../components/common/ComanTable";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  Active:
    "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-700",
  Inactive: "bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700",
  "On Hold":
    "bg-yellow-100 text-yellow-600 hover:bg-yellow-200 hover:text-yellow-700",
};

// Calculate real-time stats from API data
const calculateStats = (data: AgentRow[], t: any) => {
  const activeCount = data.filter((agent) => agent.status === "Active").length;
  const inactiveCount = data.filter(
    (agent) => agent.status === "Inactive"
  ).length;
  const totalCount = data.length;

  return [
    { value: activeCount.toString(), title: t("pages.agents.activeAgents") },
    {
      value: inactiveCount.toString(),
      title: t("pages.agents.inactiveAgents"),
    },
    { value: totalCount.toString(), title: t("pages.agents.totalAgents") },
  ];
};

const ListAgents = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("individual");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API state for both tabs
  const [agentsData, setAgentsData] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortState, setSortState] = useState<SortState[]>([]);

  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    record: AgentRow | null;
    currentStatus: boolean;
  }>({
    isOpen: false,
    record: null,
    currentStatus: false,
  });
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Only use API data - no fallback data
  const rows = agentsData;

  // Debug: Log current data state
  console.log("Current activeTab:", activeTab);
  console.log("agentsData length:", agentsData.length);
  console.log("rows length:", rows.length);

  // Calculate real-time stats from current data
  const currentStats = calculateStats(rows, t);

  // Map API data to AgentRow format
  const mapAgentDiscountToAgentRow = useCallback((apiData: any): AgentRow => {
    console.log("Mapping API data:", apiData);

    // Handle different API response structures
    if (apiData.userId && apiData.agentName !== undefined) {
      // Business API structure: { userId: 318, agentName: "Xandra" }
      console.log("Using business API structure");
      return {
        id: `#${apiData.userId.toString().padStart(4, "0")}`,
        name: apiData.agentName || "N/A",
        code: apiData.agentCode || `AGENT${apiData.userId}`,
        email: apiData.email || "N/A",
        phone: apiData.phoneNumber || "N/A",
        country: apiData.country || "N/A",
        region: apiData.region || "N/A",
        city: apiData.city || "N/A",
        status: apiData.isActive ? "Active" : "Inactive",
      };
    } else if (apiData.id && apiData.agentName) {
      // Individual API structure: { id: 318, agentName: "Ahmed Mohammad Alsulami" }
      console.log("Using individual API structure");
      return {
        id: `#${apiData.id.toString().padStart(4, "0")}`,
        name: apiData.agentName || "N/A",
        code: apiData.agentCode || `AGENT${apiData.id}`,
        email: apiData.email || "N/A",
        phone: apiData.phoneNumber || "N/A",
        country: apiData.country || "N/A",
        region: apiData.region || "N/A",
        city: apiData.city || "N/A",
        status: apiData.isActive ? "Active" : "Inactive",
      };
    } else {
      // Fallback: Old API structure
      console.log("Using fallback API structure");
      return {
        id: `#${apiData.id?.toString().padStart(4, "0") || "0000"}`,
        name: apiData.agentName || "N/A",
        code: apiData.agentCode || "N/A",
        email: apiData.email || "N/A",
        phone: apiData.phoneNumber || "N/A",
        country: apiData.country || "N/A",
        region: apiData.region || "N/A",
        city: apiData.city || "N/A",
        status: apiData.status || "Inactive",
      };
    }
  }, []);

  // Load agents data from API for both tabs
  const loadAgents = useCallback(
    async (
      page: number = 1,
      search: string = "",
      currentPageSize: number = pageSize
    ) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (activeTab === "business") {
          response = await AgentServices.GetAllListOfBusinessAgent({
            pageNumber: page,
            pageSize: currentPageSize,
            searchTerm: search || undefined,
            orderByColumn: "CreatedDate",
            orderDirection: "DESC",
          });
        } else {
          console.log("Calling GetAllIndividualAgents API with params:", {
            pageNumber: page,
            pageSize: currentPageSize,
            searchTerm: search || undefined,
            sortColumn: "CreatedDate",
            sortDirection: "DESC",
          });
          response = await AgentServices.GetAllIndividualAgents({
            pageNumber: page,
            pageSize: currentPageSize,
            searchTerm: search || undefined,
            sortColumn: "CreatedDate",
            sortDirection: "DESC",
          });
          console.log("GetAllIndividualAgents API response:", response);
        }

        // Handle the response structure from AgentServices
        if (!response) {
          throw new Error("No response received from API");
        }

        if (!response.success) {
          const errorMessage =
            "message" in response
              ? response.message
              : `Failed to load ${activeTab} agents`;
          throw new Error(errorMessage);
        }

        // Handle different response structures for different APIs
        let records: any[] = [];
        let recordTotalCount = 0;
        let recordTotalPages = 1;

        if (activeTab === "business") {
          // Business API returns paginated response with agents array and totalRecords
          const responseData = response as { success: boolean; data: any };

          // Debug: Log the actual response structure
          console.log("Business API Response:", responseData);

          // Handle different possible response structures
          if (responseData.data?.agents) {
            // Structure: { agents: [...], totalRecords: 17 }
            records = responseData.data.agents || [];
            recordTotalCount = responseData.data.totalRecords || 0;
            console.log(
              "Using agents array structure, totalRecords:",
              recordTotalCount
            );
          } else if (responseData.data?.items) {
            // Structure: { items: [...], totalRecords: 17 }
            records = responseData.data.items || [];
            recordTotalCount = responseData.data.totalRecords || 0;
            console.log(
              "Using items array structure, totalRecords:",
              recordTotalCount
            );
          } else {
            // Fallback: direct array
            records = responseData.data || [];
            recordTotalCount = records.length;
            console.log(
              "Using direct array structure, totalRecords:",
              recordTotalCount
            );
          }

          recordTotalPages = Math.ceil(recordTotalCount / currentPageSize);
        } else {
          // Individual API returns paginated response
          const responseData = response as { success: boolean; data: any };

          // Debug: Log the actual response structure
          console.log("Individual API Response:", responseData);
          console.log("Individual API Response.data:", responseData.data);

          // Handle different possible response structures
          if (responseData.data?.agents) {
            // Structure: { agents: [...], totalRecords: 17 }
            records = responseData.data.agents || [];
            recordTotalCount = responseData.data.totalRecords || 0;
            console.log(
              "Using agents array structure, totalRecords:",
              recordTotalCount,
              "records:",
              records
            );
          } else if (responseData.data?.items) {
            // Structure: { items: [...], totalRecords: 17 }
            records = responseData.data.items || [];
            recordTotalCount = responseData.data.totalRecords || 0;
            console.log(
              "Using items array structure, totalRecords:",
              recordTotalCount,
              "records:",
              records
            );
          } else if (Array.isArray(responseData.data)) {
            // Direct array response
            records = responseData.data || [];
            recordTotalCount = records.length;
            console.log(
              "Using direct array structure, totalRecords:",
              recordTotalCount,
              "records:",
              records
            );
          } else if (responseData.data?.data) {
            // Nested data structure: { data: { data: [...] } }
            records = responseData.data.data || [];
            recordTotalCount = responseData.data.totalRecords || records.length;
            console.log(
              "Using nested data structure, totalRecords:",
              recordTotalCount,
              "records:",
              records
            );
          } else if (responseData.data?.result) {
            // Result structure: { data: { result: [...] } }
            records = responseData.data.result || [];
            recordTotalCount = responseData.data.totalRecords || records.length;
            console.log(
              "Using result structure, totalRecords:",
              recordTotalCount,
              "records:",
              records
            );
          } else {
            // No data found in response
            records = [];
            recordTotalCount = 0;
            console.log(
              "No valid data structure found, records:",
              records,
              "responseData:",
              responseData
            );
          }

          recordTotalPages = Math.ceil(recordTotalCount / currentPageSize);
        }

        // Map the API data to AgentRow format
        console.log("Records before mapping:", records);
        const mappedData = records.map(mapAgentDiscountToAgentRow);
        console.log("Mapped data:", mappedData);

        setAgentsData(mappedData);
        setTotalCount(recordTotalCount);
        setTotalPages(recordTotalPages);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to load ${activeTab} agents`;
        setError(errorMessage);
        showToast(errorMessage, "error");
        setAgentsData([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, mapAgentDiscountToAgentRow, showToast, pageSize]
  );

  // Load data when tab changes or page changes
  useEffect(() => {
    void loadAgents(currentPage, searchTerm, pageSize);
  }, [activeTab, currentPage, searchTerm, pageSize, loadAgents]);

  // Update totalPages when totalCount or pageSize changes
  useEffect(() => {
    const calculatedPages =
      totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
    const finalPages = Math.max(1, calculatedPages);
    setTotalPages(finalPages);
  }, [totalCount, pageSize]);

  // Only use API data - API handles pagination and search
  const tableData = useMemo(() => {
    return agentsData;
  }, [agentsData]);

  // Use API pagination only
  const pageCount = totalPages;
  const safePage = Math.min(currentPage, pageCount);
  const displayTotalCount = totalCount;

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    void loadAgents(1, value, pageSize);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    void loadAgents(page, searchTerm, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    void loadAgents(1, searchTerm, size);
  };

  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  const handleView = (row: AgentRow) => {
    const slug = encodeURIComponent(row.id.replace(/#/g, ""));
    navigate(`/agents/${activeTab}/${slug}`);
  };

  const handleStatusToggle = (row: AgentRow) => {
    const currentStatus = row.status === "Active";
    setStatusModal({
      isOpen: true,
      record: row,
      currentStatus,
    });
  };

  // Table columns configuration for Business tab
  const businessTableColumns: TableColumn<AgentRow>[] = useMemo(
    () => [
      {
        label: "ID No",
        value: (row) => (
          <span className="font-helveticaBold text-primary">{row.id}</span>
        ),
        sortKey: "id",
        isSort: true,
      },
      {
        label: "Agent Business Name",
        value: (row) => <span className="text-gray-700">{row.name}</span>,
        sortKey: "name",
        isSort: true,
      },
      {
        label: "Agent Code",
        value: (row) => <span className="text-gray-500">{row.code}</span>,
        sortKey: "code",
        isSort: true,
      },
      {
        label: "Email",
        value: (row) => <span className="text-gray-500">{row.email}</span>,
        sortKey: "email",
        isSort: true,
      },
      {
        label: "Phone number",
        value: (row) => <span className="text-gray-500">{row.phone}</span>,
        sortKey: "phone",
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
        label: "Status",
        value: (row) => (
          <button
            type="button"
            onClick={() => handleStatusToggle(row)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer border border-transparent hover:border-current ${
              STATUS_BADGE_CLASSES[row.status] ??
              "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            title={`Click to ${
              row.status === "Active" ? "deactivate" : "activate"
            } this agent`}
          >
            {row.status}
          </button>
        ),
        sortKey: "status",
        isSort: true,
      },
    ],
    [handleStatusToggle]
  );

  // Table columns configuration for Individual tab
  const individualTableColumns: TableColumn<AgentRow>[] = useMemo(
    () => [
      {
        label: "ID No",
        value: (row) => (
          <span className="font-helveticaBold text-primary">{row.id}</span>
        ),
        sortKey: "id",
        isSort: true,
      },
      {
        label: "Agent Name",
        value: (row) => <span className="text-gray-700">{row.name}</span>,
        sortKey: "name",
        isSort: true,
      },
      {
        label: "Agent Code",
        value: (row) => <span className="text-gray-500">{row.code}</span>,
        sortKey: "code",
        isSort: true,
      },
      {
        label: "Email",
        value: (row) => <span className="text-gray-500">{row.email}</span>,
        sortKey: "email",
        isSort: true,
      },
      {
        label: "Phone number",
        value: (row) => <span className="text-gray-500">{row.phone}</span>,
        sortKey: "phone",
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
        label: "Status",
        value: (row) => (
          <button
            type="button"
            onClick={() => handleStatusToggle(row)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer border border-transparent hover:border-current ${
              STATUS_BADGE_CLASSES[row.status] ??
              "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
            title={`Click to ${
              row.status === "Active" ? "deactivate" : "activate"
            } this agent`}
          >
            {row.status}
          </button>
        ),
        sortKey: "status",
        isSort: true,
      },
    ],
    [handleStatusToggle]
  );

  // Select columns based on active tab
  const tableColumns = activeTab === "business" ? businessTableColumns : individualTableColumns;

  const handlePrint = (row: AgentRow) => {
    console.log("Print agent:", row);
    // Implement print functionality
  };

  const handleStatusConfirm = async () => {
    if (!statusModal.record) return;

    setIsStatusUpdating(true);
    try {
      const agentId = parseInt(statusModal.record.id.replace("#", ""));
      const newStatus = !statusModal.currentStatus;

      let response;
      if (activeTab === "business") {
        response = await AgentServices.UpdateAgentBusinessStatus(
          agentId,
          newStatus
        );
      } else {
        response = await AgentServices.UpdateIndividualAgentStatus(
          agentId,
          newStatus
        );
      }

      if (response?.success) {
        showToast(
          `Agent ${activeTab} status updated to ${
            newStatus ? "Active" : "Inactive"
          } successfully`,
          "success"
        );
        // Refresh the data
        await loadAgents(currentPage, searchTerm, pageSize);
        setStatusModal({ isOpen: false, record: null, currentStatus: false });
      } else {
        showToast(`Failed to update agent ${activeTab} status`, "error");
      }
    } catch (error) {
      console.error(`Error updating agent ${activeTab} status:`, error);
      const message =
        error instanceof Error ? error.message : "Failed to update status";
      showToast(message, "error");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleStatusCancel = () => {
    setStatusModal({ isOpen: false, record: null, currentStatus: false });
  };

  // Action buttons configuration for Business tab
  const businessActionButtons: ActionButton<AgentRow>[] = useMemo(
    () => [
      {
        label: "View",
        iconType: "view",
        onClick: handleView,
      },
      {
        label: "Print",
        iconType: "print",
        onClick: handlePrint,
      },
      {
        label: "Toggle Status",
        iconType: "toggle",
        onClick: handleStatusToggle,
      },
    ],
    [handleView, handlePrint, handleStatusToggle]
  );

  // Action buttons configuration for Individual tab
  const individualActionButtons: ActionButton<AgentRow>[] = useMemo(
    () => [
      {
        label: "View",
        iconType: "view",
        onClick: handleView,
      },
      {
        label: "Print",
        iconType: "print",
        onClick: handlePrint,
      },
      {
        label: "Toggle Status",
        iconType: "toggle",
        onClick: handleStatusToggle,
      },
    ],
    [handleView, handlePrint, handleStatusToggle]
  );

  // Select action buttons based on active tab
  const actionButtons = activeTab === "business" ? businessActionButtons : individualActionButtons;

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full  flex-col gap-8 pb-3">
        <section className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-primary">
                List of Agents
              </h1>
              <p className="text-sm text-gray-500">
                Monitor field agents performance and availability.
              </p>
            </div>
            <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]">
              Export
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-full bg-slate-100 p-1 text-sm font-textMedium text-gray-600">
              <TabButton
                label="Individual"
                isActive={activeTab === "individual"}
                onClick={() => handleTabChange("individual")}
              />
              <TabButton
                label="Business"
                isActive={activeTab === "business"}
                onClick={() => handleTabChange("business")}
              />
            </div>
            <div className="relative w-full max-w-xs">
              <input
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search"
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 pl-11 text-sm text-gray-600 shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
                <SearchIcon />
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {currentStats.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-center shadow-card"
              >
                <p className="text-3xl font-helveticaBold text-primary">
                  {loading ? "..." : item.value}
                </p>
                <p className="mt-2 text-xs font-textMedium uppercase tracking-[0.18em] text-gray-500">
                  {item.title}
                </p>
              </div>
            ))}
          </div>

          {/* Debug: Show total records from API */}
         

          <ChartPlaceholder />

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-600">
              {error}
            </div>
          ) : (
            <ComanTable
              columns={tableColumns}
              data={tableData}
              actions={actionButtons}
              page={safePage}
              totalPages={pageCount}
              totalCount={displayTotalCount}
              onPageChange={handlePageChange}
              sortState={sortState}
              onSortChange={handleSortChange}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              loading={loading}
            />
          )}

          {/* Status Confirmation Modal */}
          {statusModal.isOpen && statusModal.record && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[6px] px-4">
              <StatusConfirmModal
                isSubmitting={isStatusUpdating}
                onCancel={handleStatusCancel}
                onConfirm={handleStatusConfirm}
                currentStatus={statusModal.currentStatus}
                recordName={statusModal.record.name}
              />
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

const StatusConfirmModal = ({
  isSubmitting,
  onCancel,
  onConfirm,
  currentStatus,
  recordName,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  currentStatus: boolean;
  recordName: string;
}) => (
  <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
    <div className="space-y-6 text-center">
      <div
        className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
          currentStatus
            ? "bg-orange-100 text-orange-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {currentStatus ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-12 w-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-12 w-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-gray-900">
          {currentStatus ? "Deactivate" : "Activate"} Agent
        </p>
        <p className="text-sm text-gray-600">
          Are you sure you want to {currentStatus ? "deactivate" : "activate"}{" "}
          <strong>{recordName}</strong>?
          {currentStatus
            ? " They will no longer be able to access the system."
            : " They will regain access to the system."}
        </p>
      </div>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-500 transition hover:border-primary hover:text-primary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`rounded-full px-6 py-2 text-sm font-semibold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-50 ${
            currentStatus
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? currentStatus
              ? "Deactivating..."
              : "Activating..."
            : currentStatus
            ? "Deactivate"
            : "Activate"}
        </button>
      </div>
    </div>
  </div>
);

const TabButton = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-white text-primary shadow"
        : "text-gray-400 hover:text-primary"
    }`}
  >
    {label}
  </button>
);

const ChartPlaceholder = () => (
  <div className="rounded-[24px] border border-gray-200 bg-[#f6f7fb] px-6 py-10 text-center text-sm text-gray-500">
    Analytics chart placeholder
  </div>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className="h-4 w-4"
  >
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-3-3" />
  </svg>
);

export default ListAgents;
