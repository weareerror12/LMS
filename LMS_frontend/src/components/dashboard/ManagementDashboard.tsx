import React from 'react';
import { Plus, Trash2, BookOpen, Calendar, Users, Settings, TrendingUp, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ManagementDashboard: React.FC = () => {
  const { user } = useAuth();

  const courses = [
    {
      id: '1',
      title: 'Beginner Japanese (N5)',
      students: 24,
      instructor: 'Tanaka Sensei',
      status: 'Active',
      startDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Elementary Japanese (N4)',
      students: 18,
      instructor: 'Sato Sensei',
      status: 'Active',
      startDate: '2024-01-20'
    },
    {
      id: '3',
      title: 'Intermediate Japanese (N3)',
      students: 12,
      instructor: 'Yamada Sensei',
      status: 'Upcoming',
      startDate: '2024-02-01'
    }
  ];

  const schedules = [
    {
      id: '1',
      course: 'Beginner Japanese',
      time: 'Mon, Wed, Fri - 10:00 AM',
      instructor: 'Tanaka Sensei',
      room: 'Room A'
    },
    {
      id: '2',
      course: 'Elementary Japanese',
      time: 'Tue, Thu - 2:00 PM',
      instructor: 'Sato Sensei',
      room: 'Room B'
    },
    {
      id: '3',
      course: 'Intermediate Japanese',
      time: 'Mon, Wed - 6:00 PM',
      instructor: 'Yamada Sensei',
      room: 'Room C'
    }
  ];

  const enrollments = [
    {
      id: '1',
      studentName: 'John Smith',
      course: 'Beginner Japanese',
      enrollDate: '2024-01-10',
      status: 'Active'
    },
    {
      id: '2',
      studentName: 'Emily Johnson',
      course: 'Elementary Japanese',
      enrollDate: '2024-01-12',
      status: 'Active'
    },
    {
      id: '3',
      studentName: 'David Chen',
      course: 'Intermediate Japanese',
      enrollDate: '2024-01-14',
      status: 'Pending'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-500 to-green-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Management Team Dashboard</h1>
        <p className="text-teal-100">Comprehensive course and enrollment management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Active Courses</h3>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Enrollments</h3>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
        
        {/* <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Scheduled Classes</h3>
              <p className="text-2xl font-bold text-gray-900">48</p>
            </div>
          </div>
        </div> */}
        
        {/* <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Completion Rate</h3>
              <p className="text-2xl font-bold text-gray-900">89%</p>
            </div>
          </div>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Courses */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Course Management</h2>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
              Add Course
            </button>
          </div>
          
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{course.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    course.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Instructor: {course.instructor}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Students: {course.students} • Start: {course.startDate}
                </p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                    Edit
                  </button>
                  <button className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remove Courses */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Recent Enrollments</h2>
          </div>
          
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{enrollment.studentName}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    enrollment.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {enrollment.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{enrollment.course}</p>
                <p className="text-sm text-gray-600 mb-2">Enrolled: {enrollment.enrollDate}</p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors">
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manage Schedules */}
      {/* <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Manage Schedules</h2>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Add Schedule
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Schedule</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Instructor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Room</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">{schedule.course}</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.time}</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.instructor}</td>
                  <td className="py-3 px-4 text-gray-600">{schedule.room}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
 */}
      {/* Manage Enrollments */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Settings className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Generate Reports</h3>
            <p className="text-sm text-gray-600">Course and enrollment reports</p>
          </button>
          
          {/* <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Schedule Overview</h3>
            <p className="text-sm text-gray-600">View all schedules</p>
          </button> */}
          
        
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;