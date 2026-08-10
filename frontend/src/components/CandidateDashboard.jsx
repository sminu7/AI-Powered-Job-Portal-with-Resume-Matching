import React, { useState, useEffect } from 'react'

function CandidateDashboard() {
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [jobs, setJobs] = useState([])
  const [appliedJobs, setAppliedJobs] = useState([])

  // Load active user session & jobs on component mount
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('current_user') || '{}')
    if (savedUser.email) {
      setUserEmail(savedUser.email)
      setUserName(savedUser.name || 'Candidate')
    }

    const savedJobs = JSON.parse(localStorage.getItem('app_jobs') || '[]')
    if (savedJobs.length > 0) {
      setJobs(savedJobs)
    } else {
      const defaultJobs = [
        { id: '1', title: 'Backend Developer', company: 'TechCorp', skills: ['Java', 'Spring Boot', 'SQL'] },
        { id: '2', title: 'Data Analyst', company: 'DataInc', skills: ['Python', 'SQL', 'Tableau'] }
      ]
      setJobs(defaultJobs)
      localStorage.setItem('app_jobs', JSON.stringify(defaultJobs))
    }
  }, [])

  // Re-fetch applied jobs whenever userEmail updates
  useEffect(() => {
    if (userEmail) {
      loadMyApplications(userEmail)
    } else {
      setAppliedJobs([])
    }
  }, [userEmail])

  // Save session when candidate inputs their identity
  const handleSaveUser = (e) => {
    e.preventDefault()
    if (!userEmail) return alert('Please enter your email')

    const sessionData = { email: userEmail, name: userName || 'Candidate' }
    localStorage.setItem('current_user', JSON.stringify(sessionData))
    loadMyApplications(userEmail)
    alert('Logged in as candidate: ' + userEmail)
  }

  const loadMyApplications = (email) => {
    const allApps = JSON.parse(localStorage.getItem('app_applications') || '[]')
    // Match candidate applications by email address
    const myApps = allApps.filter(app => String(app.email).toLowerCase() === String(email).toLowerCase())
    setAppliedJobs(myApps)
  }

  const handleApply = (job) => {
    if (!userEmail) {
      alert('Please enter and save your email above before applying!')
      return
    }

    const allApps = JSON.parse(localStorage.getItem('app_applications') || '[]')

    // Check if candidate already applied to this specific job
    const alreadyApplied = allApps.some(
      app => String(app.jobId) === String(job.id) && String(app.email).toLowerCase() === userEmail.toLowerCase()
    )

    if (alreadyApplied) {
      alert('You have already applied for this job!')
      return
    }

    // Mock AI match calculation logic
    const matched = job.skills ? job.skills.slice(0, 2) : ['React']
    const missing = job.skills ? job.skills.slice(2) : ['Docker']
    const matchScore = Math.floor(Math.random() * 30) + 70

    const newApp = {
      id: Date.now().toString(),
      jobId: String(job.id),
      jobTitle: job.title,
      company: job.company || 'Company',
      name: userName || 'Candidate',
      email: userEmail,
      matchScore: matchScore,
      matchedSkills: matched,
      missingSkills: missing,
      status: 'Pending',
      appliedAt: new Date().toLocaleDateString()
    }

    const updatedApps = [...allApps, newApp]
    localStorage.setItem('app_applications', JSON.stringify(updatedApps))
    
    // Immediately refresh state
    setAppliedJobs(prev => [...prev, newApp])
    alert(`Successfully applied to ${job.title}!`)
  }

  return (
    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50' }}>👨‍💻 Candidate Portal</h3>

      {/* Candidate Session Input Bar */}
      <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #e9ecef' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#495057' }}>Candidate Profile Session:</h4>
        <form onSubmit={handleSaveUser} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input 
            type="text" 
            placeholder="Your Name" 
            value={userName} 
            onChange={e => setUserName(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
          />
          <input 
            type="email" 
            placeholder="Your Email (required)" 
            value={userEmail} 
            onChange={e => setUserEmail(e.target.value)}
            required
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minWidth: '220px' }}
          />
          <button 
            type="submit" 
            style={{ padding: '8px 16px', backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Save Candidate Session
          </button>
        </form>
      </div>

      {/* Applied Jobs Section */}
      <div style={{ marginBottom: '30px' }}>
        <h4 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '8px' }}>
          📋 Your Submitted Applications ({appliedJobs.length})
        </h4>
        {!userEmail ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>Enter your email above to load your applications.</p>
        ) : appliedJobs.length === 0 ? (
          <p style={{ color: '#6c757d', fontStyle: 'italic' }}>You haven't applied to any positions yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {appliedJobs.map(app => (
              <div key={app.id} style={{ padding: '12px 15px', border: '1px solid #e0e0e0', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: '15px', color: '#333' }}>{app.jobTitle}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>Applied on: {app.appliedAt}</div>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: app.status === 'Shortlisted' ? '#d4edda' : app.status === 'Rejected' ? '#f8d7da' : '#fff3cd',
                  color: app.status === 'Shortlisted' ? '#155724' : app.status === 'Rejected' ? '#721c24' : '#856404'
                }}>
                  {app.status || 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Jobs List */}
      <div>
        <h4 style={{ color: '#2c3e50', borderBottom: '2px solid #eee', paddingBottom: '8px' }}>
          🔍 Available Positions
        </h4>
        <div style={{ display: 'grid', gap: '15px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginTop: '10px' }}>
          {jobs.map(job => {
            const isApplied = appliedJobs.some(app => String(app.jobId) === String(job.id))
            return (
              <div key={job.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#fafafa' }}>
                <h5 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#0d6efd' }}>{job.title}</h5>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#555' }}>{job.company || 'Tech Company'}</p>
                <button
                  onClick={() => handleApply(job)}
                  disabled={isApplied}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: isApplied ? '#6c757d' : '#198754',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: isApplied ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isApplied ? '✓ Applied' : 'Apply Now'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CandidateDashboard