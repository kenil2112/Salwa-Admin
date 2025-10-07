import { errorHandler, successHandler } from "../../common/appHandler";
import axiosInstance from "../../common/axiosInstance";
import CommonServices from "../CommonServices/CommonServices";

class ReportServices {
  // Get service report list
  static GetServiceReportList = async (params: {
    categoryId?: number;
    serviceName?: string;
    month?: number;
    year?: number;
    subServiceName?: string;
  }) => {
    try {
      // Get current language from localStorage or default to 'en'
      const currentLanguage = localStorage.getItem("i18nextLng") || "en";
      const languageParam = currentLanguage.toUpperCase(); // Convert to EN or AR

      // Add language parameter to the params
      const paramsWithLanguage = {
        ...params,
        Language: languageParam,
      };

      const res = await axiosInstance.get(`SuperAdmin/GetServiceReportList`, {
        params: paramsWithLanguage,
      });
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  // Get categories for dropdown using CommonServices
  static GetCategories = async () => {
    try {
      const currentLanguage = localStorage.getItem("i18nextLng") || "en";
      const languageParam = currentLanguage.toUpperCase();

      const response: any = await CommonServices.CommonApi({
        Parameter: "",
        SPName: "USP_GetAllAdminCategory",
        Language: languageParam,
      });

      if (!response || !response.success) {
        throw new Error(
          (response as any)?.message || "Unable to load categories."
        );
      }

      const data: any = JSON.parse(response.data);
      return successHandler({ data });
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  // Get services for dropdown using CommonServices
  static GetServices = async (categoryId: number) => {
    try {
      const currentLanguage = localStorage.getItem("i18nextLng") || "en";
      const languageParam = currentLanguage.toUpperCase();

      const response: any = await CommonServices.CommonApi({
        Parameter: `{"ParentId":${categoryId}}`,
        SPName: "USP_GetAdminCategoryServices",
        Language: languageParam,
      });

      if (!response || !response.success) {
        throw new Error(
          (response as any)?.message || "Unable to load services."
        );
      }

      const data = JSON.parse(response.data);
      return successHandler({ data });
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  // Get sub services for dropdown using CommonServices
  static GetSubServices = async (serviceId: number) => {
    try {
      const currentLanguage = localStorage.getItem("i18nextLng") || "en";
      const languageParam = currentLanguage.toUpperCase();

      const response: any = await CommonServices.CommonApi({
        Parameter: `{"ParentId":${serviceId}}`,
        SPName: "USP_GetAdminServiceSubServices",
        Language: languageParam,
      });

      if (!response || !response.success) {
        throw new Error(
          (response as any)?.message || "Unable to load sub-services."
        );
      }

      const data = JSON.parse(response.data);
      return successHandler({ data });
    } catch (error: any) {
      return errorHandler(error);
    }
  };
}

export default ReportServices;
