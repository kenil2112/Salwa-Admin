import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../../components/common/ComanTable";
import MedicalEquipmentAndFacilitiesService, {
  type RentMedicalEquipmentRecord,
  type GetAllRentMedicalEquipmentParams,
} from "../../services/MedicalEquipmentAndFacilitiesService";

const Service21Dashboard = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<RentMedicalEquipmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortState, setSortState] = useState<SortState[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");

  const fetchDataFromAPI = async (searchTerm?: string): Promise<RentMedicalEquipmentRecord[]> => {
    try {
      const params: GetAllRentMedicalEquipmentParams = {
        searchText: searchTerm || searchText,
        pageNumber: pageNumber,
        pageSize: pageSize,
        orderByColumn: sortState.length > 0 ? sortState[0].key : "Id",
        orderDirection: sortState.length > 0 ? sortState[0].order.toUpperCase() : "ASC",
      };

      const response = await MedicalEquipmentAndFacilitiesService.GetAllRentMedicalEquipmentForAdmin(params);

      if (response && response.success) {
        const responseData = response as any;
        setTotalCount(responseData?.totalRecords || 0);
        setTotalPages(Math.ceil((responseData?.totalRecords || 0) / pageSize) || 1);
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

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiData = await fetchDataFromAPI(searchText);
      setRecords(apiData);
      setPageNumber(1); // Reset to first page when searching
    } catch (err) {
      console.error("Error searching data:", err);
      setError("Failed to search data");
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = async () => {
    setSearchText("");
    try {
      setLoading(true);
      setError(null);
      const apiData = await fetchDataFromAPI("");
      setRecords(apiData);
      setPageNumber(1);
    } catch (err) {
      console.error("Error clearing search:", err);
      setError("Failed to clear search");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (row: RentMedicalEquipmentRecord) => {
    // Navigate to equipment details page
    navigate(`/service2-1/${row.requestId}`, {
      state: { equipment: row }
    });
  };


  const getStatusBadgeClassByName = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tableColumns: TableColumn<RentMedicalEquipmentRecord>[] = [
    {
      label: "Request ID",
      value: (row) => (
        <span className="font-semibold text-primary">#{row.requestId}</span>
      ),
      sortKey: "requestId",
      isSort: true,
    },
    {
      label: "Order Title",
      value: (row) => <span className="text-gray-700 font-medium">{row.orderTitle}</span>,
      sortKey: "orderTitle",
      isSort: true,
    },
    {
      label: "Device Name",
      value: (row) => <span className="text-gray-600">{row.deviceName}</span>,
      sortKey: "deviceName",
      isSort: true,
    },
    {
      label: "Device Type",
      value: (row) => <span className="text-gray-600">{row.deviceTypeName || "N/A"}</span>,
      sortKey: "deviceTypeName",
      isSort: true,
    },
    {
      label: "Rent Value",
      value: (row) => (
        <span className="text-green-600 font-semibold">
          {row.rentValue} SAR
        </span>
      ),
      sortKey: "rentValue",
      isSort: true,
    },
    {
      label: "Rent Period",
      value: (row) => (
        <span className="text-gray-600">{row.rentPeriod} days</span>
      ),
      sortKey: "rentPeriod",
      isSort: true,
    },
    {
      label: "Location",
      value: (row) => (
        <div className="text-gray-600">
          <div>{row.city || "N/A"}, {row.country || "N/A"}</div>
          <div className="text-xs text-gray-500">{row.region || "N/A"}</div>
        </div>
      ),
      sortKey: "city",
      isSort: true,
    },
    {
      label: "Contact Person",
      value: (row) => (
        <div className="text-gray-700">
          <div className="font-medium">{row.contactPersonName}</div>
          <div className="text-xs text-gray-500">{row.contactPersonEmail}</div>
        </div>
      ),
      sortKey: "contactPersonName",
      isSort: true,
    },
    {
      label: "Status",
      value: (row) => (
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClassByName(row.statusName)}`}
        >
          {row.statusName}
        </span>
      ),
      sortKey: "statusName",
      isSort: true,
    },
  ];

  const handlePublishAction = async (row: RentMedicalEquipmentRecord) => {
    // TODO: Implement publish functionality
    console.log("Publishing request:", row.requestId);
    alert(`Publishing request #${row.requestId} - ${row.orderTitle}`);
  };

  const actionButtons: ActionButton<RentMedicalEquipmentRecord>[] = [
    {
      label: "View Details",
      iconType: "view",
      onClick: (row) => handleViewDetails(row),
      isVisible: () => true,
    },
    {
      label: "Publish",
      iconType: "publish",
      onClick: (row) => handlePublishAction(row),
      isVisible: (row) => row.statusName === "Approved",
    },
  ];

  if (loading && records.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading medical equipment rental requests...</p>
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
                  Back to Service Dashboard
                </span>
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Medical Equipment Rental Requests
            </h1>
          </div>
        </header>

        {/* Search Section */}
        <div className="mb-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative input-filed-block">
                <input
                  type="text"
                  id="search_requests"
                  placeholder="Search requests by title, device name, or contact person..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
                />
                <label
                  htmlFor="search_requests"
                  className={`
                        label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                        peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                        peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                        bg-white px-1  ${searchText && searchText.trim() !== "" ? "!-top-3 !left-3 !text-[13px]" : ""} 
                        `}
                >
                  Search requests by title, device name, or contact person...
                </label>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  <SearchIcon />
                </span>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Search
              </button>
              <button
                onClick={handleClearSearch}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 sm:grid-cols-4 mb-8">
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">{totalCount}</h3>
            <p className="text-sm text-gray-600">Total Requests</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">
              {records.filter(r => r.statusName === 'Published').length}
            </h3>
            <p className="text-sm text-gray-600">Published</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">
              {records.filter(r => r.statusName === 'Approved').length}
            </h3>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
          <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
            <h3 className="mb-2 text-4xl font-bold text-gray-900">
              {records.filter(r => r.statusName === 'Rejected').length}
            </h3>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>

        {/* Equipment Table */}
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

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="M20 20l-3-3" />
  </svg>
);

export default Service21Dashboard;
