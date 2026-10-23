import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import KpiCard from "../components/KpiCard";

function getMonthKey(date) {
  return date.toISOString().slice(0, 7);
}

function getTone(currentValue, previousValue) {
  if (currentValue > previousValue) return "positive";
  if (currentValue < previousValue) return "negative";
  return "neutral";
}

function sumDealValues(customerList) {
  return customerList.reduce(
    (total, customer) => total + (customer.dealValue || 0),
    0
  );
}

function DashboardPage({ customers }) {
  const now = new Date();
  const thisMonthKey = getMonthKey(now);
  const lastMonthKey = getMonthKey(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1))
  );

  function customersAddedIn(monthKey) {
    return customers.filter(
      (customer) => customer.createdAt && customer.createdAt.startsWith(monthKey)
    );
  }

  const addedThisMonth = customersAddedIn(thisMonthKey);
  const addedLastMonth = customersAddedIn(lastMonthKey);

  const totalCustomers = customers.length;
  const totalDealValue = sumDealValues(customers);
  const dealValueThisMonth = sumDealValues(addedThisMonth);
  const dealValueLastMonth = sumDealValues(addedLastMonth);

  const churnedCustomers = customers.filter(
    (customer) => customer.status === "Churned"
  ).length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const churnRate =
    totalCustomers === 0
      ? 0
      : ((churnedCustomers / totalCustomers) * 100).toFixed(1);

  const activeShare =
    totalCustomers === 0 ? 0 : Math.round((activeCustomers / totalCustomers) * 100);

  const monthCounts = customers.reduce((counts, customer) => {
    if (!customer.createdAt) {
      return counts;
    }

    const monthKey = customer.createdAt.slice(0, 7);
    counts[monthKey] = (counts[monthKey] || 0) + 1;
    return counts;
  }, {});

  const customersPerMonth = Object.keys(monthCounts)
    .sort()
    .map((monthKey) => ({
      month: monthKey,
      customers: monthCounts[monthKey],
    }));

  const recentCustomers = customers
    .filter((customer) => customer.createdAt)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .slice(0, 4);

  const kpiMetrics = [
    {
      id: 1,
      label: "Total customers",
      value: totalCustomers,
      detail: `${addedThisMonth.length} new this month, ${addedLastMonth.length} last month`,
      tone: getTone(addedThisMonth.length, addedLastMonth.length),
    },
    {
      id: 2,
      label: "Total deal value",
      value: `$${totalDealValue.toLocaleString()}`,
      detail: `$${dealValueThisMonth.toLocaleString()} added this month`,
      tone: getTone(dealValueThisMonth, dealValueLastMonth),
    },
    {
      id: 3,
      label: "Churn rate",
      value: `${churnRate}%`,
      detail: `${churnedCustomers} of ${totalCustomers} customers`,
      tone: "neutral",
    },
    {
      id: 4,
      label: "Active customers",
      value: activeCustomers,
      detail: `${activeShare}% of all customers`,
      tone: "neutral",
    },
  ];

  const axisTick = { fill: "#667085", fontSize: 12 };

  return (
    <>
      <div className="kpi-grid">
        {kpiMetrics.map((metric) => (
          <KpiCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            tone={metric.tone}
          />
        ))}
      </div>

      <div className="dashboard-lower">
        <div className="panel chart-card">
          <h3 className="panel-title">New customers per month</h3>
          <p className="panel-subtitle">Counted from each customer's added date</p>

          {customersPerMonth.length === 0 ? (
            <p className="empty-state">No customer dates to chart yet.</p>
          ) : (
            <div className="chart-area">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={customersPerMonth}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e7ec" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={axisTick}
                  />
                  <Tooltip
                    cursor={{ fill: "#f2f4f7" }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #e4e7ec" }}
                  />
                  <Bar
                    dataKey="customers"
                    fill="#3347e0"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="panel">
          <h3 className="panel-title">Recently added</h3>
          <p className="panel-subtitle">Newest customers first</p>

          {recentCustomers.length === 0 ? (
            <p className="empty-state">No customers yet.</p>
          ) : (
            <ul className="recent-list">
              {recentCustomers.map((customer) => (
                <li key={customer.id}>
                  <div>
                    <Link className="customer-name" to={`/customers/${customer.id}`}>
                      {customer.name}
                    </Link>
                    <p className="customer-company">{customer.company}</p>
                  </div>
                  <span className={`status-badge ${customer.status.toLowerCase()}`}>
                    {customer.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardPage;