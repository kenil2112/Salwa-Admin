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

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/service-dashboard" element={<ServiceDashboard />} />

        <Route path="/service-dashboard/insurance-services" element={<RentalServices />} />
        <Route path="/service-dashboard/insurance-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/insurance-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/service-dashboard/rental-services" element={<RentalServices />} />
        <Route path="/service-dashboard/rental-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/rental-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/service-dashboard/sell-services" element={<RentalServices />} />
        <Route path="/service-dashboard/sell-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/sell-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/service-dashboard/medical-legal-services" element={<RentalServices />} />
        <Route path="/service-dashboard/medical-legal-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/medical-legal-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/service-dashboard/medical-staff-services" element={<RentalServices />} />
        <Route path="/service-dashboard/medical-staff-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/medical-staff-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/service-dashboard/health-marketplace-services" element={<RentalServices />} />
        <Route path="/service-dashboard/health-marketplace-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/health-marketplace-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/service-dashboard/medical-real-estate-services" element={<RentalServices />} />
        <Route path="/service-dashboard/medical-real-estate-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/medical-real-estate-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/service-dashboard/general-services" element={<RentalServices />} />
        <Route path="/service-dashboard/general-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/general-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/service-dashboard/food-services" element={<RentalServices />} />
        <Route path="/service-dashboard/food-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/food-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/service-dashboard/non-medical-services" element={<RentalServices />} />
        <Route path="/service-dashboard/non-medical-services/:orderId" element={<RentalServiceDetail />} />
        <Route path="/service-dashboard/non-medical-services/notifications" element={<RentalServiceNotifications />} />

        <Route path="/advanced-options" element={<AdvancedOptions />} />
        <Route path="/statement-analysis" element={<StatementAnalysis />} />
        <Route path="/subscribers" element={<ListSubscribers />} />
        <Route path="/agents" element={<ListAgents />} />
        <Route path="/agents/individual/:id" element={<AgentIndividualDetail />} />
        <Route path="/agents/business/:id" element={<AgentBusinessDetail />} />
        <Route path="/supervisor-management/:id" element={<SupervisorDetail />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/supervisor-management" element={<SupervisorManagement />} />
        {/* <Route path="/supervisor-management/add" element={<AddSupervisor />} />
        <Route path="/supervisor-management/:employeeId" element={<AddSupervisor />} />
        <Route path="/supervisor-management/:employeeId/edit" element={<AddSupervisor />} /> */}
        <Route path="/subscription-settings" element={<SubscriptionSettings />} />
        <Route path="/service-management" element={<ServiceManagement />} />
        <Route path="/employee-category" element={<EmployeeCategoryAssignment />} />
        <Route path="/terms-master" element={<TermsConditionsMaster />} />
        <Route path="/promocode-settings" element={<PromocodeSettings />} />
        <Route path="/non-medical-companies" element={<NonMedicalCompanies />} />

      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;

