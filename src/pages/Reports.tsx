import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../layouts/DashboardLayout";
import ComanTable, {
  type TableColumn,
  type SortState,
} from "../components/common/ComanTable";
import ReportServices from "../services/ReportServices/ReportServices";

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M16 13a4 4 0 1 0-4 4 4 4 0 0 0 4-4Zm6-1v2h-2a6 6 0 0 1-12 0H6v-2h2a6 6 0 0 1 12 0Z" />
  </svg>
);

const AmountIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M12 3a9 9 0 1 0 9 9A9.01 9.01 0 0 0 12 3Zm1 12h-2v-2H8v-2h3V9h2v2h3v2h-3Z" />
  </svg>
);

const CommissionIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M4 4h16v16H4Zm4 7h8v2H8Z" />
  </svg>
);

const GatewayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M3 5h18v2H3Zm2 4h14v10H5Zm4 2v6h6v-6Z" />
  </svg>
);

// Generate year options from 2001 to current year
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 2001; year--) {
    years.push(year.toString());
  }
  return years;
};

// Generate month options
const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// Summary cards will be populated from API response
const getSummaryCards = (summary: any) => [
  {
    label: "User Count",
    value: summary?.totalCount?.toString() || "0",
    icon: <UsersIcon />,
    color: "bg-[#eef5ff]",
  },
  {
    label: "Amount",
    value: `${summary?.sumOfTotalAmount || 0} SAR`,
    icon: <AmountIcon />,
    color: "bg-[#e9fbf3]",
  },
  {
    label: "Commission",
    value: `${summary?.sumOfTotalComm || 0} SAR`,
    icon: <CommissionIcon />,
    color: "bg-[#f4edff]",
  },
  {
    label: "Payment Gateway",
    value: `${summary?.sumOfTotalPaymentGateway || 0} SAR`,
    icon: <GatewayIcon />,
    color: "bg-[#eef4ff]",
  },
];

