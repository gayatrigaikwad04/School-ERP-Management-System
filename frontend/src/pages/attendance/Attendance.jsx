import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { attendanceService } from '../../services/attendanceService';
import { useToast } from '../../context/ToastContext';
import { LoadingState, EmptyState } from '../../components/common/UIStates';

export const Attendance = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-09-23');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Student Attendance Roster: array of { student, status: 'Present'|'Absent'|'Excused', remarks: '' }
  const [roster, setRoster] = useState([]);

  useEffect(() => {
    initAttendanceView();
  }, []);

  const initAttendanceView = async () => {
    try {
      setLoading(true);
      const classesRes = await classService.getClasses();
      const activeClasses = (classesRes?.classes || []).filter((c) => c.status === 'Active');
      setClasses(activeClasses);

      if (activeClasses.length > 0) {
        setSelectedClassId(activeClasses[0].id);
        loadClassRoster(activeClasses[0].id, selectedDate);
      } else {
        setLoading(false);
      }
    } catch (err) {
      showToast('Failed to initialize attendance view', 'error');
      setLoading(false);
    }
  };

  const loadClassRoster = async (classId, date) => {
    try {
      setLoading(true);
      // Fetch students belonging to this class
      const [studentsRes, attendanceRes] = await Promise.all([
        studentService.getStudents({ classId }),
        attendanceService.getAttendance({ date }),
      ]);

      const classStudents = (studentsRes?.students || []).filter((s) => s.status === 'Active');

      // Map with existing attendance records for this date
      const rosterList = classStudents.map((st) => {
        const existing = attendanceRes.find((a) => a.studentId === st.id || a.studentId === st.studentId);
        return {
          studentId: st.id,
          studentCode: st.studentId,
          studentName: `${st.firstName} ${st.lastName}`,
          avatar: st.avatar,
          rollNo: st.rollNo || '01',
          status: existing ? existing.status : 'Present', // Default to Present
          remarks: existing ? existing.remarks || '' : '',
        };
      });

      setRoster(rosterList);
    } catch (err) {
      showToast('Failed to load class roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (newClassId) => {
    setSelectedClassId(newClassId);
    loadClassRoster(newClassId, selectedDate);
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (selectedClassId) {
      loadClassRoster(selectedClassId, newDate);
    }
  };

  const handleStatusChange = (studentId, newStatus) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, status: newStatus } : item))
    );
  };

  const handleRemarksChange = (studentId, remarks) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remarks } : item))
    );
  };

  const handleMarkAll = (status) => {
    setRoster((prev) => prev.map((item) => ({ ...item, status })));
    showToast(`Marked all students in class as ${status}.`, 'info');
  };

  const handleSaveAttendance = async () => {
    if (roster.length === 0) {
      showToast('No students to save.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const records = roster.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        remarks: r.remarks,
      }));

      await attendanceService.saveAttendanceBatch({
        date: selectedDate,
        records,
      });

      showToast(`Daily attendance verified and saved for ${roster.length} students!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save attendance records.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const totalStudents = roster.length;
  const presentCount = roster.filter((r) => r.status === 'Present').length;
  const absentCount = roster.filter((r) => r.status === 'Absent').length;
  const excusedCount = roster.filter((r) => r.status === 'Excused').length;
  const attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 font-headline">Daily Attendance Roll-Call</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Register
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Mark morning check-in status, record tardiness or medical excuse notes
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/attendance/history')}
            className="h-9 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-base">history</span>
            <span>History Log</span>
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving || roster.length === 0}
            className="h-9 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                <span>Saving Register...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Save Roll-Call</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Class & Date Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Class Select */}
          <div className="w-full sm:w-60">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select Class Section
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:border-blue-600"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className} {cls.section} ({cls.classTeacherName || 'Teacher N/A'})
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="w-full sm:w-44">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Roll-Call Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full h-9.5 px-3 text-xs sm:text-sm rounded-lg border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Quick Batch Select Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-400 font-medium hidden lg:inline">Quick actions:</span>
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="h-8.5 px-3 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold transition-colors"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="h-8.5 px-3 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-tabular">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Enrolled In Section</span>
          <div className="text-xl font-bold text-slate-900 mt-0.5">{totalStudents} Students</div>
        </div>

        <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase">Present</span>
          <div className="text-xl font-bold text-emerald-800 mt-0.5 flex items-baseline gap-2">
            <span>{presentCount}</span>
            <span className="text-xs font-medium text-emerald-600">({attendanceRate}%)</span>
          </div>
        </div>

        <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-700 uppercase">Absent (Unexcused)</span>
          <div className="text-xl font-bold text-rose-800 mt-0.5">{absentCount}</div>
        </div>

        <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200 shadow-xs">
          <span className="text-[11px] font-semibold text-purple-700 uppercase">Excused / Medical</span>
          <div className="text-xl font-bold text-purple-800 mt-0.5">{excusedCount}</div>
        </div>
      </div>

      {/* Attendance Roster Table */}
      {loading ? (
        <LoadingState message="Fetching student roll-call roster..." />
      ) : roster.length === 0 ? (
        <EmptyState
          icon="fact_check"
          title="No active students enrolled in this section"
          description="Enroll students into this class section to start recording daily attendance."
          actionText="Enroll Student"
          onAction={() => navigate('/students/new')}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider h-10">
                  <th className="py-2.5 px-4 w-12 text-center">Roll</th>
                  <th className="py-2.5 px-4">Student Name & ID</th>
                  <th className="py-2.5 px-4 text-center">Attendance Status</th>
                  <th className="py-2.5 px-4">Remarks / Excuse Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roster.map((row) => (
                  <tr key={row.studentId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Roll No */}
                    <td className="py-3 px-4 text-center font-bold text-slate-700 font-tabular">
                      {row.rollNo}
                    </td>

                    {/* Student Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            row.avatar ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${row.studentCode}`
                          }
                          alt={row.studentName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 bg-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{row.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{row.studentCode}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status Pill Toggle Buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'Present')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                            row.status === 'Present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          <span>Present</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'Absent')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                            row.status === 'Absent'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          <span>Absent</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(row.studentId, 'Excused')}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                            row.status === 'Excused'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-purple-700'
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">medication</span>
                          <span>Excused</span>
                        </button>
                      </div>
                    </td>

                    {/* Remarks Input */}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="e.g. Fever, dental appointment, bus delay"
                        value={row.remarks}
                        onChange={(e) => handleRemarksChange(row.studentId, e.target.value)}
                        className="w-full h-8 px-2.5 rounded border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-blue-600 bg-slate-50/50 focus:bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              One attendance entry per student enforced by server. Re-saving updates today's records.
            </span>
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="h-9 px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>Confirm & Save Register</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
