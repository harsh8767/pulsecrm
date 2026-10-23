import { Link } from "react-router-dom";

function getInitials(fullName) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function CustomerRow({ customer, onStatusChange, onDelete }) {
  return (
    <tr>
      <td>
        <div className="customer-cell">
          <span className={`avatar avatar-${customer.id % 5}`}>
            {getInitials(customer.name)}
          </span>
          <div>
            <Link className="customer-name" to={`/customers/${customer.id}`}>
              {customer.name}
            </Link>
            <p className="customer-company">{customer.company}</p>
          </div>
        </div>
      </td>
      <td className="number-cell">
        ${(customer.dealValue || 0).toLocaleString()}
      </td>
      <td>
        <select
          className={`status-badge status-dropdown ${customer.status.toLowerCase()}`}
          value={customer.status}
          onChange={(event) => onStatusChange(customer.id, event.target.value)}
        >
          <option value="Active">Active</option>
          <option value="Lead">Lead</option>
          <option value="Churned">Churned</option>
        </select>
      </td>
      <td className="actions-cell">
        <button className="delete-button" onClick={() => onDelete(customer.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
}

export default CustomerRow;