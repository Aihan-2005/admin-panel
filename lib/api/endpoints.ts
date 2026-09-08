export const API_ENDPOINTS = {

  
  

  authLogin: '/auth/login',

  authRefresh: '/auth/refresh',

  authMe: '/auth/me',

  authLogout: '/auth/logout',

  

  dashboard: '/admin/dashboard',

  

  lawyers: '/admin/lawyers',

  lawyer: (id: string) =>
    `/admin/lawyers/${id}`,

  lawyerStatus: (id: string) =>
    `/admin/lawyers/${id}/status`,

  lawyerAccountStatus: (id: string) =>
    `/admin/lawyers/${id}/account-status`,

  lawyerPassword: (id: string) =>
    `/admin/lawyers/${id}/password`,

  

  clients: '/admin/clients',

  client: (id: string) =>
    `/admin/clients/${id}`,

  clientAccountStatus: (id: string) =>
    `/admin/clients/${id}/account-status`,

  clientPassword: (id: string) =>
    `/admin/clients/${id}/password`,

  

  tickets: '/admin/tickets',

  ticket: (id: string) =>
    `/admin/tickets/${id}`,

  ticketStatus: (id: string) =>
    `/admin/tickets/${id}/status`,

  ticketMessages: (id: string) =>
    `/admin/tickets/${id}/messages`,

  ticketMessageAttachment: (
    ticketId: string,
    messageId: string,
  ) =>
    `/admin/tickets/${ticketId}/messages/${messageId}/attachment`,
} as const