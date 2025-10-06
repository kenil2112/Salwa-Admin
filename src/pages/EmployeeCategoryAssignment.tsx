import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode, SelectHTMLAttributes } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";
import ComanTable, {
  type TableColumn,
  type ActionButton,
  type SortState,
} from "../components/common/ComanTable";
import CommonServices from "../services/CommonServices/CommonServices";

type FormMode = "create" | "edit";

interface EmployeeCategoryAssignmentItem {
  assignmentId: number;
  employeeId: number;
  employeeName?: string | null;
  officialEmail?: string | null;
  telephone?: string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  serviceId?: number | null;
  serviceName?: string | null;
  subServiceId?: number | null;
  subServiceName?: string | null;
}

interface FormState {
  assignmentId: number | null;
  employeeIds: string[];
  categoryId: string;
  serviceId: string;
  subServiceId: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface EmployeeOption extends SelectOption {
  email?: string;
  phone?: string;
}

const LIST_ENDPOINT =
  "https://apisalwa.rushkarprojects.in/api/AdminAddEmployeeAndCategoryAssign/GetAllServiceManageMentEmployeeCategoryAssign";
const DETAIL_ENDPOINT =
  "https://apisalwa.rushkarprojects.in/api/AdminAddEmployeeAndCategoryAssign/GetServiceManageMentEmployeeCategoryAssignById";
const UPSERT_ENDPOINT =
  "https://apisalwa.rushkarprojects.in/api/AdminAddEmployeeAndCategoryAssign/UpsertServiceManageMentEmployeeCategoryAssign";

const createDefaultFormState = (): FormState => ({
  assignmentId: null,
  employeeIds: [],
  categoryId: "",
  serviceId: "",
  subServiceId: "",
});

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

const extractList = (payload: unknown): EmployeeCategoryAssignmentItem[] => {
  if (Array.isArray(payload)) {
    return payload as EmployeeCategoryAssignmentItem[];
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    const { data } = payload as { data?: unknown };
    if (Array.isArray(data)) {
      return data as EmployeeCategoryAssignmentItem[];
    }
  }
  return [];
};
const EmployeeCategoryAssignment = () => {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<
    EmployeeCategoryAssignmentItem[]
  >([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortState, setSortState] = useState<SortState[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formValues, setFormValues] = useState<FormState>(
    createDefaultFormState()
  );
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Dropdown data state
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([]);
  const [subServiceOptions, setSubServiceOptions] = useState<SelectOption[]>(
    []
  );
  console.log(categoryOptions);
  const [loadingDropdowns, setLoadingDropdowns] = useState({
    employees: false,
    categories: false,
    services: false,
    subServices: false,
  });

  const loadAssignments = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const response = await authFetch(LIST_ENDPOINT, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      const payload = await parseResponse(response);
      if (!response.ok) {
        throw new Error(
          messageFromPayload(payload, "Unable to load assignments.")
        );
      }

      const items = extractList(payload);
      setAssignments(items);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load assignments.";
      setAssignments([]);
      setListError(message);
      showToast(message, "error");
    } finally {
      setListLoading(false);
    }
  }, [authFetch, showToast]);

  // API functions for dropdowns
  const loadEmployeeOptions = useCallback(async () => {
    setLoadingDropdowns((prev) => ({ ...prev, employees: true }));
    try {
      const response: any = await CommonServices.CommonApi({
        parameter: "",
        spName: "USP_GetSuperAdminList",
        language: "EN",
      });

      if (!response || !response.success) {
        throw new Error(
          (response as any)?.message || "Unable to load employees."
        );
      }

      const data = JSON.parse(response.data);
      const options: EmployeeOption[] = data.map((item: any) => ({
        value: item.Id?.toString() || item.Id?.toString() || "",
        label:
          item.employeeName ||
          item.EmployeeName ||
          `Employee ${item.EmployeeName || item.EmployeeName}`,
      }));
      setEmployeeOptions(options);
    } catch (error) {
      console.error("Failed to load employees:", error);
      showToast("Failed to load employees", "error");
    } finally {
      setLoadingDropdowns((prev) => ({ ...prev, employees: false }));
    }
  }, [showToast]);

