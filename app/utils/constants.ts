export const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
} as const;

export const PERMISSIONS = {
  // User Permissions
  VIEW_PROFILE: 'view_profile',
  EDIT_PROFILE: 'edit_profile',
  BOOK_TICKETS: 'book_tickets',
  CANCEL_BOOKING: 'cancel_booking',
  VIEW_BOOKING_HISTORY: 'view_booking_history',

  // Admin Permissions
  MANAGE_MOVIES: 'manage_movies',
  MANAGE_THEATERS: 'manage_theaters',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  ASSIGN_MOVIES: 'assign_movies'
} as const;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.USER]: [
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.BOOK_TICKETS,
    PERMISSIONS.CANCEL_BOOKING,
    PERMISSIONS.VIEW_BOOKING_HISTORY
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.EDIT_PROFILE,
    PERMISSIONS.BOOK_TICKETS,
    PERMISSIONS.CANCEL_BOOKING,
    PERMISSIONS.VIEW_BOOKING_HISTORY,
    PERMISSIONS.MANAGE_MOVIES,
    PERMISSIONS.MANAGE_THEATERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.ASSIGN_MOVIES
  ]
};