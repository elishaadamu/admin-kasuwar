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
  status: 'pending' | 'cancelled' | 'approved' | 'delivered' // Example statuses, adjust as needed
  updatedAt: string
}
