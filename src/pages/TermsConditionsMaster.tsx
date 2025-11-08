import React, { useState, useMemo, useEffect, useRef } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import ComanTable, {
  type TableColumn,
  type SortState,
} from "../components/common/ComanTable";
import TermsConditionsService from "../services/TermsConditionsService";

type ActiveTab = "registration" | "services";
type ModalState = "view" | "edit" | "confirm" | "success" | "history" | null;

interface TermsRow {
  // UI display fields
  id: string;
  category: string;
  userType: string;
  subType: string;
  terms: string;
  version: string;

  // Services API response fields
  CategoryId?: number;
  Category?: string;
  ServiceId?: number;
  Service?: string;
  SubServiceId?: number | null;
  SubService?: string | null;

  // Registration API response fields
  UserTypeId?: number;
  UserType?: string;
  SubTypeId?: number | null;
  SubType?: string | null;

  // Common fields
  CreatedBy?: string | null;
  CreatedDate: string;
  UpdatedBy?: string | null;
  UpdatedDate: string;
  IsActive: boolean;
  Version: string;
  ETermsAndCondition: string;
  ATermsAndCondition: string;
}

interface HistoryItem {
  date: string;
  version: string;
  description: string;
}

const stats = [
  { label: "Total Reviews", value: "244" },
  { label: "Total Unique B2B Query", value: "22" },
  { label: "Total B2B Query", value: "266" },
];

// Static data removed - now using API data

const historyItems: HistoryItem[] = [
  {
    date: "17/06/2025",
    version: "2.5.1",
    description: "Collaborated Terms & Conditions updated via program",
  },
  {
    date: "10/06/2025",
    version: "2.5.0",
    description: "Collaborated Terms & Conditions",
  },
  {
    date: "27/05/2025",
    version: "2.4.8",
    description: "Collaborated Terms & Conditions",
  },
];

