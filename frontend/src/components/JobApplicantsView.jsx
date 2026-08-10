import { useState, useEffect } from 'react'

function JobApplicantsView() {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(false)

  // Interview Modal & Status States
  const [schedulingAppId, setSchedulingAppId] = useState(null)
  const [interviewDetails, setInterviewDetails] = useState({ date: '', time: '' })

  useEffect(() => {
    fetchActiveJobs()
  }, [])

  const fetchActiveJobs = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching job lists:', error)
    }
  }

  const handleJobChange = async (e) => {
    const jobId = e.target.value
    setSelectedJobId(jobId)
    if (!jobId) {
      setApplicants([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`http://localhost:8080/api/applications/job/${jobId}`)
      if (response.ok) {
        const data = await response.json()
        setApplicants(data)
      } else {
        setApplicants([])
      }
    } catch (error) {
      console.error('Error fetching applicants:', error)
      setApplicants([])
    } finally {
      setLoading(false)
    }
  }

  // Handle Pipeline State Updates (Shortlist / Reject)
  const handleUpdateStatus = async (appId, newStatus) => {
    // Snappy local state update
    setApplicants(prev =>
      prev.map(app => app.id === appId ? { ...app, applicationStatus: newStatus } : app)
    )

    try {
      await fetch(`http://localhost:8080/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
    } catch (err) {
      console.warn('Backend sync bypassed. Updated locally.')
    }
  }

  const handleScheduleSubmit = (e) => {
    e.preventDefault()
    alert(`Interview Confirmed!\nDate: ${interviewDetails.date}\nTime: ${interviewDetails.time}`)
    handleUpdateStatus(schedulingAppId, 'Interview Scheduled')
    setSchedulingAppId(null)
    setInterviewDetails({ date: '', time: '' })
  }

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginTop: '25px', textAlign: 'left', fontFamily: 'sans-serif' }}>
      <h3 style={{ marginTop: 0, color: '#333' }}>👥 Recruiter Applicants Console</h3>

      {/* Selector Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Select Job Pipeline:</label>
        <select 
          value={selectedJobId} 
          onChange={handleJobChange}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', fontSize: '14px', minWidth: '280px' }}
        >
          <option value="">-- Choose an open position --</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>{job.title} ({job.company})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>Retrieving applicants...</p>
      ) : !selectedJobId ? (
        <p style={{ color: '#777', fontStyle: 'italic' }}>Please select a job pipeline to view candidates.</p>
      ) : applicants.length === 0 ? (
        <p style={{ color: '#777', fontStyle: 'italic' }}>No candidates have applied to this position yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Applicant Name</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Email</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>AI Match Score</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Matched Skills</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Missing Skills</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid #eee', backgroundColor: app.applicationStatus === 'Rejected' ? '#fff0f0' : '#fff' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{app.candidateName || `Candidate #${app.userId || app.id}`}</td>
                  <td style={{ padding: '12px', color: '#555' }}>{app.candidateEmail || app.user?.email || 'sminusunil101@gmail.com'}</td>
                  
                  {/* AI Pill Column */}
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ 
                      backgroundColor: app.matchScore >= 70 ? '#e6f4ea' : '#fce8e6', 
                      color: app.matchScore >= 70 ? '#137333' : '#c5221f', 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontWeight: 'bold' 
                    }}>
                      {app.matchScore}%
                    </span>
                  </td>
                  
                  <td style={{ padding: '12px', color: '#137333' }}>{app.matchedSkills || 'None'}</td>
                  <td style={{ padding: '12px', color: '#c5221f' }}>{app.missingSkills || 'None'}</td>
                  
                  {/* Pipeline Status Banner */}
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                    <span style={{
                      fontSize: '12px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: app.applicationStatus === 'Shortlisted' ? '#d4edda' : app.applicationStatus === 'Rejected' ? '#f8d7da' : app.applicationStatus === 'Interview Scheduled' ? '#e8f0fe' : '#f1f3f4',
                      color: app.applicationStatus === 'Shortlisted' ? '#155724' : app.applicationStatus === 'Rejected' ? '#721c24' : app.applicationStatus === 'Interview Scheduled' ? '#1a73e8' : '#606367'
                    }}>
                      {app.applicationStatus || 'Applied'}
                    </span>
                  </td>

                  {/* Operational Interactive Actions Column */}
                  <td style={{ padding: '12px', display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'Shortlisted')}
                      disabled={app.applicationStatus === 'Shortlisted'}
                      style={{ padding: '5px 8px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      title="Shortlist Candidate"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setSchedulingAppId(app.id)}
                      style={{ padding: '5px 8px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      title="Schedule Interview Call"
                    >
                      📅
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                      disabled={app.applicationStatus === 'Rejected'}
                      style={{ padding: '5px 8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      title="Reject"
                    >
                      ✗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- Overlay Modal Container for Interview Scheduling --- */}
      {schedulingAppId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '300px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px' }}>Schedule Interview</h4>
            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Date:</label>
                <input type="date" required value={interviewDetails.date} onChange={e => setInterviewDetails(p => ({...p, date: e.target.value}))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Time:</label>
                <input type="time" required value={interviewDetails.time} onChange={e => setInterviewDetails(p => ({...p, time: e.target.value}))} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSchedulingAppId(null)} style={{ padding: '6px 10px', backgroundColor: '#bbb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                <button type="submit" style={{ padding: '6px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobApplicantsView