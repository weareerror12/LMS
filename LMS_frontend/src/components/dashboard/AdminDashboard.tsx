import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Video, Users, Calendar, FileText, Settings, TrendingUp, Award, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Course, Material, SystemOverview } from '../../types/api';
import FileUpload from '../ui/FileUpload';
import MeetingCreator from '../ui/MeetingCreator';
import NoticeCreator from '../ui/NoticeCreator';
import ActivityFeed from '../ui/ActivityFeed';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleUploadSuccess = () => {
    // Refresh dashboard data after successful upload
    fetchDashboardData();
  };

  const handleUserManagement = () => {
    navigate('/admin/users');
  };

  const handleCourseManagement = () => {
    navigate('/admin/courses');
  };

  const handleReports = () => {
    navigate('/admin/reports');
  };

  const fetchDashboardData = async () => {
    try {
      setError('');
      const [coursesData, overviewData] = await Promise.all([
        apiService.getCourses(),
        apiService.getSystemOverview()
      ]);

      setCourses(coursesData.courses.slice(0, 5)); // Get first 5 courses
      setSystemOverview(overviewData.overview);

      // Fetch materials for the first course if available
      if (coursesData.courses.length > 0) {
        const materialsData = await apiService.getMaterials(coursesData.courses[0].id);
        setMaterials(materialsData.materials.slice(0, 5)); // Get first 5 materials
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-purple-100">Manage content and oversee platform activities</p>
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
                {loading ? '...' : systemOverview?.overview.totalEnrollments || 0}
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
                {loading ? '...' : systemOverview?.overview.activeCourses || 0}
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
              <h3 className="text-sm font-medium text-gray-600">Video Lectures</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : systemOverview?.overview.totalLectures || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Study Materials</h3>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? '...' : systemOverview?.overview.totalMaterials || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Study Materials */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Study Materials</h2>
          </div>

          <div className="space-y-3 mb-4">
            {materials.length > 0 ? materials.map((material) => (
              <div key={material.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm">{material.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{material.type}</span>
                </div>
                <p className="text-sm text-gray-600">Uploaded {new Date(material.createdAt).toLocaleDateString()}</p>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{material.course.title}</span>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">No materials uploaded yet</p>
            )}
          </div>

          <FileUpload
            courses={courses}
            onUploadSuccess={handleUploadSuccess}
            uploadType="material"
          />
        </div>

        {/* Create Meetings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Video className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Meetings</h2>
          </div>

          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-500 text-center py-8">Create online meetings for your courses</p>
          </div>

          <MeetingCreator
            courses={courses}
            onMeetingCreated={handleUploadSuccess}
          />
        </div>

        {/* Create Notices */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Notices</h2>
          </div>

          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-500 text-center py-8">Post announcements and updates</p>
          </div>

          <NoticeCreator
            courses={courses}
            onNoticeCreated={handleUploadSuccess}
          />
        </div>
      </div>

      {/* Management Tools */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Management Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleUserManagement}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <Users className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">User Management</h3>
            <p className="text-sm text-gray-600">Manage all users in the system</p>
          </button>

          <button
            onClick={handleCourseManagement}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <BookOpen className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Course Management</h3>
            <p className="text-sm text-gray-600">Create and edit courses</p>
          </button>

          <button
            onClick={handleReports}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <TrendingUp className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Reports & Analytics</h3>
            <p className="text-sm text-gray-600">View system insights and analytics</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <ActivityFeed limit={8} />
      </div>

      {/* Recent Activity */}
      {/* <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">New student enrolled in Beginner course</span>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Tanaka Sensei uploaded new material</span>
            <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Video lecture published for N3 level</span>
            <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default AdminDashboard;