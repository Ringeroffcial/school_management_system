import React, { useState, useEffect, useMemo } from 'react';

const App = () => {
  const [input, setInput] = useState({
    name: '',
    age: '',
    course: ''
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false); // 🆕 Prevent rapid submits

  // Handle form input
  const handleInput = (e) => {
    const { name, value } = e.target;
    setInput(prev => ({ ...prev, [name]: value }));
  };

  // Fetch students
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/students");
        if (!response.ok) throw new Error('Failed to fetch students');
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Submit form (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); // 🆕 Set submitting state
    try {
      let res;
      if (editId) {
        res = await fetch(`http://localhost:3000/students/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
      } else {
        res = await fetch('http://localhost:3000/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
      }

      if (!res.ok) throw new Error(editId ? 'Failed to update student' : 'Failed to add student');

      const updatedStudent = await res.json();

      if (editId) {
        setStudents(prev => prev.map(student =>
          student._id === editId ? updatedStudent : student
        ));
      } else {
        setStudents(prev => [...prev, updatedStudent]);
      }

      setInput({ name: '', age: '', course: '' });
      setEditId(null);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setSubmitting(false); // 🆕 Done submitting
    }
  };

  // Delete student
  const deleteStudent = async (id) => {
    try {
      const res = await fetch(`http://localhost:3000/students/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete student');
      setStudents(prev => prev.filter(student => student._id !== id));
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    }
  };

  // Set student for editing
  const editStudent = (student) => {
    setInput({
      name: student.name,
      age: student.age,
      course: student.course
    });
    setEditId(student._id);
  };

  // 🧠 Optimized filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="app-container">
      <div className="hero-banner">
        <div className="overlay"></div>
        <img src="/studentsBackground.jpg" alt="Students background" className="hero-image" />
        <h1 className="hero-title">Student Management System</h1>
      </div>

      <div className="content-container">
        <div className="form-card">
          <h2 className="form-title">{editId ? 'Edit Student' : 'Add New Student'}</h2>
          <form onSubmit={handleSubmit} className="student-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={input.name}
                onChange={handleInput}
                className="form-input"
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age" className="form-label">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={input.age}
                onChange={handleInput}
                className="form-input"
                placeholder="18"
                min="16"
                max="99"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="course" className="form-label">Course</label>
              <input
                type="text"
                id="course"
                name="course"
                value={input.course}
                onChange={handleInput}
                className="form-input"
                placeholder="Computer Science"
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : editId ? 'Update Student' : 'Add Student'}
            </button>

            {editId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setInput({ name: '', age: '', course: '' });
                  setEditId(null);
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* 🔍 Search Input */}
        <input
          type="text"
          placeholder="Find Student"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="student-list">
          <h2 className="section-title">Student Records</h2>

          {filteredStudents.length > 0 ? (
            <div className="table-responsive">
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Course</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    student?._id && (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.age}</td>
                        <td>{student.course}</td>
                        <td className="actions">
                          <button
                            className="edit-btn"
                            onClick={() => editStudent(student)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => deleteStudent(student._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-records">No student records found</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default App;
