import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../layouts/DashboardLayout";
import type { AgentRow, TabKey } from "../data/agents";
import { businessAgents, individualAgents } from "../data/agents";
import AgentServices from "../services/AgentServices";
import { useToast } from "../components/ToastProvider";
import ComanTable, { type TableColumn, type ActionButton, type SortState } from "../components/common/ComanTable";

// Agent discount record interface
interface AgentDiscountRecord {
  id: number;
  agentName: string;
  agentCode: string;
  email: string;
  phoneNumber: string;
  country: string;
  region: string;
  city: string;
  status: "Active" | "Inactive" | "On Hold";
  discountPercentage?: number;
  discountAmount?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Calculate real-time stats from API data
const calculateStats = (data: AgentRow[], t: any) => {
  const activeCount = data.filter(agent => agent.status === "Active").length;
  const inactiveCount = data.filter(agent => agent.status === "Inactive").length;
  const totalCount = data.length;

  return [
    { value: activeCount.toString(), title: t('pages.agents.activeAgents') },
    { value: inactiveCount.toString(), title: t('pages.agents.inactiveAgents') },
    { value: totalCount.toString(), title: t('pages.agents.totalAgents') },
  ];
};

const statusStyles: Record<AgentRow["status"], string> = {
  Active: "bg-[#e9fbf3] text-[#09a66d]",
  Inactive: "bg-[#fff1f0] text-[#e23939]",
  "On Hold": "bg-[#fff7e6] text-[#b46a02]",
};

const data: Record<TabKey, AgentRow[]> = {
  individual: individualAgents,
  business: businessAgents,
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


  // Always use API data if available, otherwise fall back to static data
  const rows = agentsData.length > 0 ? agentsData : data[activeTab];

  // Calculate real-time stats from current data
  const currentStats = calculateStats(rows, t);


  // Map API data to AgentRow format
  const mapAgentDiscountToAgentRow = useCallback((apiData: AgentDiscountRecord): AgentRow => {
    return {
      id: `#${apiData.id.toString().padStart(4, "0")}`,
      name: apiData.agentName,
      code: apiData.agentCode,
      email: apiData.email,
      phone: apiData.phoneNumber,
      country: apiData.country,
      region: apiData.region,
      city: apiData.city,
      status: apiData.status,
    };
  }, []);

  // Load agents data from API for both tabs
  const loadAgents = useCallback(async (page: number = 1, search: string = "", currentPageSize: number = pageSize) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      if (activeTab === "business") {
        response = await AgentServices.GetAllAgentDiscountForBusinessList({
          pageNumber: page,
          pageSize: currentPageSize,
          searchTerm: search || undefined,
        });
      } else {
        response = await AgentServices.GetAllAgentDiscountForIndividualList({
          pageNumber: page,
          pageSize: currentPageSize,
          searchTerm: search || undefined,
        });
      }

      // Handle the response structure from AgentServices
      if (!response) {
        throw new Error('No response received from API');
      }

      if (!response.success) {
        const errorMessage = 'message' in response ? response.message : `Failed to load ${activeTab} agents`;
        throw new Error(errorMessage);
      }

      // API response is a direct array, not an object with data property
      const records = 'data' in response && response.data ? response.data : [];

      // For direct array response, we need to calculate pagination info
      const recordTotalCount = records.length;
      const recordTotalPages = Math.ceil(recordTotalCount / currentPageSize);

      // Map the API data to AgentRow format
      const mappedData = records.map(mapAgentDiscountToAgentRow);

      setAgentsData(mappedData);
      setTotalCount(recordTotalCount);
      setTotalPages(recordTotalPages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to load ${activeTab} agents`;
      setError(errorMessage);
      showToast(errorMessage, "error");
      setAgentsData([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, mapAgentDiscountToAgentRow, showToast, pageSize]);


  // Load data when tab changes or page changes
  useEffect(() => {
    void loadAgents(currentPage, searchTerm, pageSize);
  }, [activeTab, currentPage, searchTerm, pageSize, loadAgents]);

  // Update totalPages when totalCount or pageSize changes
  useEffect(() => {
    const calculatedPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
    const finalPages = Math.max(1, calculatedPages);
    setTotalPages(finalPages);
  }, [totalCount, pageSize]);

  // For API data, use it directly (API handles pagination and search)
  // For static data, do client-side filtering and pagination
  const tableData = useMemo(() => {
    // If we have API data, return it as-is (API handles pagination and search)
    if (agentsData.length > 0) {
      return agentsData;
    }

    // For static data, do client-side filtering
    let filteredData = rows;
    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      filteredData = rows.filter((row) =>
        [row.id, row.name, row.code, row.email, row.city, row.region].some((field) =>
          field.toLowerCase().includes(query)
        )
      );
    }

    // For static data, do client-side pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [agentsData, rows, searchTerm, currentPage, pageSize]);

  // Use API pagination for API data, client-side pagination for static data
  const pageCount = agentsData.length > 0 ? totalPages : Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const displayTotalCount = agentsData.length > 0 ? totalCount : rows.length;


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

  const handleEdit = (_row: AgentRow) => {
    // Implement edit functionality
  };

  const handleDelete = (_row: AgentRow) => {
    // Implement delete functionality
  };

  // Table columns configuration
  const tableColumns: TableColumn<AgentRow>[] = useMemo(() => [
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
      value: (row) => (
        <span className="text-gray-700">{row.name}</span>
      ),
      sortKey: "name",
      isSort: true,
    },
    {
      label: "Agent Code",
      value: (row) => (
        <span className="text-gray-500">{row.code}</span>
      ),
      sortKey: "code",
      isSort: true,
    },
    {
      label: "Email",
      value: (row) => (
        <span className="text-gray-500">{row.email}</span>
      ),
      sortKey: "email",
      isSort: true,
    },
    {
      label: "Phone Number",
      value: (row) => (
        <span className="text-gray-500">{row.phone}</span>
      ),
      sortKey: "phone",
      isSort: true,
    },
    {
      label: "Country",
      value: (row) => (
        <span className="text-gray-500">{row.country}</span>
      ),
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
      value: (row) => (
        <span className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold ${statusStyles[row.status]}`}>
          {row.status}
        </span>
      ),
      sortKey: "status",
      isSort: true,
    },
  ], []);

  // Action buttons configuration
  const actionButtons: ActionButton<AgentRow>[] = useMemo(() => [
    {
      label: "View",
      iconType: "view",
      onClick: handleView,
    },
    // {
    //   label: "Edit",
    //   iconType: "edit",
    //   onClick: handleEdit,
    // },
    // {
    //   label: "Delete",
    //   iconType: "delete",
    //   onClick: handleDelete,
    // },
  ], [handleView, handleEdit, handleDelete]);

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full  flex-col gap-8 pb-3">
        <section className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-primary">List of Agents</h1>
              <p className="text-sm text-gray-500">Monitor field agents performance and availability.</p>
            </div>
            <button className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]">
              Export
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-full bg-slate-100 p-1 text-sm font-textMedium text-gray-600">
              <TabButton label="Individual" isActive={activeTab === "individual"} onClick={() => handleTabChange("individual")}
              />
              <TabButton label="Business" isActive={activeTab === "business"} onClick={() => handleTabChange("business")} />
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
              <div key={item.title} className="rounded-2xl border border-slate-200 bg-white px-6 py-6 text-center shadow-card">
                <p className="text-3xl font-helveticaBold text-primary">
                  {loading ? "..." : item.value}
                </p>
                <p className="mt-2 text-xs font-textMedium uppercase tracking-[0.18em] text-gray-500">{item.title}</p>
              </div>
            ))}
          </div>

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

        </section>
      </div>
    </DashboardLayout>
  );
};

const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${isActive ? "bg-white text-primary shadow" : "text-gray-400 hover:text-primary"
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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-3-3" />
  </svg>
);

export default ListAgents;



