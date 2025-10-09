import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import OfficeStationaryService, { type OfficeStationaryParams } from "../services/OfficeStationaryService";
import ComanTable, { type TableColumn, type ActionButton, type SortState } from "../components/common/ComanTable";

interface Service {
    id: string;
    title: string;
    description: string;
    icon?: string;
    hasSubServices?: boolean;
    categoryId?: string;
    serviceId?: string;
    serviceTitle?: string;
}

interface Category {
    id: string;
    title: string;
    icon: string;
    description: string;
}

interface Service2Record {
    id: number;
    requestId: string;
    serviceName: string;
    priority: number;
    duration: number;
    status: "Pending" | "In Progress" | "Completed" | "Cancelled";
    assignedTo?: string;
    createdDate?: string;
    updatedDate?: string;
}

interface LocationState {
    category?: Category;
    service?: Service;
}

const Service2ManagementPage = () => {
    const { categoryId, serviceId, action } = useParams<{
        categoryId: string;
        serviceId: string;
        action: string;
    }>();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [category, setCategory] = useState<Category | null>(null);
    const [services, setServices] = useState<Service2Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [sortState, setSortState] = useState<SortState[]>([]);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // API call to fetch service 2 data
    const fetchService2Data = async (page: number = 1, query: string = "", currentPageSize: number = pageSize) => {
        try {
            setLoading(true);
            setError(null);

            const params: OfficeStationaryParams = {
                searchText: query,
                pageNumber: page,
                pageSize: currentPageSize,
                orderByColumn: "RequestId",
                orderDirection: "DESC"
            };

            const response: any = await OfficeStationaryService.OfficeStationarySectorGetAll(params);

            if (response?.success && response?.data) {
                const data = response.data;

                if (Array.isArray(data)) {
                    // Transform API data to match our Service2Record interface
                    const transformedServices: Service2Record[] = data.map((item: any, index: number) => ({
                        id: item.id || item.requestId || index + 1,
                        requestId: item.requestId || `#SRV2-${String(index + 1).padStart(4, '0')}`,
                        serviceName: item.serviceName || item.name || item.itemTitle || "Service Item",
                        priority: item.priority || Math.floor(Math.random() * 5) + 1,
                        duration: item.duration || Math.floor(Math.random() * 120) + 30, // 30-150 minutes
                        status: item.status || ["Pending", "In Progress", "Completed", "Cancelled"][Math.floor(Math.random() * 4)] as "Pending" | "In Progress" | "Completed" | "Cancelled",
                        assignedTo: item.assignedTo || item.assignee || "Unassigned",
                        createdDate: item.createdDate || item.date || item.requestDate,
                        updatedDate: item.updatedDate || item.modifiedDate
                    }));

                    setServices(transformedServices);
                    setTotalCount(transformedServices.length);
                    setTotalPages(Math.ceil(transformedServices.length / currentPageSize));
                } else {
                    setServices([]);
                    setTotalCount(0);
                    setTotalPages(1);
                }
            } else {
                throw new Error(response?.message || "Failed to fetch service 2 data");
            }
        } catch (err) {
            console.error("Error fetching service 2 data:", err);
            setError("Failed to load service 2 data");
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Set category from state
                if (state?.category) {
                    setCategory(state.category);
                }

                // Fetch service 2 data
                await fetchService2Data(1, searchText, pageSize);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId, serviceId, state]);

    // Handle page change
    const handlePageChange = (page: number) => {
        setPageNumber(page);
        fetchService2Data(page, searchText, pageSize);
    };

    // Handle search
    const handleSearch = () => {
        setPageNumber(1);
        fetchService2Data(1, searchText, pageSize);
    };

    // Handle sort change
    const handleSortChange = (newSortState: SortState[]) => {
        setSortState(newSortState);
    };

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPageNumber(1);
        fetchService2Data(1, searchText, size);
    };

    // Table columns configuration
    const tableColumns: TableColumn<Service2Record>[] = [
        {
            label: "Service ID",
            value: (row) => (
                <span className="font-semibold text-primary">
                    {row.requestId}
                </span>
            ),
            sortKey: "requestId",
            isSort: true
        },
        {
            label: "Service Name",
            value: (row) => (
                <span className="text-gray-700">{row.serviceName}</span>
            ),
            sortKey: "serviceName",
            isSort: true
        },
        {
            label: "Priority",
            value: (row) => {
                const getPriorityColor = (priority: number) => {
                    if (priority >= 4) return "text-red-600 bg-red-50";
                    if (priority >= 3) return "text-orange-600 bg-orange-50";
                    if (priority >= 2) return "text-yellow-600 bg-yellow-50";
                    return "text-green-600 bg-green-50";
                };

                return (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getPriorityColor(row.priority)}`}>
                        Level {row.priority}
                    </span>
                );
            },
            sortKey: "priority",
            isSort: true
        },
        {
            label: "Duration",
            value: (row) => (
                <span className="text-gray-500">{row.duration} min</span>
            ),
            sortKey: "duration",
            isSort: true
        },
        {
            label: "Assigned To",
            value: (row) => (
                <span className="text-gray-700">{row.assignedTo}</span>
            ),
            sortKey: "assignedTo",
            isSort: true
        },
        {
            label: "Status",
            value: (row) => {
                const getStatusBadgeClass = (status: string) => {
                    switch (status) {
                        case "Pending":
                            return "border border-amber-200 bg-amber-50 text-amber-700";
                        case "In Progress":
                            return "border border-blue-200 bg-blue-50 text-blue-700";
                        case "Completed":
                            return "border border-emerald-200 bg-emerald-50 text-emerald-700";
                        case "Cancelled":
                            return "border border-rose-200 bg-rose-50 text-rose-700";
                        default:
                            return "border border-gray-200 bg-gray-50 text-gray-700";
                    }
                };

                return (
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(row.status)}`}>
                        {row.status}
                    </span>
                );
            },
            sortKey: "status",
            isSort: true
        }
    ];

    // Action buttons configuration
    const actionButtons: ActionButton<Service2Record>[] = [
        {
            label: "View",
            iconType: "view",
            onClick: (row) => {
                // Navigate to service detail page
                navigate(`/service2-detail/${row.requestId}`, {
                    state: { serviceData: row }
                });
            }
        },
    ];

    if (loading && services.length === 0) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading service data...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error && services.length === 0) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="text-center py-12">
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => fetchService2Data(1, searchText, pageSize)}
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
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Service 2 Management
                            </h1>
                            <p className="text-sm text-gray-500">
                                {category?.title} - Service Index 2 - {action?.toUpperCase()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type="search"
                                        placeholder="Search services..."
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-64 rounded-full border border-slate-200 bg-white px-5 py-2 pl-10 pr-4 text-sm text-gray-600 shadow focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                                    />
                                    <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-primary/70">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSearch}
                                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]"
                                >
                                    Search
                                </button>
                            </div>
                            <button
                                type="button"
                                className="rounded-full border border-gray-200 px-6 py-2 text-sm font-semibold text-primary shadow-sm transition hover:border-primary"
                                onClick={() => navigate('/service-dashboard')}
                            >
                                Back to Service Category
                            </button>
                        </div>
                    </div>
                </header>

                {/* Stats Row */}
                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                    <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                            <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            {services.filter(service => service.status === "In Progress").length}
                        </h3>
                        <p className="text-sm text-gray-600">In Progress</p>
                    </div>
                    <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                            <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            {services.filter(service => service.status === "Completed").length}
                        </h3>
                        <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                            <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            {services.filter(service => service.priority >= 4).length}
                        </h3>
                        <p className="text-sm text-gray-600">High Priority</p>
                    </div>
                </div>

                {/* Services Table using ComanTable */}
                <div className="rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                    <ComanTable
                        columns={tableColumns}
                        data={services}
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

export default Service2ManagementPage;
