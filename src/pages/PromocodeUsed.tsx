import { useState, useEffect, useMemo, useCallback } from "react";
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

import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../components/common/ComanTable";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";

type TabType = "Registration" | "Services";

interface AdminPromoCode {
  promoCodeId: number;
  promoType?: string | null;
  categoryId?: number | null;
  serviceId?: number | null;
  subServiceId?: number | null;
  typeIsRegisterOrServices: number;
  userTypeId?: number | null;
  userType?: string | null;
  promoDescription?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  code?: string | null;
  discountType?: number | null;
  discountTypeFlatOrPercentage?: string | null;
  discountValue?: number | null;
  maxDiscountCapValue?: number | null;
  minimumPurchaseValue?: number | null;
  isActive?: boolean | null;
}

const PromocodeUsed = () => {
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { showToast } = useToast();
  
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [analytics, setAnalytics] = useState<SubscriberAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("Registration");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortState, setSortState] = useState<SortState[]>([]);
  
  // Promocode data
  const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([]);
  const [promocodeLoading, setPromocodeLoading] = useState(false);
  const [promocodeError, setPromocodeError] = useState<string | null>(null);
  const [promocodeAnalytics, setPromocodeAnalytics] = useState<{
    overallSummary?: {
      TotalPromocodeCreate?: number;
      TotalUsedPromocode?: number;
      totalPromocodeUserUsed?: number;
    };
    monthlySummary?: Array<{
      MonthName: string;
      MonthNumber: number;
      totalPromocodeUserUsed: number;
    }>;
  } | null>(null);

  const PROMOCODE_ANALYTICS_ENDPOINT =
    "https://apisalwa.rushkarprojects.in/api/PromocodeSetting/GetAdminPromoCodesRegistrationAndServicesGraphOrStatusDetails";
  const PROMOCODE_LIST_ENDPOINT =
    "https://apisalwa.rushkarprojects.in/api/PromocodeSetting/GetAllAdminPromoCodes";

  const parseResponse = async (response: Response): Promise<unknown> => {
    const text = await response.text();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const messageFromPayload = (payload: unknown, fallback: string) => {
    if (typeof payload === "string" && payload.trim()) {
      return payload;
    }
    if (payload && typeof payload === "object" && "message" in payload) {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
    return fallback;
  };

  const extractList = (payload: unknown): AdminPromoCode[] => {
    if (Array.isArray(payload)) {
      return payload as AdminPromoCode[];
    }
    if (payload && typeof payload === "object" && "data" in payload) {
      const { data } = payload as { data?: unknown };
      if (Array.isArray(data)) {
        return data as AdminPromoCode[];
      }
    }
    return [];
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "-";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatNumeric = (value?: number | null) => {
    if (value === null || value === undefined) {
      return "-";
    }
    if (Number.isNaN(Number(value))) {
      return "-";
    }
    const formatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    });
    return formatter.format(Number(value));
  };

  const loadPromocodeAnalytics = useCallback(async () => {
    try {
      const typeParam = activeTab === "Registration" ? 1 : 2;
      const response = await authFetch(
        `${PROMOCODE_ANALYTICS_ENDPOINT}?typeIsRegisterOrServices=${typeParam}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );
      const payload = await parseResponse(response);
      
      if (response.ok && payload) {
        // Extract data from response structure
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (payload as any)?.data || payload;
        setPromocodeAnalytics(data);
      }
    } catch (error) {
      console.error("Error loading promocode analytics:", error);
      setPromocodeAnalytics(null);
    }
  }, [authFetch, activeTab]);

  const loadPromocodes = useCallback(
    async (
      tab: TabType,
      page: number,
      size: number
    ) => {
      setPromocodeLoading(true);
      setPromocodeError(null);
      try {
        const typeParam = tab === "Registration" ? 1 : 2;
        const sortColumn = sortState.length > 0 ? sortState[0].key : "PromoCodeId";
        const sortDirection = sortState.length > 0 ? sortState[0].order.toUpperCase() : "ASC";

        const response = await authFetch(
          `${PROMOCODE_LIST_ENDPOINT}?typeIsRegisterOrServices=${typeParam}&PageNumber=${page}&PageSize=${size}&SortColumn=${sortColumn}&SortDirection=${sortDirection}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          }
        );

        const payload = await parseResponse(response);
        console.log("Promocode List Payload:", payload);
        
        if (!response.ok) {
          throw new Error(
            messageFromPayload(payload, "Unable to load promocodes.")
          );
        }

        const items = extractList(payload);
        console.log("Promocodes extracted:", items);
        
        setPromoCodes(items);
        setTotalCount(items.length);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load promocodes.";
        setPromoCodes([]);
        setPromocodeError(message);
        showToast(message, "error");
        console.error("Error loading promocodes:", error);
      } finally {
        setPromocodeLoading(false);
      }
    },
    [authFetch, showToast, sortState, PROMOCODE_LIST_ENDPOINT]
  );
    
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
    loadPromocodes(activeTab, currentPage, pageSize);
  }, [activeTab, currentPage, pageSize, loadPromocodes]);

  useEffect(() => {
    loadPromocodeAnalytics();
  }, [activeTab, loadPromocodeAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = async () => {
    try {
      // Use mock service for now - replace with real API when available
      await exportSubscribersMock({
        searchText,
        status: activeTab as any,
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
    setSortState([]);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); 
  };

  // Promocode table columns
  const promocodeColumns: TableColumn<AdminPromoCode>[] = useMemo(
    () => [
      {
        label: "Promo Code",
        value: (row) => (
          <span className="font-semibold text-primary">{row.code || "-"}</span>
        ),
        sortKey: "code",
        isSort: true,
      },
      {
        label: "User Type",
        value: (row) => (
          <span className="text-gray-700">{row.userType || "-"}</span>
        ),
        sortKey: "userType",
        isSort: true,
      },
      {
        label: "Description",
        value: (row) => (
          <span className="text-gray-600 text-sm">
            {row.promoDescription || "-"}
          </span>
        ),
        sortKey: "promoDescription",
        isSort: false,
      },
      {
        label: "Discount",
        value: (row) => (
          <div className="flex flex-col">
            <span className="text-gray-700 font-medium">
              {row.discountTypeFlatOrPercentage === "Percentage"
                ? `${formatNumeric(row.discountValue)}%`
                : `${formatNumeric(row.discountValue)} SAR`}
            </span>
            <span className="text-gray-500 text-xs">
              {row.discountTypeFlatOrPercentage || "-"}
            </span>
          </div>
        ),
        sortKey: "discountValue",
        isSort: true,
      },
      {
        label: "Start Date",
        value: (row) => (
          <span className="text-gray-600 text-sm">
            {formatDate(row.startDate)}
          </span>
        ),
        sortKey: "startDate",
        isSort: true,
      },
      {
        label: "End Date",
        value: (row) => (
          <span className="text-gray-600 text-sm">
            {formatDate(row.endDate)}
          </span>
        ),
        sortKey: "endDate",
        isSort: true,
      },
      {
        label: "Status",
        value: (row) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              row.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
        sortKey: "isActive",
        isSort: true,
      },
    ],
    []
  );

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full flex-col gap-8 pb-3">
        {/* <Header /> */}

        {/* Analytics Section */}
        {(analytics || promocodeAnalytics) && (
          <section className="rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {promocodeAnalytics?.overallSummary?.TotalPromocodeCreate ?? analytics?.totalActive ?? 0}
                </div>
                <div className="text-sm text-gray-500">Total Promocodes Created</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {promocodeAnalytics?.overallSummary?.TotalUsedPromocode ?? analytics?.totalInactive ?? 0}
                </div>
                <div className="text-sm text-gray-500">Total Used Promocodes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {promocodeAnalytics?.overallSummary?.totalPromocodeUserUsed ?? analytics?.totalUsers ?? 0}
                </div>
                <div className="text-sm text-gray-500">Total Users Used Promocodes</div>
              </div>
            </div>

            {/* Simple Bar Chart */}
            {promocodeAnalytics?.monthlySummary && promocodeAnalytics.monthlySummary.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Promocode Usage</h3>
                <div className="h-48 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-end justify-between h-full space-x-2">
                    {promocodeAnalytics.monthlySummary.map((monthData, index) => {
                      const maxValue = Math.max(
                        ...promocodeAnalytics.monthlySummary!.map((d) => d.totalPromocodeUserUsed),
                        1 // Prevent division by zero
                      );
                      const heightPercentage = (monthData.totalPromocodeUserUsed / maxValue) * 100;

                      return (
                        <div
                          key={index}
                          className="flex flex-col items-center flex-1"
                        >
                          <div className="flex flex-col justify-end h-32 w-full relative group">
                            <div
                              className="bg-primary rounded-t hover:bg-primary/80 transition-colors cursor-pointer"
                              style={{
                                height: `${heightPercentage}%`,
                                minHeight: monthData.totalPromocodeUserUsed > 0 ? '4px' : '0px'
                              }}
                              title={`${monthData.MonthName}: ${monthData.totalPromocodeUserUsed} users`}
                            >
                              {/* Tooltip on hover */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {monthData.totalPromocodeUserUsed} users
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                            {monthData.MonthName.substring(0, 3)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </section>
        )}

        <section className="space-y-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {(["Registration", "Services"] as TabType[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-6 py-3 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab
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
          {promocodeError && (
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
                    <p>{promocodeError}</p>
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
          {promoCodes.length > 0 ? (
            <ComanTable
              columns={promocodeColumns}
              data={promoCodes}
              actions={[]}
              page={currentPage}
              totalPages={Math.ceil(totalCount / pageSize)}
              totalCount={totalCount}
              onPageChange={handlePageChange}
              sortState={sortState}
              onSortChange={setSortState}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
              loading={promocodeLoading}
            />
          ) : !promocodeLoading && (
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No promocodes found
              </h3>
              <p className="text-gray-500">
                {searchText
                  ? `No promocodes match your search for "${searchText}"`
                  : `No ${activeTab.toLowerCase()} promocodes available`}
              </p>
            </div>
          )}
        </section>
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-3-3" />
  </svg>
);

export default PromocodeUsed;