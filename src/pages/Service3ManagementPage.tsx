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

interface Service3Record {
    id: number;
    requestId: string;
    projectName: string;
    budget: number;
    progress: number;
    status: "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";
    manager?: string;
    deadline?: string;
    createdDate?: string;
    updatedDate?: string;
}

interface LocationState {
    category?: Category;
    service?: Service;
}

const Service3ManagementPage = () => {
    const { categoryId, serviceId, action } = useParams<{
        categoryId: string;
        serviceId: string;
        action: string;
    }>();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [category, setCategory] = useState<Category | null>(null);
    const [projects, setProjects] = useState<Service3Record[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchText, setSearchText] = useState("");
    const [sortState, setSortState] = useState<SortState[]>([]);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // API call to fetch service 3 data
    const fetchService3Data = async (page: number = 1, query: string = "", currentPageSize: number = pageSize) => {
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
                    // Transform API data to match our Service3Record interface
                    const transformedProjects: Service3Record[] = data.map((item: any, index: number) => ({
                        id: item.id || item.requestId || index + 1,
                        requestId: item.requestId || `#PRJ-${String(index + 1).padStart(4, '0')}`,
                        projectName: item.projectName || item.name || item.itemTitle || "Project Item",
                        budget: item.budget || Math.floor(Math.random() * 100000) + 10000, // 10k-110k
                        progress: item.progress || Math.floor(Math.random() * 100), // 0-100%
                        status: item.status || ["Planning", "Active", "On Hold", "Completed", "Cancelled"][Math.floor(Math.random() * 5)] as "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled",
                        manager: item.manager || item.assignee || "Unassigned",
                        deadline: item.deadline || item.dueDate || new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        createdDate: item.createdDate || item.date || item.requestDate,
                        updatedDate: item.updatedDate || item.modifiedDate
                    }));

                    setProjects(transformedProjects);
                    setTotalCount(transformedProjects.length);
                    setTotalPages(Math.ceil(transformedProjects.length / currentPageSize));
                } else {
                    setProjects([]);
                    setTotalCount(0);
                    setTotalPages(1);
                }
            } else {
                throw new Error(response?.message || "Failed to fetch service 3 data");
            }
        } catch (err) {
            console.error("Error fetching service 3 data:", err);
            setError("Failed to load service 3 data");
            setProjects([]);
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

                // Fetch service 3 data
                await fetchService3Data(1, searchText, pageSize);
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
        fetchService3Data(page, searchText, pageSize);
    };

    // Handle search
    const handleSearch = () => {
        setPageNumber(1);
        fetchService3Data(1, searchText, pageSize);
    };

    // Handle sort change
    const handleSortChange = (newSortState: SortState[]) => {
        setSortState(newSortState);
    };

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPageNumber(1);
        fetchService3Data(1, searchText, size);
    };

    // Table columns configuration
    const tableColumns: TableColumn<Service3Record>[] = [
        {
            label: "Project ID",
            value: (row) => (
                <span className="font-semibold text-primary">
                    {row.requestId}
                </span>
            ),
            sortKey: "requestId",
            isSort: true
        },
        {
            label: "Project Name",
            value: (row) => (
                <span className="text-gray-700">{row.projectName}</span>
            ),
            sortKey: "projectName",
            isSort: true
        },
        {
            label: "Budget",
            value: (row) => (
                <span className="text-gray-500">${row.budget.toLocaleString()}</span>
            ),
            sortKey: "budget",
            isSort: true
        },
        {
            label: "Progress",
            value: (row) => {
                const getProgressColor = (progress: number) => {
                    if (progress >= 80) return "bg-emerald-500";
                    if (progress >= 60) return "bg-blue-500";
                    if (progress >= 40) return "bg-yellow-500";
                    return "bg-red-500";
                };

                return (
                    <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${getProgressColor(row.progress)}`}
                                style={{ width: `${row.progress}%` }}
                            ></div>
                        </div>
                        <span className="text-sm text-gray-600">{row.progress}%</span>
                    </div>
                );
            },
            sortKey: "progress",
            isSort: true
        },
        {
            label: "Manager",
            value: (row) => (
                <span className="text-gray-700">{row.manager}</span>
            ),
            sortKey: "manager",
            isSort: true
        },
        {
            label: "Deadline",
            value: (row) => (
                <span className="text-gray-500">{row.deadline}</span>
            ),
            sortKey: "deadline",
            isSort: true
        },
        {
            label: "Status",
            value: (row) => {
                const getStatusBadgeClass = (status: string) => {
                    switch (status) {
                        case "Planning":
                            return "border border-gray-200 bg-gray-50 text-gray-700";
                        case "Active":
                            return "border border-blue-200 bg-blue-50 text-blue-700";
                        case "On Hold":
                            return "border border-yellow-200 bg-yellow-50 text-yellow-700";
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
    const actionButtons: ActionButton<Service3Record>[] = [
        {
            label: "View",
            iconType: "view",
            onClick: (row) => {
                // Navigate to project detail page
                navigate(`/service3-detail/${row.requestId}`, {
                    state: { projectData: row }
                });
            }
        },

    ];

    if (loading && projects.length === 0) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading project data...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error && projects.length === 0) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="text-center py-12">
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => fetchService3Data(1, searchText, pageSize)}
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
                                Service 3 Management
                            </h1>
                            <p className="text-sm text-gray-500">
                                {category?.title} - Service Index 3 - {action?.toUpperCase()}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type="search"
                                        placeholder="Search projects..."
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            {projects.filter(project => project.status === "Active").length}
                        </h3>
                        <p className="text-sm text-gray-600">Active Projects</p>
                    </div>
                    <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                            <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            {projects.filter(project => project.status === "Completed").length}
                        </h3>
                        <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                            <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-2xl font-bold text-gray-900">
                            ${projects.reduce((sum, project) => sum + project.budget, 0).toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-600">Total Budget</p>
                    </div>
                </div>

                {/* Projects Table using ComanTable */}
                <div className="rounded-[28px] border border-gray-200 bg-white shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
                    <ComanTable
                        columns={tableColumns}
                        data={projects}
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

export default Service3ManagementPage;
