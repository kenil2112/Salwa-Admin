import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { StatisticsServices } from "../services/StatisticsServices/StatisticsServices";
import ReportServices from "../services/ReportServices/ReportServices";
import SelectFiled from "../antd/SelectFiled";
import PrimaryButton from "../antd/PrimaryButton";

const CurrencyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6"
  >
    <path d="M11 4a1 1 0 1 1 2 0v1h3a1 1 0 1 1 0 2h-3v3h3a1 1 0 1 1 0 2h-3v3h3a1 1 0 1 1 0 2h-3v1a1 1 0 1 1-2 0v-1H8a1 1 0 1 1 0-2h3v-3H8a1 1 0 1 1 0-2h3V7H8a1 1 0 1 1 0-2h3V4Z" />
  </svg>
);

const PendingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-6 w-6"
  >
    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 11h-3a1 1 0 0 1 0-2h2V7a1 1 0 0 1 2 0v5a1 1 0 0 1-1 1Z" />
  </svg>
);

type StatCard = {
  title: string;
  value: string;
  icon?: ReactNode;
};

// Generate year options (last 10 years)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());
};

// Month options
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

// User type options
const userTypeOptions = [
  { value: 1, label: "Individual" },
  { value: 2, label: "Business" },
];

const Dashboard = () => {
  // Subscription Statistics state
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionFilters, setSubscriptionFilters] = useState({
    userType: 1, // Default to Individual
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear(), // Current year
  });

  // User Statistics state
  const [userData, setUserData] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userFilters, setUserFilters] = useState({
    userType: 1, // Default to Individual
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear(), // Current year
  });

  // Service Statistics state
  const [serviceData, setServiceData] = useState<any>(null);
  const [serviceLoading, setServiceLoading] = useState(false);
  const [serviceFilters, setServiceFilters] = useState({
    categoryId: null as number | null,
    serviceName: null as string | null,
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear(), // Current year
    subServiceName: null as string | null,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [subServices, setSubServices] = useState<any[]>([]);

  // Insurance Statistics state
  const [insuranceData, setInsuranceData] = useState<any>(null);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insuranceFilters, setInsuranceFilters] = useState({
    month: new Date().getMonth() + 1, // Current month
    year: new Date().getFullYear(), // Current year
  });

  // Load subscription statistics
  const loadSubscriptionStatistics = async () => {
    try {
      setSubscriptionLoading(true);
      const response = await StatisticsServices.GetSubscriberStatistics(
        subscriptionFilters.userType,
        subscriptionFilters.month,
        subscriptionFilters.year
      );

      if (response && "data" in response && response.data) {
        setSubscriptionData(response.data);
      }
    } catch (error) {
      console.error("Error loading subscription statistics:", error);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  // Load user statistics
  const loadUserStatistics = async () => {
    try {
      setUserLoading(true);
      const response = await StatisticsServices.GetUserStatistics(
        userFilters.userType,
        userFilters.month,
        userFilters.year
      );

      if (response && "data" in response && response.data) {
        setUserData(response.data);
      }
    } catch (error) {
      console.error("Error loading user statistics:", error);
    } finally {
      setUserLoading(false);
    }
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    loadSubscriptionStatistics();
  }, [subscriptionFilters]);

  useEffect(() => {
    loadUserStatistics();
  }, [userFilters]);

  // Load service statistics
  const loadServiceStatistics = async () => {
    try {
      setServiceLoading(true);
      const response = await StatisticsServices.GetServiceStatistics(
        serviceFilters.categoryId,
        serviceFilters.serviceName,
        serviceFilters.month,
        serviceFilters.year,
        serviceFilters.subServiceName
      );

      if (response && "data" in response && response.data) {
        setServiceData(response.data);
      }
    } catch (error) {
      console.error("Error loading service statistics:", error);
    } finally {
      setServiceLoading(false);
    }
  };

  // Load categories
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

  // Load services based on category
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

  // Load sub-services based on service
  const loadSubServices = async (serviceId: number) => {
    try {
      const response = await ReportServices.GetSubServices(serviceId);
      if (response && "data" in response && response.data) {
        setSubServices(response.data);
      }
    } catch (error) {
      console.error("Error loading sub-services:", error);
    }
  };

  useEffect(() => {
    loadServiceStatistics();
  }, [serviceFilters]);

  // Load initial categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Load insurance statistics
  const loadInsuranceStatistics = async () => {
    try {
      setInsuranceLoading(true);
      const response = await StatisticsServices.GetInsuranceStatistics(
        insuranceFilters.month,
        insuranceFilters.year
      );

      if (response && "data" in response && response.data) {
        setInsuranceData(response.data);
      }
    } catch (error) {
      console.error("Error loading insurance statistics:", error);
    } finally {
      setInsuranceLoading(false);
    }
  };

  useEffect(() => {
    loadInsuranceStatistics();
  }, [insuranceFilters]);

  // Handle filter changes
  const handleSubscriptionFilterChange = (
    key: string,
    value: string | number
  ) => {
    setSubscriptionFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleUserFilterChange = (key: string, value: string | number) => {
    setUserFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleServiceFilterChange = (
    key: string,
    value: string | number | null
  ) => {
    setServiceFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Handle cascading dropdowns
      if (key === "categoryId") {
        // Clear service and sub-service when category changes
        newFilters.serviceName = null;
        newFilters.subServiceName = null;
        setServices([]);
        setSubServices([]);

        // Load services for the new category
        if (value) {
          loadServices(value as number);
        }
      } else if (key === "serviceName") {
        // Clear sub-service when service changes
        newFilters.subServiceName = null;
        setSubServices([]);

        // Find the service ID for the selected service name
        const selectedService = services.find(
          (service) =>
            (service.Name || service.name || service.serviceName) === value
        );

        // Load sub-services for the new service
        if (selectedService && (selectedService.Id || selectedService.id)) {
          loadSubServices(Number(selectedService.Id || selectedService.id));
        }
      }

      return newFilters;
    });
  };

  const handleInsuranceFilterChange = (key: string, value: string | number) => {
    setInsuranceFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Generate subscription cards from API data
  const getSubscriptionCards = (): StatCard[] => {
    if (!subscriptionData) {
      return [
        { title: "Number of Subscribers", value: "0" },
        { title: "Number of Active Subscribers", value: "0" },
        {
          title: "Total Subscription Revenue",
          value: "0",
          icon: <CurrencyIcon />,
        },
      ];
    }

    return [
      {
        title: "Number of Subscribers",
        value: subscriptionData.numberOfSubscribers?.toString() || "0",
      },
      {
        title: "Number of Active Subscribers",
        value: subscriptionData.activeSubscribers?.toString() || "0",
      },
      {
        title: "Total Subscription Revenue",
        value: `${subscriptionData.totalRevenue || 0} SAR`,
        icon: <CurrencyIcon />,
      },
    ];
  };

  // Generate user cards from API data
  const getUserCards = (): StatCard[] => {
    if (!userData) {
      return [
        { title: "Number of Users", value: "0" },
        { title: "Number of Active Users", value: "0" },
        {
          title: "Number of Inactive Users",
          value: "0",
          icon: <PendingIcon />,
        },
      ];
    }

    return [
      {
        title: "Number of Users",
        value: userData.numberOfUsers?.toString() || "0",
      },
      {
        title: "Number of Active Users",
        value: userData.activeUsers?.toString() || "0",
      },
      {
        title: "Number of Inactive Users",
        value: userData.inactiveUsers?.toString() || "0",
        icon: <PendingIcon />,
      },
    ];
  };

  // Generate service cards from API data
  const getServiceCards = (): StatCard[] => {
    if (!serviceData) {
      return [
        { title: "Number of Orders", value: "0" },
        { title: "Number of Completed Orders", value: "0" },
        { title: "Number of Pending Orders", value: "0" },
        { title: "Total Revenue Amount", value: "0", icon: <CurrencyIcon /> },
        {
          title: "Total Commission Amount",
          value: "0",
          icon: <CurrencyIcon />,
        },
        {
          title: "Total Payment Gateway Amount",
          value: "0",
          icon: <CurrencyIcon />,
        },
      ];
    }

    return [
      {
        title: "Number of Orders",
        value:
          serviceData.numberOfOrders?.toString() ||
          serviceData.totalOrders?.toString() ||
          "0",
      },
      {
        title: "Number of Completed Orders",
        value:
          serviceData.completedOrders?.toString() ||
          serviceData.numberOfCompletedOrders?.toString() ||
          "0",
      },
      {
        title: "Number of Pending Orders",
        value:
          serviceData.pendingOrders?.toString() ||
          serviceData.numberOfPendingOrders?.toString() ||
          "0",
      },
      {
        title: "Total Revenue Amount",
        value: `${serviceData.totalRevenue || serviceData.revenueAmount || 0
          } SAR`,
        icon: <CurrencyIcon />,
      },
      {
        title: "Total Commission Amount",
        value: `${serviceData.totalCommission || serviceData.commissionAmount || 0
          } SAR`,
        icon: <CurrencyIcon />,
      },
      {
        title: "Total Payment Gateway Amount",
        value: `${serviceData.totalPaymentGateway ||
          serviceData.paymentGatewayAmount ||
          0
          } SAR`,
        icon: <CurrencyIcon />,
      },
    ];
  };

  // Generate insurance cards from API data
  const getInsuranceCards = (): StatCard[] => {
    if (!insuranceData) {
      return [
        { title: "Total Appointment Booked", value: "0" },
        { title: "Total Insurance", value: "0" },
        { title: "Total Successful Bookings", value: "0" },
        { title: "Total Cancel Appointment", value: "0" },
        { title: "Total Insurance Claimed", value: "0" },
        { title: "Total Unpaid Deductions", value: "0" },
      ];
    }

    return [
      {
        title: "Total Appointment Booked",
        value: insuranceData.totalAppointmentUser?.toString() || "0",
      },
      {
        title: "Total Insurance",
        value: insuranceData.uniqAppointmentUser?.toString() || "0",
      },
      {
        title: "Total Successful Bookings",
        value:
          insuranceData.totalSuccessfulBookings?.toString() ||
          insuranceData.successfulBookings?.toString() ||
          "0",
      },
      {
        title: "Total Cancel Appointment",
        value: insuranceData.cancelAppointmentUser?.toString() || "0",
      },
      {
        title: "Total Insurance Claimed",
        value:
          insuranceData.totalInsuranceClaimed?.toString() ||
          insuranceData.insuranceClaimed?.toString() ||
          "0",
      },
      {
        title: "Total Unpaid Deductions",
        value: insuranceData.sumOfDeductible?.toString() || "0",
      },
    ];
  };

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full  flex-col gap-8 pb-3">
        <AnalysisHero />
        <SubscriptionStatisticsSection
          filters={subscriptionFilters}
          onFilterChange={handleSubscriptionFilterChange}
          cards={getSubscriptionCards()}
          loading={subscriptionLoading}
        />
        <UserStatisticsSection
          filters={userFilters}
          onFilterChange={handleUserFilterChange}
          cards={getUserCards()}
          loading={userLoading}
        />
        <ServiceStatisticsSection
          filters={serviceFilters}
          onFilterChange={handleServiceFilterChange}
          cards={getServiceCards()}
          loading={serviceLoading}
          categories={categories}
          services={services}
          subServices={subServices}
        />
        <InsuranceStatisticsSection
          filters={insuranceFilters}
          onFilterChange={handleInsuranceFilterChange}
          cards={getInsuranceCards()}
          loading={insuranceLoading}
          footer={
            <div className="rounded-[28px] border border-dashed border-gray-300 bg-[#f6f7fb] px-6 py-12 text-center text-sm text-gray-500">
              Analytics chart placeholder
            </div>
          }
        />
      </div>
    </DashboardLayout>
  );
};

interface SubscriptionStatisticsSectionProps {
  filters: {
    userType: number;
    month: number;
    year: number;
  };
  onFilterChange: (key: string, value: string | number) => void;
  cards: StatCard[];
  loading: boolean;
}

interface UserStatisticsSectionProps {
  filters: {
    userType: number;
    month: number;
    year: number;
  };
  onFilterChange: (key: string, value: string | number) => void;
  cards: StatCard[];
  loading: boolean;
}

interface ServiceStatisticsSectionProps {
  filters: {
    categoryId: number | null;
    serviceName: string | null;
    month: number;
    year: number;
    subServiceName: string | null;
  };
  onFilterChange: (key: string, value: string | number | null) => void;
  cards: StatCard[];
  loading: boolean;
  categories: any[];
  services: any[];
  subServices: any[];
}

interface InsuranceStatisticsSectionProps {
  filters: {
    month: number;
    year: number;
  };
  onFilterChange: (key: string, value: string | number) => void;
  cards: StatCard[];
  loading: boolean;
  footer?: ReactNode;
}

const SubscriptionStatisticsSection = ({
  filters,
  onFilterChange,
  cards,
  loading,
}: SubscriptionStatisticsSectionProps) => {
  return (
    <section className="space-y-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-primary">
          Subscription Statistics
        </h2>
        <PrimaryButton children="Export" />
      </header>

      {/* Custom Filter Dropdowns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* User Type Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative">
            <select
              id="user_type_subscription"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.userType}
              onChange={(e) =>
                onFilterChange("userType", parseInt(e.target.value))
              }
            >
              {userTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label
              htmlFor="user_type_subscription"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.userType ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              User Type
            </label>
          </div> */}
          <SelectFiled
            label="User Type"
            value={filters.userType}
            onChange={(e) =>
              onFilterChange("userType", parseInt(e.target.value))
            }
            option={userTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          />
        </div>

        {/* Month Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative">
            <select
              id="month_subscription"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.month}
              onChange={(e) =>
                onFilterChange("month", parseInt(e.target.value))
              }
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label
              htmlFor="month_subscription"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.month ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              Month
            </label>
          </div> */}
          <SelectFiled
            label="Month"
            value={filters.month}
            onChange={(e) =>
              onFilterChange("month", parseInt(e.target.value))
            }
            option={monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          />
        </div>

        {/* Year Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative">
            <select
              id="year_subscription"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.year}
              onChange={(e) => onFilterChange("year", parseInt(e.target.value))}
            >
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <label
              htmlFor="year_subscription"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.year ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              Year
            </label>
          </div> */}
          <SelectFiled
            label="Year"
            value={filters.year}
            onChange={(e) => onFilterChange("year", parseInt(e.target.value))}
            option={generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-gray-100 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                {card.icon && <span className="text-primary">{card.icon}</span>}
                <p className="text-4xl font-semibold text-primary">
                  {card.value}
                </p>
                <p className="text-sm text-gray-500">{card.title}</p>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

const UserStatisticsSection = ({
  filters,
  onFilterChange,
  cards,
  loading,
}: UserStatisticsSectionProps) => {
  return (
    <section className="space-y-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-primary">User Statistics</h2>
        <PrimaryButton children="Export" />
      </header>

      {/* Custom Filter Dropdowns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* User Type Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative">
            <select
              id="user_type_user"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.userType}
              onChange={(e) =>
                onFilterChange("userType", parseInt(e.target.value))
              }
            >
              {userTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label
              htmlFor="user_type_user"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.userType ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              User Type
            </label>
          </div> */}
          <SelectFiled
            label="User Type"
            value={filters.userType}
            onChange={(e) =>
              onFilterChange("userType", parseInt(e.target.value))
            }
            option={userTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          />
        </div>

        {/* Month Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative">
            <select
              id="month_user"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.month}
              onChange={(e) =>
                onFilterChange("month", parseInt(e.target.value))
              }
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label
              htmlFor="month_user"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.month ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              Month
            </label>
          </div> */}
          <SelectFiled
            label="Month"
            value={filters.month}
            onChange={(e) =>
              onFilterChange("month", parseInt(e.target.value))
            }
            option={monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          />
        </div>

        {/* Year Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative">
            <select
              id="year_user"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.year}
              onChange={(e) => onFilterChange("year", parseInt(e.target.value))}
            >
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <label
              htmlFor="year_user"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.year ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              Year
            </label>
          </div> */}
          <SelectFiled
            label="Year"
            value={filters.year}
            onChange={(e) => onFilterChange("year", parseInt(e.target.value))}
            option={generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-gray-100 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                {card.icon && <span className="text-primary">{card.icon}</span>}
                <p className="text-4xl font-semibold text-primary">
                  {card.value}
                </p>
                <p className="text-sm text-gray-500">{card.title}</p>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

const ServiceStatisticsSection = ({
  filters,
  onFilterChange,
  cards,
  loading,
  categories,
  services,
  subServices,
}: ServiceStatisticsSectionProps) => {
  return (
    <section className="space-y-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-primary">
          Service Statistics
        </h2>
        <PrimaryButton children="Export" />
      </header>

      {/* Custom Filter Dropdowns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Category Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative">
            <select
              id="category_service"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.categoryId || ""}
              onChange={(e) =>
                onFilterChange(
                  "categoryId",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option
                  key={category.Id || category.id}
                  value={category.Id || category.id}
                >
                  {category.EName || category.name}
                </option>
              ))}
            </select>
            <label
              htmlFor="category_service"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.categoryId || ""
                  ? "!-top-3 !left-3 !text-[13px]"
                  : ""
                } 
                  `}
            >
              Category
            </label>
          </div> */}
          <SelectFiled
            label="Category"
            value={filters.categoryId || ""}
            onChange={(e) =>
              onFilterChange(
                "categoryId",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            option={
              <>
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option
                    key={category.Id || category.id}
                    value={category.Id || category.id}
                  >
                    {category.EName || category.name}
                  </option>
                ))}
              </>
            }
          />
        </div>

        {/* Service Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative input-filed-block">
            <select
              id="service"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.serviceName || ""}
              onChange={(e) =>
                onFilterChange("serviceName", e.target.value || null)
              }
              disabled={!filters.categoryId}
            >
              <option value="">All Services</option>
              {services.map((service) => (
                <option
                  key={service.Id || service.id}
                  value={service.Name || service.name || service.serviceName}
                >
                  {service.EName || service.name || service.serviceName}
                </option>
              ))}
            </select>
            <label
              htmlFor="service"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.serviceName || ""
                  ? "!-top-3 !left-3 !text-[13px]"
                  : ""
                } 
                  `}
            >
              Service
            </label>
          </div> */}
          <SelectFiled
            label="Service"
            value={filters.serviceName || ""}
            onChange={(e) =>
              onFilterChange("serviceName", e.target.value || null)
            }
            disabled={!filters.categoryId}
            option={
              <>
                <option value="">All Services</option>
                {services.map((service) => (
                  <option
                    key={service.Id || service.id}
                    value={service.Name || service.name || service.serviceName}
                  >
                    {service.EName || service.name || service.serviceName}
                  </option>
                ))}
              </>
            }
          />
        </div>

        {/* Sub-Service Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative input-filed-block">
            <select
              id="sub_service"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.subServiceName || ""}
              onChange={(e) =>
                onFilterChange("subServiceName", e.target.value || null)
              }
              disabled={!filters.serviceName}
            >
              <option value="">All Sub-Services</option>
              {subServices.map((subService) => (
                <option
                  key={subService.Id || subService.id}
                  value={
                    subService.Name ||
                    subService.name ||
                    subService.subServiceName
                  }
                >
                  {subService.EName ||
                    subService.name ||
                    subService.subServiceName}
                </option>
              ))}
            </select>
            <label
              htmlFor="sub_service"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.subServiceName || ""
                  ? "!-top-3 !left-3 !text-[13px]"
                  : ""
                } 
                  `}
            >
              Sub Service
            </label>
          </div> */}
          <SelectFiled
            label="Sub Service"
            value={filters.subServiceName || ""}
            onChange={(e) =>
              onFilterChange("subServiceName", e.target.value || null)
            }
            disabled={!filters.serviceName}
            option={
              <>
                <option value="">All Sub-Services</option>
                {subServices.map((subService) => (
                  <option
                    key={subService.Id || subService.id}
                    value={
                      subService.Name ||
                      subService.name ||
                      subService.subServiceName
                    }
                  >
                    {subService.EName ||
                      subService.name ||
                      subService.subServiceName}
                  </option>
                ))}
              </>
            }
          />
        </div>

        {/* Month Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative input-filed-block">
            <select
              id="month_service"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.month}
              onChange={(e) =>
                onFilterChange("month", parseInt(e.target.value))
              }
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label
              htmlFor="month_service"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.month ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              Month
            </label>
          </div> */}
          <SelectFiled
            label="Month"
            value={filters.month}
            onChange={(e) =>
              onFilterChange("month", parseInt(e.target.value))
            }
            option={monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          />
        </div>

        {/* Year Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative input-filed-block">
            <select
              id="year_service"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.year}
              onChange={(e) => onFilterChange("year", parseInt(e.target.value))}
            >
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <label
              htmlFor="year_service"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.year ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              Year
            </label>
          </div> */}
          <SelectFiled
            label="Year"
            value={filters.year}
            onChange={(e) => onFilterChange("year", parseInt(e.target.value))}
            option={generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-gray-100 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                {card.icon && <span className="text-primary">{card.icon}</span>}
                <p className="text-4xl font-semibold text-primary">
                  {card.value}
                </p>
                <p className="text-sm text-gray-500">{card.title}</p>
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

const InsuranceStatisticsSection = ({
  filters,
  onFilterChange,
  cards,
  loading,
  footer,
}: InsuranceStatisticsSectionProps) => {
  return (
    <section className="space-y-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-primary">
          Insurance Statistics
        </h2>
        <PrimaryButton children="Export" />
      </header>

      {/* Custom Filter Dropdowns */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {/* Month Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative input-filed-block">
            <select
              id="month_insurance"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.month}
              onChange={(e) =>
                onFilterChange("month", parseInt(e.target.value))
              }
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label
              htmlFor="month_insurance"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.month ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              Month
            </label>
          </div> */}
          <SelectFiled
            label="Month"
            value={filters.month}
            onChange={(e) =>
              onFilterChange("month", parseInt(e.target.value))
            }
            option={monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          />
        </div>

        {/* Year Dropdown */}
        <div className="space-y-1">
          {/* <div className="relative input-filed-block">
            <select
              id="year_insurance"
              className="w-full px-3 py-2 h-[46px] border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer
                        placeholder-transparent disabled:cursor-not-allowed disabled:bg-[#F4F5F9] disabled:text-[#A0A3BD]"
              value={filters.year}
              onChange={(e) => onFilterChange("year", parseInt(e.target.value))}
            >
              {generateYearOptions().map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <label
              htmlFor="year_insurance"
              className={`
                  label-filed absolute left-3 top-2 text-[#A0A3BD] text-base transition-all duration-200
                  peer-placeholder-shown:top-2 peer-placeholder-shown:left-3 peer-placeholder-shown:text-base cursor-text
                  peer-focus:-top-3 peer-focus:left-3 peer-focus:text-[13px] peer-focus:text-[#070B68]
                  bg-white px-1  ${filters.year ? "!-top-3 !left-3 !text-[13px]" : ""
                } 
                  `}
            >
              Year
            </label>
          </div> */}
          <SelectFiled
            label="Year"
            value={filters.year}
            onChange={(e) => onFilterChange("year", parseInt(e.target.value))}
            option={generateYearOptions().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.title}
            className="flex flex-col items-center justify-center gap-3 rounded-[28px] border border-gray-100 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                {card.icon && <span className="text-primary">{card.icon}</span>}
                <p className="text-4xl font-semibold text-primary">
                  {card.value}
                </p>
                <p className="text-sm text-gray-500">{card.title}</p>
              </>
            )}
          </article>
        ))}
      </div>

      {/* Footer */}
      {footer}
    </section>
  );
};

const AnalysisHero = () => (
  <div className="flex items-center gap-4 rounded-[28px] border border-gray-200 bg-white px-6 py-5 shadow-sm">
    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 72 72"
        className="h-10 w-10"
      >
        <path
          d="M52.5 10a13.5 13.5 0 0 0-10.1 4.6L36 22.1l-6.4-7.5A13.5 13.5 0 0 0 9.5 29.3c0 12 11.7 21.2 24.6 32.5l1.9 1.7 1.9-1.7c12.9-11.3 24.6-20.5 24.6-32.5A13.5 13.5 0 0 0 52.5 10Z"
          fill="#050668"
        />
        <path
          d="M31.1 37.6 26 32.4l3.1-3.1 2.1 2.1 7.4-7.4 3.1 3.1-9.5 10.5Z"
          fill="#ffffff"
        />
      </svg>
    </div>
    <div>
      <h1 className="text-2xl font-semibold text-primary">Analysis</h1>
      <p className="text-sm text-gray-400">Overview dashboard</p>
    </div>
  </div>
);

export default Dashboard;
