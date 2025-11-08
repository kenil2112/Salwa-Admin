import { useMemo, useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import NonMedicalServices from "../services/NonMedicalServices";
import { useToast } from "../components/ToastProvider";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../components/common/ComanTable";

type CompanyRow = {
  id: string;
  name: string;
  subscription: string;
  subscriptionStart: string;
  subscriptionEnd: string;
  amount: string;
  country: string;
  region: string;
  city: string;
  district: string;
  status: "Active" | "Inactive";
};

type TabKey = "individual" | "business";
type FormMode = "create" | "edit" | "view";

interface FormState {
  id: string;
  businessName: string;
  subscription: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  subscriptionAmount: string;
  country: string;
  region: string;
  city: string;
  district: string;
  status: "Active" | "Inactive";
}

// Calculate real-time stats from API data
const calculateStats = (data: CompanyRow[]) => {
  const activeCount = data.filter(
    (company) => company.status === "Active"
  ).length;
  const inactiveCount = data.filter(
    (company) => company.status === "Inactive"
  ).length;
  const totalCount = data.length;

  return [
    { value: activeCount.toString(), title: "Active Companies" },
    { value: inactiveCount.toString(), title: "Inactive Companies" },
    { value: totalCount.toString(), title: "Total Companies" },
  ];
};

const statusStyles: Record<CompanyRow["status"], string> = {
  Active: "bg-[#e9fbf3] text-[#09a66d]",
  Inactive: "bg-[#fff1f0] text-[#e23939]",
};

const DeleteConfirmModal = ({
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ModalShell title="Delete Business User" onClose={onCancel}>
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100 text-red-600">
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-gray-900">
          Delete Business User
        </p>
        <p className="text-sm text-gray-600">
          This action will permanently delete the business user. This action
          cannot be undone.
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
          className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </ModalShell>
);

const NonMedicalCompanies = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>("individual");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API state
  const [companiesData, setCompaniesData] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [sortState, setSortState] = useState<SortState[]>([]);

  // Menu data state
  const [menuData] = useState<any[]>([]);
  const [menuLoading] = useState(false);
  const [menuError] = useState<string | null>(null);
  const [menuTotalCount] = useState(0);
  const [menuTotalPages] = useState(1);
  const [showMenuTable] = useState(false);

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formValues, setFormValues] = useState<FormState>({
    id: "",
    businessName: "",
    subscription: "",
    subscriptionStartDate: "",
    subscriptionEndDate: "",
    subscriptionAmount: "",
    country: "",
    region: "",
    city: "",
    district: "",
    status: "Active",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    record: CompanyRow | null;
  }>({
    isOpen: false,
    record: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Always use API data if available, otherwise fall back to static data
  const rows = companiesData.length > 0 ? companiesData : [];

  // Calculate real-time stats from current data
  const currentStats = calculateStats(rows);

  // Helper function to format dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";

      // Format as DD/MM/YYYY
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "N/A";
    }
  };

  // Helper function to format currency
  const formatCurrency = (
    amount: string | number | null | undefined
  ): string => {
    if (!amount && amount !== 0) return "0";

    try {
      const numAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      if (isNaN(numAmount)) return "0";

      // Format with commas for thousands
      return numAmount.toLocaleString();
    } catch (error) {
      console.error("Error formatting currency:", amount, error);
      return "0";
    }
  };

  // Map API data to CompanyRow format
  const mapNonMedicalToCompanyRow = useCallback(
    (apiData: any): CompanyRow => {
      console.log("Mapping API data:", apiData);

      if (activeTab === "individual") {
        // Individual user data structure: { UserId: 864, FirstName: null, LastName: null, MiddleName: null, Gender: null, ... }
        const fullName =
          [apiData.FirstName, apiData.MiddleName, apiData.LastName]
            .filter(Boolean)
            .join(" ") || "N/A";

        return {
          id: `#${apiData.UserId?.toString().padStart(4, "0") || "0000"}`,
          name: fullName,
          subscription: apiData.SubscriptionType || "N/A",
          subscriptionStart: formatDate(apiData.SubscriptionStartDate),
          subscriptionEnd: formatDate(apiData.SubscriptionEndDate),
          amount: formatCurrency(apiData.SubscriptionAmount),
          country: apiData.Country || "N/A",
          region: apiData.Region || "N/A",
          city: apiData.City || "N/A",
          district: apiData.District || "N/A",
          status: apiData.IsActive ? "Active" : "Inactive",
        };
      } else {
        // Business request list data structure - new API
        return {
          id: `#${apiData.id?.toString().padStart(4, "0") ||
            apiData.requestId?.toString().padStart(4, "0") ||
            "0000"
            }`,
          name: apiData.businessName || apiData.companyName || "N/A",
          subscription:
            apiData.subscriptionType || apiData.subscription || "N/A",
          subscriptionStart: formatDate(
            apiData.subscriptionStartDate || apiData.startDate
          ),
          subscriptionEnd: formatDate(
            apiData.subscriptionEndDate || apiData.endDate
          ),
          amount: formatCurrency(apiData.subscriptionAmount || apiData.amount),
          country: apiData.country || "N/A",
          region: apiData.region || "N/A",
          city: apiData.city || "N/A",
          district: apiData.district || "N/A",
          status: apiData.isActive
            ? "Active"
            : apiData.status === "Active"
              ? "Active"
              : "Inactive",
        };
      }
    },
    [activeTab]
  );

  // Load companies data from API for both tabs
  const loadCompanies = useCallback(
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
          response =
            await NonMedicalServices.GetAllBusinessUserNonMedicalRequestList({
              userId: 0, // You can pass a specific userId if needed
              pageNumber: page,
              pageSize: currentPageSize,
              sortColumn: "CreatedDate",
              sortDirection: "DESC",
            });
        } else {
          response = await NonMedicalServices.GetAllIndividualUserNonMedical({
            pageNumber: page,
            pageSize: currentPageSize,
            searchTerm: search || undefined,
          });
        }

        // Handle the response structure
        if (!response) {
          throw new Error("No response received from API");
        }

        if (!response.success) {
          const errorMessage =
            "message" in response
              ? response.message
              : `Failed to load ${activeTab} companies`;
          throw new Error(errorMessage);
        }

        // Handle different API response structures
        let records = [];
        let recordTotalCount = 0;
        let recordTotalPages = 1;

        if (activeTab === "individual") {
          // Individual API returns { totalRecords: 66, individualUsers: [...], insuranceMembers: [...] }
          const responseData = (response as { success: boolean; data: any })
            .data;
          console.log("Individual API Response:", responseData);

          if (responseData?.individualUsers) {
            records = responseData.individualUsers;
            recordTotalCount = responseData.totalRecords || records.length;
            console.log(
              "Using individualUsers array, totalRecords:",
              recordTotalCount
            );
          } else {
            // Fallback: direct array
            records = responseData || [];
            recordTotalCount = records.length;
            console.log(
              "Using direct array structure, totalRecords:",
              recordTotalCount
            );
          }
        } else {
          // Business API response structure - new request list API
          const responseData = (response as { success: boolean; data: any })
            .data;
          console.log("Business Request List API Response:", responseData);

          if (Array.isArray(responseData)) {
            records = responseData;
            recordTotalCount = records.length;
            console.log(
              "Using direct array structure, totalRecords:",
              recordTotalCount
            );
          } else if (responseData?.requests) {
            records = responseData.requests;
            recordTotalCount = responseData.totalRecords || records.length;
            console.log(
              "Using requests array structure, totalRecords:",
              recordTotalCount
            );
          } else if (responseData?.data) {
            records = responseData.data;
            recordTotalCount = responseData.totalRecords || records.length;
            console.log(
              "Using nested data structure, totalRecords:",
              recordTotalCount
            );
          } else {
            records = [];
            recordTotalCount = 0;
            console.log("No valid data structure found for business requests");
          }
        }

        recordTotalPages = Math.ceil(recordTotalCount / currentPageSize);

        // Map the API data to CompanyRow format
        const mappedData = records.map(mapNonMedicalToCompanyRow);

        setCompaniesData(mappedData);
        setTotalCount(recordTotalCount);
        setTotalPages(recordTotalPages);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Failed to load ${activeTab} companies`;
        setError(errorMessage);
        showToast(errorMessage, "error");
        setCompaniesData([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, mapNonMedicalToCompanyRow, showToast, pageSize]
  );

  // Load data when tab changes or page changes
  useEffect(() => {
    void loadCompanies(currentPage, searchTerm, pageSize);
  }, [activeTab, currentPage, searchTerm, pageSize, loadCompanies]);

  // Update totalPages when totalCount or pageSize changes
  useEffect(() => {
    const calculatedPages =
      totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
    const finalPages = Math.max(1, calculatedPages);
    setTotalPages(finalPages);
  }, [totalCount, pageSize]);

  // For API data, use it directly (API handles pagination and search)
  // For static data, do client-side filtering and pagination
  const tableData = useMemo(() => {
    // If we have API data, return it as-is (API handles pagination and search)
    if (companiesData.length > 0) {
      return companiesData;
    }

    // For static data, do client-side filtering
    let filteredData = rows;
    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      filteredData = rows.filter((row) =>
        [
          row.id,
          row.name,
          row.subscription,
          row.country,
          row.city,
          row.region,
        ].some((field) => field.toLowerCase().includes(query))
      );
    }

    // For static data, do client-side pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [companiesData, rows, searchTerm, currentPage, pageSize]);

  // Use API pagination for API data, client-side pagination for static data
  const pageCount =
    companiesData.length > 0
      ? totalPages
      : Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const displayTotalCount = companiesData.length > 0 ? totalCount : rows.length;

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    void loadCompanies(1, value, pageSize);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    void loadCompanies(page, searchTerm, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    void loadCompanies(1, searchTerm, size);
  };

  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  const handleView = (row: CompanyRow) => {
    setFormMode("view");
    setFormValues({
      id: row.id,
      businessName: row.name,
      subscription: row.subscription,
      subscriptionStartDate: row.subscriptionStart,
      subscriptionEndDate: row.subscriptionEnd,
      subscriptionAmount: row.amount,
      country: row.country,
      region: row.region,
      city: row.city,
      district: row.district,
      status: row.status,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (row: CompanyRow) => {
    setDeleteModal({
      isOpen: true,
      record: row,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.record) return;

    setIsDeleting(true);
    try {
      // Extract ID from the row (remove # prefix and convert to number)
      const recordId = parseInt(deleteModal.record.id.replace("#", ""));

      const response = await NonMedicalServices.DeleteBusinessUserNonMedical(
        recordId
      );

      if (response?.success) {
        showToast("Business user deleted successfully", "success");

        // Refresh the data
        await loadCompanies(currentPage, searchTerm, pageSize);

        // Close modal
        setDeleteModal({ isOpen: false, record: null });
      } else {
        showToast("Failed to delete business user", "error");
      }
    } catch (error) {
      console.error("Error deleting business user:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete business user";
      showToast(message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, record: null });
  };

  const handleFormSubmit = async () => {
    setFormSubmitting(true);
    try {
      // Implement form submission logic here
      console.log("Form submitted:", formValues);
      showToast("Company saved successfully!", "success");
      setIsFormOpen(false);
      // Reload data
      void loadCompanies(currentPage, searchTerm, pageSize);
    } catch (error) {
      showToast("Failed to save company", "error");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Table columns configuration
  const tableColumns: TableColumn<CompanyRow>[] = useMemo(
    () => [
      {
        label: "SO NO",
        value: (row) => (
          <span className="font-helveticaBold text-primary">{row.id}</span>
        ),
        sortKey: "id",
        isSort: true,
      },
      {
        label: "Business Name",
        value: (row) => <span className="text-gray-700">{row.name}</span>,
        sortKey: "name",
        isSort: true,
      },
      {
        label: "Subscription",
        value: (row) => (
          <span className="text-gray-500">{row.subscription}</span>
        ),
        sortKey: "subscription",
        isSort: true,
      },
      {
        label: "Subscription Start Date",
        value: (row) => (
          <span className="text-gray-500">{row.subscriptionStart}</span>
        ),
        sortKey: "subscriptionStart",
        isSort: true,
      },
      {
        label: "Subscription End Date",
        value: (row) => (
          <span className="text-gray-500">{row.subscriptionEnd}</span>
        ),
        sortKey: "subscriptionEnd",
        isSort: true,
      },
      {
        label: "Subscription Amount",
        value: (row) => <span className="text-gray-500">{row.amount}</span>,
        sortKey: "amount",
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
        label: "District",
        value: (row) => <span className="text-gray-500">{row.district}</span>,
        sortKey: "district",
        isSort: true,
      },
      {
        label: "Status",
        value: (row) => (
          <span
            className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold ${statusStyles[row.status]
              }`}
          >
            {row.status}
          </span>
        ),
        sortKey: "status",
        isSort: true,
      },
    ],
    []
  );

  // Action buttons configuration - Only View and Delete
  const actionButtons: ActionButton<CompanyRow>[] = useMemo(
    () => [
      {
        label: "View",
        iconType: "view",
        onClick: handleView,
      },
      {
        label: "Delete",
        iconType: "delete",
        onClick: handleDelete,
      },
    ],
    [handleView, handleDelete]
  );

  // Menu table columns configuration
  const menuTableColumns: TableColumn<any>[] = useMemo(
    () => [
      {
        label: "ID",
        value: (row) => (
          <span className="font-helveticaBold text-primary">
            {row.id || row.categoryId || "N/A"}
          </span>
        ),
        sortKey: "id",
        isSort: true,
      },
      {
        label: "Category Name",
        value: (row) => (
          <span className="text-gray-700">
            {row.categoryName || row.name || "N/A"}
          </span>
        ),
        sortKey: "categoryName",
        isSort: true,
      },
      {
        label: "Description",
        value: (row) => (
          <span className="text-gray-500">{row.description || "N/A"}</span>
        ),
        sortKey: "description",
        isSort: true,
      },
      {
        label: "Status",
        value: (row) => (
          <span
            className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-semibold ${row.isActive || row.status === "Active"
              ? "bg-[#e9fbf3] text-[#09a66d]"
              : "bg-[#fff1f0] text-[#e23939]"
              }`}
          >
            {row.isActive || row.status === "Active" ? "Active" : "Inactive"}
          </span>
        ),
        sortKey: "isActive",
        isSort: true,
      },
    ],
    []
  );

  // Menu action buttons (if needed)
  const menuActionButtons: ActionButton<any>[] = useMemo(
    () => [
      {
        label: "View",
        iconType: "view",
        onClick: (row) => console.log("View menu item:", row),
      },
    ],
    []
  );

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full  flex-col gap-8 pb-3">
        <section className="space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-primary">
                Non Medical Companies
              </h1>
              <p className="text-sm text-gray-500">
                Monitor non-medical companies and their subscription details.
              </p>
            </div>
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
            <div className="relative w-full max-w-xs input-filed-block">
              <input
                type="search"
                id="search_bar_non_medical_companies"
                placeholder="Search"
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white pl-3 pr-11 py-2 text-base text-gray-600 shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 peer
          placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              />
              <label
                htmlFor="search_bar_non_medical_companies"
                className={`
                  label-filed absolute left-2.5 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-2.5 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-2.5 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1 ${searchTerm && searchTerm.trim() !== "" ? "!-top-3 !text-[13px] " : ""} 
                  `}
              >
                Search
              </label>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
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

          {/* Debug: Show API response info */}

          <ChartPlaceholder />

          {showMenuTable ? (
            // Menu Table
            <>
              {menuError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-600">
                  {menuError}
                </div>
              ) : (
                <ComanTable
                  columns={menuTableColumns}
                  data={menuData}
                  actions={menuActionButtons}
                  page={safePage}
                  totalPages={menuTotalPages}
                  totalCount={menuTotalCount}
                  onPageChange={handlePageChange}
                  sortState={sortState}
                  onSortChange={handleSortChange}
                  pageSize={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                  loading={menuLoading}
                />
              )}
            </>
          ) : (
            // Companies Table
            <>
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
            </>
          )}
        </section>
      </div>

      {isFormOpen && (
        <ModalOverlay>
          <FormModal
            mode={formMode}
            values={formValues}
            onChange={setFormValues}
            onClose={() => {
              if (!formSubmitting) {
                setIsFormOpen(false);
              }
            }}
            onSubmit={handleFormSubmit}
            isSubmitting={formSubmitting}
            isLoading={false}
          />
        </ModalOverlay>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[6px] px-4">
          <DeleteConfirmModal
            isSubmitting={isDeleting}
            onCancel={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

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
    className={`rounded-full px-5 py-2 text-sm font-semibold transition ${isActive
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

const FormModal = ({
  mode,
  values,
  onChange,
  onClose,
  onSubmit,
  isSubmitting,
  isLoading,
}: {
  mode: FormMode;
  values: FormState;
  onChange: (next: FormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isLoading: boolean;
}) => {
  return (
    <ModalShell
      title={`${mode === "edit" ? "Edit" : mode === "view" ? "View" : "Add"
        } Non Medical Company`}
      onClose={onClose}
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-gray-500">
          Loading details...
        </div>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          {/* General Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-primary">
                General Information
              </h4>
              <ChevronIcon />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                label="Business Name"
                value={values.businessName}
                onChange={(e) =>
                  onChange({ ...values, businessName: e.target.value })
                }
                disabled={mode === "view"}
                required
              />
              <LabeledInput
                label="Subscription"
                value={values.subscription}
                onChange={(e) =>
                  onChange({ ...values, subscription: e.target.value })
                }
                disabled={mode === "view"}
                required
              />
              <LabeledInput
                label="Subscription Start Date"
                type="date"
                value={values.subscriptionStartDate}
                onChange={(e) =>
                  onChange({ ...values, subscriptionStartDate: e.target.value })
                }
                disabled={mode === "view"}
                required
              />
              <LabeledInput
                label="Subscription End Date"
                type="date"
                value={values.subscriptionEndDate}
                onChange={(e) =>
                  onChange({ ...values, subscriptionEndDate: e.target.value })
                }
                disabled={mode === "view"}
                required
              />
              <LabeledInput
                label="Subscription Amount"
                value={values.subscriptionAmount}
                onChange={(e) =>
                  onChange({ ...values, subscriptionAmount: e.target.value })
                }
                disabled={mode === "view"}
                required
              />
              <LabeledSelect
                label="Status"
                value={values.status}
                onChange={(e) =>
                  onChange({
                    ...values,
                    status: e.target.value as "Active" | "Inactive",
                  })
                }
                disabled={mode === "view"}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </LabeledSelect>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-primary">Location</h4>
              <ChevronIcon />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                label="Country"
                value={values.country}
                onChange={(e) =>
                  onChange({ ...values, country: e.target.value })
                }
                disabled={mode === "view"}
                required
              />
              <LabeledInput
                label="Region"
                value={values.region}
                onChange={(e) =>
                  onChange({ ...values, region: e.target.value })
                }
                disabled={mode === "view"}
                required
              />
              <LabeledInput
                label="City"
                value={values.city}
                onChange={(e) => onChange({ ...values, city: e.target.value })}
                disabled={mode === "view"}
                required
              />
              <LabeledInput
                label="District"
                value={values.district}
                onChange={(e) =>
                  onChange({ ...values, district: e.target.value })
                }
                disabled={mode === "view"}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          {mode !== "view" && (
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-gray-100 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447] disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : mode === "edit"
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          )}
        </form>
      )}
    </ModalShell>
  );
};

const LabeledInput = ({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  ...props
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-500 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-500"
      {...props}
    />
  </div>
);

const LabeledSelect = ({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  children,
  ...props
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  required?: boolean;
  children: ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 disabled:text-gray-500"
      {...props}
    >
      {children}
    </select>
  </div>
);

const ModalOverlay = ({ children }: { children: ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[6px] px-4">
    {children}
  </div>
);

const ModalShell = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => (
  <div className="w-full max-w-2xl rounded-[36px] bg-white px-8 py-10 shadow-[0_40px_90px_rgba(5,6,104,0.18)]">
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-xl font-semibold text-primary">{title}</h3>
      <button
        type="button"
        aria-label="Close"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f8fd] text-gray-500 transition hover:bg-primary/10 hover:text-primary"
        onClick={onClose}
      >
        <CloseIcon />
      </button>
    </div>
    <div className="mt-8 space-y-6">{children}</div>
  </div>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6l12 12M18 6L6 18"
    />
  </svg>
);

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className="h-3 w-3"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 8 4 4 4-4" />
  </svg>
);

export default NonMedicalCompanies;