const Reports = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [subServices, setSubServices] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    categoryId: "",
    serviceName: "",
    month: "",
    year: new Date().getFullYear().toString(),
    subServiceName: "",
  });
  const [sortState, setSortState] = useState<SortState[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadReportData();
  }, []);

  // Load report data when filters change
  useEffect(() => {
    loadReportData();
  }, [filters]);

  // Load services when category changes
  useEffect(() => {
    if (filters.categoryId) {
      loadServices(parseInt(filters.categoryId));
    } else {
      setServices([]);
      setSubServices([]);
    }
  }, [filters.categoryId]);

  // Load sub services when service changes
  useEffect(() => {
    if (filters.serviceName) {
      // Find the service ID from the service name
      const selectedService = services.find(service => 
        (service.name || service.serviceName) === filters.serviceName
      );
      if (selectedService) {
        loadSubServices(parseInt(selectedService.id || selectedService.Id));
      }
    } else {
      setSubServices([]);
    }
  }, [filters.serviceName, services]);

  const loadCategories = async () => {
    try {
      const response = await ReportServices.GetCategories();
      if (response && "data" in response && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadServices = async (categoryId: number) => {
    try {
      const response = await ReportServices.GetServices(categoryId);
      if (response && "data" in response && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error("Error loading services:", error);
    }
  };

  const loadSubServices = async (serviceId: number) => {
    try {
      const response = await ReportServices.GetSubServices(serviceId);
      if (response && "data" in response && response.data) {
        setSubServices(response.data);
      }
    } catch (error) {
      console.error("Error loading sub services:", error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      const params: any = {};

      if (filters.categoryId) params.categoryId = parseInt(filters.categoryId);
      if (filters.serviceName) params.serviceName = filters.serviceName;
      if (filters.month) params.month = parseInt(filters.month);
      if (filters.year) params.year = parseInt(filters.year);
      if (filters.subServiceName)
        params.subServiceName = filters.subServiceName;

      const response = await ReportServices.GetServiceReportList(params);
      if (response && "data" in response && response.data) {
        // Handle the new response structure
        const responseData = response.data;
        
        // Set the data array
        setReportData(responseData.data || []);
        setTotalCount(responseData.data?.length || 0);
        
        // Set the summary data
        setSummaryData(responseData.summary || null);
      }
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      
      // Clear dependent dropdowns when parent changes
      if (key === "categoryId") {
        newFilters.serviceName = "";
        newFilters.subServiceName = "";
        setServices([]);
        setSubServices([]);
      } else if (key === "serviceName") {
        newFilters.subServiceName = "";
        setSubServices([]);
      }
      
      return newFilters;
    });
  };

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
  };

  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  // Table columns configuration
  const tableColumns: TableColumn<any>[] = useMemo(
    () => [
      {
        label: "Order No",
        value: (row) => (
          <span className="font-semibold text-primary">
            {row.orderNo || row.orderNumber || row.id || `#${row.id || 'N/A'}`}
          </span>
        ),
        sortKey: "orderNo",
        isSort: true,
      },
      {
        label: "Order Title",
        value: (row) => (
          <span className="text-gray-700">
            {row.orderTitle || row.serviceName || row.title || row.name || "N/A"}
          </span>
        ),
        sortKey: "orderTitle",
        isSort: true,
      },
      {
        label: "Purchase By / Rented By",
        value: (row) => (
          <span className="text-gray-500">
            {row.purchasedBy || row.customerName || row.purchaserName || row.customer || "N/A"}
          </span>
        ),
        sortKey: "purchasedBy",
        isSort: true,
      },
      {
        label: "Sold By",
        value: (row) => (
          <span className="text-gray-500">
            {row.soldBy || row.agentName || row.sellerName || row.agent || "N/A"}
          </span>
        ),
        sortKey: "soldBy",
        isSort: true,
      },
      {
        label: "Amount",
        value: (row) => (
          <span className="font-medium text-primary">
            {row.amount ? `${row.amount} SAR` : row.totalAmount ? `${row.totalAmount} SAR` : "0 SAR"}
          </span>
        ),
        sortKey: "amount",
        isSort: true,
      },
      {
        label: "Discount Amount",
        value: (row) => (
          <span className="text-gray-500">
            {row.discount ? `${row.discount} SAR` : row.discountAmount ? `${row.discountAmount} SAR` : "0 SAR"}
          </span>
        ),
        sortKey: "discount",
        isSort: true,
      },
      {
        label: "Sales Commission",
        value: (row) => (
          <span className="text-gray-500">
            {row.salesCommission ? `${row.salesCommission} SAR` : row.commission ? `${row.commission} SAR` : "0 SAR"}
          </span>
        ),
        sortKey: "salesCommission",
        isSort: true,
      },
      {
        label: "Payment Gateway Charges",
        value: (row) => (
          <span className="text-gray-500">
            {row.paymentGateway ? `${row.paymentGateway} SAR` : row.gatewayCharges ? `${row.gatewayCharges} SAR` : "0 SAR"}
          </span>
        ),
        sortKey: "paymentGateway",
        isSort: true,
      },
    ],
    []
  );

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full  flex-col gap-8 pb-3">
        <Header />
        <section className="space-y-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-primary">
              <ArrowUpIcon />
              <h2 className="text-2xl font-semibold">Reports</h2>
            </div>
            <button className="rounded-full border border-gray-200 px-6 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:text-primary">
              Export
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              label={t("pages.reports.month")}
              value={filters.month}
              options={monthOptions.map((m) => ({
                value: m.value.toString(),
                label: m.label,
              }))}
              onChange={(value) => handleFilterChange("month", value)}
            />
            <Select
              label={t("pages.reports.year")}
              value={filters.year}
              options={generateYearOptions().map((year) => ({
                value: year,
                label: year,
              }))}
              onChange={(value) => handleFilterChange("year", value)}
            />
             <Select
               label={t("pages.reports.category")}
               value={filters.categoryId}
               options={categories.map((cat) => ({
                 value: (cat.Id || cat.id)?.toString() || "",
                 label: cat.Name || cat.name || `Category ${cat.Id || cat.id}`,
               }))}
               onChange={(value) => handleFilterChange("categoryId", value)}
             />
             <Select
               label={t("pages.reports.service")}
               value={filters.serviceName}
               options={services.map((service) => ({
                 value: service.name || service.serviceName || `Service ${service.Id || service.id}`,
                 label: service.name || service.serviceName || `Service ${service.Id || service.id}`,
               }))}
               onChange={(value) => handleFilterChange("serviceName", value)}
             />
             <Select
               label={t("pages.reports.subService")}
               value={filters.subServiceName}
               options={subServices.map((sub) => ({
                 value: sub.name || sub.subServiceName || `Sub-service ${sub.Id || sub.id}`,
                 label: sub.name || sub.subServiceName || `Sub-service ${sub.Id || sub.id}`,
               }))}
               onChange={(value) => handleFilterChange("subServiceName", value)}
             />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {getSummaryCards(summaryData).map((card) => (
              <div
                key={card.label}
                className={`rounded-[28px] border border-gray-100 px-6 py-5 ${card.color}`}
              >
                <div className="flex items-center gap-3 text-primary">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 text-primary">
                    {card.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                      {card.label}
                    </p>
                    <p className="pt-1 text-lg font-semibold text-primary">
                      {card.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ComanTable
            data={reportData}
            columns={tableColumns}
            loading={loading}
            page={pageNumber}
            totalPages={Math.ceil(totalCount / pageSize)}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onSortChange={handleSortChange}
            sortState={sortState}
          />
        </section>
      </div>
    </DashboardLayout>
  );
};

const Header = () => (
  <div className="flex items-center gap-4 rounded-[28px] border border-gray-200 bg-white px-6 py-5 shadow-sm">
    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
      <ReportsIcon />
    </div>
    <div>
      <h1 className="text-2xl font-semibold text-primary">Reports</h1>
      <p className="text-sm text-gray-400">Insights and performance overview</p>
    </div>
  </div>
);

const Select = ({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) => (
  <div className="space-y-1">
    <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-full border border-gray-200 bg-white px-5 py-3 text-sm text-gray-600 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
        <ChevronDownIcon />
      </span>
    </div>
  </div>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.171l3.71-3.94a.75.75 0 0 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z"
      clipRule="evenodd"
    />
  </svg>
);

const ArrowUpIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    className="h-6 w-6"
  >
    <path
      d="M12 5l6 6m0 0-6 6m6-6H6"
      stroke="#050668"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ReportsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 72 72"
    className="h-10 w-10"
    fill="#050668"
  >
    <path d="M51 10H21a4 4 0 0 0-4 4v44a4 4 0 0 0 4 4h30a4 4 0 0 0 4-4V14a4 4 0 0 0-4-4Zm-4 32H25v-4h22Zm0-10H25v-4h22Zm0-10H25v-4h22Z" />
  </svg>
);

export default Reports;
