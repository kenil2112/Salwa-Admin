import { apiRequest } from "./httpClient";

const INDIVIDUAL_USER_INSURANCE_BASE_URL =
  "https://apisalwa.rushkarprojects.in/api/IndividualUserInsurance";

export interface IndividualUserParams {
  searchText?: string;
  pageNumber?: number;
  pageSize?: number;
  orderByColumn?: string;
  orderDirection?: string;
}

export interface HospitalNetworkRecord {
  id: number;
  businessName: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  class: string | null;
  email: string | null;
  facilityOfficialPhoneNumber: string | null;
  certificatePath: string | null;
  category: string;
  points: number;
  createdDate: string;
  updatedDate: string;
  userId: number;
  userTypeId: number;
  isUpgradeFlag: number;
  totalRecords?: number;
}

export interface IndividualUserRecord {
  id: number;
  idNumber_IqamaNumber: string;
  userTypeId: number;
  subUserTypeId: number | null;
  subUserTypeIdLevel2: number | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  gender: string | null;
  idNumberExpiryDate: string | null;
  dateOfBirth: string | null;
  doYouWork: string | null;
  acquiredLanguage: string | null;
  languageGarented: string | null;
  jobName: string | null;
  graduationCertificate: string | null;
  telephone: string | null;
  officialEmail: string | null;
  nationality: string | null;
  otp: string | null;
  otpExpiry: string | null;
  planId: number | null;
  planExpiry: string | null;
  currentStage: string;
  isActive: boolean;
  isApproved: boolean;
  emailVerificationCode: string | null;
  isMobileNoVerify: boolean;
  isPasswordSet: boolean;
  uniqueUserCode: string | null;
  deviceToken: string | null;
  insuranceId: number | null;
  insuranceUserId: number | null;
  hasInsuranceCard: boolean | null;
  insuranceCompanyName: string | null;
  insurancePolicyNumber: string | null;
  insurancePolicyExpiryDate: string | null;
  insuranceMembership: string | null;
  insuranceNetworkClass: string | null;
  deductiblePercentage: number | null;
  maximumDeductibleAmount: number | null;
  insuranceMemberName: string | null;
  insuranceMemberType: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  district: string | null;
  address: string | null;
  nationalAddress: string | null;
}

export interface IndividualUserResponse {
  code: number;
  message: string;
  totalRecords: number;
  data: IndividualUserRecord[];
}

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

const extractList = (
  payload: IndividualUserResponse | IndividualUserRecord[] | unknown
): IndividualUserRecord[] => {
  if (Array.isArray(payload)) {
    return payload as IndividualUserRecord[];
  }
  if (payload && typeof payload === "object") {
    const typed = payload as IndividualUserResponse;
    if (Array.isArray(typed.data)) {
      return typed.data;
    }
  }
  return [];
};

// Transform IndividualUserRecord to SubscriberRecord for table display
const transformToSubscriberRecord = (record: IndividualUserRecord): any => {
  const fullName =
    [record.firstName, record.middleName, record.lastName]
      .filter(Boolean)
      .join(" ") || "N/A";

  const userType =
    record.userTypeId === 0
      ? "Individual"
      : record.userTypeId === 1
      ? "Business"
      : "Government";

  const subUserType = record.subUserTypeId
    ? `Type ${record.subUserTypeId}`
    : "N/A";

  const status = record.isActive
    ? record.isApproved
      ? "Active"
      : "Pending Approval"
    : "Inactive";

  const joinedDate = record.uniqueUserCode
    ? new Date().toLocaleDateString() // Use current date as fallback
    : "N/A";

  return {
    id: record.id.toString(),
    idNo: record.idNumber_IqamaNumber,
    userType,
    subUserType,
    name: fullName,
    email: record.officialEmail || "N/A",
    phoneNumber: record.telephone || "N/A",
    subscriptionAmount: 0, // Not available in API response
    subscriptionUpdatedDate: record.planExpiry || "N/A",
    country: record.country || "N/A",
    region: record.region || "N/A",
    city: record.city || "N/A",
    district: record.district || "N/A",
    status: status as "Active" | "Inactive" | "Pending Approval",
    joinedDate,
    // Additional fields from API
    firstName: record.firstName,
    lastName: record.lastName,
    nationalId: record.idNumber_IqamaNumber,
    dateOfBirth: record.dateOfBirth,
    gender: record.gender,
    address: record.address,
    insuranceProvider: record.insuranceCompanyName,
    policyNumber: record.insurancePolicyNumber,
    coverageType: record.insuranceNetworkClass,
    expiryDate: record.insurancePolicyExpiryDate,
    currentStage: record.currentStage,
    isApproved: record.isApproved,
  };
};

export const getAllIndividualUserDetails = async (
  params: IndividualUserParams = {}
) => {
  const {
    searchText = "",
    pageNumber = 1,
    pageSize = 10,
    orderByColumn = "Id",
    orderDirection = "DESC",
  } = params;

  const query = buildQuery({
    searchText,
    pageNumber,
    pageSize,
    orderByColumn,
    orderDirection,
  });

  const response = await apiRequest<IndividualUserResponse>(
    `${INDIVIDUAL_USER_INSURANCE_BASE_URL}/GetAllIndividualUserDetails${query}`,
    { method: "GET" }
  );

  const rawRecords = extractList(response);
  const records = rawRecords.map(transformToSubscriberRecord);

  return {
    records,
    totalCount: response.totalRecords ?? rawRecords.length,
    pageNumber: pageNumber,
    pageSize: pageSize,
  };
};

export const getIndividualUserDetailById = async (userId: string) => {
  const query = buildQuery({ userId });
  return apiRequest<IndividualUserRecord>(
    `${INDIVIDUAL_USER_INSURANCE_BASE_URL}/GetIndividualUserDetailById${query}`,
    { method: "GET" }
  );
};

export const getAllHospitalNetwork = async (
  params: IndividualUserParams = {}
) => {
  const {
    searchText = "",
    pageNumber = 1,
    pageSize = 10,
    orderByColumn = "Id",
    orderDirection = "DESC",
  } = params;

  const query = buildQuery({
    searchText,
    pageNumber,
    pageSize,
    orderByColumn,
    orderDirection,
  });
  return apiRequest<HospitalNetworkRecord>(
    `${INDIVIDUAL_USER_INSURANCE_BASE_URL}/GetAllHospitalNetwork${query}`,
    { method: "GET" }
  );
};
