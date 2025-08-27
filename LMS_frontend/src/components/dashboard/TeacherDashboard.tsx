import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, FileText, Calendar, Users, BookOpen, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Course } from '../../types/api';
import FileUpload from '../ui/FileUpload';
import MeetingCreator from '../ui/MeetingCreator';
import NoticeCreator from '../ui/NoticeCreator';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeacherData = async () => {
    try {
      const coursesData = await apiService.getCourses();
      // Filter courses to only show those taught by current teacher
      const teacherCourses = coursesData.courses.filter(course =>
        course.teachers.some((teacher: any) => teacher.id === user?.id)
      );
      setCourses(teacherCourses);
    } catch (error) {
      console.error('Failed to fetch teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  const handleViewCourse = (course: Course) => {
    navigate(`/course/${course.id}`);
  };

  const handleUploadSuccess = () => {
    // Refresh teacher data after successful upload
    fetchTeacherData();
  };

  const handleViewStudents = () => {
    navigate('/students');
  };

  const handleScheduleClass = () => {
    // Scroll to meeting creator section
    document.getElementById('meeting-creator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-blue-100">Manage your classes and students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conduct Meeting */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Conduct Meeting</h2>
          </div>
          
          <div className="space-y-3">
            {courses.length > 0 ? courses.map((course) => (
              <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{course.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${course.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {course.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Created {new Date(course.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  <Users className="w-4 h-4 inline mr-1" />
                  {course._count?.enrollments || 0} students
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewCourse(course)}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Course
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {loading ? 'Loading courses...' : 'No courses assigned yet'}
              </p>
            )}
          </div>
        </div>

        {/* Share Notes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Share Notes</h2>
          </div>
          
          <div className="space-y-3 mb-4">
            {courses.length > 0 ? courses.slice(0, 3).map((course) => (
              <div key={course.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-900 text-sm">{course.title}</h3>
                  <span className="text-xs text-gray-500">{course._count?.materials || 0} materials</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{course.description || 'No description available'}</p>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  {course._count?.lectures || 0} lectures • {course._count?.meetings || 0} meetings
                </span>
              </div>
            )) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {loading ? 'Loading course details...' : 'No course details available'}
              </p>
            )}
          </div>
          
          <FileUpload
            courses={courses}
            onUploadSuccess={handleUploadSuccess}
            uploadType="material"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-lg text-left">
            <BookOpen className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900 mb-2">Upload Materials</h3>
            <p className="text-sm text-gray-600 mb-4">Share study resources</p>
            <FileUpload
              courses={courses}
              onUploadSuccess={handleUploadSuccess}
              uploadType="material"
            />
          </div>

          <button
            onClick={handleViewStudents}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
          >
            <Users className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">View Students</h3>
            <p className="text-sm text-gray-600">Manage class roster</p>
          </button>

          <button
            onClick={handleScheduleClass}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <Calendar className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Schedule Class</h3>
            <p className="text-sm text-gray-600">Plan upcoming sessions</p>
          </button>
          
          {/* <button className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-left">
            <MessageSquare className="w-8 h-8 text-red-600 mb-2" />
            <h3 className="font-medium text-gray-900">Class Discussion</h3>
            <p className="text-sm text-gray-600">Engage with students</p>
          </button> */}
        </div>
      </div>

      {/* Teacher Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Meeting */}
        <div id="meeting-creator" className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Schedule Meeting</h2>
          </div>

          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-500 text-center py-4">Create online meetings for your courses</p>
          </div>

          <MeetingCreator
            courses={courses}
            onMeetingCreated={handleUploadSuccess}
          />
        </div>

        {/* Create Notice */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Post Notice</h2>
          </div>

          <div className="space-y-3 mb-4">
            <p className="text-sm text-gray-500 text-center py-4">Share announcements with your students</p>
          </div>

          <NoticeCreator
            courses={courses}
            onNoticeCreated={handleUploadSuccess}
          />
        </div>
      </div>

      {/* Class Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> 
        {/* <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
              <p className="text-2xl font-bold text-blue-600">24</p>
            </div>
          </div>
        </div> */}
        
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Courses</h3>
              <p className="text-2xl font-bold text-green-600">
                {loading ? '...' : courses.filter(c => c.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
              <p className="text-2xl font-bold text-purple-600">
                {loading ? '...' : courses.reduce((sum, course) => sum + (course._count?.enrollments || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;