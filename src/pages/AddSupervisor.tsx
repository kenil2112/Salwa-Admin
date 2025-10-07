
//   useEffect(() => {
//     const loadTypes = async () => {
//       setTypeOptionsLoading(true);
//       try {
//         const list = await fetchSuperAdminTypes();
//         setTypeOptions(list);
//       } catch (error) {
//         const message = error instanceof Error ? error.message : "Failed to load employee types";
//         showToast(message, "error");
//       } finally {
//         setTypeOptionsLoading(false);
//       }
//     };

//     void loadTypes();
//   }, [showToast]);
//   useEffect(() => {
//     if (!typeOptions.length) {
//       return;
//     }
//     setForm((prev) => {
//       if (typeOptions.some((option) => option.id === prev.type)) {
//         return prev;
//       }
//       return { ...prev, type: typeOptions[0]?.id ?? prev.type };
//     });
//   }, [typeOptions]);
// import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
// import { useNavigate, useParams, useSearchParams } from "react-router-dom";
// import DashboardLayout from "../layouts/DashboardLayout";
// import { useToast } from "../components/ToastProvider";
// import { getSuperAdminById, upsertSuperAdmin, fetchSuperAdminTypes, type SuperAdminTypeOption } from "../services/superAdminService";
// import type { SuperAdminRecord, SuperAdminStatusId } from "../services/superAdminService";
// import { fetchCities, fetchCountries, fetchStates, type LookupOption } from "../services/locationService";

// const TYPE_OPTIONS = [
//   { label: "Operational Supervisor", value: 0 },
//   { label: "Operational Employee", value: 1 },
//   { label: "Finance Supervisor", value: 2 },
//   { label: "Finance Employee", value: 3 },
//   { label: "IT Support Employee", value: 4 },
// ];

// const PHONE_DIAL_OPTIONS = [
//   { label: "Saudi Arabia (+966)", value: "+966" },
//   { label: "United Arab Emirates (+971)", value: "+971" },
//   { label: "Kuwait (+965)", value: "+965" },
//   { label: "Qatar (+974)", value: "+974" },
//   { label: "Bahrain (+973)", value: "+973" },
//   { label: "India (+91)", value: "+91" },
// ];
// const DEFAULT_PHONE_DIAL = PHONE_DIAL_OPTIONS[0].value;

// const sanitizeDigits = (value: string) => value.replace(/[^0-9]/g, "");

// const splitTelephone = (raw?: string) => {
//   const trimmed = (raw ?? "").trim();
//   if (!trimmed) {
//     return { dial: DEFAULT_PHONE_DIAL, local: "" };
//   }
//   const normalized = trimmed.replace(/[^0-9+]/g, "");
//   const digitsOnly = sanitizeDigits(normalized);
//   for (const option of PHONE_DIAL_OPTIONS) {
//     const optionDigits = sanitizeDigits(option.value);
//     if (digitsOnly.startsWith(optionDigits)) {
//       return {
//         dial: option.value,
//         local: digitsOnly.slice(optionDigits.length),
//       };
//     }
//   }
//   if (normalized.startsWith("+")) {
//     return {
//       dial: normalized.slice(0, Math.min(4, normalized.length)),
//       local: digitsOnly.slice(sanitizeDigits(normalized.slice(0, Math.min(4, normalized.length))).length),
//     };
//   }
//   return { dial: DEFAULT_PHONE_DIAL, local: digitsOnly };
// };

// const buildTelephone = (dial: string, local: string) => {
//   const cleanedDial = dial || DEFAULT_PHONE_DIAL;
//   const cleanedLocal = sanitizeDigits(local);
//   return cleanedLocal ? `${cleanedDial} ${cleanedLocal}` : cleanedDial;
// };

// const STATIC_LATITUDE = "0";
// const STATIC_LONGITUDE = "0";

