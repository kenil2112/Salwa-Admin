
import { useCallback, useEffect, useMemo, useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ToastProvider";

type ActiveTab = "registration" | "services";

type TabToType = {
  readonly registration: 1;
  readonly services: 2;
};

const TAB_TO_TYPE: TabToType = {
  registration: 1,
  services: 2,
};

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

interface UserTypeOption {
  id: number;
  label: string;
}

type DiscountKind = "Flat" | "Percentage";

interface FormState {
  promoCodeId: number | null;
  userTypeId: number;
  promoDescription: string;
  startDate: string;
  endDate: string;
  code: string;
  discountType: DiscountKind;
  discountValue: string;
  maxDiscount: string;
  minPurchase: string;
  isActive: boolean;
}

type FormMode = "create" | "edit";

const DEFAULT_USER_TYPES: UserTypeOption[] = [
  { id: 1, label: "Individual" },
  { id: 2, label: "Business" },
  { id: 3, label: "Government" },
];

const LIST_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/PromocodeSetting/GetAllAdminPromoCodes";
const DETAIL_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/PromocodeSetting/GetAdminPromoCodeById";
const UPSERT_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/PromocodeSetting/UpsertAdminPromoCodesRegistrationAndServices";
const STATUS_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/PromocodeSetting/ChangeAdminPromoCodeStatus";
const DELETE_ENDPOINT = "https://apisalwa.rushkarprojects.in/api/PromocodeSetting/DeleteAdminPromoCode";

const createInitialFormState = (defaultUserTypeId: number): FormState => ({
  promoCodeId: null,
  userTypeId: defaultUserTypeId,
  promoDescription: "",
  startDate: "",
  endDate: "",
  code: "",
  discountType: "Flat",
  discountValue: "",
  maxDiscount: "",
  minPurchase: "",
  isActive: true,
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

const extractItem = (payload: unknown): AdminPromoCode | null => {
  if (!payload) {
    return null;
  }
  if (Array.isArray(payload)) {
    return (payload[0] as AdminPromoCode | undefined) ?? null;
  }
  if (typeof payload === "object" && "data" in payload) {
    const { data } = payload as { data?: unknown };
    if (Array.isArray(data)) {
      return (data[0] as AdminPromoCode | undefined) ?? null;
    }
    if (data && typeof data === "object") {
      return data as AdminPromoCode;
    }
  }
  if (typeof payload === "object") {
    return payload as AdminPromoCode;
  }
  return null;
};

const mergeUserTypeOptions = (existing: UserTypeOption[], source: AdminPromoCode | AdminPromoCode[]) => {
  const map = new Map(existing.map((option) => [option.id, option]));
  const list = Array.isArray(source) ? source : [source];
  list.forEach((item) => {
    if (item && typeof item.userTypeId === "number") {
      const label = item.userType?.trim() || `Type ${item.userTypeId}`;
      if (!map.has(item.userTypeId)) {
        map.set(item.userTypeId, { id: item.userTypeId, label });
      }
    }
  });
  return Array.from(map.values());
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const formatNumeric = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (Number.isNaN(Number(value))) {
    return "-";
  }
  const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
  return formatter.format(Number(value));
};

const toNumericOrNull = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const numeric = Number(trimmed);
  return Number.isNaN(numeric) ? null : numeric;
};
const PromocodeSettings = () => {
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>("registration");
  const [searchTerm, setSearchTerm] = useState("");

  const [promoCodes, setPromoCodes] = useState<AdminPromoCode[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [userTypeOptions, setUserTypeOptions] = useState<UserTypeOption[]>(DEFAULT_USER_TYPES);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [formTab, setFormTab] = useState<ActiveTab>("registration");
  const [formValues, setFormValues] = useState<FormState>(createInitialFormState(DEFAULT_USER_TYPES[0].id));
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [statusTarget, setStatusTarget] = useState<{ promoCodeId: number; currentStatus: boolean; tab: ActiveTab } | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ promoCodeId: number; tab: ActiveTab } | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadPromocodes = useCallback(
    async (tab: ActiveTab) => {
      setListLoading(true);
      setListError(null);
      try {
        const response = await authFetch(
          `${LIST_ENDPOINT}?typeIsRegisterOrServices=${TAB_TO_TYPE[tab]}`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
            },
          }
        );

        const payload = await parseResponse(response);
        if (!response.ok) {
          throw new Error(messageFromPayload(payload, "Unable to load promocodes."));
        }

        const items = extractList(payload);
        setPromoCodes(items);
        setUserTypeOptions((prev) => mergeUserTypeOptions(prev, items));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load promocodes.";
        setPromoCodes([]);
        setListError(message);
        showToast(message, "error");
      } finally {
        setListLoading(false);
      }
    },
    [authFetch, showToast]
  );

  useEffect(() => {
    void loadPromocodes(activeTab);
  }, [activeTab, loadPromocodes]);

  const handleOpenCreate = (tab: ActiveTab) => {
    const defaultUserTypeId = userTypeOptions[0]?.id ?? DEFAULT_USER_TYPES[0].id;
    setFormMode("create");
    setFormTab(tab);
    setFormValues(createInitialFormState(defaultUserTypeId));
    setFormLoading(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = async (promoCodeId: number, tab: ActiveTab) => {
    setFormMode("edit");
    setFormTab(tab);
    setFormLoading(true);
    setIsFormOpen(true);

    try {
      const response = await authFetch(
        `${DETAIL_ENDPOINT}?promoCodeId=${promoCodeId}&typeIsRegisterOrServices=${TAB_TO_TYPE[tab]}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        }
      );

      const payload = await parseResponse(response);
      if (!response.ok) {
        throw new Error(messageFromPayload(payload, "Unable to fetch promocode details."));
      }

      const item = extractItem(payload);
      if (!item) {
        throw new Error("Promocode not found.");
      }

      setUserTypeOptions((prev) => mergeUserTypeOptions(prev, item));

      setFormValues({
        promoCodeId: item.promoCodeId,
        userTypeId: item.userTypeId ?? userTypeOptions[0]?.id ?? DEFAULT_USER_TYPES[0].id,
        promoDescription: item.promoDescription ?? "",
        startDate: item.startDate ? item.startDate.slice(0, 10) : "",
        endDate: item.endDate ? item.endDate.slice(0, 10) : "",
        code: item.code ?? "",
        discountType:
          item.discountTypeFlatOrPercentage === "Percentage" || item.discountType === 1
            ? "Percentage"
            : "Flat",
        discountValue:
          item.discountValue !== null && item.discountValue !== undefined
            ? String(item.discountValue)
            : "",
        maxDiscount:
          item.maxDiscountCapValue !== null && item.maxDiscountCapValue !== undefined
            ? String(item.maxDiscountCapValue)
            : "",
        minPurchase:
          item.minimumPurchaseValue !== null && item.minimumPurchaseValue !== undefined
            ? String(item.minimumPurchaseValue)
            : "",
        isActive: Boolean(item.isActive ?? true),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to fetch promocode details.";
      showToast(message, "error");
      setIsFormOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    if (formSubmitting) {
      return;
    }

    if (!formValues.promoDescription.trim()) {
      showToast("Promo description is required.", "error");
      return;
    }
    if (!formValues.startDate) {
      showToast("Start date is required.", "error");
      return;
    }
    if (!formValues.endDate) {
      showToast("End date is required.", "error");
      return;
    }
    if (!formValues.code.trim()) {
      showToast("Promo code is required.", "error");
      return;
    }
    if (!formValues.discountValue.trim()) {
      showToast(
        formValues.discountType === "Flat"
          ? "Discount value is required."
          : "Discount percentage is required.",
        "error"
      );
      return;
    }

    const payload = {
      promoCodeId: formValues.promoCodeId ?? 0,
      promoType: formTab === "registration" ? "Registration" : "Services",
      categoryId: 0,
      serviceId: 0,
      subServiceId: 0,
      typeIsRegisterOrServices: TAB_TO_TYPE[formTab],
      userTypeId: formValues.userTypeId,
      promoDescription: formValues.promoDescription.trim(),
      startDate: `${formValues.startDate}T00:00:00`,
      endDate: `${formValues.endDate}T00:00:00`,
      code: formValues.code.trim(),
      discountType: formValues.discountType === "Percentage" ? 1 : 0,
      discountValue: toNumericOrNull(formValues.discountValue) ?? 0,
      maxDiscountCapValue: toNumericOrNull(formValues.maxDiscount) ?? 0,
      minimumPurchaseValue: toNumericOrNull(formValues.minPurchase) ?? 0,
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
        throw new Error(messageFromPayload(body, "Unable to save promocode."));
      }

      const successMessage = messageFromPayload(body, "Promocode saved successfully.");
      showToast(successMessage, "success");
      setIsFormOpen(false);
      setFormSubmitting(false);
      await loadPromocodes(formTab);
      setActiveTab(formTab);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save promocode.";
      showToast(message, "error");
      setFormSubmitting(false);
    }
  };

  const handleStatusRequest = (promoCodeId: number, isActive: boolean, tab: ActiveTab) => {
    setStatusTarget({ promoCodeId, currentStatus: isActive, tab });
  };

  const handleConfirmStatus = async () => {
    if (!statusTarget || statusSubmitting) {
      return;
    }

    const nextStatus = !statusTarget.currentStatus;
    setStatusSubmitting(true);
    try {
      const response = await authFetch(STATUS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          promoCodeId: statusTarget.promoCodeId,
          typeIsRegisterOrServices: TAB_TO_TYPE[statusTarget.tab],
          isActive: nextStatus,
          userId: 0,
        }),
      });

      const body = await parseResponse(response);
      if (!response.ok) {
        throw new Error(messageFromPayload(body, "Unable to update status."));
      }

      const successMessage = messageFromPayload(body, "Status updated successfully.");
      showToast(successMessage, "success");
      setStatusTarget(null);
      await loadPromocodes(statusTarget.tab);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update status.";
      showToast(message, "error");
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleDeleteRequest = (promoCodeId: number, tab: ActiveTab) => {
    setDeleteTarget({ promoCodeId, tab });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || deleteSubmitting) {
      return;
    }

    setDeleteSubmitting(true);
    const { promoCodeId, tab } = deleteTarget;
    try {
      const response = await authFetch(DELETE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          promoCodeId,
          typeIsRegisterOrServices: TAB_TO_TYPE[tab],
          userId: 0,
        }),
      });

      const body = await parseResponse(response);
      if (!response.ok) {
        throw new Error(messageFromPayload(body, "Unable to delete promocode."));
      }

      const successMessage = messageFromPayload(body, "Promocode deleted successfully.");
      showToast(successMessage, "success");
      setDeleteTarget(null);
      await loadPromocodes(tab);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete promocode.";
      showToast(message, "error");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const filteredPromos = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return promoCodes;
    }

    return promoCodes.filter((promo) => {
      const haystack = [promo.code, promo.promoDescription, promo.userType]
        .filter((value): value is string => Boolean(value))
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [promoCodes, searchTerm]);

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-16">
        <Header />
        <section className="space-y-8 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 rounded-full bg-[#f7f8fd] p-1 text-sm font-semibold text-gray-500">
              <TabButton label="Registration" isActive={activeTab === "registration"} onClick={() => setActiveTab("registration")} />
              <TabButton label="Services" isActive={activeTab === "services"} onClick={() => setActiveTab("services")} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SearchField value={searchTerm} onChange={setSearchTerm} />
              <button
                type="button"
                className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447]"
                onClick={() => handleOpenCreate(activeTab)}
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

          <StatsRow />
          <ChartPlaceholder />

          <div className="rounded-[28px] border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full text-left text-[11px] tracking-[0.18em] text-gray-600">
                <thead className="bg-[#f6f7fb] text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">SO NO</th>
                    <th className="px-4 py-3 whitespace-nowrap">USER TYPE</th>
                    <th className="px-4 py-3 whitespace-nowrap">PROMO DESCRIPTION</th>
                    <th className="px-4 py-3 whitespace-nowrap">START DATE</th>
                    <th className="px-4 py-3 whitespace-nowrap">END DATE</th>
                    <th className="px-4 py-3 whitespace-nowrap">CODE</th>
                    <th className="px-4 py-3 whitespace-nowrap">VALUE TYPE</th>
                    <th className="px-4 py-3 whitespace-nowrap">VALUE</th>
                    <th className="px-4 py-3 whitespace-nowrap">PERCENTAGE (%)</th>
                    <th className="px-4 py-3 whitespace-nowrap">MAX DISCOUNT</th>
                    <th className="px-4 py-3 whitespace-nowrap">MIN PURCHASE</th>
                    <th className="px-4 py-3 whitespace-nowrap">STATUS</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {listLoading ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-6 text-center text-sm text-gray-500">
                        Loading promocodes...
                      </td>
                    </tr>
                  ) : filteredPromos.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-4 py-6 text-center text-sm text-gray-500">
                        No promocodes found.
                      </td>
                    </tr>
                  ) : (
                    filteredPromos.map((promo) => {
                      const isPercentage =
                        promo.discountTypeFlatOrPercentage === "Percentage" || promo.discountType === 1;
                      const valueDisplay = isPercentage
                        ? "-"
                        : formatNumeric(promo.discountValue ?? null);
                      const percentageDisplay = isPercentage
                        ? `${formatNumeric(promo.discountValue ?? null)}%`
                        : "-";

                      return (
                        <tr key={promo.promoCodeId}>
                          <td className="px-4 py-3 whitespace-nowrap font-semibold text-primary">#{promo.promoCodeId.toString().padStart(4, "0")}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-700">{promo.userType ?? "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{promo.promoDescription ?? "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(promo.startDate)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(promo.endDate)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{promo.code ?? "-"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{isPercentage ? "Percentage" : "Flat"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{valueDisplay}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{percentageDisplay}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatNumeric(promo.maxDiscountCapValue ?? null)}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatNumeric(promo.minimumPurchaseValue ?? null)}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${promo.isActive ? "bg-[#e9fbf3] text-[#0f7b4d]" : "bg-[#fff3d9] text-[#b46a02]"}`}
                            >
                              {promo.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <ActionButton
                                label="Edit"
                                variant="edit"
                                onClick={() => handleOpenEdit(promo.promoCodeId, activeTab)}
                              >
                                <EditIcon />
                              </ActionButton>
                              <ActionButton
                                label={promo.isActive ? "Deactivate" : "Activate"}
                                variant={promo.isActive ? "delete" : "view"}
                                onClick={() => handleStatusRequest(promo.promoCodeId, Boolean(promo.isActive), activeTab)}
                              >
                                {promo.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                              </ActionButton>
                              <ActionButton
                                label="Delete"
                                variant="delete"
                                onClick={() => handleDeleteRequest(promo.promoCodeId, activeTab)}
                              >
                                <TrashIcon />
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {isFormOpen && (
        <ModalOverlay>
          <FormModal
            mode={formMode}
            activeTab={formTab}
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
            userTypeOptions={userTypeOptions}
          />
        </ModalOverlay>
      )}

      {deleteTarget && (
        <ModalOverlay>
          <DeleteConfirmModal
            isSubmitting={deleteSubmitting}
            onCancel={() => {
              if (!deleteSubmitting) {
                setDeleteTarget(null);
              }
            }}
            onConfirm={handleConfirmDelete}
          />
        </ModalOverlay>
      )}

      {statusTarget && (
        <ModalOverlay>
          <StatusConfirmModal
            isActive={statusTarget.currentStatus}
            isSubmitting={statusSubmitting}
            onCancel={() => {
              if (!statusSubmitting) {
                setStatusTarget(null);
              }
            }}
            onConfirm={handleConfirmStatus}
          />
        </ModalOverlay>
      )}
    </DashboardLayout>
  );
};
const Header = () => (
  <div className="flex items-center gap-4 rounded-[28px] border border-gray-200 bg-white px-6 py-5 shadow-sm">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16" />
      </svg>
    </div>
    <div>
      <p className="text-lg font-semibold text-primary">Promocode Settings</p>
      <p className="text-sm text-gray-500">Manage promocodes for registration and services.</p>
    </div>
  </div>
);

const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    type="button"
    className={`rounded-full px-5 py-2 ${isActive ? "bg-white text-primary shadow" : "bg-transparent text-gray-500 hover:text-primary"
      }`}
    onClick={onClick}
  >
    {label}
  </button>
);

const SearchField = ({ value, onChange }: { value: string; onChange: (next: string) => void }) => (
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

const StatsRow = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {stats.map((item) => (
      <div key={item.label} className="rounded-[28px] border border-gray-200 bg-[#f7f8fd] px-6 py-8 text-center shadow-[0_20px_40px_rgba(5,6,104,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">{item.label}</p>
        <p className="mt-3 text-3xl font-semibold text-primary">{item.value}</p>
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
  activeTab,
  values,
  onChange,
  onClose,
  onSubmit,
  isSubmitting,
  isLoading,
  userTypeOptions,
}: {
  mode: FormMode;
  activeTab: ActiveTab;
  values: FormState;
  onChange: (next: FormState) => void;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isLoading: boolean;
  userTypeOptions: UserTypeOption[];
}) => {
  const tabLabel = activeTab === "registration" ? "Registration" : "Services";
  const submitLabel = mode === "edit" ? "Update Promocode" : "Save Promocode";

  return (
    <ModalShell
      title={`${mode === "edit" ? "Edit" : "Add"} Promocode (${tabLabel})`}
      onClose={onClose}
    >
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-gray-500">Loading details...</div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <LabeledSelect
              value={values.userTypeId}
              onChange={(event) =>
                onChange({
                  ...values,
                  userTypeId: Number(event.target.value),
                })
              }
              options={userTypeOptions.map((option) => ({ value: option.id, label: option.label }))}
              disabled={isSubmitting}
            />
            <LabeledInput
              placeholder="Promo Description"
              value={values.promoDescription}
              onChange={(event) => onChange({ ...values, promoDescription: event.target.value })}
              disabled={isSubmitting}
            />
            <LabeledInput
              type="date"
              value={values.startDate}
              onChange={(event) => onChange({ ...values, startDate: event.target.value })}
              disabled={isSubmitting}
            />
            <LabeledInput
              type="date"
              value={values.endDate}
              onChange={(event) => onChange({ ...values, endDate: event.target.value })}
              disabled={isSubmitting}
            />
            <LabeledInput
              placeholder="Code"
              value={values.code}
              onChange={(event) => onChange({ ...values, code: event.target.value })}
              disabled={isSubmitting}
            />
            <div className="space-y-2">
              <div className="flex items-center gap-6 rounded-md border border-gray-200 bg-[#f7f8fd] px-4 py-3 text-sm text-gray-600">
                <LabelledRadio
                  label="Flat"
                  checked={values.discountType === "Flat"}
                  onChange={() => onChange({ ...values, discountType: "Flat" })}
                  disabled={isSubmitting}
                />
                <LabelledRadio
                  label="Percentage"
                  checked={values.discountType === "Percentage"}
                  onChange={() => onChange({ ...values, discountType: "Percentage" })}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <LabeledInput
              placeholder={values.discountType === "Flat" ? "Discount Value" : "Discount Percentage"}
              value={values.discountValue}
              onChange={(event) => onChange({ ...values, discountValue: event.target.value })}
              rightAdornment={values.discountType === "Flat" ? <CurrencyIcon /> : <PercentageIcon />}
              disabled={isSubmitting}
            />
            <LabeledInput
              placeholder="Maximum Discount Cap Value"
              value={values.maxDiscount}
              onChange={(event) => onChange({ ...values, maxDiscount: event.target.value })}
              rightAdornment={<CurrencyIcon />}
              disabled={isSubmitting}
            />
            <LabeledInput
              placeholder="Minimum Purchase Value"
              value={values.minPurchase}
              onChange={(event) => onChange({ ...values, minPurchase: event.target.value })}
              rightAdornment={<CurrencyIcon />}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              className="rounded-md border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-500 hover:border-primary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-10 py-3 text-sm font-semibold text-white shadow hover:bg-[#030447] disabled:cursor-not-allowed disabled:bg-primary/70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
};

const StatusConfirmModal = ({
  isActive,
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  isActive: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ModalShell title={`${isActive ? "Deactivate" : "Activate"} Promocode`} onClose={onCancel}>
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff3d9] text-[#b46a02]">
        <span className="text-4xl">!</span>
      </div>
      <p className="text-sm font-medium text-gray-600">
        Are you sure you want to {isActive ? "deactivate" : "activate"} this promocode?
      </p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-500 hover:border-primary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#030447] disabled:cursor-not-allowed disabled:bg-primary/70"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Updating..." : "Yes"}
        </button>
      </div>
    </div>
  </ModalShell>
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
  <ModalShell title="Delete Promocode" onClose={onCancel}>
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ffe6e6] text-[#c03636]">
        <TrashIcon />
      </div>
      <p className="text-sm font-medium text-gray-600">
        This action will permanently delete the promocode. Do you want to continue?
      </p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          className="rounded-full border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-500 hover:border-primary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className="rounded-full bg-[#ff4d4f] px-6 py-2 text-sm font-semibold text-white shadow hover:bg-[#e34040] disabled:cursor-not-allowed disabled:bg-[#ff4d4f]/70"
          onClick={onConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </ModalShell>
);

const LabelledRadio = ({ label, checked, onChange, disabled }: { label: string; checked: boolean; onChange: () => void; disabled?: boolean }) => (
  <label className={`flex items-center gap-2 ${disabled ? "opacity-60" : ""}`}>
    <input type="radio" checked={checked} onChange={onChange} disabled={disabled} />
    {label}
  </label>
);

const LabeledInput = ({ rightAdornment, className = "", ...props }: { rightAdornment?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) => (
  <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
    <div className="relative">
      <input
        {...props}
        className={`w-full rounded-md border border-gray-200 bg-[#f7f8fd] px-4 py-3 text-sm text-gray-600 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${className}`}
      />
      {rightAdornment && <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">{rightAdornment}</span>}
    </div>
  </label>
);

const LabeledSelect = ({ options, className = "", ...props }: { options: Array<{ value: number | string; label: string }> } & SelectHTMLAttributes<HTMLSelectElement>) => (
  <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
    <div className="relative">
      <select
        {...props}
        className={`w-full appearance-none rounded-md border border-gray-200 bg-[#f7f8fd] px-4 py-3 text-sm text-gray-600 shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
        <ChevronDownIcon />
      </span>
    </div>
  </label>
);

const ActionButton = ({ label, variant, onClick, children }: { label: string; variant: "view" | "edit" | "delete"; onClick: () => void; children: ReactNode }) => {
  const styles: Record<"view" | "edit" | "delete", string> = {
    view: "bg-[#eff2f9] text-[#1d1f2a] border border-transparent hover:bg-white hover:border-primary/40 hover:shadow-md",
    edit: "bg-white text-[#1d1f2a] border border-gray-200 hover:border-primary hover:text-primary",
    delete: "bg-[#ff4d4f] text-white hover:bg-[#e34040] border border-transparent",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-200 shadow-sm ${styles[variant]}`}
    >
      {children}
    </button>
  );
};

const ModalOverlay = ({ children }: { children: ReactNode }) => (
  <div className="fixed inset-0 z-[9999999] flex items-center justify-center bg-[#1b1787b8] px-4">
    {children}
  </div>
);

const ModalShell = ({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) => (
  <div className="w-full max-w-xl rounded-[20px] bg-white px-8 py-10 shadow-[0_40px_90px_rgba(5,6,104,0.18)]">
    <div className="flex items-center justify-between gap-4">
      <h3 className="text-xl font-semibold text-primary">{title}</h3>
      <button
        type="button"
        aria-label="Close"
        className="flex h-8 w-8 items-center justify-center rounded-full text-[#1B1787] transition"
        onClick={onClose}
      >
        <CloseIcon />
      </button>
    </div>
    <div className="mt-8 space-y-6">{children}</div>
  </div>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 20l-3-3" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3 w-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
  </svg>
);

const CurrencyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m0-16a4 4 0 1 1 0 8m0 0a4 4 0 1 0 0 8" />
  </svg>
);

const PercentageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 5L5 19" />
    <circle cx="7" cy="7" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h4l10.5-10.5a1.5 1.5 0 0 0-2.12-2.12L6 17.88V20Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 6.5l3 3" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 11v6M14 11v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5h6v2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
  </svg>
);

const ActivateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
  </svg>
);

const DeactivateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

const stats = [
  { label: "Total Business", value: "244" },
  { label: "Total Unique B2B Query", value: "22" },
  { label: "Total B2B Query", value: "266" },
];

export default PromocodeSettings;










