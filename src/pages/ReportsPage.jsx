import { Link } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import Avatar from "../components/Avatar";

const statuses = [
  { name: "Active", color: "#2f9e63" },
  { name: "Lead", color: "#f0a21c" },
  { name: "Churned", color: "#d9463e" },
];

function ReportsPage({ customers }) {
  const totalCustomers = customers.length;

  const statusBreakdown = statuses.map((status) => {
    const matchingCustomers = customers.filter(
      (customer) => customer.status === status.name
    );
    const dealValue = matchingCustomers.reduce(
      (total, customer) => total + (customer.dealValue || 0),
      0
    );
    const share =
      totalCustomers === 0
        ? 0
        : Math.round((matchingCustomers.length / totalCustomers) * 100);

    return { ...status, count: matchingCustomers.length, share, dealValue };
  });

  const donutData = statusBreakdown.filter((status) => status.count > 0);

  const topCustomers = [...customers]
    .sort((first, second) => (second.dealValue || 0) - (first.dealValue || 0))
    .slice(0, 5);
  const largestDealValue =
    topCustomers.length === 0 ? 0 : topCustomers[0].dealValue || 0;

  return (
    <>
      <div className="reports-grid">
        <div className="panel">
          <h3 className="panel-title">Customers by status</h3>
          <p className="panel-subtitle">Share of all customers</p>

          {totalCustomers === 0 ? (
            <p className="empty-state">No customers to report on yet.</p>
          ) : (
            <div className="donut-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {donutData.map((status) => (
                      <Cell key={status.name} fill={status.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <strong>{totalCustomers}</strong>
                <span>customers</span>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <h3 className="panel-title">Status breakdown</h3>
          <p className="panel-subtitle">Customers and deal value for each status</p>

          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Status</th>
                <th className="number-cell">Customers</th>
                <th className="number-cell">Share</th>
                <th className="number-cell">Deal value</th>
              </tr>
            </thead>
            <tbody>
              {statusBreakdown.map((status) => (
                <tr key={status.name}>
                  <td>
                    <span
                      className="status-dot"
                      style={{ background: status.color }}
                    />
                    {status.name}
                  </td>
                  <td className="number-cell">{status.count}</td>
                  <td className="number-cell">{status.share}%</td>
                  <td className="number-cell">${status.dealValue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h3 className="panel-title">Top customers by deal value</h3>
        <p className="panel-subtitle">The five largest, any status</p>

        {topCustomers.length === 0 ? (
          <p className="empty-state">No customers yet.</p>
        ) : (
          <ul className="deal-list">
            {topCustomers.map((customer) => {
              const dealValue = customer.dealValue || 0;
              const barWidth =
                largestDealValue === 0
                  ? 0
                  : Math.round((dealValue / largestDealValue) * 100);

              return (
                <li className="deal-row" key={customer.id}>
                  <div className="deal-person">
                    <Avatar name={customer.name} id={customer.id} />
                    <div>
                      <Link
                        className="customer-name"
                        to={`/customers/${customer.id}`}
                      >
                        {customer.name}
                      </Link>
                      <p className="customer-company">{customer.company}</p>
                    </div>
                  </div>
                  <div className="deal-bar-track">
                    <div className="deal-bar" style={{ width: `${barWidth}%` }} />
                  </div>
                  <p className="deal-value">${dealValue.toLocaleString()}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

export default ReportsPage;