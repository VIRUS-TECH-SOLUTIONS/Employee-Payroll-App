const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'payroll_db'
});

// Employee routes
app.get('/api/employees', (req, res) => {
  db.query('SELECT * FROM employees ORDER BY name', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/employees', (req, res) => {
  const { name, role, salary } = req.body;
  db.query('INSERT INTO employees (name, role, salary) VALUES (?, ?, ?)', 
    [name, role, salary], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, name, role, salary });
  });
});

app.put('/api/employees/:id', (req, res) => {
  const { name, role, salary } = req.body;
  db.query('UPDATE employees SET name = ?, role = ?, salary = ? WHERE id = ?',
    [name, role, salary, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee updated' });
  });
});

app.delete('/api/employees/:id', (req, res) => {
  db.query('DELETE FROM employees WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Employee deleted' });
  });
});

// Payment routes
app.get('/api/payments', (req, res) => {
  db.query(`SELECT p.*, e.name, e.role FROM payments p 
    JOIN employees e ON p.employee_id = e.id 
    ORDER BY p.date DESC`, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/payments', (req, res) => {
  const { employee_id, amount, status } = req.body;
  db.query('INSERT INTO payments (employee_id, amount, status, date) VALUES (?, ?, ?, NOW())', 
    [employee_id, amount, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: result.insertId, employee_id, amount, status });
  });
});

app.put('/api/payments/:id', (req, res) => {
  const { status } = req.body;
  db.query('UPDATE payments SET status = ? WHERE id = ?', [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Payment updated' });
  });
});

app.listen(5001, () => console.log('Server running on port 5001'));