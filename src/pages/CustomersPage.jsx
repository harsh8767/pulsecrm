import { useState } from "react";
import CustomerRow from "../components/CustomerRow";
import AddCustomerForm from "../components/AddCustomerForm";

function CustomersPage({
  customers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
}) {
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const visibleCustomers = customers.filter((customer) => {
    const lowerCaseSearchText = searchText.toLowerCase();

    const matchesSearch =
      customer.name.toLowerCase().includes(lowerCaseSearchText) ||
      customer.company.toLowerCase().includes(lowerCaseSearchText);

    const matchesStatus =
      selectedStatus === "All" || customer.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const hasNoResults = visibleCustomers.length === 0;
  const hasActiveFilters = searchText !== "" || selectedStatus !== "All";

  function handleResetFilters() {
    setSearchText("");
    setSelectedStatus("All");
  }

  function handleStatusChange(customerId, newStatus) {
    onUpdateCustomer(customerId, { status: newStatus });
  }

  async function handleAddCustomer(customerDetails) {
    await onAddCustomer(customerDetails);
    setIsAddFormOpen(false);
  }

  return (
    <>
      <div className="page-toolbar">
        <div className="search-field">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name or company"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <select
          className="status-select"
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          <option value="All">All statuses</option>
          <option value="Active">Active</option>
          <option value="Lead">Lead</option>
          <option value="Churned">Churned</option>
        </select>

        {hasActiveFilters && (
          <button className="reset-button" onClick={handleResetFilters}>
            Clear filters
          </button>
        )}

        <button
          className="primary-button toolbar-action"
          onClick={() => setIsAddFormOpen(!isAddFormOpen)}
        >
          {isAddFormOpen ? "Cancel" : "Add customer"}
        </button>
      </div>

      {isAddFormOpen && (
        <div className="panel add-panel">
          <AddCustomerForm onAddCustomer={handleAddCustomer} />
        </div>
      )}

      <p className="result-count">
        {visibleCustomers.length} customer
        {visibleCustomers.length !== 1 ? "s" : ""}
      </p>

      {hasNoResults ? (
        <p className="empty-state">No customers match your filters.</p>
      ) : (
        <div className="table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th className="number-cell">Deal value</th>
                <th>Status</th>
                <th>
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleCustomers.map((customer) => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  onStatusChange={handleStatusChange}
                  onDelete={onDeleteCustomer}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default CustomersPage;