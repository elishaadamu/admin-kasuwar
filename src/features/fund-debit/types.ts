export interface Transaction {
  _id: string
  amount: number
  type: string
  status: 'pending' | 'success' | 'failed'
  reference: string
  description: string
  userModel: string
  userId: {
    _id: string
    fullName: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface DeliveryRequest {
  _id: string
  createdAt: string
  deliveryDuration: string
  description: string
  isPaid: boolean
  receipientAddress: string
  receipientAltPhone?: string
  receipientLGA: string
  receipientName: string
  receipientPhone: string
  receipientState: string
  requestType: string
  senderAddress: string
  senderLGA: string
  senderName: string
  senderPhone: string
  senderState: string
  status: 'pending' | 'cancelled' | 'approved' | 'delivered'
  updatedAt: string
}

// Unified User type for all roles
export interface UserRoleBase {
  _id: string
  id?: string
  name?: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  role?: string
  status?: 'active' | 'inactive' | 'suspended' | 'pending'
  suspended?: boolean
  walletBalance?: number
  virtualAcc?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BDMUser extends UserRoleBase {
  role: 'bdm' | 'bd'
  managers?: any[]
}

export interface SMUser extends UserRoleBase {
  role: 'sales-manager' | 'sm'
}

export interface BDUser extends UserRoleBase {
  role: 'bd'
}

export interface AgentUser extends UserRoleBase {
  role: 'agent'
}

export interface DeliveryManUser extends UserRoleBase {
  role: 'delivery-man' | 'delivery'
  isApproved?: boolean
}

// Union type for all user types
export type FundDebitUser = BDMUser | SMUser | BDUser | AgentUser | DeliveryManUser

// Tab types
export type UserTabType = 'bdm' | 'sm'