// const DEFAULT_FORM = {
//   firstName: "",
//   middleName: "",
//   lastName: "",
//   idNumber: "",
//   idExpiryDate: "",
//   dateOfBirth: "",
//   graduationCertificate: "",
//   acquiredLanguages: "",
//   telephone: buildTelephone(DEFAULT_PHONE_DIAL, ""),
//   officialEmail: "",
//   type: TYPE_OPTIONS[0]?.value ?? 0,
//   country: "",
//   region: "",
//   city: "",
//   nationalAddress: "",
//   address: "",
//   bankName: "",
//   ibanNumber: "",
//   statusId: 1 as SuperAdminStatusId,
//   isMobileNoVerify: true,
// };

// type FormState = typeof DEFAULT_FORM;

// const normalizeName = (value: string) => value.trim().toLowerCase();

// const AddSupervisor = () => {
//   const navigate = useNavigate();
//   const { showToast } = useToast();
//   const params = useParams<{ employeeId?: string }>();
//   const [searchParams] = useSearchParams();

//   const employeeId = params.employeeId ? Number(params.employeeId) : null;
//   const modeFromQuery = searchParams.get("mode");
//   const mode: "create" | "edit" | "view" = employeeId
//     ? modeFromQuery === "view"
//       ? "view"
//       : "edit"
//     : "create";

//   const [form, setForm] = useState<FormState>(DEFAULT_FORM);
//   const [phoneDialCode, setPhoneDialCode] = useState<string>(DEFAULT_PHONE_DIAL);
//   const [phoneLocalNumber, setPhoneLocalNumber] = useState<string>("");
//   const [typeOptions, setTypeOptions] = useState<SuperAdminTypeOption[]>(TYPE_OPTIONS.map((option) => ({ id: option.value, name: option.label })));
//   const [typeOptionsLoading, setTypeOptionsLoading] = useState(false);
//   const [existingRecord, setExistingRecord] = useState<SuperAdminRecord | null>(null);
//   const [loading, setLoading] = useState(mode !== "create");
//   const [submitting, setSubmitting] = useState(false);

//   const [countryOptions, setCountryOptions] = useState<LookupOption[]>([]);
//   const [stateOptions, setStateOptions] = useState<LookupOption[]>([]);
//   const [cityOptions, setCityOptions] = useState<LookupOption[]>([]);
//   const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
//   const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
//   const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
//   const [countriesLoading, setCountriesLoading] = useState(false);
//   const [statesLoading, setStatesLoading] = useState(false);
//   const [citiesLoading, setCitiesLoading] = useState(false);

//   const pageTitle = useMemo(() => {
//     if (mode === "create") {
//       return "Add Employee / Supervisor";
//     }
//     if (mode === "edit") {
//       return "Edit Employee / Supervisor";
//     }
//     return "View Employee / Supervisor";
//   }, [mode]);

//   useEffect(() => {
//     const loadCountries = async () => {
//       setCountriesLoading(true);
//       try {
//         const list = await fetchCountries();
//         setCountryOptions(list);
//       } catch (error) {
//         const message = error instanceof Error ? error.message : "Failed to load countries";
//         showToast(message, "error");
//       } finally {
//         setCountriesLoading(false);
//       }
//     };

//     void loadCountries();
//   }, [showToast]);

//   useEffect(() => {
//     const fetchRecord = async () => {
//       if (!employeeId) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const response = await getSuperAdminById(employeeId);
//         const record = (response && typeof response === "object" && "data" in response
//           ? (response as { data?: SuperAdminRecord }).data
//           : (response as SuperAdminRecord)) ?? null;
//         if (!record) {
//           throw new Error("Unable to load employee details");
//         }
//         setExistingRecord(record);
//         setForm({
//           firstName: record.firstName ?? "",
//           middleName: record.middleName ?? "",
//           lastName: record.lastName ?? "",
//           idNumber: record.idNumber ?? "",
//           idExpiryDate: record.idExpiryDate ? record.idExpiryDate.slice(0, 10) : "",
//           dateOfBirth: record.dateOfBirth ? record.dateOfBirth.slice(0, 10) : "",
//           graduationCertificate: record.graduationCertificate ?? "",
//           acquiredLanguages: record.acquiredLanguages ?? "",
//           telephone: record.telephone ?? "",
//           officialEmail: record.officialEmail ?? "",
//           type: record.type ?? 0,
//           country: record.country ?? "",
//           region: record.region ?? "",
//           city: record.city ?? "",
//           nationalAddress: record.nationalAddress ?? "",
//           address: record.address ?? "",
//           bankName: record.bankName ?? "",
//           ibanNumber: record.ibanNumber ?? "",
//           statusId: (record.statusId ?? (record.isActive ? 1 : 0) ?? 1) as SuperAdminStatusId,
//           isMobileNoVerify: record.isMobileNoVerify ?? true,
//         });
//         const parsedTelephone = splitTelephone(record.telephone);
//         setPhoneDialCode(parsedTelephone.dial);
//         setPhoneLocalNumber(parsedTelephone.local);
//       } catch (error) {
//         const message = error instanceof Error ? error.message : "Failed to load employee";
//         showToast(message, "error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     void fetchRecord();
//   }, [employeeId, showToast]);

