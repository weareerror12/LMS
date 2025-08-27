// API service layer for LMS frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  public async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const response = await this.request<{ token: string; user: any; message: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials)
      }
    );

    // Store token
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async register(userData: { email: string; password: string; name: string; role: string }) {
    return await this.request<{ user: any; message: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(userData)
      }
    );
  }

  async getProfile() {
    return await this.request<{ user: any }>('/auth/me');
  }

  // User management
  async getUsers() {
    return await this.request<{ users: any[] }>('/users');
  }

  async createUser(userData: { email: string; password: string; name: string; role: string }) {
    return await this.request<{ user: any; message: string }>(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify(userData)
      }
    );
  }

  // Course management
  async getCourses() {
    return await this.request<{ courses: any[] }>('/courses');
  }

  async getActiveCourses() {
    return await this.request<{ courses: any[] }>('/courses/active');
  }

  async getCourse(id: string) {
    return await this.request<{ course: any }>(`/courses/${id}`);
  }

  async createCourse(courseData: { title: string; description?: string; teacherIds?: string[] }) {
    return await this.request<{ course: any; message: string }>(
      '/courses',
      {
        method: 'POST',
        body: JSON.stringify(courseData)
      }
    );
  }

  async enrollInCourse(courseId: string, studentId?: string) {
    return await this.request<{ enrollment: any; message: string }>(
      `/courses/${courseId}/enroll`,
      {
        method: 'POST',
        body: JSON.stringify(studentId ? { studentId } : {})
      }
    );
  }

  // Materials
  async getMaterials(courseId: string) {
    return await this.request<{ materials: any[] }>(`/materials/course/${courseId}`);
  }

  async uploadMaterial(formData: FormData) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${this.baseURL}/materials`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async downloadMaterial(materialId: string) {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${this.baseURL}/materials/${materialId}/download`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }

  // Lectures
  async getLectures(courseId: string) {
    return await this.request<{ lectures: any[] }>(`/lectures/course/${courseId}`);
  }

  async createLecture(lectureData: { courseId: string; title: string; scheduledAt: string }) {
    return await this.request<{ lecture: any; message: string }>(
      '/lectures',
      {
        method: 'POST',
        body: JSON.stringify(lectureData)
      }
    );
  }

  // Meetings
  async getMeetings(courseId: string) {
    return await this.request<{ meetings: any[] }>(`/meetings/course/${courseId}`);
  }

  async createMeeting(meetingData: { courseId: string; title: string; meetLink: string }) {
    return await this.request<{ meeting: any; message: string }>(
      '/meetings',
      {
        method: 'POST',
        body: JSON.stringify(meetingData)
      }
    );
  }

  async joinMeeting(meetingId: string) {
    window.location.href = `${this.baseURL}/meetings/${meetingId}/join`;
  }

  // Notices
  async getNotices(courseId?: string) {
    const endpoint = courseId ? `/notices/course/${courseId}` : '/notices/general';
    return await this.request<{ notices: any[] }>(endpoint);
  }

  async createNotice(noticeData: { courseId?: string; title: string; body: string }) {
    return await this.request<{ notice: any; message: string }>(
      '/notices',
      {
        method: 'POST',
        body: JSON.stringify(noticeData)
      }
    );
  }

  // Reports
  async getEnrollmentStats() {
    return await this.request<{ enrollmentStats: any[]; totalCourses: number; totalEnrollments: number }>('/reports/enrollments');
  }

  async getActiveCoursesOverview() {
    return await this.request<{ activeCourses: any[]; totalActiveCourses: number }>('/reports/courses/active');
  }

  async getSystemOverview() {
    return await this.request<{ overview: any }>('/reports/overview');
  }

  // Logout helper
  logout() {
    localStorage.removeItem('auth_token');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;