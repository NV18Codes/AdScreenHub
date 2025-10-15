// Standardized Order Status Constants
// These status names must match exactly with the API expectations

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'Pending Payment',
  PAYMENT_FAILED: 'Payment Failed', 
  PENDING_APPROVAL: 'Pending Approval',
  DESIGN_REVISE: 'Design Revise',
  PENDING_DISPLAY_APPROVED: 'Pending Display (Approved)',
  IN_DISPLAY: 'In Display',
  COMPLETED: 'Completed',
  CANCELLED_FORFEITED: 'Cancelled - Forfeited',
  CANCELLED_REFUNDED: 'Cancelled - Refunded'
};

// Array of all statuses for dropdowns and filters
export const ALL_ORDER_STATUSES = [
  ORDER_STATUS.PENDING_PAYMENT,
  ORDER_STATUS.PAYMENT_FAILED,
  ORDER_STATUS.PENDING_APPROVAL,
  ORDER_STATUS.DESIGN_REVISE,
  ORDER_STATUS.PENDING_DISPLAY_APPROVED,
  ORDER_STATUS.IN_DISPLAY,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED_FORFEITED,
  ORDER_STATUS.CANCELLED_REFUNDED
];

// Status categories for dashboard stats
export const STATUS_CATEGORIES = {
  PENDING: [ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PENDING_APPROVAL],
  ACTIVE: [ORDER_STATUS.IN_DISPLAY, ORDER_STATUS.PENDING_DISPLAY_APPROVED],
  COMPLETED: [ORDER_STATUS.COMPLETED],
  CANCELLED: [ORDER_STATUS.CANCELLED_FORFEITED, ORDER_STATUS.CANCELLED_REFUNDED, ORDER_STATUS.PAYMENT_FAILED],
  REVISION: [ORDER_STATUS.DESIGN_REVISE]
};

// Status colors for UI display
export const STATUS_COLORS = {
  [ORDER_STATUS.PENDING_PAYMENT]: '#f59e0b', // amber
  [ORDER_STATUS.PAYMENT_FAILED]: '#ef4444', // red
  [ORDER_STATUS.PENDING_APPROVAL]: '#3b82f6', // blue
  [ORDER_STATUS.DESIGN_REVISE]: '#f59e0b', // amber
  [ORDER_STATUS.PENDING_DISPLAY_APPROVED]: '#8b5cf6', // purple
  [ORDER_STATUS.IN_DISPLAY]: '#10b981', // green
  [ORDER_STATUS.COMPLETED]: '#059669', // emerald
  [ORDER_STATUS.CANCELLED_FORFEITED]: '#6b7280', // gray
  [ORDER_STATUS.CANCELLED_REFUNDED]: '#6b7280' // gray
};

// Helper functions
export const isPendingStatus = (status) => STATUS_CATEGORIES.PENDING.includes(status);
export const isActiveStatus = (status) => STATUS_CATEGORIES.ACTIVE.includes(status);
export const isCompletedStatus = (status) => STATUS_CATEGORIES.COMPLETED.includes(status);
export const isCancelledStatus = (status) => STATUS_CATEGORIES.CANCELLED.includes(status);
export const isRevisionStatus = (status) => STATUS_CATEGORIES.REVISION.includes(status);

// Get status color for UI
export const getStatusColor = (status) => STATUS_COLORS[status] || '#6b7280';

// Check if order can be revised
export const canReviseOrder = (order) => {
  return order.status === ORDER_STATUS.DESIGN_REVISE;
};

// Check if order can be cancelled
export const canCancelOrder = (order) => {
  return [ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PENDING_APPROVAL, ORDER_STATUS.DESIGN_REVISE].includes(order.status);
};

// Check if order is paid (excludes failed payments)
export const isPaidOrder = (order) => {
  return ![
    ORDER_STATUS.PENDING_PAYMENT, 
    ORDER_STATUS.PAYMENT_FAILED, 
    ORDER_STATUS.CANCELLED_FORFEITED, 
    ORDER_STATUS.CANCELLED_REFUNDED
  ].includes(order.status);
};