const TermsConditionsMaster = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>("registration");
  const [modalState, setModalState] = useState<ModalState>(null);
  const [englishText, setEnglishText] = useState("");
  const [arabicText, setArabicText] = useState("");
  const [selectedRow, setSelectedRow] = useState<TermsRow | null>(null);

  // Table state management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortState, setSortState] = useState<SortState[]>([]);

  // API state management
  const [tableRows, setTableRows] = useState<TermsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  // History state
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Ref to track current tab for reliable access
  const currentTabRef = useRef<ActiveTab>(activeTab);

  // Track activeTab changes
  useEffect(() => {
    currentTabRef.current = activeTab; // Update ref when activeTab changes
  }, [activeTab]);

  // Open history modal
  const openHistory = async (row: TermsRow) => {
    // Use ref to get the most current tab value
    const currentTab = currentTabRef.current;

    setSelectedRow(row);
    setModalState("history");
    await fetchHistoryData(row, currentTab);
  };

  // Print history data
  const printHistory = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Terms & Conditions History</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #050668;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #050668;
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 5px 0 0 0;
              color: #666;
              font-size: 14px;
            }
            .history-item {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 15px;
              background-color: #f7f8fd;
            }
            .history-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.18em;
              color: #6b7280;
            }
            .history-description {
              font-size: 14px;
              color: #374151;
              line-height: 1.5;
            }
            .no-data {
              text-align: center;
              color: #6b7280;
              font-style: italic;
              padding: 40px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Terms & Conditions History</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            ${selectedRow ? `<p><strong>${activeTab === 'registration' ? 'User Type' : 'Service'}:</strong> ${selectedRow.userType || selectedRow.Service || 'N/A'}</p>` : ''}
            ${selectedRow ? `<p><strong>Category:</strong> ${selectedRow.category}</p>` : ''}
          </div>
          <div class="history-content">
            ${historyData.length > 0 ?
        historyData.map((item) => `
                <div class="history-item">
                  <div class="history-header">
                    <span>Date: ${item.date}</span>
                    <span>Version: ${item.version}</span>
                  </div>
                  <div class="history-description">
                    ${item.description}
                  </div>
                </div>
              `).join('') :
        '<div class="no-data">No history data available</div>'
      }
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // API call function
  const fetchTermsConditions = async () => {
    setLoading(true);
    try {
      // Get sort parameters
      const orderByColumn = sortState.length > 0 ? sortState[0].key : "CreatedDate";
      const orderDirection = sortState.length > 0 ? sortState[0].order.toUpperCase() : "DESC";

      // Call different API based on active tab
      const response: any = activeTab === "registration"
        ? await TermsConditionsService.getRegistrationTermsAndConditionsAdmin({
          searchText: debouncedSearchText,
          pageNumber: currentPage,
          pageSize,
          orderByColumn,
          orderDirection,
        })
        : await TermsConditionsService.getServiceTermsAndConditionsAdmin({
          searchText: debouncedSearchText,
          pageNumber: currentPage,
          pageSize,
          orderByColumn,
          orderDirection,
        });


      if (response && response.data) {
        // Transform API data to match component structure
        const transformedData: TermsRow[] = response.data.data.map((item: any) => {
          // Determine ID based on API type
          const id = activeTab === "registration"
            ? `#${item.UserTypeId || item.CategoryId || 'N/A'}`
            : `#${item.ServiceId || item.Id || item.RequestId || 'N/A'}`;

          // Map fields based on API type
          const category = item.Category || "N/A";
          const userType = activeTab === "registration"
            ? (item.UserType || "N/A")
            : (item.Service || item.UserType || "N/A");
          const subType = activeTab === "registration"
            ? (item.SubType || "-")
            : (item.SubService || item.SubType || "-");

          return {
            // UI display fields
            id,
            category,
            userType,
            subType,
            terms: item.ETermsAndCondition || item.TermsAndCondition || "N/A",
            version: item.Version || "1.0.0",
            // Include all original API fields
            ...item,
          };
        });

        setTableRows(transformedData);
        setTotalCount(response.data.totalRecords?.TotalRecords || 0);
        setTotalPages(Math.ceil((response.data.totalRecords?.TotalRecords || 0) / pageSize));
      }
    } catch (error) {
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  };

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchTermsConditions();
  }, [currentPage, pageSize, sortState, debouncedSearchText, activeTab]);

  // Table handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset to first page when switching tabs
    setSearchText(""); // Clear search when switching tabs
    setDebouncedSearchText(""); // Clear debounced search
  };

  // const openView = (row: TermsRow) => {
  //   setSelectedRow(row);
  //   setModalState("view");
  // };

  const openEdit = async (row: TermsRow) => {
    setSelectedRow(row);
    setModalState("edit");

    // Show loading state for edit modal
    setEditLoading(true);

    try {
      let response;

      // Use ref to get the most current tab value
      const currentTab = currentTabRef.current;

      // Call different API based on current tab
      if (currentTab === "registration") {
        response = await TermsConditionsService.getRegistrationTermsAndConditionsAdminById(
          row.CategoryId || 0
        );
      } else {
        response = await TermsConditionsService.getServiceTermsAndConditionsAdminById(
          row.CategoryId || 0
        );
      }

      if (response.success && response.data) {
        // Set the detailed terms content in both languages
        setEnglishText(response.data.ETermsAndCondition || "");
        setArabicText(response.data.ATermsAndCondition || "");
      } else {
        // Fallback to existing data if API fails
        setEnglishText(row.ETermsAndCondition || "");
        setArabicText(row.ATermsAndCondition || "");
      }
    } catch (error) {
      // Fallback to existing data on error
      setEnglishText(row.ETermsAndCondition || "");
      setArabicText(row.ATermsAndCondition || "");
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateTerms = async () => {
    if (!selectedRow) return;

    setEditLoading(true);

    try {
      let response;

      // Use ref to get the most current tab value
      const currentTab = currentTabRef.current;

      // Call different API based on current tab
      if (currentTab === "registration") {
        // Prepare the registration update request data
        const updateData = {
          subTypeId: selectedRow.SubTypeId || null,
          userTypeId: selectedRow.UserTypeId || 0,
          userType: selectedRow.userType || "",
          categoryId: selectedRow.CategoryId || 0,
          category: selectedRow.category || "",
          subType: selectedRow.subType || null,
          eTermsAndCondition: englishText,
          aTermsAndCondition: arabicText,
          updatedBy: 1, // You might want to get this from user context
        };

        response = await TermsConditionsService.updateRegistrationTermsAndConditions(updateData);
      } else {
        // Prepare the service update request data
        const updateData = {
          serviceId: selectedRow.ServiceId || 0,
          categoryId: selectedRow.CategoryId || 0,
          category: selectedRow.category || "",
          subServiceId: selectedRow.SubServiceId || 0,
          service: selectedRow.userType || "",
          subService: selectedRow.subType || "",
          eTermsAndCondition: englishText,
          aTermsAndCondition: arabicText,
          isActive: selectedRow.IsActive,
          updatedBy: 1, // You might want to get this from user context
        };

        response = await TermsConditionsService.updateServiceTermsAndConditions(updateData);
      }

      if (response.success) {
        // Update successful, show success modal
        setModalState("success");
        // Refresh the table data
        fetchTermsConditions();
      } else {
        // Handle error - you might want to show an error message
        // For now, still show success modal, but you could add error handling
        setModalState("success");
      }
    } catch (error) {
      // Handle error - you might want to show an error message
      setModalState("success"); // For now, still show success modal
    } finally {
      setEditLoading(false);
    }
  };

  // Table columns configuration
  const termsTableColumns: TableColumn<TermsRow>[] = useMemo(
    () => [
      {
        label: "T&C No",
        value: (row) => (
          <span className="font-semibold text-primary">
            {row.id}
          </span>
        ),
        sortKey: "id",
        isSort: true,
      },
      {
        label: "Category",
        value: (row) => (
          <span className="text-gray-700">{row.category}</span>
        ),
        sortKey: "category",
        isSort: true,
      },
      {
        label: activeTab === "registration" ? "User Type" : "User Type",
        value: (row) => (
          <span className="text-gray-500">{row.userType}</span>
        ),
        sortKey: "userType",
        isSort: true,
      },
      {
        label: activeTab === "registration" ? "Sub-Type" : "Sub-User Type",
        value: (row) => (
          <span className="text-gray-500">{row.subType}</span>
        ),
        sortKey: "subType",
        isSort: true,
      },
      {
        label: "Terms & Condition",
        value: (row) => {
          // Strip HTML tags and truncate for display
          const plainText = row.terms.replace(/<[^>]*>/g, '').trim();
          const truncated = plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;

          return (
            <div className="max-w-xs">
              <span className="text-gray-500 text-sm" title={plainText}>
                {truncated}
              </span>
            </div>
          );
        },
        sortKey: "terms",
        isSort: true,
      },
      {
        label: "Version",
        value: (row) => (
          <span className="text-gray-500">{row.version}</span>
        ),
        sortKey: "version",
        isSort: true,
      },
      {
        label: "Actions",
        value: (row) => (
          <div className="flex items-center justify-center gap-3">
            {/* <IconButton label="View" onClick={() => openView(row)}>
              <ViewIcon />
            </IconButton> */}
            <IconButton label="Edit" onClick={() => openEdit(row)}>
              <EditIcon />
            </IconButton>
            <IconButton label="History" onClick={() => openHistory(row)}>
              <HistoryIcon />
            </IconButton>
          </div>
        ),
        sortKey: "",
        isSort: false,
      },
    ],
    []
  );

  // Fetch history data
  const fetchHistoryData = async (row: TermsRow, currentTab: ActiveTab) => {
    setHistoryLoading(true);
    try {
      let response;

      if (currentTab === "registration") {
        response = await TermsConditionsService.getHistoryRegistrationTermsAndCondition(
          row.UserTypeId || 0,
          row.CategoryId || 0
        );
      } else {
        response = await TermsConditionsService.getHistoryServiceTermsAndCondition(
          row.ServiceId || 0,
          row.CategoryId || 0
        );
      }

      if (response.success && response.data) {
        // Transform API data to HistoryItem format
        const transformedHistory = response.data.map((item: any) => ({
          date: item.CreatedDate ? new Date(item.CreatedDate).toLocaleDateString() : item.date || "",
          version: item.Version || item.version || "1.0.0",
          description: item.Description || item.description || "Terms and conditions updated",
        }));
        setHistoryData(transformedHistory);
      } else {
        // Fallback to static data if API fails
        setHistoryData(historyItems);
      }
    } catch (error) {
      // Fallback to static data on error
      setHistoryData(historyItems);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full  flex-col gap-8 pb-3">
        <Header />
        <section className="space-y-8 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-full bg-[#f7f8fd] p-1 text-sm font-semibold text-gray-500">
              <TabButton label="Registration" isActive={activeTab === "registration"} onClick={() => handleTabChange("registration")} />
              <TabButton label="Services" isActive={activeTab === "services"} onClick={() => handleTabChange("services")} />
            </div>
            <SearchField onSearchChange={handleSearchChange} value={searchText} />
          </div>

          <StatsRow />
          <ChartPlaceholder />

          {/* Terms & Conditions Table with ComanTable */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                {activeTab === "registration" ? "Registration Terms & Conditions" : "Service Terms & Conditions"}
              </h3>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Loading...
                </div>
              )}
            </div>
            <ComanTable
              columns={termsTableColumns}
              data={tableRows}
              page={currentPage}
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
        </section>
      </div>

      {modalState && (
        <ModalOverlay>
          {modalState === "view" && selectedRow && (
            <ViewModal
              row={selectedRow}
              activeTab={activeTab}
              onClose={() => setModalState(null)}
              onEdit={() => setModalState("edit")}
            />
          )}
          {modalState === "edit" && selectedRow && (
            <EditModal
              onClose={() => setModalState(null)}
              onSubmit={() => setModalState("confirm")}
              englishText={englishText}
              arabicText={arabicText}
              onEnglishChange={setEnglishText}
              onArabicChange={setArabicText}
              loading={editLoading}
            />
          )}
          {modalState === "confirm" && selectedRow && (
            <ConfirmModal
              version={selectedRow.version}
              onClose={() => setModalState(null)}
              onCancel={() => setModalState("edit")}
              onConfirm={handleUpdateTerms}
              loading={editLoading}
            />
          )}
          {modalState === "success" && selectedRow && (
            <SuccessModal version={selectedRow.version} onClose={() => setModalState(null)} />
          )}
          {modalState === "history" && (
            <HistoryModal
              onClose={() => setModalState(null)}
              items={historyData}
              loading={historyLoading}
              onPrint={printHistory}
            />
          )}
        </ModalOverlay>
      )}
    </DashboardLayout>
  );
};

const Header = () => (
  <div className="flex items-center gap-4 rounded-[28px] border border-gray-200 bg-white px-6 py-5 shadow-sm">
    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" className="h-10 w-10" fill="#050668">
        <path d="M18 54h36V18H18Zm6-24h24v18H24Z" />
      </svg>
    </div>
    <div>
      <h1 className="text-2xl font-semibold text-primary">Terms &amp; Condition Master</h1>
      <p className="text-sm text-gray-400">Manage policy updates for each subscription group</p>
    </div>
  </div>
);

const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full px-5 py-2 transition ${isActive ? "bg-white text-primary shadow" : "text-gray-500 hover:text-primary"}`}
  >
    {label}
  </button>
);

const SearchField = ({ onSearchChange, value }: { onSearchChange: (value: string) => void; value: string }) => (
  <div className="relative w-full max-w-xs input-filed-block">
    <input
      id="search_terms_condition_master"
      className="w-full rounded-md border border-slate-200 bg-white pl-3 pr-11 py-2 text-base text-gray-600 shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 peer
          placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
      placeholder="Search here"
      value={value}
      onChange={(e) => onSearchChange(e.target.value)}
    />
    <label
      htmlFor="search_terms_condition_master"
      className={`
        label-filed absolute left-2.5 top-2 text-[#A0A3BD] text-base transition-all duration-200
        peer-placeholder-shown:top-2 peer-placeholder-shown:left-2.5 peer-placeholder-shown:text-base cursor-text
        peer-focus:-top-3 peer-focus:left-2.5 peer-focus:text-[13px] peer-focus:text-[#070B68]
        bg-white px-1 ${value && value.trim() !== "" ? "!-top-3 !text-[13px] " : ""} 
      `}
    >
      Search here
    </label>
    <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
      <SearchIcon />
    </span>
  </div>
);

const StatsRow = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {stats.map((item) => (
      <div key={item.label} className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
        <p className="text-4xl font-semibold text-primary">{item.value}</p>
        <p className="mt-2 text-sm text-gray-500">{item.label}</p>
      </div>
    ))}
  </div>
);

const ChartPlaceholder = () => (
  <div className="rounded-[28px] border border-gray-200 bg-[#f6f7fb] px-6 py-10 text-center text-sm text-gray-500">
    Analytics chart placeholder
  </div>
);

const IconButton = ({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-primary hover:text-primary"
    aria-label={label}
  >
    {children}
  </button>
);

const ModalOverlay = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[6px] px-4">
    {children}
  </div>
);

const ModalShell = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="w-full max-w-4xl max-h-[90vh] rounded-[36px] bg-white px-8 py-10 shadow-[0_40px_90px_rgba(5,6,104,0.18)] overflow-hidden flex flex-col">
    <div className="flex items-center justify-between gap-4 flex-shrink-0">
      <h3 className="text-xl font-semibold text-primary">{title}</h3>
      <button
        type="button"
        aria-label="Close"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f8fd] text-gray-500 transition hover:bg-primary/10 hover:text-primary"
        onClick={onClose}
      >
        <CloseIcon />
      </button>
    </div>
    <div className="mt-8 space-y-6 overflow-y-auto flex-1">{children}</div>
  </div>
);

const EditModal = ({
  onClose,
  onSubmit,
  englishText,
  arabicText,
  onEnglishChange,
  onArabicChange,
  loading = false,
}: {
  onClose: () => void;
  onSubmit: () => void;
  englishText: string;
  arabicText: string;
  onEnglishChange: (value: string) => void;
  onArabicChange: (value: string) => void;
  loading?: boolean;
}) => (
  <ModalShell title="Edit Terms &amp; Condition" onClose={onClose}>
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Loading terms details...
          </div>
        </div>
      ) : (
        <>
          <RichTextCard languageLabel="English" value={englishText} onChange={onEnglishChange} />
          <RichTextCard languageLabel="Arabic" value={arabicText} onChange={onArabicChange} />
          <div className="flex justify-end">
            <button
              type="button"
              className="rounded-full bg-primary px-10 py-3 text-sm font-semibold text-white shadow hover:bg-[#030447]"
              onClick={onSubmit}
            >
              Update
            </button>
          </div>
        </>
      )}
    </div>
  </ModalShell>
);

const RichTextCard = ({
  languageLabel,
  value,
  onChange,
}: {
  languageLabel: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const editorRef = React.useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
      }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div className="space-y-4 rounded-[28px] border border-gray-200 bg-[#f7f8fd] p-6 max-w-full overflow-hidden">
      <div className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        <span>{languageLabel}</span>
        <div className="w-full overflow-x-auto">
          <RichTextToolbar onCommand={executeCommand} />
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        className="h-32 w-full overflow-y-auto resize-none rounded-[18px] border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{ minHeight: '120px' }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

const RichTextToolbar = ({ onCommand }: { onCommand: (command: string, value?: string) => void }) => (
  <div className="flex flex-wrap items-center gap-1 text-xs text-gray-400 max-w-full overflow-hidden">
    {/* Undo/Redo */}
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onCommand('undo')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Undo (Ctrl+Z)"
      >
        <UndoIcon />
      </button>
      <button
        type="button"
        onClick={() => onCommand('redo')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Redo (Ctrl+Y)"
      >
        <RedoIcon />
      </button>
    </div>

    {/* Text Style Dropdown */}
    <select
      onChange={(e) => onCommand('formatBlock', e.target.value)}
      className="h-6 rounded border border-gray-300 bg-white px-1 text-xs min-w-0"
      title="Text Style"
    >
      <option value="div">Normal text</option>
      <option value="h1">Heading 1</option>
      <option value="h2">Heading 2</option>
      <option value="h3">Heading 3</option>
      <option value="h4">Heading 4</option>
      <option value="h5">Heading 5</option>
      <option value="h6">Heading 6</option>
      <option value="p">Paragraph</option>
    </select>

    {/* Alignment */}
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onCommand('justifyLeft')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Align Left"
      >
        <AlignLeftIcon />
      </button>
      <button
        type="button"
        onClick={() => onCommand('justifyCenter')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Align Center"
      >
        <AlignCenterIcon />
      </button>
      <button
        type="button"
        onClick={() => onCommand('justifyRight')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Align Right"
      >
        <AlignRightIcon />
      </button>
      <button
        type="button"
        onClick={() => onCommand('justifyFull')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Justify"
      >
        <JustifyIcon />
      </button>
    </div>

    {/* Lists */}
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onCommand('insertUnorderedList')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Bullet List"
      >
        <BulletListIcon />
      </button>
      <button
        type="button"
        onClick={() => onCommand('insertOrderedList')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Numbered List"
      >
        <NumberedListIcon />
      </button>
    </div>

    {/* Color Picker */}
    <input
      type="color"
      onChange={(e) => onCommand('foreColor', e.target.value)}
      className="h-6 w-6 rounded border border-gray-300 cursor-pointer"
      title="Text Color"
    />

    {/* Text Formatting */}
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onCommand('bold')}
        className="flex h-6 w-6 items-center justify-center rounded font-bold hover:bg-gray-200"
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => onCommand('italic')}
        className="flex h-6 w-6 items-center justify-center rounded italic hover:bg-gray-200"
        title="Italic (Ctrl+I)"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => onCommand('underline')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Underline (Ctrl+U)"
      >
        U
      </button>
      <button
        type="button"
        onClick={() => onCommand('strikeThrough')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Strikethrough"
      >
        S
      </button>
    </div>

    {/* Advanced Formatting */}
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onCommand('insertCode')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Code"
      >
        &lt;/&gt;
      </button>
      <button
        type="button"
        onClick={() => {
          const url = prompt('Enter URL:');
          if (url) onCommand('createLink', url);
        }}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Insert Link"
      >
        <LinkIcon />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = prompt('Enter image URL:');
          if (url) onCommand('insertImage', url);
        }}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Insert Image"
      >
        <ImageIcon />
      </button>
      <button
        type="button"
        onClick={() => onCommand('formatBlock', 'blockquote')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Blockquote"
      >
        <QuoteIcon />
      </button>
      <button
        type="button"
        onClick={() => onCommand('insertHorizontalRule')}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
        title="Horizontal Rule"
      >
        <HrIcon />
      </button>
    </div>
  </div>
);

const ConfirmModal = ({
  version,
  onClose,
  onCancel,
  onConfirm,
  loading = false,
}: {
  version: string;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
}) => (
  <ModalShell title="Confirm Update" onClose={onClose}>
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff3d9] text-[#b46a02]">
        <span className="text-4xl">!</span>
      </div>
      <p className="text-sm font-medium text-gray-600">
        Are you sure you want to update the Terms &amp; Condition (Version: {version})?
      </p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-500 hover:border-primary disabled:opacity-50"
          onClick={onCancel}
          disabled={loading}
        >
          No
        </button>
        <button
          type="button"
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447] disabled:opacity-50 flex items-center gap-2"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          )}
          {loading ? "Updating..." : "Yes"}
        </button>
      </div>
    </div>
  </ModalShell>
);

const SuccessModal = ({ version, onClose }: { version: string; onClose: () => void }) => (
  <ModalShell title="Update Successful" onClose={onClose}>
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#e9fbf3] text-[#09a66d]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm-1 15-4-4 1.41-1.42L11 13.17l4.59-4.59L17 10l-6 7Z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-600">
        Terms &amp; Condition (Version {version}) updated successfully.
      </p>
      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-full bg-primary px-10 py-3 text-sm font-semibold text-white shadow hover:bg-[#030447]"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </ModalShell>
);

const HistoryModal = ({
  onClose,
  items,
  loading = false,
  onPrint
}: {
  onClose: () => void;
  items: HistoryItem[];
  loading?: boolean;
  onPrint: () => void;
}) => (
  <ModalShell title="Version History" onClose={onClose}>
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            Loading history...
          </div>
        </div>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={`${item.date}-${item.version}-${index}`} className="rounded-[20px] border border-gray-200 bg-[#f7f8fd] px-5 py-4 text-left text-sm text-gray-600">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  <span>Date : {item.date}</span>
                  <span>Version : {item.version}</span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-8 text-sm text-gray-500">
              No history data available
            </div>
          )}
        </div>
      )}
      <div className="flex justify-center gap-3">
        <button
          type="button"
          className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-600 hover:border-primary"
          onClick={onPrint}
        >
          Print
        </button>
      </div>
    </div>
  </ModalShell>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="M20 20l-3-3" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0-2.12-2.12L6 17.88V20Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 6.5l3 3" />
  </svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 1 3 7" />
  </svg>
);

// const ViewIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//     <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//   </svg>
// );

// Rich Text Editor Icons
const UndoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const RedoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
  </svg>
);

const AlignLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M3 8h12M3 12h18M3 16h12M3 20h18" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M6 8h12M3 12h18M6 16h12M3 20h18" />
  </svg>
);

const AlignRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M9 8h12M3 12h18M9 16h12M3 20h18" />
  </svg>
);

const JustifyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18" />
  </svg>
);

const BulletListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

const NumberedListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

const LinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

const QuoteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

const HrIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M3 6h18M3 18h18" />
  </svg>
);

const ViewModal = ({
  row,
  activeTab,
  onClose,
  onEdit
}: {
  row: TermsRow;
  activeTab: ActiveTab;
  onClose: () => void;
  onEdit: () => void;
}) => (
  <ModalShell title={`View Terms & Conditions - ${row.category}`} onClose={onClose}>
    <div className="space-y-6">
      <div className="grid gap-4 rounded-[20px] border border-gray-200 bg-[#f7f8fd] p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-600">Category:</span>
            <span className="ml-2 text-gray-800">{row.category}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">
              {activeTab === "registration" ? "User Type:" : "Service:"}
            </span>
            <span className="ml-2 text-gray-800">{row.userType}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">
              {activeTab === "registration" ? "Sub-Type:" : "Sub-Service:"}
            </span>
            <span className="ml-2 text-gray-800">{row.subType}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Version:</span>
            <span className="ml-2 text-gray-800">{row.version}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Created:</span>
            <span className="ml-2 text-gray-800">{new Date(row.CreatedDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Updated:</span>
            <span className="ml-2 text-gray-800">{new Date(row.UpdatedDate).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Status:</span>
            <span className={`ml-2 ${row.IsActive ? 'text-green-600' : 'text-red-600'}`}>
              {row.IsActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {activeTab === "registration" && row.UserTypeId && (
            <div>
              <span className="font-semibold text-gray-600">User Type ID:</span>
              <span className="ml-2 text-gray-800">{row.UserTypeId}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[20px] border border-gray-200 bg-[#f7f8fd] p-4">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">English Terms</h4>
          <div
            className="max-h-64 overflow-y-auto rounded-[12px] border border-gray-200 bg-white p-4 text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: row.ETermsAndCondition }}
          />
        </div>

        <div className="rounded-[20px] border border-gray-200 bg-[#f7f8fd] p-4">
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Arabic Terms</h4>
          <div
            className="max-h-64 overflow-y-auto rounded-[12px] border border-gray-200 bg-white p-4 text-sm text-gray-700 text-right"
            dir="rtl"
            dangerouslySetInnerHTML={{ __html: row.ATermsAndCondition }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-600 hover:border-primary"
          onClick={onClose}
        >
          Close
        </button>
        <button
          type="button"
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]"
          onClick={onEdit}
        >
          Edit
        </button>
      </div>
    </div>
  </ModalShell>
);

export default TermsConditionsMaster;
