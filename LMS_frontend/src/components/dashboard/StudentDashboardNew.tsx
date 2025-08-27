import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Course, Enrollment, Material, Meeting, Notice, Lecture } from '../../types/api';
import { BookOpen, Users, Calendar, FileText, Video, ExternalLink, Download, Clock } from 'lucide-react';

const StudentDashboardNew: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<{ [courseId: string]: Material[] }>({});
  const [meetings, setMeetings] = useState<{ [courseId: string]: Meeting[] }>({});
  const [notices, setNotices] = useState<{ [courseId: string]: Notice[] }>({});
  const [lectures, setLectures] = useState<{ [courseId: string]: Lecture[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // For now, fetch all active courses (in a real app, you'd have an endpoint to get user's enrolled courses)
      const coursesResponse = await apiService.getActiveCourses();
      setCourses(coursesResponse.courses);

      // Fetch materials, meetings, notices, and lectures for each course
      const materialsData: { [courseId: string]: Material[] } = {};
      const meetingsData: { [courseId: string]: Meeting[] } = {};
      const noticesData: { [courseId: string]: Notice[] } = {};
      const lecturesData: { [courseId: string]: Lecture[] } = {};

      for (const course of coursesResponse.courses) {
        try {
          const [materialsRes, meetingsRes, noticesRes, lecturesRes] = await Promise.all([
            apiService.getMaterials(course.id),
            apiService.getMeetings(course.id),
            apiService.getNotices(course.id),
            apiService.getLectures(course.id)
          ]);

          materialsData[course.id] = materialsRes.materials;
          meetingsData[course.id] = meetingsRes.meetings;
          noticesData[course.id] = noticesRes.notices;
          lecturesData[course.id] = lecturesRes.lectures;
        } catch (err) {
          console.error(`Error fetching data for course ${course.id}:`, err);
        }
      }

      setMaterials(materialsData);
      setMeetings(meetingsData);
      setNotices(noticesData);
      setLectures(lecturesData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async (meetingId: string) => {
    try {
      await apiService.joinMeeting(meetingId);
    } catch (err) {
      console.error('Error joining meeting:', err);
    }
  };

  const handleDownloadMaterial = async (materialId: string, fileName: string) => {
    try {
      const blob = await apiService.downloadMaterial(materialId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading material:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          You are enrolled in {courses.length} course{courses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Study Materials</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(materials).reduce((sum, mats) => sum + mats.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Video className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lectures</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(lectures).reduce((sum, lects) => sum + lects.length, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Meetings</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(meetings).reduce((sum, meets) => sum + meets.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">My Courses</h2>

        {courses.map(course => (
          <div key={course.id} className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                  <p className="text-gray-600 mt-1">{course.description}</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <span>Instructors: {course.teachers.map(t => t.name).join(', ')}</span>
                    <span>•</span>
                    <span>Status: {course.active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Notices */}
              {notices[course.id] && notices[course.id].length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Recent Notices
                  </h4>
                  <div className="space-y-2">
                    {notices[course.id].slice(0, 3).map(notice => (
                      <div key={notice.id} className="bg-gray-50 rounded p-3">
                        <h5 className="font-medium text-gray-900">{notice.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">{notice.body}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(notice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Lectures */}
              {lectures[course.id] && lectures[course.id].length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <Video className="w-5 h-5 mr-2" />
                    Upcoming Lectures
                  </h4>
                  <div className="space-y-2">
                    {lectures[course.id]
                      .filter(lecture => new Date(lecture.scheduledAt) > new Date())
                      .slice(0, 3)
                      .map(lecture => (
                        <div key={lecture.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                          <div>
                            <h5 className="font-medium text-gray-900">{lecture.title}</h5>
                            <p className="text-sm text-gray-600 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(lecture.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Meetings */}
              {meetings[course.id] && meetings[course.id].length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Meetings
                  </h4>
                  <div className="space-y-2">
                    {meetings[course.id].slice(0, 3).map(meeting => (
                      <div key={meeting.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{meeting.title}</h5>
                          <p className="text-sm text-gray-600">Created by: {meeting.createdBy}</p>
                        </div>
                        <button
                          onClick={() => handleJoinMeeting(meeting.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {materials[course.id] && materials[course.id].length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Study Materials
                  </h4>
                  <div className="space-y-2">
                    {materials[course.id].slice(0, 5).map(material => (
                      <div key={material.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                        <div>
                          <h5 className="font-medium text-gray-900">{material.title}</h5>
                          <p className="text-sm text-gray-600">Type: {material.type}</p>
                        </div>
                        <button
                          onClick={() => handleDownloadMaterial(material.id, material.title)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboardNew;