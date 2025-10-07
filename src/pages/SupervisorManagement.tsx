import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";
import {
  getSuperAdmins,
  softDeleteSuperAdmin,
  updateSuperAdminStatus,
} from "../services/superAdminService";
import type {
  SuperAdminRecord,
  SuperAdminStatusId,
} from "../services/superAdminService";
import SupervisorForm from "../components/supervisor/SupervisorForm";
import { ModalShell } from "../components/rentalServices/Modals";
import DashboardLayout from "../layouts/DashboardLayout";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../components/common/ComanTable";

const PAGE_SIZE = 10;

const STATUS_BADGE_CLASSES: Record<string, string> = {
  Active:
    "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-700",
  Inactive: "bg-rose-100 text-rose-600 hover:bg-rose-200 hover:text-rose-700",
};

const TYPE_LABELS: Record<number, string> = {
  0: "Operational Supervisor",
  1: "Operational Employee",
  2: "Finance Supervisor",
  3: "Finance Employee",
  4: "IT Support Employee",
};

const SupervisorPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [records, setRecords] = useState<SuperAdminRecord[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "view" | "edit">("add");
  const [selectedRecord, setSelectedRecord] = useState<SuperAdminRecord | null>(
    null
  );
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    record: SuperAdminRecord | null;
  }>({
    isOpen: false,
    record: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    record: SuperAdminRecord | null;
    currentStatus: boolean;
  }>({
    isOpen: false,
    record: null,
    currentStatus: false,
  });
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [sortState, setSortState] = useState<SortState[]>([]);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);

  const loadData = useCallback(
    async (page: number, query: string, currentPageSize: number = pageSize) => {
      setLoading(true);
      setErrorMessage(null);
      try {
        const response: any = await getSuperAdmins({
          pageNumber: page,
          pageSize: currentPageSize,
          search: query || undefined,
        });

        setRecords(response?.raw?.data?.records);
        const newTotalCount = response?.raw?.data?.totalRecords;
        setTotalCount(newTotalCount);
        setPageNumber(response.pageNumber ?? page);
        const calculatedPages =
          newTotalCount > 0 ? Math.ceil(newTotalCount / currentPageSize) : 1;
        setTotalPages(Math.max(1, calculatedPages));
      } catch (error) {
        console.error("Failed to fetch super admin list", error);
        const message =
          error instanceof Error ? error.message : "Unable to load records";
        setErrorMessage(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadData(pageNumber, searchTerm.trim(), pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update totalPages when totalCount or pageSize changes
  useEffect(() => {
    const calculatedPages =
      totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;
    const finalPages = Math.max(1, calculatedPages);
    setTotalPages(finalPages);
  }, [totalCount, pageSize]);

  const handleRefresh = () => {
    void loadData(pageNumber, searchTerm.trim(), pageSize);
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPageNumber(1);
    void loadData(1, searchTerm.trim(), pageSize);
  };

  const handleAdd = () => {
    setFormMode("add");
    setSelectedRecord(null);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedRecord(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedRecord(null);
    void loadData(pageNumber, searchTerm.trim(), pageSize);
  };

  const handleView = (record: SuperAdminRecord) => {
    navigate(`/supervisor-management/${record.employeeId}`);
  };

  const handleEdit = (record: SuperAdminRecord) => {
    setFormMode("edit");
    setSelectedRecord(record);
    setShowForm(true);
  };

  const handleStatusToggle = (record: SuperAdminRecord) => {
    const currentStatus = (record.statusId ?? (record.isActive ? 1 : 0)) === 1;
    setStatusModal({
      isOpen: true,
      record,
      currentStatus,
    });
  };

  const handleStatusConfirm = async () => {
    if (!statusModal.record) return;

    setIsStatusUpdating(true);
    try {
      const nextStatus: SuperAdminStatusId = statusModal.currentStatus ? 0 : 1;
      await updateSuperAdminStatus(statusModal.record.employeeId, nextStatus);
      showToast(
        `Status updated to ${nextStatus === 1 ? "Active" : "Inactive"}.`,
        "success"
      );
      setRecords((prev) =>
        prev.map((item) =>
          item.employeeId === statusModal.record!.employeeId
            ? { ...item, statusId: nextStatus, isActive: nextStatus === 1 }
            : item
        )
      );
      setStatusModal({ isOpen: false, record: null, currentStatus: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update status";
      showToast(message, "error");
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleStatusCancel = () => {
    setStatusModal({ isOpen: false, record: null, currentStatus: false });
  };

  const handleDelete = (record: SuperAdminRecord) => {
    setDeleteModal({
      isOpen: true,
      record,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.record) return;

    setIsDeleting(true);
    try {
      await softDeleteSuperAdmin(deleteModal.record.employeeId);
      showToast("Profile removed successfully.", "success");
      setRecords((prev) =>
        prev.filter(
          (item) => item.employeeId !== deleteModal.record!.employeeId
        )
      );
      setTotalCount((prev) => Math.max(0, prev - 1));
      setDeleteModal({ isOpen: false, record: null });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete profile";
      showToast(message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, record: null });
  };

  const stats = useMemo(() => {
    const total = totalCount || records.length;
    const active = records.filter(
      (item) => (item.statusId ?? (item.isActive ? 1 : 0)) === 1
    ).length;
    const inactive = total - active;
    return [
      { label: "Total Employee", value: total.toString() },
      { label: "Total Active Employee", value: active.toString() },
      { label: "Total Inactive", value: inactive.toString() },
    ];
  }, [records, totalCount]);

  // Table columns configuration
  const tableColumns: TableColumn<SuperAdminRecord>[] = useMemo(
    () => [
      {
        label: "ID No",
        value: (row) => (
          <span className="font-semibold text-primary">
            {row.idNumber || `#${row.employeeId}`}
          </span>
        ),
        sortKey: "employeeId",
        isSort: true,
      },
      {
        label: "Name",
        value: (row) => (
          <span className="text-gray-700">
            {[row.firstName, row.middleName, row.lastName]
              .filter(Boolean)
              .join(" ")}
          </span>
        ),
        sortKey: "firstName",
        isSort: true,
      },
      {
        label: "User Type",
        value: (row) => (
          <span className="text-gray-500">
            {TYPE_LABELS[row.type] ?? "Unknown"}
          </span>
        ),
        sortKey: "type",
        isSort: true,
      },
      {
        label: "Email",
        value: (row) => (
          <span className="text-gray-500">{row.officialEmail}</span>
        ),
        sortKey: "officialEmail",
        isSort: true,
      },
      {
        label: "Phone",
        value: (row) => (
          <span className="text-gray-500">{row.telephone || "N/A"}</span>
        ),
        sortKey: "telephone",
        isSort: true,
      },
      {
        label: "Country",
        value: (row) => (
          <span className="text-gray-500">{row.country || "N/A"}</span>
        ),
        sortKey: "country",
        isSort: true,
      },
      {
        label: "Region",
        value: (row) => (
          <span className="text-gray-500">{row.region || "N/A"}</span>
        ),
        sortKey: "region",
        isSort: true,
      },
      {
        label: "City",
        value: (row) => (
          <span className="text-gray-500">{row.city || "N/A"}</span>
        ),
        sortKey: "city",
        isSort: true,
      },
      {
        label: "Status",
        value: (row) => {
          const statusLabel =
            (row.statusId ?? (row.isActive ? 1 : 0)) === 1
              ? "Active"
              : "Inactive";
          return (
            <button
              type="button"
              onClick={() => handleStatusToggle(row)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 hover:shadow-md hover:scale-105 cursor-pointer border border-transparent hover:border-current ${
                STATUS_BADGE_CLASSES[statusLabel] ??
                "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
              title={`Click to ${
                statusLabel === "Active" ? "deactivate" : "activate"
              } this supervisor`}
            >
              {statusLabel}
            </button>
          );
        },
        sortKey: "statusId",
        isSort: true,
      },
    ],
    []
  );

  // Action buttons configuration
  const actionButtons: ActionButton<SuperAdminRecord>[] = useMemo(
    () => [
      {
        label: "View",
        iconType: "view",
        onClick: handleView,
      },
      {
        label: "Edit",
        iconType: "edit",
        onClick: handleEdit,
      },
      {
        label: "Delete",
        iconType: "delete",
        onClick: handleDelete,
      },
    ],
    []
  );

  // Handle page change
  const handlePageChange = (page: number) => {
    setPageNumber(page);
    void loadData(page, searchTerm.trim(), pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageNumber(1);
    void loadData(1, searchTerm.trim(), size);
  };

  // Handle sort change
  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
    // You can implement sorting logic here if needed
    // For now, we'll just update the sort state
  };

  return (
    <DashboardLayout>
      <div className="salva-main-desh w-full mx-auto flex bg-[#f2f2f2]">
        {/* Header section */}

        {/* Main content area */}
        <div className="w-full">
          {!showForm ? (
            <div className="flex-1 space-y-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="grid gap-1 text-primary">
                  <h2 className="text-2xl font-semibold">
                    Supervisor / Employee Management
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Overview
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]"
                    onClick={handleAdd}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-gray-200 px-6 py-2 text-sm font-semibold text-primary transition hover:border-primary"
                    onClick={handleRefresh}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <StatsRow stats={stats} />
              <ChartPlaceholder />

              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <div className="relative flex-1 min-w-[220px] max-w-sm">
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name, ID, or email"
                    className="w-full rounded-full border border-gray-200 bg-white px-5 py-3 pl-12 text-sm text-gray-600 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-primary/60">
                    <SearchIcon />
                  </span>
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#030447]"
                  disabled={loading}
                >
                  Search
                </button>
              </form>

              {errorMessage ? (
                <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-6 py-10 text-center text-sm text-rose-600">
                  {errorMessage}
                </div>
              ) : (
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
              )}
            </div>
          ) : (
            <SupervisorForm
              mode={formMode}
              record={selectedRecord || undefined}
              onCancel={handleCancelForm}
              onSuccess={handleFormSuccess}
            />
          )}
        </div>

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

        {/* Status Confirmation Modal */}
        {statusModal.isOpen && statusModal.record && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[6px] px-4">
            <StatusConfirmModal
              isSubmitting={isStatusUpdating}
              onCancel={handleStatusCancel}
              onConfirm={handleStatusConfirm}
              currentStatus={statusModal.currentStatus}
              recordName={[
                statusModal.record.firstName,
                statusModal.record.middleName,
                statusModal.record.lastName,
              ]
                .filter(Boolean)
                .join(" ")}
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

const StatsRow = ({
  stats,
}: {
  stats: Array<{ label: string; value: string }>;
}) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {stats.map((item) => (
      <div
        key={item.label}
        className="rounded-[28px] border border-gray-100 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]"
      >
        <p className="text-4xl font-semibold text-primary">{item.value}</p>
        <p className="mt-2 text-sm text-gray-500">{item.label}</p>
      </div>
    ))}
  </div>
);

const DeleteConfirmModal = ({
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ModalShell title="Delete Supervisor / Employee" onClose={onCancel}>
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
          Delete Supervisor / Employee
        </p>
        <p className="text-sm text-gray-600">
          This action will permanently delete the supervisor/employee. This
          action cannot be undone.
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

const StatusConfirmModal = ({
  isSubmitting,
  onCancel,
  onConfirm,
  currentStatus,
  recordName,
}: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  currentStatus: boolean;
  recordName: string;
}) => (
  <ModalShell
    title={
      currentStatus
        ? "Deactivate Supervisor / Employee"
        : "Activate Supervisor / Employee"
    }
    onClose={onCancel}
  >
    <div className="space-y-6 text-center">
      <div
        className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
          currentStatus
            ? "bg-orange-100 text-orange-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {currentStatus ? (
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
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
            />
          </svg>
        ) : (
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold text-gray-900">
          {currentStatus ? "Deactivate" : "Activate"} Supervisor / Employee
        </p>
        <p className="text-sm text-gray-600">
          Are you sure you want to {currentStatus ? "deactivate" : "activate"}{" "}
          <strong>{recordName}</strong>?
          {currentStatus
            ? " They will no longer be able to access the system."
            : " They will regain access to the system."}
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
          className={`rounded-full px-6 py-2 text-sm font-semibold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-50 ${
            currentStatus
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? currentStatus
              ? "Deactivating..."
              : "Activating..."
            : currentStatus
            ? "Deactivate"
            : "Activate"}
        </button>
      </div>
    </div>
  </ModalShell>
);

const ChartPlaceholder = () => (
  <div className="rounded-[28px] border border-gray-200 bg-[#f6f7fb] px-6 py-10 text-center text-sm text-gray-500">
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
    <circle cx="11" cy="11" r="6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-2.6-2.6" />
  </svg>
);

export default SupervisorPage;