//   useEffect(() => {
//     if (countryOptions.length === 0 || !form.country || selectedCountryId !== null) {
//       return;
//     }
//     const match = countryOptions.find((option) => normalizeName(option.name) === normalizeName(form.country));
//     if (match) {
//       setSelectedCountryId(match.id);
//     }
//   }, [countryOptions, form.country, selectedCountryId]);

//   useEffect(() => {
//     if (!selectedCountryId) {
//       setStateOptions([]);
//       setSelectedStateId(null);
//       setCityOptions([]);
//       setSelectedCityId(null);
//       if (mode !== "view") {
//         setForm((prev) => ({ ...prev, country: "", region: "", city: "" }));
//       }
//       return;
//     }

//     const selected = countryOptions.find((option) => option.id === selectedCountryId);
//     if (selected && form.country !== selected.name) {
//       setForm((prev) => ({ ...prev, country: selected.name }));
//     }

//     const loadStates = async () => {
//       setStatesLoading(true);
//       try {
//         const list = await fetchStates(selectedCountryId);
//         setStateOptions(list);
//       } catch (error) {
//         const message = error instanceof Error ? error.message : "Failed to load regions";
//         showToast(message, "error");
//       } finally {
//         setStatesLoading(false);
//       }
//     };

//     void loadStates();
//   }, [selectedCountryId, countryOptions, form.country, mode, showToast]);

//   useEffect(() => {
//     if (stateOptions.length === 0 || !form.region || selectedStateId !== null) {
//       return;
//     }
//     const match = stateOptions.find((option) => normalizeName(option.name) === normalizeName(form.region));
//     if (match) {
//       setSelectedStateId(match.id);
//     }
//   }, [stateOptions, form.region, selectedStateId]);

//   useEffect(() => {
//     if (!selectedCountryId || !selectedStateId) {
//       setCityOptions([]);
//       setSelectedCityId(null);
//       if (!selectedStateId && mode !== "view") {
//         setForm((prev) => ({ ...prev, city: "" }));
//       }
//       return;
//     }

//     const selected = stateOptions.find((option) => option.id === selectedStateId);
//     if (selected && form.region !== selected.name) {
//       setForm((prev) => ({ ...prev, region: selected.name }));
//     }

//     const loadCities = async () => {
//       setCitiesLoading(true);
//       try {
//         const list = await fetchCities(selectedCountryId, selectedStateId);
//         setCityOptions(list);
//       } catch (error) {
//         const message = error instanceof Error ? error.message : "Failed to load cities";
//         showToast(message, "error");
//       } finally {
//         setCitiesLoading(false);
//       }
//     };

//     void loadCities();
//   }, [selectedCountryId, selectedStateId, stateOptions, form.region, mode, showToast]);

//   useEffect(() => {
//     if (cityOptions.length === 0 || !form.city || selectedCityId !== null) {
//       return;
//     }
//     const match = cityOptions.find((option) => normalizeName(option.name) === normalizeName(form.city));
//     if (match) {
//       setSelectedCityId(match.id);
//     }
//   }, [cityOptions, form.city, selectedCityId]);

//   useEffect(() => {
//     if (selectedCityId === null) {
//       return;
//     }
//     const selected = cityOptions.find((option) => option.id === selectedCityId);
//     if (selected && form.city !== selected.name) {
//       setForm((prev) => ({ ...prev, city: selected.name }));
//     }
//   }, [selectedCityId, cityOptions, form.city]);

