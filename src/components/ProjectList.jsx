import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import { employees } from '../data/employees'
import { getEnrichedTasks } from '../data/tasks'
import { projects as initialProjects } from '../data/projects'

function ProjectList({ role }) {
  const navigate = useNavigate()

  // Modal state for editing only
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

  // Mock data - will be replaced with API calls
  const [projects, setProjects] = useState(initialProjects)
  
  // Get enriched tasks with names for project members
  const tasks = useMemo(() => getEnrichedTasks(), [])

  const handleNewProject = () => {
    navigate('/pm/new-project')
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setShowModal(true)
  }

  const handleSaveProject = (project) => {
    if (editingProject) {
      // Update existing project
      setProjects(prev => prev.map(p => p.project_id === project.project_id ? project : p))
    }
  }

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.project_id !== projectId))
    }
  }

  const handleClick = (project) => {
    // Role'e göre doğru path'e yönlendir
    const basePath = role === 'pm' ? '/pm' : '/executor'
    // URL için numeric ID kullan (backward compatibility)
    const numericId = project.project_id.replace('p', '').replace(/^0+/, '') || '1'
    navigate(`${basePath}/projects/${numericId}`)
  }

  // Her proje için çalışanları hesapla
  const getProjectMembers = (projectName) => {
    // Bu projedeki taskların assignee'lerini bul
    const projectTasks = tasks.filter(task => task.project === projectName)
    const uniqueAssignees = [...new Set(projectTasks.map(task => task.assignee))]
    
    // Assignee isimlerine göre employee bilgilerini bul
    return uniqueAssignees.map(assigneeName => 
      employees.find(emp => emp.name === assigneeName)
    ).filter(Boolean) // undefined olanları filtrele
  }

  return (
      <div className="projects-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Projects</h5>
          {role === 'pm' && (
              <button className="btn btn-primary btn-sm" onClick={handleNewProject}>
                + New Project
              </button>
          )}
        </div>

        <div className="row">
          {projects.length === 0 ? (
              <div className="col-12">
                <div className="alert alert-info">
                  No projects yet. Click "New Project" to create one!
                </div>
              </div>
          ) : (
              projects.map(project => (
                  <div key={project.project_id} className="col-md-6 col-lg-4 mb-3">
                    <ProjectCard
                        project={project}
                        role={role}
                        members={getProjectMembers(project.name)}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        onClick={() => handleClick(project)}
                    />
                  </div>
              ))
          )}
        </div>

        {/* Project Modal - Only for editing */}
        <ProjectModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveProject}
            project={editingProject}
        />
      </div>
  )
}

export default ProjectList