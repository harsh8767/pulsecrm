import { useState, useEffect } from "react";

const API_URL = "/api/customers";

async function requestJson(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      try {
        const loadedCustomers = await requestJson(API_URL);
        setCustomers(loadedCustomers);
      } catch {
        setErrorMessage("Could not load customers. Is the API server running?");
      } finally {
        setIsLoading(false);
      }
    }

    loadCustomers();
  }, []);

  async function addCustomer(customerDetails) {
    setErrorMessage("");
    try {
      const createdCustomer = await requestJson(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customerDetails),
      });
      setCustomers((currentCustomers) => [...currentCustomers, createdCustomer]);
    } catch {
      setErrorMessage("Could not add the customer.");
    }
  }

  async function updateCustomer(customerId, changes) {
    setErrorMessage("");
    try {
      const updatedCustomer = await requestJson(`${API_URL}/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      setCustomers((currentCustomers) =>
        currentCustomers.map((customer) =>
          customer.id === customerId ? updatedCustomer : customer
        )
      );
    } catch {
      setErrorMessage("Could not save your changes.");
    }
  }

  async function deleteCustomer(customerId) {
    setErrorMessage("");
    try {
      await requestJson(`${API_URL}/${customerId}`, { method: "DELETE" });
      setCustomers((currentCustomers) =>
        currentCustomers.filter((customer) => customer.id !== customerId)
      );
    } catch {
      setErrorMessage("Could not delete the customer.");
    }
  }

  async function addSampleCustomers() {
    setErrorMessage("");
    try {
      const sampleCustomers = await requestJson(`${API_URL}/sample`, {
        method: "POST",
      });
      setCustomers(sampleCustomers);
    } catch {
      setErrorMessage("Could not add the sample customers.");
    }
  }

  return {
    customers,
    isLoading,
    errorMessage,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addSampleCustomers,
  };
}

export default useCustomers;