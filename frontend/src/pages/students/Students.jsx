import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationModal } from '../../components/common/Modal';
import { LoadingState, EmptyState, Pagination } from '../../components/common/UIStates';

export const Students = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Toggle status modal state
  const [toggleStudent, setToggleStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        studentService.getStudents(),
        classService.getClasses(),
      ]);
      setStudents(studentsRes?.students || []);
      setClasses(classesRes?.classes || []);
    } catch (err) {
      showToast(err.message || 'Failed to load students directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q) ||
        s.parentName?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.rollNo?.includes(q);

      const matchesClass =
        selectedClass === 'All' || s.classId === selectedClass || s.className?.includes(selectedClass);

      const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, search, selectedClass, selectedStatus]);

  // Paginated Students
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handleToggleConfirm = async () => {
    if (!toggleStudent) return;
    try {
      setActionLoading(true);
      const updated = await studentService.deactivateStudent(toggleStudent.id);
      showToast(
        `Student "${updated.firstName} ${updated.lastName}" marked as ${updated.status}.`,
        'success'
      );
      setIsModalOpen(false);
      setToggleStudent(null);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to update student status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredStudents.length) {
      showToast('No students available to export.', 'warning');
      return;
    }
    const headers = ['Student ID', 'First Name', 'Last Name', 'Class', 'Roll No', 'Parent Name', 'Phone', 'Total Fee', 'Paid Amount', 'Pending Fee', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.studentId,
      s.firstName,
      s.lastName,
      s.className,
      s.rollNo,
      s.parentName,
      s.phone,
      s.totalFee,
      s.paidAmount,
      s.totalFee - s.paidAmount,
      s.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_Oakridge_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Students roster exported as CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Title & Primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 font-headline">Student Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-tabular">
              {filteredStudents.length} Students
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage student enrollment, class allocations, profiles, and fee standing
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => navigate('/students/new')}
            className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name, roll no, student ID, or parent..."
            className="w-full h-9.5 pl-9 pr-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors"
          />
        </div>

        {/* Class Filter */}
        <div className="w-full md:w-52">
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Classes & Grades</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.className} {cls.section}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-36">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-9.5 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:border-blue-600"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {(search || selectedClass !== 'All' || selectedStatus !== 'All') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedClass('All');
              setSelectedStatus('All');
              setCurrentPage(1);
            }}
            className="h-9.5 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg shrink-0 transition-colors"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* 3. Main Data Table */}
      {loading ? (
        <LoadingState message="Loading students list..." />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon="school"
          title="No students match your criteria"
          description="Try clearing search keywords or changing the class filter to see more students."
          actionText="Enroll New Student"
          onAction={() => navigate('/students/new')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider h-10">
                  <th className="py-2.5 px-4">Student & ID</th>
                  <th className="py-2.5 px-4">Class & Roll</th>
                  <th className="py-2.5 px-4">Parent / Contact</th>
                  <th className="py-2.5 px-4 text-right">Fee Standing</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedStudents.map((student) => {
                  const pending = Math.max(0, Number(student.totalFee) - Number(student.paidAmount));
                  const feeStatus =
                    pending === 0
                      ? 'Fully Paid'
                      : student.paidAmount > 0
                      ? 'Partial'
                      : 'Overdue';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Student Profile Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              student.avatar ||
                              `https://api.dicebear.com/7.x/bottts/svg?seed=${student.studentId}`
                            }
                            alt={student.firstName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                          />
                          <div>
                            <div
                              onClick={() => navigate(`/students/${student.id}`)}
                              className="font-bold text-slate-900 hover:text-blue-700 cursor-pointer text-xs sm:text-sm"
                            >
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-tabular">
                              ID: {student.studentId}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class and Roll Number */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{student.className}</div>
                        <div className="text-[11px] text-slate-500 font-tabular">
                          Roll No: {student.rollNo || '—'}
                        </div>
                      </td>

                      {/* Parent and Contact */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{student.parentName}</div>
                        <div className="text-[11px] text-slate-500 font-tabular">{student.phone}</div>
                      </td>

                      {/* Fee Standing */}
                      <td className="py-3 px-4 text-right font-tabular">
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={feeStatus} size="sm" />
                          <div className="text-[11px] text-slate-500">
                            Paid: ₹{Number(student.paidAmount).toLocaleString('en-IN')} / ₹
                            {Number(student.totalFee).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </td>

                      {/* Enrollment Status */}
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={student.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Student Profile"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </button>

                          <button
                            onClick={() => navigate(`/students/${student.id}/edit`)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Student Info"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>

                          {pending > 0 && (
                            <button
                              onClick={() => navigate(`/fees/collect?studentId=${student.id}`)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Collect Pending Fee"
                            >
                              <span className="material-symbols-outlined text-base">payments</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setToggleStudent(student);
                              setIsModalOpen(true);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              student.status === 'Active'
                                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={student.status === 'Active' ? 'Deactivate Student' : 'Activate Student'}
                          >
                            <span className="material-symbols-outlined text-base">
                              {student.status === 'Active' ? 'person_off' : 'person'}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Confirmation Modal for Student Status Toggle */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setToggleStudent(null);
        }}
        onConfirm={handleToggleConfirm}
        title={toggleStudent?.status === 'Active' ? 'Deactivate Student Record?' : 'Reactivate Student Record?'}
        message={
          toggleStudent?.status === 'Active'
            ? `Are you sure you want to mark ${toggleStudent?.firstName} ${toggleStudent?.lastName} (${toggleStudent?.studentId}) as Inactive? They will be excluded from future attendance roll-calls.`
            : `Are you sure you want to reactivate ${toggleStudent?.firstName} ${toggleStudent?.lastName} (${toggleStudent?.studentId})?`
        }
        confirmText={toggleStudent?.status === 'Active' ? 'Deactivate Student' : 'Activate Student'}
        isDestructive={toggleStudent?.status === 'Active'}
        loading={actionLoading}
      />
    </div>
  );
};

export default Students;
