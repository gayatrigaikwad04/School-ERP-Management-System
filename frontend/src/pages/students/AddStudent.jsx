import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { parentService } from '../../services/parentService';
import { feeService } from '../../services/feeService';
import { paymentService } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';

export const AddStudent = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Parent selection mode: 'existing' or 'new'
  const [parentMode, setParentMode] = useState('new');

  // Form State
  const [formData, setFormData] = useState({
    // Student Identity
    studentId: `OA-2026-0${Math.floor(100 + Math.random() * 900)}`,
    firstName: '',
    lastName: '',
    dateOfBirth: '2020-05-15',
    gender: 'Male',
    bloodGroup: 'O+',
    admissionDate: new Date().toISOString().split('T')[0],
    rollNo: '09',

    // Class Allocation
    classId: '',
    className: '',
    totalFee: 30000,

    // Parent Details
    parentId: '',
    parentName: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',

    // Initial Payment
    initialPayment: 0,
    paymentMode: 'Cash',
    paymentRef: '',
  });

  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [classesRes, parentsRes, feesRes] = await Promise.all([
          classService.getClasses(),
          parentService.getParents(),
          feeService.getFeeStructures(),
        ]);

        const classList = classesRes?.classes || [];
        setClasses(classList);
        setParents(parentsRes?.parents || []);
        setFeeStructures(feesRes || []);

        if (classList.length > 0) {
          const firstClass = classList[0];
          const matchedFee = feesRes?.find((f) => f.classId === firstClass.id);
          setFormData((prev) => ({
            ...prev,
            classId: firstClass.id,
            className: `${firstClass.className} ${firstClass.section}`,
            totalFee: matchedFee ? matchedFee.totalAnnualFee : 30000,
          }));
        }
      } catch (err) {
        showToast('Failed to load classes and parents list', 'error');
      }
    };

    fetchPrerequisites();
  }, [showToast]);

  const handleClassChange = (classId) => {
    const foundClass = classes.find((c) => c.id === classId);
    if (!foundClass) return;

    const matchedFee = feeStructures.find(
      (f) => f.classId === classId || f.className?.toLowerCase() === foundClass.className?.toLowerCase()
    );

    setFormData((prev) => ({
      ...prev,
      classId,
      className: `${foundClass.className} ${foundClass.section}`,
      totalFee: matchedFee ? matchedFee.totalAnnualFee : prev.totalFee,
    }));
  };

  const handleParentSelect = (parentId) => {
    const parent = parents.find((p) => p.id === parentId);
    if (parent) {
      setFormData((prev) => ({
        ...prev,
        parentId: parent.id,
        parentName: parent.name,
        phone: parent.phone,
        email: parent.email || '',
        address: parent.address || '',
        occupation: parent.occupation || '',
      }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formData.studentId.trim()) errors.studentId = 'Student ID is required.';
    if (!formData.classId) errors.classId = 'Please allocate a class section.';

    if (parentMode === 'new') {
      if (!formData.parentName.trim()) errors.parentName = 'Parent name is required.';
      if (!formData.phone.trim()) errors.phone = 'Contact phone number is required.';
    } else if (!formData.parentId) {
      errors.parentId = 'Please select a registered parent or switch to create new.';
    }

    if (Number(formData.initialPayment) > Number(formData.totalFee)) {
      errors.initialPayment = 'Initial payment cannot exceed total annual fee.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fix the errors in the admission form.', 'error');
      return;
    }

    try {
      setLoading(true);

      // 1. If creating a new parent, register parent first
      let parentRecordId = formData.parentId;
      if (parentMode === 'new') {
        const createdParent = await parentService.createParent({
          name: formData.parentName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          occupation: formData.occupation.trim(),
        });
        parentRecordId = createdParent.id;
      }

      // 2. Create Student Record
      const newStudent = await studentService.createStudent({
        studentId: formData.studentId.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        admissionDate: formData.admissionDate,
        rollNo: formData.rollNo,
        classId: formData.classId,
        className: formData.className,
        parentId: parentRecordId,
        parentName: formData.parentName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        totalFee: Number(formData.totalFee),
        paidAmount: Number(formData.initialPayment || 0),
      });

      // 3. If initial payment entered, create payment ledger record
      if (Number(formData.initialPayment) > 0) {
        await paymentService.createPayment({
          studentId: newStudent.id,
          amountPaid: Number(formData.initialPayment),
          paymentDate: formData.admissionDate,
          paymentMode: formData.paymentMode,
          refNumber: formData.paymentRef || `ADM-INIT-${Math.floor(1000 + Math.random() * 9000)}`,
          remarks: `Initial admission deposit for ${newStudent.firstName} ${newStudent.lastName}`,
        });
      }

      showToast(`Admission complete! Enrolled ${newStudent.firstName} ${newStudent.lastName}.`, 'success');
      navigate('/students');
    } catch (err) {
      showToast(err.message || 'Admission failed to save.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/students" className="hover:text-blue-700">
          Students
        </Link>
        <span className="material-symbols-outlined text-sm">chevron_right</span>
        <span className="text-slate-900 font-semibold">New Admission</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-headline">
            Student Admission & Enrollment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Register new student, assign class section, associate guardian, and collect initial bursar fee
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
          Academic Year 2026–27
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Student Identity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-200">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-base font-bold text-slate-900 font-headline">Student Identification</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID / Roll Prefix <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50 font-mono font-medium focus:bg-white focus:outline-none focus:border-blue-600"
              />
              {formErrors.studentId && <p className="text-[11px] text-rose-600 mt-1">{formErrors.studentId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Aarav"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
              {formErrors.firstName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.firstName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sharma"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
              {formErrors.lastName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Date</label>
              <input
                type="date"
                value={formData.admissionDate}
                onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Class Roll Number</label>
              <input
                type="text"
                placeholder="e.g. 09"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Class & Academic Allocation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-200">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h2 className="text-base font-bold text-slate-900 font-headline">Class & Academic Assignment</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class & Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.classId}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-medium"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.status === 'Inactive'}>
                    {c.className} {c.section} {c.status === 'Inactive' ? '(Section Inactive)' : ''}
                  </option>
                ))}
              </select>
              {formErrors.classId && <p className="text-[11px] text-rose-600 mt-1">{formErrors.classId}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
              <input
                type="text"
                readOnly
                value="2026–27"
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
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
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Parent / Guardian Association */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-5 border-b border-slate-200 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h2 className="text-base font-bold text-slate-900 font-headline">Parent / Guardian Information</h2>
            </div>
            {/* Toggle Mode */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setParentMode('new')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  parentMode === 'new' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600'
                }`}
              >
                + Register New Parent
              </button>
              <button
                type="button"
                onClick={() => setParentMode('existing')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  parentMode === 'existing' ? 'bg-white shadow-xs text-blue-700' : 'text-slate-600'
                }`}
              >
                Select Existing Parent
              </button>
            </div>
          </div>

          {parentMode === 'existing' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Registered Parent <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => handleParentSelect(e.target.value)}
                  className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                >
                  <option value="">-- Choose registered parent from directory --</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone}) — {p.parentId}
                    </option>
                  ))}
                </select>
                {formErrors.parentId && <p className="text-[11px] text-rose-600 mt-1">{formErrors.parentId}</p>}
              </div>

              {formData.parentId && (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block">Parent Name:</span>
                    <span className="font-semibold text-slate-800">{formData.parentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Phone:</span>
                    <span className="font-semibold text-slate-800">{formData.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Address:</span>
                    <span className="font-semibold text-slate-800">{formData.address || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parent / Guardian Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
                {formErrors.parentName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.parentName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (WhatsApp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="+91 98220 11223"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular"
                />
                {formErrors.phone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="parent@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="Flat / Building, Locality, City, PIN"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. IT Consultant, Civil Contractor"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Initial Fee Payment (Optional) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6">
          <div className="flex items-center gap-2 pb-3 mb-5 border-b border-slate-200">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              4
            </span>
            <h2 className="text-base font-bold text-slate-900 font-headline">
              Initial Fee Collection (Optional)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Amount Received (₹)
              </label>
              <input
                type="number"
                min="0"
                max={formData.totalFee}
                placeholder="0"
                value={formData.initialPayment}
                onChange={(e) => setFormData({ ...formData, initialPayment: Number(e.target.value) })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-tabular"
              />
              {formErrors.initialPayment && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.initialPayment}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI (GPay / PhonePe)</option>
                <option value="Bank Transfer">Bank Transfer (NEFT / IMPS)</option>
                <option value="Card">Debit / Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Ref #</label>
              <input
                type="text"
                placeholder="e.g. UPI-992140 / CSH-01"
                value={formData.paymentRef}
                onChange={(e) => setFormData({ ...formData, paymentRef: e.target.value })}
                className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/students')}
            disabled={loading}
            className="h-10 px-5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                <span>Enrolling Student...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">how_to_reg</span>
                <span>Complete Admission</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;
