export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="admin-page-title">Overview</h1>
      <div className="admin-card-grid">
        <div className="admin-card">
          <h3>Live tournaments</h3>
          <div className="stat">—</div>
        </div>
        <div className="admin-card">
          <h3>Registered users</h3>
          <div className="stat">—</div>
        </div>
        <div className="admin-card">
          <h3>Organizers</h3>
          <div className="stat">—</div>
        </div>
        <div className="admin-card">
          <h3>Pending payouts</h3>
          <div className="stat">—</div>
        </div>
      </div>
    </>
  );
}
