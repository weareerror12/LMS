import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, BookOpen, Calendar, Activity, Settings, Eye, UserPlus, TrendingUp, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Course, SystemOverview } from '../../types/api';
import MeetingCreator from '../ui/MeetingCreator';
import ActivityFeed from '../ui/ActivityFeed';

const HeadDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Default overview structure to prevent undefined errors
  const defaultOverview = {
    totalUsers: 0,
    totalCourses: 0,
    activeCourses: 0,
    totalEnrollments: 0,
    totalMaterials: 0,
    totalLectures: 0,
    totalMeetings: 0,
    totalNotices: 0,
    recentActivities: 0
  };

  const fetchDashboardData = async () => {
    try {
      setError('');
      const [coursesData, overviewData] = await Promise.all([
        apiService.getCourses(),
        apiService.getSystemOverview()
      ]);

      setCourses(coursesData.courses || []);
      setSystemOverview(overviewData?.overview || null);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
      setCourses([]);
      setSystemOverview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUserManagement = () => {
    navigate('/admin/users');
  };

  const handleMeetingCreated = () => {
    fetchDashboardData();
  };

  const handleViewAllActivities = () => {
    navigate('/admin/activities');
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={fetchDashboardData}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Head Dashboard</h1>
        <p className="text-indigo-100">Oversee operations and manage staff</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : (systemOverview?.overview?.totalEnrollments ?? defaultOverview.totalEnrollments)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Active Courses</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : (systemOverview?.overview?.activeCourses ?? defaultOverview.activeCourses)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Total Meetings</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : (systemOverview?.overview?.totalMeetings ?? defaultOverview.totalMeetings)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Recent Activities</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : (systemOverview?.overview?.recentActivities ?? defaultOverview.recentActivities)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Student Count */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Course Student Count</h2>
          </div>

          <div className="space-y-3">
            {courses.length > 0 ? courses.map((course) => (
              <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm">{course.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${course.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {course.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    <Users className="w-4 h-4 inline mr-1" />
                    {course._count?.enrollments || 0} students
                  </span>
                  <span className="text-sm text-gray-600">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    {course._count?.materials || 0} materials
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">No courses available</p>
            )}
          </div>
        </div>

        {/* Meeting Oversight */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Meeting Oversight</h2>
          </div>

          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-500 text-center py-8">Create and oversee meetings across all courses</p>
          </div>

          <MeetingCreator
            courses={courses}
            onMeetingCreated={handleMeetingCreated}
          />
        </div>
      </div>

      {/* Management Tools */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Management Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleUserManagement}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <UserPlus className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Staff</h3>
            <p className="text-sm text-gray-600">Add and manage staff members</p>
          </button>

          <button
            onClick={handleViewAllActivities}
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-left"
          >
            <Activity className="w-8 h-8 text-orange-600 mb-2" />
            <h3 className="font-medium text-gray-900">View All Activities</h3>
            <p className="text-sm text-gray-600">Monitor system-wide activities</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent System Activities</h2>
          <button
            onClick={handleViewAllActivities}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <ActivityFeed limit={10} />
      </div>
    </div>
  );
};

export default HeadDashboard;