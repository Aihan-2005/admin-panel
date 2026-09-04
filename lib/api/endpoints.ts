export const API_ENDPOINTS = {

    
    

  adminLogin:
    '/admin/auth/login',

  adminMe:
    '/admin/auth/me',

  adminLogout:
    '/admin/auth/logout',


    
  lawyers:
    '/admin/lawyers',

  lawyer: (
    id: string,
  ) =>
    `/admin/lawyers/${id}`,

  lawyerState: (
    id: string,
  ) =>
    `/admin/lawyers/${id}/state`,

  lawyerAccountStatus: (
    id: string,
  ) =>
    `/admin/lawyers/${id}/account-status`,

  lawyerPassword: (
    id: string,
  ) =>
    `/admin/lawyers/${id}/password`,

  
  

  clients:
    '/admin/clients',

  client: (
    id: string,
  ) =>
    `/admin/clients/${id}`,

  clientAccountStatus: (
    id: string,
  ) =>
    `/admin/clients/${id}/account-status`,

    

  tickets:
    '/admin/tickets',

  ticket: (
    id: string,
  ) =>
    `/admin/tickets/${id}`,

  ticketReply: (
    id: string,
  ) =>
    `/admin/tickets/${id}/reply`,

  ticketStatus: (
    id: string,
  ) =>
    `/admin/tickets/${id}/status`,

    

  cases:
    '/admin/cases',

  
    
  soldAccounts:
    '/admin/sold-accounts',
} as const