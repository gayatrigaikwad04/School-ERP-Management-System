import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { LoadingState } from '../../components/common/UIStates';

export const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    bloodGroup: 'O+',
    admissionDate: '',
    rollNo: '',
    classId: '',
    className: '',
    parentName: '',
    phone: '',
    address: '',
    totalFee: 30000,
    status: 'Active',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [student, classesRes] = await Promise.all([
          studentService.getStudentById(id),
          classService.getClasses(),
        ]);

        setClasses(classesRes?.classes || []);
        setFormData({
          studentId: student.studentId || '',
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          dateOfBirth: student.dateOfBirth || '',
          gender: student.gender || 'Male',
          bloodGroup: student.bloodGroup || 'O+',
          admissionDate: student.admissionDate || '',
          rollNo: student.rollNo || '',
          classId: student.classId || '',
          className: student.className || '',
          parentName: student.parentName || '',
          phone: student.phone || '',
          address: student.address || '',
          totalFee: student.totalFee || 30000,
          status: student.status || 'Active',
        });
      } catch (err) {
        showToast(err.message || 'Failed to load student for editing', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showToast]);

  const handleClassChange = (classId) => {
    const found = classes.find((c) => c.id === classId);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        classId: found.id,
        className: `${found.className} ${found.section}`,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast('First and last name are required.', 'error');
      return;
    }

    try {
      setSaving(true);
      await studentService.updateStudent(id, formData);
      showToast('Student profile updated successfully.', 'success');
      navigate(`/students/${id}`);
    } catch (err) {
      showToast(err.message || 'Failed to update student.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading student profile for editing..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/students" className="hover:text-blue-700">
          Students
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <Link to={`/students/${id}`} className="hover:text-blue-700">
          {formData.firstName} {formData.lastName}
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 font-semibold">Edit Profile</span>
      </nav>

      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 font-headline">Edit Student Details</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Update personal details, section assignment, guardian contact, or tuition fees
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID</label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 bg-slate-50 font-mono focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class & Section</label>
              <select
                value={formData.classId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} {c.section} {c.status === 'Inactive' ? '(Inactive)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Roll Number</label>
              <input
                type="text"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name</label>
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Annual Tuition Fee (₹)
              </label>
              <input
                type="number"
                value={formData.totalFee}
                onChange={(e) => setFormData({ ...formData, totalFee: Number(e.target.value) })}
                className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-bold font-tabular"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/students/${id}`)}
              className="h-9 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-9 px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              {saving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudent;