//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     if (mode === "view") {
//       return;
//     }

//     if (!form.firstName || !form.lastName || !form.officialEmail || !form.idNumber) {
//       showToast("Please fill in the required fields.", "error");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const payload: SuperAdminRecord = {
//         employeeId: existingRecord?.employeeId ?? 0,
//         firstName: form.firstName,
//         middleName: form.middleName,
//         lastName: form.lastName,
//         idNumber: form.idNumber,
//         idExpiryDate: form.idExpiryDate ? new Date(form.idExpiryDate).toISOString() : existingRecord?.idExpiryDate,
//         dateOfBirth: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : existingRecord?.dateOfBirth,
//         graduationCertificate: form.graduationCertificate,
//         acquiredLanguages: form.acquiredLanguages,
//         telephone: buildTelephone(phoneDialCode, phoneLocalNumber),
//         officialEmail: form.officialEmail,
//         type: Number(form.type),
//         country: form.country,
//         region: form.region,
//         city: form.city,
//         nationalAddress: form.nationalAddress,
//         address: form.address,
//         bankName: form.bankName,
//         ibanNumber: form.ibanNumber,
//         latitude: existingRecord?.latitude ?? STATIC_LATITUDE,
//         longitude: existingRecord?.longitude ?? STATIC_LONGITUDE,
//         password: null,
//         otp: existingRecord?.otp ?? 0,
//         isPasswordset: existingRecord?.isPasswordset ?? 0,
//         isOtpVerify: existingRecord?.isOtpVerify ?? 0,
//         isMobileNoVerify: form.isMobileNoVerify,
//         createdBy: existingRecord?.createdBy ?? 0,
//         updatedBy: existingRecord?.updatedBy ?? 0,
//         isActive: form.statusId === 1,
//         statusId: form.statusId,
//       };

//       await upsertSuperAdmin(payload);
//       showToast(`Employee ${mode === "create" ? "created" : "updated"} successfully.`, "success");
//       navigate("/supervisor-management");
//     } catch (error) {
//       const message = error instanceof Error ? error.message : "Failed to save changes";
//       showToast(message, "error");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleTelephoneDialChange = (value: string) => {
//     if (mode === "view") {
//       return;
//     }
//     setPhoneDialCode(value);
//     setForm((prev) => ({ ...prev, telephone: buildTelephone(value, phoneLocalNumber) }));
//   };

//   const handleTelephoneNumberChange = (value: string) => {
//     if (mode === "view") {
//       return;
//     }
//     const sanitized = sanitizeDigits(value);
//     setPhoneLocalNumber(sanitized);
//     setForm((prev) => ({ ...prev, telephone: buildTelephone(phoneDialCode, sanitized) }));
//   };

//   const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
//     setForm((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleCountrySelect = (value: string) => {
//     if (!value) {
//       setSelectedCountryId(null);
//       setStateOptions([]);
//       setSelectedStateId(null);
//       setCityOptions([]);
//       setSelectedCityId(null);
//       setForm((prev) => ({ ...prev, country: "", region: "", city: "" }));
//       return;
//     }

//     const numericValue = Number(value);
//     if (Number.isNaN(numericValue)) {
//       return;
//     }

//     setSelectedCountryId(numericValue);
//     const match = countryOptions.find((option) => option.id === numericValue);
//     setForm((prev) => ({ ...prev, country: match?.name ?? prev.country, region: "", city: "" }));
//     setSelectedStateId(null);
//     setStateOptions([]);
//     setSelectedCityId(null);
//     setCityOptions([]);
//   };

//   const handleStateSelect = (value: string) => {
//     if (!value) {
//       setSelectedStateId(null);
//       setCityOptions([]);
//       setSelectedCityId(null);
//       setForm((prev) => ({ ...prev, region: "", city: "" }));
//       return;
//     }

//     const numericValue = Number(value);
//     if (Number.isNaN(numericValue)) {
//       return;
//     }

//     setSelectedStateId(numericValue);
//     const match = stateOptions.find((option) => option.id === numericValue);
//     setForm((prev) => ({ ...prev, region: match?.name ?? prev.region, city: "" }));
//     setSelectedCityId(null);
//     setCityOptions([]);
//   };

