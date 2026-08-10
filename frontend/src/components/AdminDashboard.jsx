import { useState, useEffect } from 'react'

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    companies: 0,
    jobsPosted: 0,
    applications: 0
  })

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLiveStatsAndUsers()
  }, [])

  const fetchLiveStatsAndUsers = async () => {
    setLoading(true)
    try {
      // 1. Fetch Users Data
      const usersRes = await fetch('http://localhost:8080/api/users')
      let usersData = []
      if (usersRes.ok) {
        usersData = await usersRes.json()
        setUsers(usersData)
      }

      // 2. Fetch Jobs Data
      const jobsRes = await fetch('http://localhost:8080/api/jobs')
      let jobsData = []
      if (jobsRes.ok) {
        jobsData = await jobsRes.json()
      }

      // 3. Fetch Applications Data
      const appsRes = await fetch('http://localhost:8080/api/applications')
      let appsData = []
      if (appsRes.ok) {
        appsData = await appsRes.json()
      }

      // --- Compute Live Metrics ---
      const totalUsersCount = usersData.length
      // Count unique recruiters or companies
      const recruitersCount = usersData.filter(u => u.role?.toUpperCase() === 'RECRUITER' || u.role?.toUpperCase() === 'COMPANY').length
      const jobsCount = jobsData.length
      const appsCount = appsData.length

      setStats({
        totalUsers: totalUsersCount,
        companies: recruitersCount,
        jobsPosted: jobsCount,
        applications: appsCount
      })

    } catch (error) {
      console.error('Error fetching live system analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Toggle user account block status
  const toggleBlockStatus = async (userId, currentStatus) => {
    const updatedStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked'

    // Optimistic UI update
    setUsers(prevUsers =>
      prevUsers.map(user => user.id === userId ? { ...user, status: updatedStatus } : user)
    )

    try {
      await fetch(`http://localhost:8080/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updatedStatus })
      })
    } catch (err) {
      console.warn('Backend status update warning: updated in UI state.')
    }
  }

  return (
    <div style={{ padding: '25px', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ddd' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>🛡️ System Admin Console</h2>
        <button 
          onClick={fetchLiveStatsAndUsers} 
          style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px' }}
        >
          🔄 Refresh Metrics
        </button>
      </div>

      {/* --- Dynamic Live Analytics Overview Cards --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={cardStyle}>
          <span style={cardTitle}>Total Users</span>
          <span style={cardValue}>{loading ? '...' : stats.totalUsers}</span>
        </div>
        <div style={cardStyle}>
          <span style={cardTitle}>Companies / Recruiters</span>
          <span style={cardValue}>{loading ? '...' : stats.companies}</span>
        </div>
        <div style={cardStyle}>
          <span style={cardTitle}>Jobs Posted</span>
          <span style={cardValue}>{loading ? '...' : stats.jobsPosted}</span>
        </div>
        <div style={cardStyle}>
          <span style={cardTitle}>Applications</span>
          <span style={cardValue}>{loading ? '...' : stats.applications}</span>
        </div>
      </div>

      {/* --- User Management & Security Panel --- */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>👤 Registered User Management</h3>
        
        {loading ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Loading registered users...</p>
        ) : users.length === 0 ? (
          <p style={{ color: '#777', fontStyle: 'italic' }}>No registered users found in database.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>User Name</th>
                <th style={{ padding: '10px' }}>Email</th>
                <th style={{ padding: '10px' }}>Role</th>
                <th style={{ padding: '10px' }}>Account Status</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{u.name || u.username || `User #${u.id}`}</td>
                  <td style={{ padding: '10px', color: '#555' }}>{u.email}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '12px', 
                      backgroundColor: '#e8f0fe', 
                      color: '#1a73e8',
                      fontWeight: 'bold' 
                    }}>
                      {u.role || 'Candidate'}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: u.status === 'Blocked' ? '#f8d7da' : '#d4edda',
                      color: u.status === 'Blocked' ? '#721c24' : '#155724'
                    }}>
                      {u.status || 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button
                      onClick={() => toggleBlockStatus(u.id, u.status || 'Active')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        color: '#fff',
                        backgroundColor: u.status === 'Blocked' ? '#28a745' : '#dc3545',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '12px'
                      }}
                    >
                      {u.status === 'Blocked' ? 'Unblock Account' : 'Block Account'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// Styling objects
const cardStyle = {
  backgroundColor: '#fff',
  padding: '18px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
  borderLeft: '4px solid #007bff',
  border: '1px solid #eee'
}

const cardTitle = { fontSize: '13px', color: '#666', marginBottom: '6px', fontWeight: '600' }
const cardValue = { fontSize: '26px', fontWeight: 'bold', color: '#1a73e8' }

export default AdminDashboard