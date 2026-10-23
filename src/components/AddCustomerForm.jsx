import { useState } from "react";

function AddCustomerForm({ onAddCustomer }) {
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerCompany, setNewCustomerCompany] = useState("");
  const [newCustomerDealValue, setNewCustomerDealValue] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = newCustomerName.trim();
    const trimmedCompany = newCustomerCompany.trim();

    if (trimmedName === "" || trimmedCompany === "") {
      return;
    }

    onAddCustomer({
      name: trimmedName,
      company: trimmedCompany,
      dealValue: Number(newCustomerDealValue) || 0,
    });

    setNewCustomerName("");
    setNewCustomerCompany("");
    setNewCustomerDealValue("");
  }

  return (
    <form className="add-customer-form" onSubmit={handleSubmit}>
      <input
        className="search-input"
        type="text"
        placeholder="Customer name"
        value={newCustomerName}
        onChange={(event) => setNewCustomerName(event.target.value)}
      />
      <input
        className="search-input"
        type="text"
        placeholder="Company"
        value={newCustomerCompany}
        onChange={(event) => setNewCustomerCompany(event.target.value)}
      />
      <input
        className="search-input"
        type="number"
        min="0"
        placeholder="Deal value ($)"
        value={newCustomerDealValue}
        onChange={(event) => setNewCustomerDealValue(event.target.value)}
      />
      <button className="reset-button" type="submit">
        Add customer
      </button>
    </form>
  );
}

export default AddCustomerForm;