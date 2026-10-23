import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import DealsPage from "./pages/DealsPage";
import ReportsPage from "./pages/ReportsPage";
import useCustomers from "./hooks/useCustomers";

const pageTitles = {
  "/": "Dashboard",
  "/customers": "Customers",
  "/deals": "Deals",
  "/reports": "Reports",
};

function App() {
  const {
    customers,
    isLoading,
    errorMessage,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();
  const location = useLocation();

  const pageTitle = location.pathname.startsWith("/customers/")
    ? "Customer details"
    : pageTitles[location.pathname] || "Page not found";

  return (
    <div className="app-layout">
      <Sidebar />
      <main>
        <h1>{pageTitle}</h1>
        <p>Customer Intelligence Platform</p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {isLoading && <p>Loading customers...</p>}

        {!isLoading && (
          <Routes>
            <Route path="/" element={<DashboardPage customers={customers} />} />
            <Route
              path="/customers"
              element={
                <CustomersPage
                  customers={customers}
                  onAddCustomer={addCustomer}
                  onUpdateCustomer={updateCustomer}
                  onDeleteCustomer={deleteCustomer}
                />
              }
            />
            <Route
              path="/customers/:customerId"
              element={
                <CustomerDetailPage
                  customers={customers}
                  onUpdateCustomer={updateCustomer}
                />
              }
            />
            <Route path="/deals" element={<DealsPage customers={customers} />} />
            <Route path="/reports" element={<ReportsPage customers={customers} />} />
            <Route path="*" element={<p>That page doesn't exist.</p>} />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default App;