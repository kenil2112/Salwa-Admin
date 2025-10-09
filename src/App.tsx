import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ServiceDashboard from "./pages/ServiceDashboard";
import RentalServices from "./pages/RentalServices";
import RentalServiceDetail from "./pages/RentalServiceDetail";
import RentalServiceNotifications from "./pages/RentalServiceNotifications";
import AdvancedOptions from "./pages/AdvancedOptions";
import StatementAnalysis from "./pages/StatementAnalysis";
import ListSubscribers from "./pages/ListSubscribers";
import ListAgents from "./pages/ListAgents";
import Login from "./pages/Login";
import Reports from "./pages/Reports";
import SupervisorManagement from "./pages/SupervisorManagement";
// import AddSupervisor from "./pages/AddSupervisor";
import SubscriptionSettings from "./pages/SubscriptionSettings";
import ServiceManagement from "./pages/ServiceManagement";
import EmployeeCategoryAssignment from "./pages/EmployeeCategoryAssignment";
import TermsConditionsMaster from "./pages/TermsConditionsMaster";
import PromocodeSettings from "./pages/PromocodeSettings";
import NonMedicalCompanies from "./pages/NonMedicalCompanies";
import AgentIndividualDetail from "./pages/AgentIndividualDetail";
import AgentBusinessDetail from "./pages/AgentBusinessDetail";
import SupervisorDetail from "./pages/SupervisorDetail";
import ProtectedRoute from "./routes/ProtectedRoute";
import OrderManagementPage from "./pages/OrderManagementPage";
import Service2ManagementPage from "./pages/Service2ManagementPage";
import Service3ManagementPage from "./pages/Service3ManagementPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import Service2DetailPage from "./pages/Service2DetailPage";
import Service3DetailPage from "./pages/Service3DetailPage";
import NewDashboardPage from "./pages/NewDashboardPage";
import SubServicesDetails7 from "./pages/SubServicesDetails7";
import Service72Dashboard from "./pages/service7-2/Service72Dashboard";
import Service72Details from "./pages/service7-2/Service72Details";
import Service73Dashboard from "./pages/service7-3/Service73Dashboard";
import Service73Details from "./pages/service7-3/Service73Details";
import Service81Dashboard from "./pages/service8-1/Service81Dashboard";
import Service81Details from "./pages/service8-1/Service81Details";
import Service82Dashboard from "./pages/service8-2/Service82Dashboard";
import Service82Details from "./pages/service8-2/Service82Details";
import Service91Dashboard from "./pages/service9-1/Service91Dashboard";
import Service91Details from "./pages/service9-1/Service91Details";
import Service51Dashboard from "./pages/service5-1/Service51Dashboard";
import Service51Details from "./pages/service5-1/Service51Details";
import Service41Dashboard from "./pages/service4-1/Service41Dashboard";
import Service41Details from "./pages/service4-1/Service41Details";
import Service31Dashboard from "./pages/service3-1/Service31Dashboard";
import Service31Details from "./pages/service3-1/Service31Details";
import Service21Dashboard from "./pages/service2-1/Service21Dashboard";
import Service21Details from "./pages/service2-1/Service21Details";
import Service22Dashboard from "./pages/service2-2/Service22Dashboard";
import Service22Details from "./pages/service2-2/Service22Details";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/service-dashboard" element={<ServiceDashboard />} />

        {/* Specific routes for Category ID 2 */}
        <Route
          path="/service-dashboard/category/2/service/1/action/order"
          element={<Service21Dashboard />}
        />
        <Route
          path="/service-dashboard/category/2/service/2/action/order"
          element={<Service22Dashboard />}
        />

        {/* Specific routes for Category ID 3 */}
        <Route
          path="/service-dashboard/category/3/service/1/action/order"
          element={<Service31Dashboard />}
        />

        {/* Specific routes for Category ID 4 */}
        <Route
          path="/service-dashboard/category/4/service/1/action/order"
          element={<Service41Dashboard />}
        />

        {/* Specific routes for Category ID 5 */}
        <Route
          path="/service-dashboard/category/5/service/1/action/order"
          element={<Service51Dashboard />}
        />

        {/* Specific routes for Category ID 6, different service indices */}
        <Route
          path="/service-dashboard/category/6/service/1/action/order"
          element={<OrderManagementPage />}
        />
        <Route
          path="/service-dashboard/category/6/service/2/action/order"
          element={<Service2ManagementPage />}
        />
        <Route
          path="/service-dashboard/category/6/service/3/action/order"
          element={<Service3ManagementPage />}
        />

        {/* Specific routes for Category ID 7 */}
        <Route
          path="/service-dashboard/category/7/service/1/action/order/subservice/:subserviceIndex"
          element={<NewDashboardPage />}
        />
        <Route
          path="/service-dashboard/category/7/service/2/action/order"
          element={<Service72Dashboard />}
        />
        <Route
          path="/service-dashboard/category/7/service/3/action/order"
          element={<Service73Dashboard />}
        />

        {/* Specific routes for Category ID 8 */}
        <Route
          path="/service-dashboard/category/8/service/1/action/order"
          element={<Service81Dashboard />}
        />
        <Route
          path="/service-dashboard/category/8/service/2/action/order"
          element={<Service82Dashboard />}
        />

        {/* Specific routes for Category ID 9 */}
        <Route
          path="/service-dashboard/category/9/service/1/action/order"
          element={<Service91Dashboard />}
        />

        {/* Detail Pages */}
        <Route path="/order-detail/:orderId" element={<OrderDetailPage />} />
        <Route
          path="/service2-detail/:serviceId"
          element={<Service2DetailPage />}
        />
        <Route
          path="/service3-detail/:projectId"
          element={<Service3DetailPage />}
        />

        {/* SubServices Details Route */}
        <Route
          path="/subservices-details7/:requestId"
          element={<SubServicesDetails7 />}
        />

        {/* Service 7-2 Routes */}
        <Route path="/service7-2" element={<Service72Dashboard />} />
        <Route path="/service7-2/:id" element={<Service72Details />} />

        {/* Service 7-3 Routes */}
        <Route path="/service7-3" element={<Service73Dashboard />} />
        <Route path="/service7-3/:id" element={<Service73Details />} />

        {/* Service 8-1 Routes */}
        <Route path="/service8-1" element={<Service81Dashboard />} />
        <Route path="/service8-1/:id" element={<Service81Details />} />

        {/* Service 8-2 Routes */}
        <Route path="/service8-2" element={<Service82Dashboard />} />
        <Route path="/service8-2/:id" element={<Service82Details />} />

        {/* Service 9-1 Routes */}
        <Route path="/service9-1" element={<Service91Dashboard />} />
        <Route path="/service9-1/:id" element={<Service91Details />} />

        {/* Service 5-1 Routes */}
        <Route path="/service5-1" element={<Service51Dashboard />} />
        <Route path="/service5-1/:id" element={<Service51Details />} />

        {/* Service 4-1 Routes */}
        <Route path="/service4-1" element={<Service41Dashboard />} />
        <Route path="/service4-1/:id" element={<Service41Details />} />

        {/* Service 3-1 Routes */}
        <Route path="/service3-1" element={<Service31Dashboard />} />
        <Route path="/service3-1/:id" element={<Service31Details />} />

        {/* Service 2-1 Routes */}
        <Route path="/service2-1" element={<Service21Dashboard />} />
        <Route path="/service2-1/:id" element={<Service21Details />} />

        {/* Service 2-2 Routes */}
        <Route path="/service2-2" element={<Service22Dashboard />} />
        <Route path="/service2-2/:id" element={<Service22Details />} />

        <Route
          path="/service-dashboard/insurance-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/insurance-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/insurance-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route
          path="/service-dashboard/rental-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/rental-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/rental-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route
          path="/service-dashboard/sell-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/sell-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/sell-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route
          path="/service-dashboard/medical-legal-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/medical-legal-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/medical-legal-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route
          path="/service-dashboard/medical-staff-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/medical-staff-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/medical-staff-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route
          path="/service-dashboard/health-marketplace-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/health-marketplace-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/health-marketplace-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route
          path="/service-dashboard/medical-real-estate-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/medical-real-estate-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/medical-real-estate-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route
          path="/service-dashboard/general-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/general-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/general-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route
          path="/service-dashboard/food-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/food-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/food-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route
          path="/service-dashboard/non-medical-services"
          element={<RentalServices />}
        />
        <Route
          path="/service-dashboard/non-medical-services/:orderId"
          element={<RentalServiceDetail />}
        />
        <Route
          path="/service-dashboard/non-medical-services/notifications"
          element={<RentalServiceNotifications />}
        />

        <Route path="/advanced-options" element={<AdvancedOptions />} />
        <Route path="/statement-analysis" element={<StatementAnalysis />} />
        <Route path="/subscribers" element={<ListSubscribers />} />
        <Route path="/agents" element={<ListAgents />} />
        <Route
          path="/agents/individual/:id"
          element={<AgentIndividualDetail />}
        />
        <Route path="/agents/business/:id" element={<AgentBusinessDetail />} />
        <Route
          path="/supervisor-management/:id"
          element={<SupervisorDetail />}
        />
        <Route path="/reports" element={<Reports />} />
        <Route
          path="/supervisor-management"
          element={<SupervisorManagement />}
        />
        {/* <Route path="/supervisor-management/add" element={<AddSupervisor />} />
        <Route path="/supervisor-management/:employeeId" element={<AddSupervisor />} />
        <Route path="/supervisor-management/:employeeId/edit" element={<AddSupervisor />} /> */}
        <Route
          path="/subscription-settings"
          element={<SubscriptionSettings />}
        />
        <Route path="/service-management" element={<ServiceManagement />} />
        <Route
          path="/employee-category"
          element={<EmployeeCategoryAssignment />}
        />
        <Route path="/terms-master" element={<TermsConditionsMaster />} />
        <Route path="/promocode-settings" element={<PromocodeSettings />} />
        <Route
          path="/non-medical-companies"
          element={<NonMedicalCompanies />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
