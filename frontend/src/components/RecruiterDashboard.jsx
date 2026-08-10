import React, { useState, useEffect } from 'react'

function RecruiterDashboard() {
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [candidates, setCandidates] = useState([])
  
  // Interview Modal States
  const [showModal, setShowModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [interviewDate, setInterviewDate] = useState('')
  const [interviewTime, setInterviewTime] = useState('')

  // 1. Fetch jobs on mount & when window/tab gets focus
  useEffect(() => {
    fetchJobs()

    const handleFocus = () => {
      fetchJobs()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // 2. Refresh candidate list whenever selectedJobId changes
  useEffect(() => {
    if (selectedJobId) {
      loadCandidatesForJob(selectedJobId)
    } else {
      setCandidates([])
    }
  }, [selectedJobId])

  const fetchJobs = () => {
    const savedJobs = JSON.parse(localStorage.getItem('app_jobs') || '[]')
    let currentJobs = savedJobs

    if (savedJobs.length === 0) {
      currentJobs = [
        { id: '1', title: 'Backend Developer' },
        { id: '2', title: 'Data Analyst' }
      ]
      localStorage.setItem('app_jobs', JSON.stringify(currentJobs))
    }

    setJobs(currentJobs)

    // Auto-select first job if none selected yet
    setSelectedJobId(prev => {
      if (!prev && currentJobs.length > 0) {
        return String(currentJobs[0].id)
      }
      return prev
    })

    // If a job is already selected, force reload its candidates
    if (selectedJobId) {
      loadCandidatesForJob(selectedJobId)
    }
  }

  // Read applicants from localStorage for selected pipeline
  const loadCandidatesForJob = (jobId) => {
    const allApps = JSON.parse(localStorage.getItem('app_applications') || '[]')
    
    // Strict string comparison prevents type mismatches
    const matchedCandidates = allApps.filter(app => String(app.jobId) === String(jobId))
    setCandidates(matchedCandidates)
  }

  const handleJobSelect = (e) => {
    const jobId = e.target.value
    setSelectedJobId(jobId)
    loadCandidatesForJob(jobId)
  }

  const handleShortlist = (candidateId) => {
    updateCandidateStatus(candidateId, 'Shortlisted')
  }

  const handleReject = (candidateId) => {
    updateCandidateStatus(candidateId, 'Rejected')
  }

  // Synchronize status updates to state and localStorage
  const updateCandidateStatus = (candidateId, newStatus, interviewInfo = null) => {
    setCandidates(prev =>
      prev.map(c => 
        c.id === candidateId 
          ? { ...c, status: newStatus, interviewInfo: interviewInfo || c.interviewInfo } 
          : c
      )
    )

    const allApps = JSON.parse(localStorage.getItem('app_applications') || '[]')
    const updatedAllApps = allApps.map(app => {
      if (app.id === candidateId) {
        return {
          ...app,
          status: newStatus,
          interviewInfo: interviewInfo || app.interviewInfo
        }
      }
      return app
    })
    localStorage.setItem('app_applications', JSON.stringify(updatedAllApps))
  }

  const openInterviewModal = (candidate) => {
    setSelectedCandidate(candidate)
    setShowModal(true)
  }

  const handleScheduleSubmit = (e) => {
    e.preventDefault()
    if (!interviewDate || !interviewTime) {
      alert('Please select both date and time for the interview.')
      return
    }

    const interviewInfo = `${interviewDate} at ${interviewTime}`
    updateCandidateStatus(selectedCandidate.id, 'Interview Scheduled', interviewInfo)

    alert(`Interview scheduled for ${selectedCandidate.name || selectedCandidate.email} on ${interviewInfo}`)
    setShowModal(false)
    setInterviewDate('')
    setInterviewTime('')
  }

  return (
    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50' }}>
        👥 Recruiter Applicants Console
      </h3>

      {/* Pipeline Select Dropdown */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#444' }}>Select Job Pipeline:</label>
        <select 
          value={selectedJobId} 
          onChange={handleJobSelect}
          style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', backgroundColor: '#fff', cursor: 'pointer', minWidth: '220px' }}
        >
          <option value="">-- Choose an open position --</option>
          {jobs.map(job => (
            <option key={job.id} value={String(job.id)}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {/* Candidate Table */}
      {!selectedJobId ? (
        <p style={{ color: '#777', fontStyle: 'italic', margin: 0 }}>Please select a job pipeline to view candidates.</p>
      ) : candidates.length === 0 ? (
        <p style={{ color: '#777', fontStyle: 'italic' }}>No applicants found for this position yet.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px' }}>Candidate</th>
                <th style={{ padding: '12px' }}>AI Match Score</th>
                <th style={{ padding: '12px' }}>Skill Gap Analysis</th>
                <th style={{ padding: '12px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(candidate => (
                <tr key={candidate.id} style={{ borderBottom: '1px solid #eee' }}>
                  
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>{candidate.name || 'Candidate'}</div>
                    <div style={{ fontSize: '12px', color: '#777' }}>{candidate.email}</div>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      backgroundColor: (candidate.matchScore || 0) >= 70 ? '#d4edda' : '#f8d7da',
                      color: (candidate.matchScore || 0) >= 70 ? '#155724' : '#721c24'
                    }}>
                      {candidate.matchScore || 0}% Match
                    </span>
                  </td>

                  <td style={{ padding: '12px', fontSize: '12px' }}>
                    <div style={{ color: '#28a745', marginBottom: '2px' }}>
                      ✓ {Array.isArray(candidate.matchedSkills) ? candidate.matchedSkills.join(', ') : 'None'}
                    </div>
                    <div style={{ color: '#dc3545' }}>
                      ✗ {Array.isArray(candidate.missingSkills) ? candidate.missingSkills.join(', ') : 'None'}
                    </div>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        candidate.status === 'Shortlisted' ? '#e2e3e5' :
                        candidate.status === 'Rejected' ? '#f8d7da' :
                        candidate.status === 'Interview Scheduled' ? '#cce5ff' : '#fff3cd',
                      color: 
                        candidate.status === 'Shortlisted' ? '#383d41' :
                        candidate.status === 'Rejected' ? '#721c24' :
                        candidate.status === 'Interview Scheduled' ? '#004085' : '#856404'
                    }}>
                      {candidate.status || 'Pending'}
                    </span>
                    {candidate.interviewInfo && (
                      <div style={{ fontSize: '11px', color: '#004085', marginTop: '4px' }}>
                        📅 {candidate.interviewInfo}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleShortlist(candidate.id)}
                        disabled={candidate.status === 'Shortlisted'}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          opacity: candidate.status === 'Shortlisted' ? 0.6 : 1
                        }}
                      >
                        Shortlist
                      </button>

                      <button
                        onClick={() => openInterviewModal(candidate)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#0056b3',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Schedule
                      </button>

                      <button
                        onClick={() => handleReject(candidate.id)}
                        disabled={candidate.status === 'Rejected'}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          opacity: candidate.status === 'Rejected' ? 0.6 : 1
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '8px',
            width: '350px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
          }}>
            <h4 style={{ marginTop: 0, color: '#2c3e50' }}>
              📅 Schedule Interview
            </h4>

            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Date:</label>
                <input 
                  type="date" 
                  value={interviewDate} 
                  onChange={e => setInterviewDate(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>Time:</label>
                <input 
                  type="time" 
                  value={interviewTime} 
                  onChange={e => setInterviewTime(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 14px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '8px 14px', backgroundColor: '#0056b3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecruiterDashboard