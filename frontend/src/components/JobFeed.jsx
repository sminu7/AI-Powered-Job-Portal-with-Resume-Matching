import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'

const JobFeed = forwardRef(({ onEditClick }, ref) => {
  const [jobs, setJobs] = useState([])

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job posting permanently?')) return

    try {
      const response = await fetch(`http://localhost:8080/api/jobs/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchJobs() // Reload remaining jobs
      } else {
        alert('Failed to delete the job posting.')
      }
    } catch (err) {
      console.error(err)
    }
  }

  useImperativeHandle(ref, () => ({
    refreshFeed() {
      fetchJobs()
    }
  }))

  return (
    <div style={{ textAlign: 'left' }}>
      <h3 style={{ color: '#333' }}>Active Job Openings ({jobs.length})</h3>
      {jobs.length === 0 ? (
        <p style={{ color: '#777', fontStyle: 'italic' }}>No job openings have been listed yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {jobs.map((job) => (
            <div key={job.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{job.title}</h4>
                  <strong style={{ display: 'block', color: '#333', marginBottom: '5px' }}>{job.company} — <span style={{ fontWeight: 'normal', color: '#666' }}>{job.location}</span></strong>
                </div>
                
                {/* Edit & Delete Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => onEditClick(job)} style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(job.id)} style={{ padding: '5px 10px', fontSize: '12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Delete
                  </button>
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#555', margin: '10px 0', whiteSpace: 'pre-line' }}>{job.description}</p>
              <span style={{ display: 'inline-block', padding: '3px 8px', backgroundColor: '#eee', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                {job.salaryRange}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
})

export default JobFeed