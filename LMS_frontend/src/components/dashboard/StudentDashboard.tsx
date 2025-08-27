import React from 'react';
import { Video, BookOpen, MessageSquare, Calendar, Play, Download, Clock, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  const upcomingMeetings = [
    {
      id: '1',
      title: 'Beginner Japanese Class',
      date: '2024-01-15',
      time: '10:00 AM',
      instructor: 'Tanaka Sensei',
      link: 'https://meet.google.com/abc-def-ghi'
    },
    {
      id: '2',
      title: 'Conversation Practice',
      date: '2024-01-16',
      time: '2:00 PM',
      instructor: 'Sato Sensei',
      link: 'https://meet.google.com/xyz-uvw-rst'
    }
  ];

  const studyMaterials = [
    {
      id: '1',
      title: 'Hiragana Practice Sheets',
      type: 'pdf',
      course: 'Beginner',
      uploadedAt: '2024-01-10'
    },
    {
      id: '2',
      title: 'Basic Greetings Audio',
      type: 'audio',
      course: 'Beginner',
      uploadedAt: '2024-01-12'
    },
    {
      id: '3',
      title: 'Grammar Lesson 1',
      type: 'video',
      course: 'Elementary',
      uploadedAt: '2024-01-14'
    }
  ];

  const recordedVideos = [
    {
      id: '1',
      title: 'Introduction to Japanese Writing Systems',
      duration: '45 min',
      course: 'Beginner',
      thumbnail: 'https://images.pexels.com/photos/5990267/pexels-photo-5990267.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '2',
      title: 'Basic Sentence Structure',
      duration: '38 min',
      course: 'Elementary',
      thumbnail: 'https://images.pexels.com/photos/5990265/pexels-photo-5990265.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <BookOpen className="w-5 h-5 text-red-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'audio':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-indigo-100">Continue your Japanese learning journey</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Join Meeting */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Join Meeting</h2>
            </div>
            
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-1">{meeting.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {meeting.date} at {meeting.time}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">Instructor: {meeting.instructor}</p>
                  <button className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Join Meeting
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* View Recorded Videos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Play className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Recorded Videos</h2>
            </div>
            
            <div className="space-y-3">
              {recordedVideos.map((video) => (
                <div key={video.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{video.title}</h3>
                    <p className="text-xs text-gray-600">{video.course}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{video.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Access Study Materials */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Study Materials</h2>
            </div>
            
            <div className="space-y-3">
              {studyMaterials.map((material) => (
                <div key={material.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  {getFileIcon(material.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{material.title}</h3>
                    <p className="text-xs text-gray-600">{material.course}</p>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Communication Tools */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-teal-100 rounded-lg">
            <MessageSquare className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Communication Tools</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <MessageSquare className="w-8 h-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Class Chat</h3>
            <p className="text-sm text-gray-600">Chat with classmates and teachers</p>
          </button>
          
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
            <Users className="w-8 h-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Study Groups</h3>
            <p className="text-sm text-gray-600">Join or create study groups</p>
          </button>
          
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <Calendar className="w-8 h-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Schedule</h3>
            <p className="text-sm text-gray-600">View your class schedule</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;