  const loadCategoryOptions = useCallback(async () => {
    setLoadingDropdowns((prev) => ({ ...prev, categories: true }));
    try {
      const response: any = await CommonServices.CommonApi({
        Parameter: "",
        SPName: "USP_GetAllAdminCategory",
        Language: "EN",
      });

      if (!response || !response.success) {
        throw new Error(
          (response as any)?.message || "Unable to load categories."
        );
      }

      const data: any = JSON.parse(response.data);
      const options: SelectOption[] = data.map((item: any) => ({
        value: item.Id?.toString() || item.Id?.toString() || "",
        label: item.Name || `Category ${item.categoryId || item.id}`,
      }));
      setCategoryOptions(options);
    } catch (error) {
      console.error("Failed to load categories:", error);
      showToast("Failed to load categories", "error");
    } finally {
      setLoadingDropdowns((prev) => ({ ...prev, categories: false }));
    }
  }, [showToast]);

  const loadServiceOptions = useCallback(
    async (categoryId: string) => {
      if (!categoryId) {
        setServiceOptions([]);
        setSubServiceOptions([]);
        return;
      }

      setLoadingDropdowns((prev) => ({ ...prev, services: true }));
      try {
        const response: any = await CommonServices.CommonApi({
          Parameter: `{"ParentId":${categoryId}}`,
          SPName: "USP_GetAdminCategoryServices",
          Language: "EN",
        });

        if (!response || !response.success) {
          throw new Error(
            (response as any)?.message || "Unable to load services."
          );
        }

        const data = JSON.parse(response.data);
        const options: SelectOption[] = data.map((item: any) => ({
          value: item.Id?.toString() || item.id?.toString() || "",
          label:
            item.name || item.serviceName || `Service ${item.Id || item.id}`,
        }));
        setServiceOptions(options);
        setSubServiceOptions([]); // Clear sub-services when category changes
      } catch (error) {
        console.error("Failed to load services:", error);
        showToast("Failed to load services", "error");
      } finally {
        setLoadingDropdowns((prev) => ({ ...prev, services: false }));
      }
    },
    [showToast]
  );

  const loadSubServiceOptions = useCallback(
    async (serviceId: string) => {
      if (!serviceId) {
        setSubServiceOptions([]);
        return;
      }

      setLoadingDropdowns((prev) => ({ ...prev, subServices: true }));
      try {
        const response: any = await CommonServices.CommonApi({
          Parameter: `{"ParentId":${serviceId}}`,
          SPName: "USP_GetAdminServiceSubServices",
          Language: "EN",
        });

        if (!response || !response.success) {
          throw new Error(
            (response as any)?.message || "Unable to load sub-services."
          );
        }

        const data = JSON.parse(response.data);

        const options: SelectOption[] = data.map((item: any) => ({
          value: item.Id?.toString() || item.id?.toString() || "",
          label:
            item.name ||
            item.subServiceName ||
            `Sub-service ${item.Id || item.id}`,
        }));
        setSubServiceOptions(options);
      } catch (error) {
        console.error("Failed to load sub-services:", error);
        showToast("Failed to load sub-services", "error");
      } finally {
        setLoadingDropdowns((prev) => ({ ...prev, subServices: false }));
      }
    },
    [showToast]
  );

  useEffect(() => {
    void loadAssignments();
    void loadEmployeeOptions();
    void loadCategoryOptions();
  }, [loadAssignments, loadEmployeeOptions, loadCategoryOptions]);

