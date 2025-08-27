import React, { useState, useEffect } from 'react';
import { BookOpen, Video, Users, Calendar, FileText, Settings, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Course, Material, SystemOverview } from '../../types/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const handleUploadMaterial = () => {
    alert('Upload Material functionality would open a file upload dialog here.');
  };

  const handleUploadVideo = () => {
    alert('Upload Video functionality would open a video upload dialog here.');
  };

  const handleUserManagement = () => {
    alert('User Management functionality would navigate to user management page.');
  };

  const handleCourseManagement = () => {
    alert('Course Management functionality would navigate to course management page.');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
          
          <button
            onClick={handleUploadMaterial}
            className="w-full py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            Upload New Material
          </button>
        </div>

        {/* Post Video Lectures */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Video Lectures</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            {courses.length > 0 ? courses.slice(0, 3).map((course) => (
              <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 text-sm mb-1">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {course.teachers.map(t => t.name).join(', ')} • {course._count?.lectures || 0} lectures
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{course._count?.enrollments || 0} students</span>
                  <span className="text-xs text-gray-500">{course.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">No courses available</p>
            )}
          </div>
          
          <button
            onClick={handleUploadVideo}
            className="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Upload New Video
          </button>
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
            <p className="text-sm text-gray-600">Manage students and teachers</p>
          </button>

          <button
            onClick={handleCourseManagement}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
          >
            <BookOpen className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Course Management</h3>
            <p className="text-sm text-gray-600">Create and edit courses</p>
          </button>
          
        </div>
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