//   const handleCitySelect = (value: string) => {
//     if (!value) {
//       setSelectedCityId(null);
//       setForm((prev) => ({ ...prev, city: "" }));
//       return;
//     }

//     const numericValue = Number(value);
//     if (Number.isNaN(numericValue)) {
//       return;
//     }

//     setSelectedCityId(numericValue);
//     const match = cityOptions.find((option) => option.id === numericValue);
//     setForm((prev) => ({ ...prev, city: match?.name ?? prev.city }));
//   };

//   const typeSelectOptions = (typeOptions.length ? typeOptions : TYPE_OPTIONS.map((option) => ({ id: option.value, name: option.label })))\n    .map((option) => ({ label: option.name, value: option.id }));

//   return (
//     <DashboardLayout>
//       <div className="mx-auto flex w-full  flex-col gap-8 pb-16">
//         <Header
//           title={pageTitle}
//           subtitle={mode === "create" ? "Fill in the details to create a new profile" : "Update the details as needed."}
//         />
//         <form
//           onSubmit={handleSubmit}
//           className="space-y-6 rounded-[32px] border border-gray-200 bg-white p-8 shadow-sm"
//         >
//           {loading ? (
//             <div className="py-20 text-center text-sm text-gray-500">Loading details...</div>
//           ) : (
//             <>
//               <Fieldset title="General Information">
//                 <div className="grid gap-4 md:grid-cols-3">
//                   <Input label="First Name" value={form.firstName} onChange={(value) => handleChange("firstName", value)} readOnly={mode === "view"} required />
//                   <Input label="Middle Name" value={form.middleName} onChange={(value) => handleChange("middleName", value)} readOnly={mode === "view"} />
//                   <Input label="Last Name" value={form.lastName} onChange={(value) => handleChange("lastName", value)} readOnly={mode === "view"} required />
//                 </div>
//                 <div className="grid gap-4 md:grid-cols-2">
//                   <Input label="ID Number / IQAMA Number" value={form.idNumber} onChange={(value) => handleChange("idNumber", value)} readOnly={mode === "view"} required />
//                   <Input label="Date of Expiry" type="date" value={form.idExpiryDate} onChange={(value) => handleChange("idExpiryDate", value)} readOnly={mode === "view"} />
//                 </div>
//                 <div className="grid gap-4 md:grid-cols-3">
//                   <Input label="Date of Birth" type="date" value={form.dateOfBirth} onChange={(value) => handleChange("dateOfBirth", value)} readOnly={mode === "view"} />
//                   <Input label="Graduation certificate" value={form.graduationCertificate} onChange={(value) => handleChange("graduationCertificate", value)} readOnly={mode === "view"} />
//                   <Input label="Acquired Languages" value={form.acquiredLanguages} onChange={(value) => handleChange("acquiredLanguages", value)} readOnly={mode === "view"} />
//                 </div>
//                 <div className="grid gap-4 md:grid-cols-3">
//                   <Input
//                     label="Telephone"
//                     value={phoneLocalNumber}
//                     onChange={handleTelephoneNumberChange}
//                     readOnly={mode === "view"}
//                     placeholder="987 654 321"
//                     prefix={
//                       mode === "view" ? (
//                         <span className="min-w-[3.5rem] text-sm font-medium text-gray-600">{phoneDialCode}</span>
//                       ) : (
//                         <select
//                           value={phoneDialCode}
//                           onChange={(event) => handleTelephoneDialChange(event.target.value)}
//                           className="bg-transparent text-sm font-medium text-gray-600 outline-none"
//                         >
//                           {PHONE_DIAL_OPTIONS.map((option) => (
//                             <option key={option.value} value={option.value}>
//                               {option.label}
//                             </option>
//                           ))}
//                         </select>
//                       )
//                     }
//                   />
//                   <Input label="Official Email" type="email" value={form.officialEmail} onChange={(value) => handleChange("officialEmail", value)} readOnly={mode === "view"} required />
//                   <Select
//                     label="Type"
//                     value={form.type}
//                     onChange={(value) => handleChange("type", Number(value))}
//                     options={typeSelectOptions}
//                     readOnly={mode === "view"}
//                   />
//                 </div>
//               </Fieldset>

