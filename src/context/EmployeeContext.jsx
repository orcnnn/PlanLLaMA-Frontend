import { createContext, useContext, useState, useEffect } from 'react'
import { getEmployeeByEmployeeId } from '../data/employees'

const EmployeeContext = createContext()

export function EmployeeProvider({ children }) {
  const [currentEmployee, setCurrentEmployee] = useState(null)

  // Load employee from localStorage on mount
  useEffect(() => {
    const savedEmployeeId = localStorage.getItem('currentEmployeeId')
    if (savedEmployeeId) {
      const employee = getEmployeeByEmployeeId(savedEmployeeId)
      if (employee) {
        setCurrentEmployee(employee)
      }
    }
  }, [])

  // Save employee to localStorage when it changes
  const selectEmployee = (employee) => {
    setCurrentEmployee(employee)
    if (employee) {
      localStorage.setItem('currentEmployeeId', employee.employee_id)
    } else {
      localStorage.removeItem('currentEmployeeId')
    }
  }

  const logout = () => {
    setCurrentEmployee(null)
    localStorage.removeItem('currentEmployeeId')
  }

  return (
    <EmployeeContext.Provider value={{ currentEmployee, selectEmployee, logout }}>
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployee() {
  const context = useContext(EmployeeContext)
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider')
  }
  return context
}

