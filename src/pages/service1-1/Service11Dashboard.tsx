import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../../components/common/ComanTable";
import {
  getUserWisePointsAndClassGraphOrStatusDetails,
  type UserWisePointsAndClassParams,
  type GraphOrStatusDetailsResponse,
} from "../../services/AccountService";
import {
  getAllHospitalNetwork,
  type HospitalNetworkRecord,
} from "../../services/IndividualUserInsuranceService";

// Use the API record type
type Category1Service1Record = HospitalNetworkRecord;

const Service11Dashboard = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState<Category1Service1Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortState, setSortState] = useState<SortState[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [graphData, setGraphData] =
    useState<GraphOrStatusDetailsResponse | null>(null);
  const [graphLoading, setGraphLoading] = useState(true);

  const fetchDataFromAPI = async (
    searchTerm?: string
  ): Promise<Category1Service1Record[]> => {
    try {
      const params: UserWisePointsAndClassParams = {
        searchText: searchTerm || searchText,
        pageNumber: pageNumber,
        pageSize: pageSize,
        orderByColumn: sortState.length > 0 ? sortState[0].key : "CreatedDate",
        orderDirection:
          sortState.length > 0 ? sortState[0].order.toUpperCase() : "DESC",
      };

      const response = await getAllHospitalNetwork(params);

      setTotalCount(response.totalRecords || 0);
      setTotalPages(Math.ceil((response.totalRecords || 0) / pageSize));

      return response?.data || [];
    } catch (error) {
      console.error("Error fetching data from API:", error);
      throw error;
    }
  };

  const fetchGraphData = async () => {
    try {
      setGraphLoading(true);
      const response = await getUserWisePointsAndClassGraphOrStatusDetails();
      setGraphData(response);
    } catch (error) {
      console.error("Error fetching graph data:", error);
    } finally {
      setGraphLoading(false);
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
    fetchGraphData();
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

  console.log("Records:", records);
  console.log("Total Count:", totalCount);

  const handleViewDetails = (row: Category1Service1Record) => {
    // Navigate to service details page
    navigate(`/service1-1/${row.id}`, {
      state: { service: row },
    });
  };

  const tableColumns: TableColumn<Category1Service1Record>[] = [
    {
      label: "ID No",
      value: (row) => (
        <span className="font-semibold text-primary">#{row.id}</span>
      ),
      sortKey: "id",
      isSort: true,
    },
    {
      label: "Hospital Name",
      value: (row) => (
        <span className="text-gray-700 font-medium">
          {row.businessName || "N/A"}
        </span>
      ),
      sortKey: "businessName",
      isSort: true,
    },
    {
      label: "Grades",
      value: (row) => {
        const getCategoryColor = (category: string) => {
          switch (category) {
            case "VIP":
              return "bg-purple-100 text-purple-800";
            case "A":
              return "bg-green-100 text-green-800";
            case "B":
              return "bg-blue-100 text-blue-800";
            case "Invalid":
              return "bg-red-100 text-red-800";
            default:
              return "bg-gray-100 text-gray-800";
          }
        };
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(
              row.class ? row.class : "N/A"
            )}`}
          >
            {row.class}
          </span>
        );
      },
      sortKey: "class",
      isSort: true,
    },
    {
      label: "Email",
      value: (row) => <span className="text-gray-600">{row.email}</span>,
      sortKey: "email",
      isSort: true,
    },
    {
      label: "Phone Number",
      value: (row) => (
        <span className="text-gray-600">{row.facilityOfficialPhoneNumber}</span>
      ),
      sortKey: "facilityOfficialPhoneNumber",
      isSort: true,
    },
    {
      label: "Country",
      value: (row) => (
        <span className="text-gray-600">{row.country || "N/A"}</span>
      ),
      sortKey: "country",
      isSort: true,
    },
    {
      label: "Region",
      value: (row) => (
        <span className="text-gray-600">{row.region || "N/A"}</span>
      ),
      sortKey: "region",
      isSort: true,
    },
    {
      label: "City",
      value: (row) => (
        <span className="text-gray-600">{row.city || "N/A"}</span>
      ),
      sortKey: "city",
      isSort: true,
    },
  ];

  const handleEditAction = (row: Category1Service1Record) => {
    console.log("Editing business:", row.id);
    alert(`Editing business #${row.id} - ${row.businessName || "N/A"}`);
  };

  const handlePrintAction = () => {
    console.log("Printing request");
    window.print();
  };

  const actionButtons: ActionButton<Category1Service1Record>[] = [
    {
      label: "Edit",
      iconType: "edit",
      onClick: (row) => handleEditAction(row),
      isVisible: () => true,
    },
    {
      label: "View Details",
      iconType: "view",
      onClick: (row) => handleViewDetails(row),
      isVisible: () => true,
    },
    {
      label: "Download",
      iconType: "download",
      onClick: (row) => handlePrintAction(row.certificatePath || ""),
      isVisible: () => true,
    },
  ];

  if (loading && records.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading hospital data...</p>
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
        {/* Header Section */}
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
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                Export
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">
            Hospital Network Management
          </h1>
        </header>

        {/* Analytics Section */}
        <div className="mb-8">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Key Metrics */}
            <div className="lg:col-span-3">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="bg-white rounded-2xl p-6 shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">
                    {graphLoading ? (
                      <div className="animate-pulse bg-gray-200 h-10 w-20 rounded"></div>
                    ) : (
                      graphData?.statusSummary?.[0]?.TotalHospital?.toLocaleString() ||
                      totalCount
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">Total Hospitals</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">
                    {graphLoading ? (
                      <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
                    ) : (
                      graphData?.statusSummary?.[0]?.TotalCity?.toLocaleString() ||
                      records
                        .reduce((sum, record) => sum + record.points, 0)
                        .toLocaleString()
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">Total Cities</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">
                    {graphLoading ? (
                      <div className="animate-pulse bg-gray-200 h-10 w-16 rounded"></div>
                    ) : (
                      graphData?.statusSummary?.[0]?.TotalIdNumber?.toLocaleString() ||
                      new Set(records.map((record) => record.category)).size
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">Total ID Numbers</p>
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-2xl p-6 shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Monthly Overview
              </h3>
              {graphLoading ? (
                <div className="h-32 flex items-end justify-between gap-1">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 rounded-t flex-1 animate-pulse"
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="h-32 flex items-end justify-between gap-1">
                    {graphData?.monthlyGraph?.map((item, index) => {
                      const maxValue = Math.max(
                        ...(graphData?.monthlyGraph?.map(
                          (d) => d.TotalHospital
                        ) || [1])
                      );
                      const height =
                        maxValue > 0
                          ? (item.TotalHospital / maxValue) * 100
                          : 0;
                      return (
                        <div
                          key={index}
                          className="bg-primary rounded-t flex-1 transition-all duration-300 hover:bg-primary-dark"
                          style={{ height: `${height}%` }}
                          title={`${item.Month}: ${item.TotalHospital} hospitals`}
                        />
                      );
                    }) ||
                      [65, 80, 45, 90, 110, 75, 85, 95, 70, 88, 92, 78].map(
                        (height, index) => (
                          <div
                            key={index}
                            className="bg-primary rounded-t flex-1"
                            style={{ height: `${(height / 110) * 100}%` }}
                          />
                        )
                      )}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {graphData?.monthlyGraph?.map((item, index) => (
                      <span key={index}>{item.Month.substring(0, 3)}</span>
                    )) || (
                      <>
                        <span>Jan</span>
                        <span>Mar</span>
                        <span>May</span>
                        <span>Jul</span>
                        <span>Sep</span>
                        <span>Nov</span>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-6">
          <div className="relative input-filed-block">
            <input
              type="text"
              id="search_hospitals"
              placeholder="Search hospitals by name, country, or category..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full rounded-md border border-slate-200 bg-white pl-3 pr-11 py-2 text-base text-gray-600 shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 peer
              placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
            />
            <label
              htmlFor="search_hospitals"
              className={`
              label-filed absolute left-2.5 top-2 text-[#A0A3BD] text-base transition-all duration-200
              peer-placeholder-shown:top-2 peer-placeholder-shown:left-2.5 peer-placeholder-shown:text-base cursor-text
              peer-focus:-top-3 peer-focus:left-2.5 peer-focus:text-[13px] peer-focus:text-[#070B68]
              bg-white px-1 ${
                searchText && searchText.trim() !== ""
                  ? "!-top-3 !text-[13px] "
                  : ""
              } 
            `}
            >
              Search hospitals by name, country, or category...
            </label>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
              <SearchIcon />
            </span>
          </div>
        </div>

        {/* Service Table */}
        <div className="rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
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
      </div>
    </DashboardLayout>
  );
};

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
    <path strokeLinecap="round" d="M20 20l-3-3" />
  </svg>
);

export default Service11Dashboard;