//               <Fieldset title="Address">
//                 <div className="grid gap-4 md:grid-cols-3">
//                   {mode === "view" ? (
//                     <Input label="Country" value={form.country} readOnly />
//                   ) : (
//                     <Select
//                       label="Country"
//                       value={selectedCountryId}
//                       onChange={handleCountrySelect}
//                       options={countryOptions.map((option) => ({ label: option.name, value: option.id }))}
//                       placeholder="Select country"
//                       isLoading={countriesLoading}
//                     />
//                   )}
//                   {mode === "view" ? (
//                     <Input label="Region" value={form.region} readOnly />
//                   ) : (
//                     <Select
//                       label="Region"
//                       value={selectedStateId}
//                       onChange={handleStateSelect}
//                       options={stateOptions.map((option) => ({ label: option.name, value: option.id }))}
//                       placeholder={selectedCountryId ? "Select region" : "Select country first"}
//                       isLoading={statesLoading}
//                       disabled={!selectedCountryId}
//                     />
//                   )}
//                   <Input label="National Address - SPL (Short Address)" value={form.nationalAddress} onChange={(value) => handleChange("nationalAddress", value)} readOnly={mode === "view"} />
//                 </div>
//                 <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
//                   <div className="grid gap-4 md:grid-cols-2">
//                     {mode === "view" ? (
//                       <Input label="City" value={form.city} readOnly />
//                     ) : (
//                       <Select
//                         label="City"
//                         value={selectedCityId}
//                         onChange={handleCitySelect}
//                         options={cityOptions.map((option) => ({ label: option.name, value: option.id }))}
//                         placeholder={selectedStateId ? "Select city" : "Select region first"}
//                         isLoading={citiesLoading}
//                         disabled={!selectedStateId}
//                       />
//                     )}
//                     <div className="space-y-1 md:col-span-2">
//                       <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Address</label>
//                       <textarea
//                         value={form.address}
//                         onChange={(event) => handleChange("address", event.target.value)}
//                         readOnly={mode === "view"}
//                         rows={3}
//                         className={`w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${mode === "view" ? "bg-gray-100 text-gray-500" : ""}`}
//                       />
//                     </div>
//                   </div>
//                   <MapPlaceholder />
//                 </div>
//               </Fieldset>

//               <Fieldset title="Bank Information">
//                 <div className="grid gap-4 md:grid-cols-2">
//                   <Input label="Bank Name" value={form.bankName} onChange={(value) => handleChange("bankName", value)} readOnly={mode === "view"} />
//                   <Input label="IBAN Number" value={form.ibanNumber} onChange={(value) => handleChange("ibanNumber", value)} readOnly={mode === "view"} />
//                 </div>
//               </Fieldset>

//               {mode !== "view" && (
//                 <div className="flex justify-end">
//                   <button
//                     type="submit"
//                     className="rounded-full bg-primary px-10 py-3 text-sm font-semibold text-white shadow hover:bg-[#030447] disabled:cursor-not-allowed disabled:bg-primary/70"
//                     disabled={submitting}
//                   >
//                     {submitting ? "Saving..." : "Save"}
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </form>
//       </div>
//     </DashboardLayout>
//   );
// };

// const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
//   <div className="flex items-center gap-4 rounded-[28px] border border-gray-200 bg-white px-6 py-5 shadow-sm">
//     <div className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary">
//       <HeaderIcon />
//     </div>
//     <div>
//       <h1 className="text-2xl font-semibold text-primary">{title}</h1>
//       <p className="text-sm text-gray-400">{subtitle}</p>
//     </div>
//   </div>
// );

// const Fieldset = ({ title, children }: { title: string; children: ReactNode }) => (
//   <section className="space-y-4 rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm">
//     <header className="flex items-center justify-between">
//       <h2 className="text-lg font-semibold text-primary">{title}</h2>
//       <ChevronDownIcon />
//     </header>
//     <div className="space-y-4">{children}</div>
//   </section>
// );

