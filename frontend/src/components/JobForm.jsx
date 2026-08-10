import { useState, useEffect } from 'react'

function JobForm({ onJobPosted, editingJob, clearEditing }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salaryRange: '',
    description: ''
  })
  const [status, setStatus] = useState('')

  // If the recruiter clicks "Edit" on a job card, populate the form fields
  useEffect(() => {
    if (editingJob) {
      setFormData({
        title: editingJob.title || '',
        company: editingJob.company || '',
        location: editingJob.location || '',
        salaryRange: editingJob.salaryRange || '',
        description: editingJob.description || ''
      })
    } else {
      setFormData({ title: '', company: '', location: '', salaryRange: '', description: '' })
    }
  }, [editingJob])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Processing payload...')

    const url = editingJob 
      ? `http://localhost:8080/api/jobs/${editingJob.id}`
      : 'http://localhost:8080/api/jobs'
      
    const method = editingJob ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setStatus(editingJob ? 'Job updated successfully!' : 'Job posted successfully!')
        setFormData({ title: '', company: '', location: '', salaryRange: '', description: '' })
        if (clearEditing) clearEditing()
        if (onJobPosted) onJobPosted()
      } else {
        setStatus('Failed to process job configurations.')
      }
    } catch (error) {
      setStatus('Network connectivity error.')
    }
  }

  return (
    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', textAlign: 'left', marginBottom: '25px', border: '1px solid #eee' }}>
      <h3 style={{ marginTop: 0, color: '#333' }}>
        {editingJob ? '✏️ Modify Job Posting' : '💼 Post a New Job Opening'}
      </h3>
      {status && <p style={{ fontWeight: 'bold', color: 'green' }}>{status}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="text" name="title" placeholder="Job Title" value={formData.title} onChange={handleInputChange} required style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" name="company" placeholder="Company Name" value={formData.company} onChange={handleInputChange} required style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" name="location" placeholder="Location (e.g., Remote, NY)" value={formData.location} onChange={handleInputChange} required style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" name="salaryRange" placeholder="Salary Range (e.g., $80k - $100k)" value={formData.salaryRange} onChange={handleInputChange} required style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <textarea name="description" placeholder="Job Description & Required Technical Skills" value={formData.description} onChange={handleInputChange} required rows="4" style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', fontFamily: 'inherit' }} />
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: editingJob ? '#ffc107' : '#28a745', color: editingJob ? 'black' : 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingJob ? 'Update Posting' : 'Submit Job'}
          </button>
          
          {editingJob && (
            <button type="button" onClick={clearEditing} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default JobForm