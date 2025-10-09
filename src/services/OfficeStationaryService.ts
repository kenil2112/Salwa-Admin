import { errorHandler, successHandler } from "../common/appHandler";
import axiosInstance from "../common/axiosInstance";

interface OfficeStationaryParams {
  searchText?: string;
  pageNumber?: number;
  pageSize?: number;
  orderByColumn?: string;
  orderDirection?: string;
}

interface CreateOrderParams {
  CategoryId: string;
  ServiceId: string;
  Action: string;
  OrderType?: string;
  UserId?: string;
  OrderDate?: string;
  Status?: string;
  ItemName?: string;
  ItemQuantity?: number;
  Weight?: number;
}

class OfficeStationaryService {
  /**
   * Get all office stationary data with pagination and search
   * Uses the exact API endpoint: /api/officestationary/OfficeStationarySectorGetAll
   */
  static OfficeStationarySectorGetAll = async (
    params: OfficeStationaryParams = {}
  ) => {
    try {
      const {
        searchText = "",
        pageNumber = 1,
        pageSize = 10,
        orderByColumn = "RequestId",
        orderDirection = "DESC",
      } = params;

      // Build query parameters for GET request
      const queryParams = new URLSearchParams({
        searchText: searchText,
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        orderByColumn: orderByColumn,
        orderDirection: orderDirection,
      });

      // Use GET request with query parameters
      const res = await axiosInstance.get(
        `OfficeStationary/OfficeStationarySectorGetAll?${queryParams.toString()}`
      );
      return successHandler(res);
    } catch (error: any) {
      return errorHandler(error);
    }
  };
}

export default OfficeStationaryService;
export type { OfficeStationaryParams, CreateOrderParams };
