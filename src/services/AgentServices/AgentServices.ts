import { errorHandler, successHandler } from "../../common/appHandler";
import axiosInstance from "../../common/axiosInstance";

class AgentServices {
  // Get all agent discount business list
  static GetAllAgentDiscountForBusinessList = async (data: any) => {
    try {
      // Get current language from localStorage or default to 'en'
      const currentLanguage = localStorage.getItem("i18nextLng") || "en";
      const languageParam = currentLanguage.toUpperCase(); // Convert to EN or AR

      // Add language parameter to the data
      const dataWithLanguage = {
        ...data,
        Language: languageParam,
      };

      const res = await axiosInstance.post(
        `AgentDiscountForBusinessAndIndividual/GetAllAgentDiscountForBusinessList`,
        dataWithLanguage
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  // Get all agent discount individual list
  static GetAllAgentDiscountForIndividualList = async (data: any) => {
    try {
      // Get current language from localStorage or default to 'en'
      const currentLanguage = localStorage.getItem("i18nextLng") || "en";
      const languageParam = currentLanguage.toUpperCase(); // Convert to EN or AR

      // Add language parameter to the data
      const dataWithLanguage = {
        ...data,
        Language: languageParam,
      };

      const res = await axiosInstance.post(
        `AgentDiscountForBusinessAndIndividual/GetAllAgentDiscountForIndividualList`,
        dataWithLanguage
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  // Get agent discount for business by ID
  static GetAgentDiscountForBusinessById = async (id: any) => {
    try {
      const res = await axiosInstance.get(
        `AgentDiscountForBusinessAndIndividual/GetAgentDiscountForBusinessById?id=${id}`
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  // Get agent discount for individual by ID
  static GetAgentDiscountForIndividualById = async (id: any) => {
    try {
      const res = await axiosInstance.get(
        `AgentDiscountForBusinessAndIndividual/GetAgentDiscountForIndividualById?id=${id}`
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  // Upsert agent discount for business and individual
  static UpsertAgentDiscountForBusinessAndIndividual = async (data: any) => {
    try {
      // Get current language from localStorage or default to 'en'
      const currentLanguage = localStorage.getItem("i18nextLng") || "en";
      const languageParam = currentLanguage.toUpperCase(); // Convert to EN or AR

      // Add language parameter to the data
      const dataWithLanguage = {
        ...data,
        Language: languageParam,
      };

      const res = await axiosInstance.post(
        `AgentDiscountForBusinessAndIndividual/UpsertAgentDiscountForBusinessAndIndividual`,
        dataWithLanguage
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  // Get all agent discount for business and individual (combined)
  static GetAllAgentDiscountForBusinessAndIndividual = async (data: any) => {
    try {
      // Get current language from localStorage or default to 'en'
      const currentLanguage = localStorage.getItem("i18nextLng") || "en";
      const languageParam = currentLanguage.toUpperCase(); // Convert to EN or AR

      // Add language parameter to the data
      const dataWithLanguage = {
        ...data,
        Language: languageParam,
      };

      const res = await axiosInstance.post(
        `AgentDiscountForBusinessAndIndividual/GetAllAgentDiscountForBusinessAndIndividual`,
        dataWithLanguage
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  // Get all list of business agent (GET method with query parameters)
  static GetAllListOfBusinessAgent = async (params: {
    searchTerm?: string;
    pageNumber?: number;
    pageSize?: number;
    orderByColumn?: string;
    orderDirection?: string;
  }) => {
    try {
      // Get current language from localStorage or default to 'en'
      const currentLanguage = localStorage.getItem("i18nextLng") || "en";
      const languageParam = currentLanguage.toUpperCase(); // Convert to EN or AR

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("Language", languageParam);

      if (params.searchTerm) {
        queryParams.append("searchTerm", params.searchTerm);
      }
      if (params.pageNumber) {
        queryParams.append("pageNumber", params.pageNumber.toString());
      }
      if (params.pageSize) {
        queryParams.append("pageSize", params.pageSize.toString());
      }
      if (params.orderByColumn) {
        queryParams.append("orderByColumn", params.orderByColumn);
      }
      if (params.orderDirection) {
        queryParams.append("orderDirection", params.orderDirection);
      }

      const res = await axiosInstance.get(
        `AgentDiscountForBusinessAndIndividual/GetAllListOfBusinessAgent?${queryParams.toString()}`
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };
}

export default AgentServices;