  const stats = useMemo(() => {
    const totalAssignments = assignments.length;
    const uniqueEmployees = new Set(
      assignments
        .map((item) => item.employeeId)
        .filter(
          (value): value is number =>
            typeof value === "number" && !Number.isNaN(value)
        )
    ).size;
    const uniqueCategories = new Set(
      assignments
        .map((item) => item.categoryId)
        .filter(
          (value): value is number =>
            typeof value === "number" && !Number.isNaN(value)
        )
    ).size;

    return [
      { label: "Total Assignments", value: totalAssignments.toString() },
      { label: "Unique Employees", value: uniqueEmployees.toString() },
      { label: "Unique Categories", value: uniqueCategories.toString() },
    ];
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return assignments;
    }

    return assignments.filter((item) => {
      const haystack = [
        item.employeeName,
        item.officialEmail,
        item.telephone,
        item.categoryName,
        item.serviceName,
        item.subServiceName,
      ]
        .filter((value): value is string => Boolean(value))
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [assignments, searchTerm]);

  // Pagination logic
  const totalCount = filteredAssignments.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssignments = filteredAssignments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortState: SortState[]) => {
    setSortState(newSortState);
  };

  // Table columns configuration
  const tableColumns: TableColumn<EmployeeCategoryAssignmentItem>[] = useMemo(
    () => [
      {
        label: "Assignment ID",
        value: (row) => (
          <span className="font-semibold text-primary">
            #{row.assignmentId.toString().padStart(4, "0")}
          </span>
        ),
        sortKey: "assignmentId",
        isSort: true,
      },
      {
        label: "Employee Name",
        value: (row) => (
          <span className="text-gray-700">{row.employeeName ?? "-"}</span>
        ),
        sortKey: "employeeName",
        isSort: true,
      },
      {
        label: "Official Email",
        value: (row) => (
          <span className="text-gray-500">{row.officialEmail ?? "-"}</span>
        ),
        sortKey: "officialEmail",
        isSort: true,
      },
      {
        label: "Telephone",
        value: (row) => (
          <span className="text-gray-500">{row.telephone ?? "-"}</span>
        ),
        sortKey: "telephone",
        isSort: true,
      },
      {
        label: "Category",
        value: (row) => (
          <span className="text-gray-500">{row.categoryName ?? "-"}</span>
        ),
        sortKey: "categoryName",
        isSort: true,
      },
      {
        label: "Service",
        value: (row) => (
          <span className="text-gray-500">{row.serviceName ?? "-"}</span>
        ),
        sortKey: "serviceName",
        isSort: true,
      },
      {
        label: "Sub-service",
        value: (row) => (
          <span className="text-gray-500">{row.subServiceName ?? "-"}</span>
        ),
        sortKey: "subServiceName",
        isSort: true,
      },
    ],
    []
  );

  const handleOpenCreate = () => {
    setFormMode("create");
    setFormValues(createDefaultFormState());
    setFormLoading(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (assignment: EmployeeCategoryAssignmentItem) => {
    setFormMode("edit");
    setFormValues(createDefaultFormState());
    setIsFormOpen(true);
    setFormLoading(true);

    try {
      const response = await authFetch(
        `${DETAIL_ENDPOINT}?EmployeeId=${assignment.employeeId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      const payload = await parseResponse(response);
      if (!response.ok) {
        throw new Error(
          messageFromPayload(payload, "Unable to fetch assignment details.")
        );
      }

      const items = extractList(payload);
      const match =
        items.find((item) => item.assignmentId === assignment.assignmentId) ??
        items[0] ??
        assignment;

      const formState: FormState = {
        assignmentId: match.assignmentId ?? assignment.assignmentId ?? null,
        employeeIds:
          typeof match.employeeId === "number" &&
          !Number.isNaN(match.employeeId)
            ? [match.employeeId.toString()]
            : [],
        categoryId:
          typeof match.categoryId === "number" &&
          !Number.isNaN(match.categoryId)
            ? match.categoryId.toString()
            : "",
        serviceId:
          typeof match.serviceId === "number" && !Number.isNaN(match.serviceId)
            ? match.serviceId.toString()
            : "",
        subServiceId:
          typeof match.subServiceId === "number" &&
          !Number.isNaN(match.subServiceId)
            ? match.subServiceId.toString()
            : "",
      };

      setFormValues(formState);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to fetch assignment details.";
      showToast(message, "error");
      setIsFormOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  // Action buttons configuration
  const actionButtons: ActionButton<EmployeeCategoryAssignmentItem>[] = useMemo(
    () => [
      {
        label: "Edit",
        iconType: "edit",
        onClick: handleOpenEdit,
      },
    ],
    [handleOpenEdit]
  );

  const handleFormSubmit = async () => {
    if (formSubmitting) {
      return;
    }

    const employeeIds = formValues.employeeIds;
    const categoryId = formValues.categoryId.trim();
    const serviceId = formValues.serviceId.trim();
    const subServiceId = formValues.subServiceId.trim();

    if (employeeIds.length === 0) {
      showToast("Employee is required.", "error");
      return;
    }
    if (!categoryId) {
      showToast("Category is required.", "error");
      return;
    }
    if (!serviceId) {
      showToast("Service is required.", "error");
      return;
    }

    const payload = {
      assignmentIds: formValues.assignmentId
        ? formValues.assignmentId.toString()
        : "0",
      employeeIds: employeeIds.join(","),
      categoryIds: categoryId,
      serviceIds: serviceId,
      subServiceIds: subServiceId || "0",
    };

    setFormSubmitting(true);
    try {
      const response = await authFetch(UPSERT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify(payload),
      });

      const body = await parseResponse(response);
      if (!response.ok) {
        throw new Error(messageFromPayload(body, "Unable to save assignment."));
      }

      const successMessage = messageFromPayload(
        body,
        "Assignment saved successfully."
      );
      showToast(successMessage, "success");
      setIsFormOpen(false);
      await loadAssignments();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save assignment.";
      showToast(message, "error");
    } finally {
      setFormSubmitting(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full  flex-col gap-8 pb-3">
        {/* <Header /> */}
        <section className="space-y-8 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="grid gap-1">
              <h2 className="text-2xl font-semibold text-primary">
                Employee &amp; Category Assignment
              </h2>
              <p className="text-sm text-gray-500">
                Assign workforce to categories and services.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SearchField value={searchTerm} onChange={setSearchTerm} />
              <button
                type="button"
                className="rounded-full bg-primary px-8 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]"
                onClick={handleOpenCreate}
              >
                Add
              </button>
            </div>
          </div>

          {listError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {listError}
            </div>
          )}

          <StatsRow stats={stats} />
          <ChartPlaceholder />

          <ComanTable
            columns={tableColumns}
            data={paginatedAssignments}
            actions={actionButtons}
            page={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={handlePageChange}
            sortState={sortState}
            onSortChange={handleSortChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            loading={listLoading}
          />
        </section>
      </div>

      {isFormOpen && (
        <ModalOverlay>
          <FormModal
            mode={formMode}
            values={formValues}
            onChange={setFormValues}
            onClose={() => {
              if (!formSubmitting) {
                setIsFormOpen(false);
              }
            }}
            onSubmit={handleFormSubmit}
            isSubmitting={formSubmitting}
            isLoading={formLoading}
            employeeOptions={employeeOptions}
            categoryOptions={categoryOptions}
            serviceOptions={serviceOptions}
            subServiceOptions={subServiceOptions}
            loadingDropdowns={loadingDropdowns}
            onCategoryChange={loadServiceOptions}
            onServiceChange={loadSubServiceOptions}
          />
        </ModalOverlay>
      )}
    </DashboardLayout>
  );
};

const SearchField = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) => (
  <div className="relative w-full max-w-xs">
    <input
      className="w-full rounded-full border border-gray-200 bg-white px-4 py-2.5 pl-10 text-sm text-gray-600 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      placeholder="Search here"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
      <SearchIcon />
    </span>
  </div>
);

const StatsRow = ({
  stats,
}: {
  stats: Array<{ label: string; value: string }>;
}) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {stats.map((item) => (
      <div
        key={item.label}
        className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]"
      >
        <p className="text-3xl font-semibold text-primary">{item.value}</p>
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

const FormModal = ({
  mode,
  values,
  onChange,
  onClose,
  onSubmit,
  isSubmitting,
  isLoading,
  employeeOptions,
  categoryOptions,
  serviceOptions,
  subServiceOptions,
  loadingDropdowns,
  onCategoryChange,
  onServiceChange,
}: {
  mode: FormMode;
  values: FormState;
  onChange: (next: FormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isLoading: boolean;
  employeeOptions: EmployeeOption[];
  categoryOptions: SelectOption[];
  serviceOptions: SelectOption[];
  subServiceOptions: SelectOption[];
  loadingDropdowns: {
    employees: boolean;
    categories: boolean;
    services: boolean;
    subServices: boolean;
  };
  onCategoryChange: (categoryId: string) => void;
  onServiceChange: (serviceId: string) => void;
}) => {
  return (
    <ModalShell
      title={`${
        mode === "edit" ? "Edit" : "Add"
      } Employee & Category Assignment`}
      onClose={onClose}
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-gray-500">
          Loading details...
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid gap-4 grid-cols-2">
            <LabeledSelect
              value={values.employeeIds[0] || ""}
              onChange={(event) => {
                const selectedValue = event.target.value;
                onChange({
                  ...values,
                  employeeIds: selectedValue ? [selectedValue] : [],
                });
              }}
              disabled={isSubmitting || loadingDropdowns.employees}
            >
              <option value="">Select employee</option>
              {employeeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </LabeledSelect>

            <LabeledSelect
              value={values.categoryId}
              onChange={(event) => {
                const selectedValue = event.target.value;
                onChange({
                  ...values,
                  categoryId: selectedValue,
                  serviceId: "",
                  subServiceId: "",
                });
                onCategoryChange(selectedValue);
              }}
              disabled={isSubmitting || loadingDropdowns.categories}
            >
              <option value="">Select category</option>
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </LabeledSelect>

            <LabeledSelect
              value={values.serviceId}
              onChange={(event) => {
                const selectedValue = event.target.value;
                onChange({
                  ...values,
                  serviceId: selectedValue,
                  subServiceId: "",
                });
                onServiceChange(selectedValue);
              }}
              disabled={
                isSubmitting || loadingDropdowns.services || !values.categoryId
              }
            >
              <option value="">Select service</option>
              {serviceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </LabeledSelect>

            <LabeledSelect
              value={values.subServiceId}
              onChange={(event) => {
                onChange({
                  ...values,
                  subServiceId: event.target.value,
                });
              }}
              disabled={
                isSubmitting ||
                loadingDropdowns.subServices ||
                !values.serviceId
              }
            >
              <option value="">Select sub-service</option>
              {subServiceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </LabeledSelect>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
};

const LabeledSelect = ({
  label,
  className = "",
  children,
  ...props
}: {
  label?: string;
  children: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label || ""}
    </label>
    <div className="relative">
      <select
        {...props}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${className}`}
      >
        {children}
      </select>
    </div>
  </div>
);

const ActionButton = ({
  label,
  variant,
  onClick,
  children,
}: {
  label: string;
  variant: "edit";
  onClick: () => void;
  children: ReactNode;
}) => {
  const styles: Record<"edit", string> = {
    edit: "bg-white text-[#1d1f2a] border border-gray-200 hover:border-primary hover:text-primary",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 shadow-sm ${styles[variant]}`}
    >
      {children}
    </button>
  );
};
const ModalOverlay = ({ children }: { children: ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-[6px] px-4">
    {children}
  </div>
);

const ModalShell = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => (
  <div className="w-full max-w-2xl rounded-lg bg-white px-6 py-6 shadow-lg">
    <div className="flex items-center justify-between gap-4 mb-6">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <button
        type="button"
        aria-label="Close"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
        onClick={onClose}
      >
        <CloseIcon />
      </button>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="h-4 w-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6l12 12M18 6L6 18"
    />
  </svg>
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
    <path strokeLinecap="round" strokeLinejoin="round" d="m20 20-3-3" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    className="h-3 w-3"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m6 8 4 4 4-4" />
  </svg>
);

export default EmployeeCategoryAssignment;
