export interface DashboardStats {
  accounts: {
    clients: {
      total: number
      active: number
      suspended: number
    }

    lawyers: {
      total: number
      active: number
      suspended: number
    }
  }

  lawyerProfiles: {
    total: number

    pendingVerification: number

    active: number

    suspended: number

    rejected: number
  }

  tickets: {
    total: number

    open: number

    inProgress: number

    waitingForLawyer: number

    resolved: number

    closed: number
  }
}