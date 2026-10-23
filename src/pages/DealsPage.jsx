import { Link } from "react-router-dom";
import KpiCard from "../components/KpiCard";
import Avatar from "../components/Avatar";

function sumDealValues(customerList) {
  return customerList.reduce(
    (total, customer) => total + (customer.dealValue || 0),
    0
  );
}

function DealsPage({ customers }) {
  const openDeals = customers.filter((customer) => customer.status === "Lead");
  const wonCustomers = customers.filter((customer) => customer.status === "Active");

  const pipelineValue = sumDealValues(openDeals);
  const wonValue = sumDealValues(wonCustomers);
  const averageDealValue =
    openDeals.length === 0 ? 0 : Math.round(pipelineValue / openDeals.length);

  const sortedDeals = [...openDeals].sort(
    (firstDeal, secondDeal) =>
      (secondDeal.dealValue || 0) - (firstDeal.dealValue || 0)
  );
  const largestDealValue =
    sortedDeals.length === 0 ? 0 : sortedDeals[0].dealValue || 0;

  const dealMetrics = [
    {
      id: 1,
      label: "Open deals",
      value: openDeals.length,
      detail: "Customers with Lead status",
    },
    {
      id: 2,
      label: "Pipeline value",
      value: `$${pipelineValue.toLocaleString()}`,
      detail: "Total of all open deals",
    },
    {
      id: 3,
      label: "Average deal",
      value: `$${averageDealValue.toLocaleString()}`,
      detail: "Pipeline value per open deal",
    },
    {
      id: 4,
      label: "Won value",
      value: `$${wonValue.toLocaleString()}`,
      detail: `${wonCustomers.length} active customer${wonCustomers.length !== 1 ? "s" : ""}`,
    },
  ];

  return (
    <>
      <div className="kpi-grid">
        {dealMetrics.map((metric) => (
          <KpiCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            tone="neutral"
          />
        ))}
      </div>

      <div className="panel">
        <h3 className="panel-title">Open deals</h3>
        <p className="panel-subtitle">Largest first</p>

        {sortedDeals.length === 0 ? (
          <p className="empty-state">
            No open deals right now. Customers with the Lead status show up here.
          </p>
        ) : (
          <ul className="deal-list">
            {sortedDeals.map((deal) => {
              const dealValue = deal.dealValue || 0;
              const barWidth =
                largestDealValue === 0
                  ? 0
                  : Math.round((dealValue / largestDealValue) * 100);

              return (
                <li className="deal-row" key={deal.id}>
                  <div className="deal-person">
                    <Avatar name={deal.name} id={deal.id} />
                    <div>
                      <Link className="customer-name" to={`/customers/${deal.id}`}>
                        {deal.name}
                      </Link>
                      <p className="customer-company">{deal.company}</p>
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

export default DealsPage;