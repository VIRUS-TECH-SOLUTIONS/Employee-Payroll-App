import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [employees, setEmployees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({ name: '', role: '', salary: '' });
  const [paymentForm, setPaymentForm] = useState({ employee_id: '', amount: '', status: 'pending' });
  const [editing, setEditing] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchEmployees();
    fetchPayments();
  }, []);

  const fetchEmployees = async () => {
    const response = await fetch('http://localhost:5001/api/employees');
    const data = await response.json();
    setEmployees(data);
  };

  const fetchPayments = async () => {
    const response = await fetch('http://localhost:5001/api/payments');
    const data = await response.json();
    setPayments(data);
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    const url = editing ? `http://localhost:5001/api/employees/${editing}` : 'http://localhost:5001/api/employees';
    await fetch(url, {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeForm)
    });
    setEmployeeForm({ name: '', role: '', salary: '' });
    setEditing(null);
    fetchEmployees();
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5001/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentForm)
    });
    setPaymentForm({ employee_id: '', amount: '', status: 'pending' });
    fetchPayments();
  };

  const handleEdit = (employee) => {
    setEmployeeForm({ name: employee.name, role: employee.role, salary: employee.salary });
    setEditing(employee.id);
    setActiveTab('employees');
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5001/api/employees/${id}`, { method: 'DELETE' });
    fetchEmployees();
    fetchPayments();
  };

  const updatePaymentStatus = async (id, status) => {
    await fetch(`http://localhost:5001/api/payments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchPayments();
  };

  return (
    <div className="App">
      <h1>Employee Payroll System</h1>
      
      <nav>
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}>Dashboard</button>
        <button onClick={() => setActiveTab('employees')} className={activeTab === 'employees' ? 'active' : ''}>Employees</button>
        <button onClick={() => setActiveTab('payments')} className={activeTab === 'payments' ? 'active' : ''}>Payments</button>
      </nav>

      {activeTab === 'dashboard' && (
        <div className="dashboard">
          <div className="stats">
            <div className="stat-card">
              <h3>Total Employees</h3>
              <p>{employees.length}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Payments</h3>
              <p>{payments.filter(p => p.status === 'pending').length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Salary</h3>
              <p>${employees.reduce((sum, emp) => sum + parseFloat(emp.salary), 0).toFixed(2)}</p>
            </div>
          </div>
          
          <h3>Recent Payments</h3>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 5).map(payment => (
                <tr key={payment.id}>
                  <td>{payment.name}</td>
                  <td>${payment.amount}</td>
                  <td className={payment.status}>{payment.status}</td>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                  <td>
                    {payment.status === 'pending' && (
                      <button onClick={() => updatePaymentStatus(payment.id, 'paid')}>Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'employees' && (
        <div>
          <form onSubmit={handleEmployeeSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Role"
              value={employeeForm.role}
              onChange={(e) => setEmployeeForm({...employeeForm, role: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Salary"
              value={employeeForm.salary}
              onChange={(e) => setEmployeeForm({...employeeForm, salary: e.target.value})}
              required
            />
            <button type="submit">{editing ? 'Update' : 'Add'} Employee</button>
            {editing && <button type="button" onClick={() => {setEditing(null); setEmployeeForm({ name: '', role: '', salary: '' });}}>Cancel</button>}
          </form>

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.role}</td>
                  <td>${employee.salary}</td>
                  <td>
                    <button onClick={() => handleEdit(employee)}>Edit</button>
                    <button onClick={() => handleDelete(employee.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <form onSubmit={handlePaymentSubmit}>
            <select
              value={paymentForm.employee_id}
              onChange={(e) => setPaymentForm({...paymentForm, employee_id: e.target.value})}
              required
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
              required
            />
            <select
              value={paymentForm.status}
              onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
            <button type="submit">Add Payment</button>
          </form>

          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.name}</td>
                  <td>{payment.role}</td>
                  <td>${payment.amount}</td>
                  <td className={payment.status}>{payment.status}</td>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                  <td>
                    {payment.status === 'pending' && (
                      <>
                        <button onClick={() => updatePaymentStatus(payment.id, 'paid')}>Mark Paid</button>
                        <button onClick={() => updatePaymentStatus(payment.id, 'cancelled')}>Cancel</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;