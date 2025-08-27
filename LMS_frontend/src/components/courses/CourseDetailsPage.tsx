import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Course, Material, Lecture, Meeting, Notice } from '../../types/api';
import { BookOpen, Video, Calendar, FileText, Users, ArrowLeft, Download, ExternalLink } from 'lucide-react';

const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'materials' | 'lectures' | 'meetings' | 'notices'>('materials');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      try {
        const courseData = await apiService.getCourse(courseId);
        setCourse(courseData.course);
      } catch (error) {
        console.error('Failed to fetch course details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleDownload = async (material: Material) => {
    setDownloading(material.id);
    try {
      const blob = await apiService.downloadMaterial(material.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = material.title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download material:', error);
      alert('Failed to download the file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const handleJoinMeeting = (meeting: Meeting) => {
    window.open(meeting.meetLink, '_blank');
  };

  const isEnrolled = () => {
    if (!user || !course) return false;
    return course.enrollments.some((enrollment: any) => enrollment.studentId === user.id);
  };

  const handleEnroll = async () => {
    if (!course || !user) return;

    try {
      await apiService.enrollInCourse(course.id);
      // Refresh course data
      const courseData = await apiService.getCourse(course.id);
      setCourse(courseData.course);
      alert('Successfully enrolled in the course!');
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll in the course. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                <p className="mt-1 text-gray-600">by {course.teachers.map(t => t.name).join(', ')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm rounded-full ${
                course.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {course.active ? 'Active' : 'Inactive'}
              </span>
              {!isEnrolled() && user?.role === 'STUDENT' && (
                <button
                  onClick={handleEnroll}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Enroll Now
                </button>
              )}
              {isEnrolled() && (
                <span className="px-4 py-2 bg-green-100 text-green-800 rounded-md">
                  ✓ Enrolled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Course Description */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Description</h2>
          <p className="text-gray-600">{course.description || 'No description available.'}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{course._count?.enrollments || 0}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{course._count?.materials || 0}</div>
              <div className="text-sm text-gray-600">Materials</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                <Video className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{course._count?.lectures || 0}</div>
              <div className="text-sm text-gray-600">Lectures</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{course._count?.meetings || 0}</div>
              <div className="text-sm text-gray-600">Meetings</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { id: 'materials', label: 'Materials', icon: FileText },
                { id: 'lectures', label: 'Lectures', icon: Video },
                { id: 'meetings', label: 'Meetings', icon: Calendar },
                { id: 'notices', label: 'Notices', icon: BookOpen }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Course Materials</h3>
                {course.materials.length === 0 ? (
                  <p className="text-gray-600">No materials available for this course.</p>
                ) : (
                  <div className="space-y-4">
                    {course.materials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{material.title}</h4>
                            <p className="text-sm text-gray-600">
                              {material.type} • Uploaded {new Date(material.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(material)}
                          disabled={downloading === material.id}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          {downloading === material.id ? 'Downloading...' : 'Download'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Lectures Tab */}
            {activeTab === 'lectures' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lectures</h3>
                {course.lectures.length === 0 ? (
                  <p className="text-gray-600">No lectures scheduled for this course.</p>
                ) : (
                  <div className="space-y-4">
                    {course.lectures.map((lecture) => (
                      <div key={lecture.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{lecture.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Scheduled for {new Date(lecture.scheduledAt).toLocaleDateString()} at{' '}
                              {new Date(lecture.scheduledAt).toLocaleTimeString()}
                            </p>
                            {lecture.recordPath && (
                              <p className="text-sm text-green-600 mt-1">✓ Recording available</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Meetings Tab */}
            {activeTab === 'meetings' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Meetings</h3>
                {course.meetings.length === 0 ? (
                  <p className="text-gray-600">No meetings scheduled for this course.</p>
                ) : (
                  <div className="space-y-4">
                    {course.meetings.map((meeting) => (
                      <div key={meeting.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{meeting.title}</h4>
                          <p className="text-sm text-gray-600">
                            Created {new Date(meeting.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Join Meeting
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Notices Tab */}
            {activeTab === 'notices' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notices</h3>
                {course.notices.length === 0 ? (
                  <p className="text-gray-600">No notices for this course.</p>
                ) : (
                  <div className="space-y-4">
                    {course.notices.map((notice) => (
                      <div key={notice.id} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{notice.title}</h4>
                        <p className="text-gray-600 mb-3">{notice.body}</p>
                        <p className="text-sm text-gray-500">
                          Posted {new Date(notice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;