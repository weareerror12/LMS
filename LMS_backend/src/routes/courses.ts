const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { requireAdminRoles, requireTeacherOrHead, requireStaff } = require('../middleware/roles');

const router = Router();
const prisma = new PrismaClient();

// Define AuthRequest interface locally since we can't import types in CommonJS
interface AuthRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Get all courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true,
            materials: true,
            lectures: true,
            meetings: true,
            notices: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active courses
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { active: true },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get active courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get course by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        materials: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        lectures: {
          orderBy: {
            scheduledAt: 'asc'
          }
        },
        meetings: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        notices: {
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            enrollments: true,
            materials: true,
            lectures: true,
            meetings: true,
            notices: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create course - Teacher/Admin/Head/Management only
router.post('/', authenticateToken, requireTeacherOrHead, async (req, res) => {
  try {
    const { title, description, teacherIds } = req.body;

    // Validate input
    if (!title) {
      return res.status(400).json({ error: 'Course title is required' });
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        teachers: {
          connect: teacherIds?.map((id: string) => ({ id })) || []
        }
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'created course',
          entity: 'Course',
          entityId: course.id
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update course - Teacher/Admin/Head/Management only (teachers can only update their own courses)
router.put('/:id', authenticateToken, requireTeacherOrHead, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, active, teacherIds } = req.body;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        teachers: {
          select: {
            id: true
          }
        }
      }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if teacher has permission to update this course
    if (req.user.role === 'TEACHER') {
      const isTeacherOfCourse = existingCourse.teachers.some(teacher => teacher.id === req.user.id);
      if (!isTeacherOfCourse) {
        return res.status(403).json({ error: 'You can only update courses you teach' });
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (active !== undefined) updateData.active = active;

    if (teacherIds) {
      updateData.teachers = {
        set: [], // Clear existing teachers
        connect: teacherIds.map((teacherId: string) => ({ id: teacherId }))
      };
    }

    // Update course
    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'updated course',
          entity: 'Course',
          entityId: course.id
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.json({
      message: 'Course updated successfully',
      course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete course - Teacher/Admin/Head/Management only (teachers can only delete their own courses)
router.delete('/:id', authenticateToken, requireTeacherOrHead, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        teachers: {
          select: {
            id: true
          }
        }
      }
    });

    if (!existingCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if teacher has permission to delete this course
    if (req.user.role === 'TEACHER') {
      const isTeacherOfCourse = existingCourse.teachers.some(teacher => teacher.id === req.user.id);
      if (!isTeacherOfCourse) {
        return res.status(403).json({ error: 'You can only delete courses you teach' });
      }
    }

    // Delete course (this will cascade delete related records)
    await prisma.course.delete({
      where: { id }
    });

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'deleted course',
          entity: 'Course',
          entityId: id
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enroll student in course
router.post('/:id/enroll', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id: courseId } = req.params;
    const { studentId } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Students can only enroll themselves, staff can enroll anyone
    const targetStudentId = req.user.role === 'STUDENT' ? req.user.id : studentId;

    if (!targetStudentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Check if course exists and is active
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (!course.active) {
      return res.status(400).json({ error: 'Course is not active' });
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: targetStudentId }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.role !== 'STUDENT') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: targetStudentId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Student already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: targetStudentId,
        courseId
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'enrolled student',
          entity: 'Enrollment',
          entityId: enrollment.id
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.status(201).json({
      message: 'Student enrolled successfully',
      enrollment
    });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unenroll student from course
router.delete('/:id/enroll/:studentId', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { id: courseId, studentId } = req.params;

    // Check if enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: {
        studentId_courseId: {
          studentId,
          courseId
        }
      }
    });

    // Create activity record
    try {
      await prisma.activity.create({
        data: {
          actorId: req.user.id,
          action: 'unenrolled student',
          entity: 'Enrollment',
          entityId: `${studentId}_${courseId}`
        }
      });
    } catch (activityError) {
      console.error('Failed to create activity:', activityError);
    }

    res.json({
      message: 'Student unenrolled successfully'
    });
  } catch (error) {
    console.error('Unenroll student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get teacher's courses with student counts - Teacher only
router.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (req.user.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Access denied. Teachers only.' });
    }

    const courses = await prisma.course.findMany({
      where: {
        teachers: {
          some: {
            id: req.user.id
          }
        }
      },
      include: {
        teachers: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ courses });
  } catch (error) {
    console.error('Get teacher courses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;