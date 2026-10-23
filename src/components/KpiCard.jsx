function KpiCard({ label, value, detail, tone = "neutral" }) {
  return (
    <div className="kpi-card">
      <p className="kpi-label">{label}</p>
      <h2 className="kpi-value">{value}</h2>
      {detail && <p className={`kpi-change ${tone}`}>{detail}</p>}
    </div>
  );
}

export default KpiCard;