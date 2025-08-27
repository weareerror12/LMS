const express = require('express');

// Define AuthRequest interface locally since we can't import types in CommonJS
interface AuthRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

type Role = 'ADMIN' | 'TEACHER' | 'HEAD' | 'MANAGEMENT' | 'STUDENT';

const requireRoles = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({
        error: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

// Specific role middleware functions
export const requireAdmin = requireRoles('ADMIN');
export const requireTeacher = requireRoles('TEACHER');
export const requireHead = requireRoles('HEAD');
export const requireManagement = requireRoles('MANAGEMENT');
export const requireStudent = requireRoles('STUDENT');

// Combined role requirements
const requireAdminOrHead = requireRoles('ADMIN', 'HEAD');
const requireTeacherOrHead = requireRoles('TEACHER', 'HEAD');
const requireManagementOrHead = requireRoles('MANAGEMENT', 'HEAD');
const requireStaff = requireRoles('ADMIN', 'TEACHER', 'HEAD', 'MANAGEMENT');

module.exports = {
  requireRoles,
  requireAdmin,
  requireTeacher,
  requireHead,
  requireManagement,
  requireStudent,
  requireAdminOrHead,
  requireTeacherOrHead,
  requireManagementOrHead,
  requireStaff
};