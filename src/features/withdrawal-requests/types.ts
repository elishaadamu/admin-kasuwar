export interface SettlementInfo {
  accountNumber?: string | number
  bankName?: string
  accountName?: string
  name?: string
  accName?: string
  accNumber?: string | number
}

export interface WithdrawalRequest {
  _id: string
  transactionId?: string
  amount: number | string
  chargeAmount?: number | string
  netAmount?: number | string
  role?: string
  userModel?: string
  accName?: string
  accNumber?: string | number
  bankName?: string
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt?: string
  userDetails?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    virtualAccount?: SettlementInfo
  }
  user?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    virtualAccount?: SettlementInfo
  }
  settlementInfo?: SettlementInfo
  virtualAccount?: SettlementInfo
}

export type DeliveryRequest = WithdrawalRequest