// const Input = ({
//   label,
//   value,
//   onChange,
//   readOnly = false,
//   type = "text",
//   required = false,
//   placeholder,
//   prefix,
//   suffix,
// }: {
//   label: string;
//   value: string;
//   onChange?: (value: string) => void;
//   readOnly?: boolean;
//   type?: string;
//   required?: boolean;
//   placeholder?: string;
//   prefix?: ReactNode;
//   suffix?: ReactNode;
// }) => (
//   <div className="space-y-1">
//     <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
//       {label}
//       {required ? <span className="text-rose-500"> *</span> : null}
//     </label>
//     <div
//       className={`flex items-stretch overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 ${readOnly ? "bg-gray-100" : ""}`}
//     >
//       {prefix ? (
//         <span className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
//           {prefix}
//         </span>
//       ) : null}
//       <input
//         value={value}
//         onChange={(event) => onChange?.(event.target.value)}
//         readOnly={readOnly}
//         type={type}
//         required={required}
//         placeholder={placeholder}
//         className={`w-full bg-transparent px-4 py-3 text-sm text-gray-600 outline-none placeholder:text-[#A0A3BD] ${readOnly ? "cursor-default text-gray-500" : ""}`}
//       />
//       {suffix ? (
//         <span className="flex items-center border-l border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
//           {suffix}
//         </span>
//       ) : null}
//     </div>
//   </div>
// );
// const Select = ({
//   label,
//   value,
//   onChange,
//   options,
//   placeholder = "Select option",
//   readOnly,
//   isLoading,
//   disabled,
// }: {
//   label: string;
//   value: string | number | null | undefined;
//   onChange?: (value: string) => void;
//   options: Array<{ label: string; value: string | number }>;
//   placeholder?: string;
//   readOnly?: boolean;
//   isLoading?: boolean;
//   disabled?: boolean;
// }) => {
//   if (readOnly) {
//     const displayValue =
//       options.find((option) => String(option.value) === String(value))?.label ?? "";
//     return <Input label={label} value={displayValue} readOnly />;
//   }

//   const normalizedValue = value === null || value === undefined ? "" : String(value);
//   const isDisabled = Boolean(disabled) || Boolean(isLoading);
//   const selectClassName = [
//     "w-full appearance-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
//     isDisabled ? "bg-gray-100 text-gray-400" : "",
//   ]
//     .filter(Boolean)
//     .join(" ");

//   return (
//     <div className="space-y-1">
//       <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
//         {label}
//       </label>
//       <div className="relative">
//         <select
//           value={normalizedValue}
//           onChange={(event) => onChange?.(event.target.value)}
//           disabled={isDisabled}
//           className={selectClassName}
//         >
//           {normalizedValue === "" && (
//             <option value="" disabled>
//               {placeholder}
//             </option>
//           )}
//           {options.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>
//         <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
//           <ChevronDownIcon />
//         </span>
//       </div>
//       {isLoading ? <p className="text-[11px] text-gray-400">Loading options...</p> : null}
//     </div>
//   );
// };


// const MapPlaceholder = () => (
//   <div className="flex h-full flex-col justify-between rounded-3xl border border-gray-200 bg-[#f4f5fb] px-6 py-5 text-sm text-gray-500">
//     <div className="flex-1">
//       <div className="h-36 rounded-2xl bg-[linear-gradient(135deg,#e8e9f5_0%,#d3d6ec_100%)]" />
//     </div>
//     <button
//       type="button"
//       className="mt-4 w-full rounded-full bg-black px-6 py-2 text-xs font-semibold text-white shadow"
//     >
//       Get Direction
//     </button>
//   </div>
// );

// const ChevronDownIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
//     <path
//       fillRule="evenodd"
//       d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.171l3.71-3.94a.75.75 0 0 1 1.08 1.04l-4.24 4.5a.75.75 0 0 1-1.08 0l-4.24-4.5a.75.75 0 0 1 .02-1.06Z"
//       clipRule="evenodd"
//     />
//   </svg>
// );

// const HeaderIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-10 w-10">
//     <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" />
//     <path strokeLinecap="round" strokeLinejoin="round" d="M6 20c0-3.3137 2.6863-6 6-6s6 2.6863 6 6" />
//   </svg>
// );

// export default AddSupervisor;














