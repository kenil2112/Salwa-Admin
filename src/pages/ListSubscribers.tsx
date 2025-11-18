import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  type SubscriberRecord,
  type SubscriberAnalytics,
} from "../services/SubscriberService";
import {
  getSubscriberAnalyticsMock,
  exportSubscribersMock,
} from "../services/SubscriberMockService";
import {
  getAllIndividualUserDetails,
  type IndividualUserParams,
} from "../services/IndividualUserInsuranceService";
import {
  getAllBusinessUserDetails,
  type BusinessUserParams,
} from "../services/BusinessUserDetailsService";
import {
  getAllGovernmentUserDetails,
  type GovernmentUserParams,
} from "../services/GovernmentUserDetailService";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../components/common/ComanTable";
type TabType = "Individual" | "Business" | "Government";

const ListSubscribers = () => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [analytics, setAnalytics] = useState<SubscriberAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("Individual");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(1501);
  const [pageSize, setPageSize] = useState(10);
  const [sortState, setSortState] = useState<SortState[]>([]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "Individual") {
        // Use Individual User Insurance API for Individual tab
        const sortColumn = sortState.length > 0 ? sortState[0].key : "Id";
        const sortDirection =
          sortState.length > 0 ? sortState[0].order.toUpperCase() : "DESC";

        const params: IndividualUserParams = {
          searchText,
          pageNumber: currentPage,
          pageSize,
          orderByColumn: sortColumn,
          orderDirection: sortDirection,
        };

        const response = await getAllIndividualUserDetails(params);

        console.log("Transformed Records:", response.records);
        setSubscribers(response.records);
        setTotalCount(response.totalCount);
      } else if (activeTab === "Business") {
        // Use Business User Details API for Business tab
        const sortColumn =
          sortState.length > 0 ? sortState[0].key : "CreatedDate";
        const sortDirection =
          sortState.length > 0 ? sortState[0].order.toUpperCase() : "DESC";

        const params: BusinessUserParams = {
          searchText,
          pageNumber: currentPage,
          pageSize,
          orderByColumn: sortColumn,
          orderDirection: sortDirection,
        };

        const response = await getAllBusinessUserDetails(params);
        console.log("Business API Response:", response);
        console.log("Transformed Business Records:", response.records);
        setSubscribers(response.records);
        setTotalCount(response.totalCount);
      } else {
        // Use Government User Details API for Government tab
        const sortColumn =
          sortState.length > 0 ? sortState[0].key : "CreatedDate";
        const sortDirection =
          sortState.length > 0 ? sortState[0].order.toUpperCase() : "DESC";

        const params: GovernmentUserParams = {
          searchText,
          pageNumber: currentPage,
          pageSize,
          orderByColumn: sortColumn,
          orderDirection: sortDirection,
        };

        const response = await getAllGovernmentUserDetails(params);
        console.log("Government API Response:", response);
        console.log("Transformed Government Records:", response.records);
        setSubscribers(response.records);
        setTotalCount(response.totalCount);
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch subscribers"
      );
      setSubscribers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Use mock service for now - replace with real API when available
      const data = await getSubscriberAnalyticsMock();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [activeTab, currentPage, searchText, pageSize, sortState]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = async () => {
    try {
      // Use mock service for now - replace with real API when available
      await exportSubscribersMock({
        searchText,
        status: activeTab as "Individual" | "Business" | "Government",
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Table columns configuration
  const tableColumns: TableColumn<SubscriberRecord>[] = useMemo(
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
        label: " User Type",
        value: (row) => (
          <span className="font-helveticaBold text-primary">{row?.userType}</span>
        ),
        sortKey: "id",
        isSort: true,
      },
      {
        label: "Sub User Type",
        value: (row: any) => (
          <span className="font-helveticaBold text-primary">{row?.subUserTypeIdName}</span>
        ),
        sortKey: "subUserTypeIdName",
        isSort: true,
      },
      {
        label: "Name",
        value: (row: any) => (
          <div className="flex flex-col">
            <span className="text-gray-600 text-sm">
              {row?.name
              }
            </span>
          </div>
        ),
        sortKey: "insuranceMemberName",
        isSort: true,
      },
      {
        label: "Email",
        value: (row) => (
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">{row.email}</span>
          </div>
        ),
        sortKey: "email",
        isSort: true,
      },
      {
        label: "Phone",
        value: (row) => (
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">{row.phoneNumber}</span>
          </div>
        ),
        sortKey: "phoneNumber",
        isSort: true,
      },
      {
        label: "Subscription Amount",
        value: (row: any) => (
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">
              {row.subscriptionAmount}
            </span>
          </div>
        ),
        sortKey: "subscriptionAmount",
        isSort: true,
      },
      {
        label: "Subscription Due Date",
        value: (row: any) => (
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">
              {row.insurancePolicyExpiryDate}
            </span>
          </div>
        ),
        sortKey: "insurancePolicyExpiryDate",
        isSort: true,
      },
      {
        label: "Subscr",
        value: (row) => (
          <div className="flex flex-col">
            <span className="text-gray-700 text-sm">
              {row.city}, {row.region}
            </span>
            <span className="text-gray-500 text-xs">{row.country}</span>
          </div>
        ),
        sortKey: "city",
        isSort: true,
      },
      {
        label:
          activeTab === "Business"
            ? "Business Info"
            : activeTab === "Government"
              ? "Ministry/Department"
              : "Insurance",
        value: (row) => (
          <div className="flex flex-col">
            {activeTab === "Business" ? (
              <>
                <span className="text-gray-700 text-sm">
                  {(row as any).businessSector || "N/A"}
                </span>
                {(row as any).numberOfEmployees && (
                  <span className="text-gray-500 text-xs">
                    {(row as any).numberOfEmployees} employees
                  </span>
                )}
              </>
            ) : activeTab === "Government" ? (
              <>
                <span className="text-gray-700 text-sm">
                  {(row as any).ministryName || "N/A"}
                </span>
                {(row as any).employmentLevel && (
                  <span className="text-gray-500 text-xs">
                    {(row as any).employmentLevel}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="text-gray-700 text-sm">
                  {row.insuranceProvider || "No Insurance"}
                </span>
                {row.policyNumber && (
                  <span className="text-gray-500 text-xs">
                    Policy: {row.policyNumber}
                  </span>
                )}
              </>
            )}
          </div>
        ),
        sortKey:
          activeTab === "Business"
            ? "businessSector"
            : activeTab === "Government"
              ? "ministryName"
              : "insuranceProvider",
        isSort: true,
      },
      {
        label: "Status",
        value: (row) => (
          <div className="flex flex-col space-y-1">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${row.status === "Active"
                ? "bg-green-100 text-green-800"
                : row.status === "Inactive"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
                }`}
            >
              {row.status}
            </span>
            {activeTab === "Individual" &&
              (row as any).isApproved !== undefined && (
                <span
                  className={`text-xs ${(row as any).isApproved
                    ? "text-green-600"
                    : "text-yellow-600"
                    }`}
                >
                  {(row as any).isApproved ? "Approved" : "Pending"}
                </span>
              )}
            {activeTab === "Business" &&
              (row as any).isVerified !== undefined && (
                <span
                  className={`text-xs ${(row as any).isVerified
                    ? "text-green-600"
                    : "text-yellow-600"
                    }`}
                >
                  {(row as any).isVerified ? "Verified" : "Unverified"}
                </span>
              )}
            {activeTab === "Government" &&
              (row as any).isVerified !== undefined && (
                <span
                  className={`text-xs ${(row as any).isVerified
                    ? "text-green-600"
                    : "text-yellow-600"
                    }`}
                >
                  {(row as any).isVerified ? "Verified" : "Unverified"}
                </span>
              )}
          </div>
        ),
        sortKey: "status",
        isSort: true,
      },
      {
        label:
          activeTab === "Business"
            ? "Revenue"
            : activeTab === "Government"
              ? "Salary Grade"
              : "Stage",
        value: (row) =>
          activeTab === "Business" ? (
            <span className="text-gray-600 text-sm">
              {row.subscriptionAmount > 0
                ? `$${row.subscriptionAmount.toLocaleString()}`
                : "N/A"}
            </span>
          ) : activeTab === "Government" ? (
            <span className="text-gray-600 text-sm">
              {(row as any).salaryGrade || "N/A"}
            </span>
          ) : (
            <span className="text-gray-600 text-sm">
              Stage {(row as any).currentStage || "N/A"}
            </span>
          ),
        sortKey:
          activeTab === "Business"
            ? "subscriptionAmount"
            : activeTab === "Government"
              ? "salaryGrade"
              : "currentStage",
        isSort: true,
      },
    ],
    [activeTab]
  );

  // Action buttons configuration
  const actionButtons: ActionButton<SubscriberRecord>[] = useMemo(
    () => [
      {
        label: "View",
        iconType: "view",
        onClick: (row) => {
          navigate(`/user-details/${row.id}/${activeTab.toLowerCase()}`);
        },
      },
      {
        label: "Edit",
        iconType: "edit",
        onClick: (row) => {
          console.log("Edit subscriber:", row);
          // Add edit functionality
        },
      },
      {
        label: "Delete",
        iconType: "delete",
        onClick: (row) => {
          console.log("Delete subscriber:", row);
          // Add delete functionality
        },
      },
    ],
    []
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full flex-col gap-8 pb-3">
        <Header />

        {/* Analytics Section */}
        {analytics && (
          <section className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {analytics.totalActive}
                </div>
                <div className="text-sm text-gray-500">Total Active</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {analytics.totalInactive}
                </div>
                <div className="text-sm text-gray-500">Total Inactive</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {analytics.totalUsers}
                </div>
                <div className="text-sm text-gray-500">Total User</div>
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="h-32 bg-gray-50 rounded-lg p-4">
              <div className="flex items-end justify-between h-full space-x-2">
                {analytics.monthlyData.slice(0, 6).map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    <div className="flex flex-col justify-end h-20 w-full">
                      <div
                        className="bg-primary rounded-t"
                        style={{
                          height: `${(data.active /
                            Math.max(
                              ...analytics.monthlyData.map((d) => d.active)
                            )) *
                            100
                            }%`,
                        }}
                      />
                      <div
                        className="bg-gray-300 rounded-t"
                        style={{
                          height: `${(data.inactive /
                            Math.max(
                              ...analytics.monthlyData.map((d) => d.inactive)
                            )) *
                            100
                            }%`,
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {data.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="space-y-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {(["Individual", "Business", "Government"] as TabType[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                      }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="relative input-filed-block">
                <input
                  id="search_bar_subscribers"
                  placeholder="Search subscribers"
                  value={searchText}
                  onChange={handleSearch}
                  className="w-full rounded-md border border-slate-200 bg-white pl-3 pr-11 py-2 text-base text-gray-600 shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 peer
          placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
                />
                <label
                  htmlFor="search_bar_subscribers"
                  className={`
                    label-filed absolute left-2.5 top-2 text-[#A0A3BD] text-base transition-all duration-200
                    peer-placeholder-shown:top-2 peer-placeholder-shown:left-2.5 peer-placeholder-shown:text-base cursor-text
                    peer-focus:-top-3 peer-focus:left-2.5 peer-focus:text-[13px] peer-focus:text-[#070B68]
                    bg-white px-1  ${searchText && searchText.trim() !== ""
                      ? "!-top-3 !text-[13px] "
                      : ""
                    } 
                    `}
                >
                  Search subscribers
                </label>
                <span className="pointer-events-none absolute inset-y-0 right-4 grid place-items-center text-gray-400">
                  <SearchIcon />
                </span>
              </div>
              <button
                onClick={handleExport}
                className="rounded-full border border-gray-200 px-6 py-2 text-sm font-semibold text-primary hover:border-primary"
              >
                Export
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading data
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Data Message */}
          {!loading && subscribers.length === 0 && !error && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="w-full h-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No subscribers found
              </h3>
              <p className="text-gray-500">
                {searchText
                  ? `No subscribers match your search for "${searchText}"`
                  : `No ${activeTab.toLowerCase()} subscribers available`}
              </p>
            </div>
          )}

          {/* Table */}
          {subscribers.length > 0 && (
            <ComanTable
              columns={tableColumns}
              data={subscribers}
              actions={actionButtons}
              page={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              sortState={sortState}
              onSortChange={setSortState}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              loading={loading}
            />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

const Header = () => (
  <div className="flex items-center gap-4 rounded-[28px] border border-gray-200 bg-white px-6 py-5 shadow-sm">
    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 72 72"
        className="h-10 w-10"
        fill="#050668"
      >
        <path d="M36 36a8 8 0 1 0-8-8 8 8 0 0 0 8 8Zm0 6c-8.84 0-24 4.62-24 13.5V60h48v-4.5C60 46.62 44.84 42 36 42Z" />
      </svg>
    </div>
    <div>
      <h1 className="text-2xl font-semibold text-primary">
        List of Subscribers
      </h1>
      <p className="text-sm text-gray-400">
        View members and their subscription plans
      </p>
    </div>
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

export default ListSubscribers;
