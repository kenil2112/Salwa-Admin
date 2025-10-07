import { errorHandler, successHandler } from "../../common/appHandler";
import axiosInstance from "../../common/axiosInstance";

export class StatisticsServices {
  /**
   * Get Subscriber Statistics
   * @param userType - User type (1 for Individual, 2 for Business)
   * @param month - Month (1-12)
   * @param year - Year
   */
  static GetSubscriberStatistics = async (
    userType: number,
    month: number,
    year: number
  ) => {
    try {
      const res = await axiosInstance.get(
        `SuperAdmin/GetSubscriberStatistics?userType=${userType}&month=${month}&year=${year}`
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  /**
   * Get User Statistics
   * @param userType - User type (1 for Individual, 2 for Business)
   * @param month - Month (1-12)
   * @param year - Year
   */
  static GetUserStatistics = async (
    userType: number,
    month: number,
    year: number
  ) => {
    try {
      const res = await axiosInstance.get(
        `SuperAdmin/GetUserStatistics?userType=${userType}&month=${month}&year=${year}`
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  /**
   * Get Service Statistics
   * @param categoryId - Category ID
   * @param serviceName - Service name (sent as serviceName parameter)
   * @param month - Month (1-12)
   * @param year - Year
   * @param subServiceName - Sub-service name (sent as subServiceName parameter)
   */
  static GetServiceStatistics = async (
    categoryId: number | null,
    serviceName: string | null,
    month: number | null,
    year: number | null,
    subServiceName: string | null
  ) => {
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId.toString());
      if (serviceName) params.append('serviceName', serviceName);
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      if (subServiceName) params.append('subServiceName', subServiceName);

      const res = await axiosInstance.get(
        `SuperAdmin/GetServiceStatistics?${params.toString()}`
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };

  /**
   * Get Insurance Statistics
   * @param month - Month (1-12)
   * @param year - Year
   */
  static GetInsuranceStatistics = async (
    month: number,
    year: number
  ) => {
    try {
      const res = await axiosInstance.get(
        `SuperAdmin/GetInsuranceStatistics?month=${month}&year=${year}`
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };
}
