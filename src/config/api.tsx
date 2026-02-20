export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/bdm/register',
      SIGNIN: '/auth/login-admin',
    },
    ADMIN: {
      CURRENT_STATS: '/admin/current-stats/',
      TRANSFER: '/admin/transfer/',
      DEBIT: '/admin/debit/',
      REWARD_CONFIG: '/admin/rewards/config',
      REWARD_CONFIG_UPDATE: '/admin/rewards/config',
      REWARD_CONFIG_STATUS: '/admin/rewards/config',
    },
    CATEGORY: {
      CREATE: '/category/',
      GET: '/category/',
      UPDATE: '/category/',
      DELETE: '/category/',
    },
    PRODUCT: {
      CREATE: '/admin/products/',
      GET: '/admin/products/',
      UPDATE: '/admin/products/',
      DELETE: '/admin/products/',
      VIEW: '/admin/products/',
    },
    USER: {
      UPDATE: '/admin/update-profile/',
      GET_DOWNLINES: '/bdm/entities/',
      CREATE: '/bdm/register-downline',
      SUSPEND_AGENT: '/bdm/suspend-agent',
      CREATE_AGENT: '/agent/create-user',
      SUSPEND_BD: '/bdm/suspend-bd',
      GET_DETAILS: "/admin/profile/"
    },
    CUSTOMERS: {
      GET_ALL: '/admin/users/',
      GET_SINGLE: '/admin/users/',
      SUSPEND: '/admin/suspend-user/',
      UNSUSPEND: '/admin/unsuspend-user/',
      DELETE: '/admin/delete-users/',
    },
    VENDORS: {
      GET_ALL: '/admin/vendors/',
      GET_SINGLE: '/admin/vendors/',
      SUSPEND: '/admin/suspend-vendor/',
      UNSUSPEND: '/admin/unsuspend-vendor/',
      DELETE: '/admin/delete-vendor/',
    },
    DELIVERY_MANAGEMENT: {
      GET_ALL: '/admin/delivery-men/',
      GET_SINGLE: '/admin/delivery-man/',
      SUSPEND: '/admin/suspend-delivery-man/',
      UNSUSPEND: '/admin/unsuspend-delivery-man/',
      ASSIGN: '/delivery-request/assign-delivery-task/',
      APPROVE: '/admin/approve-delivery-man/',
      DELETE: '/admin/delete-delivery-man/',
    },
    DELIVERY_REQUESTS: {
      GET_ALL: '/delivery-request/all-requests/',
      GET_SINGLE: '/admin/delivery-request/',
      APPROVE: '/delivery-request/approve-request/',
      ASSIGN: '/delivery-request/assign-delivery-task/',
      ASSIGN_PRICE: '/delivery-request/assign-delivery-price/',
      CANCEL: '/delivery-request/cancel-request/',
      GET_REPORT: '/delivery-request/delivery-report/',
    },
    ORDER: {
      GET: '/admin/all-orders/',
      UPDATE: '/admin/update-order-status/',
      GET_SINGLE: '/admin/single-order/',
      DELETE: '/order/',
      GET_DETAILS: '/order/details/',
      GET_ORDER_PRODUCTS: '/admin/order-products/',
    },
    MANAGERS: {
      GET_ALL: '/admin/manager/',
      GET_SINGLE: '/admin/manager/',
      SUSPEND: '/admin/suspend-manager/',
      CREATE: '/admin/manager/create-bdm/',
      UNSUSPEND: '/admin/unsuspend-manager/',
      DELETE: '/admin/delete-manager/',
    },
    SHIPPING_FEE: {
      GET_ALL: '/shipping-fee/all',
      GET_SINGLE: '/shipping-fee/single-region',
      CREATE: '/shipping-fee/create',
      UPDATE: '/shipping-fee/update',
      DELETE: '/shipping-fee/delete',
    },
    WITHDRAWALS: {
      GET_ALL: '/admin/withdrwals/',
      PROCESS: '/admin/process-withdrawal/',
    },
    SUBSCRIPTION: {
      GET_ALL: '/subscribe',
      GET_SINGLE: '/subscribe/plan/', // /subscribe/plan/{planId}
      GET_BY_PACKAGE: '/subscribe/plan-package/', // /subscribe/plan-package/{package}
      CREATE: '/subscribe/create/', // /subscribe/create/{adminUserId}
      UPDATE: '/subscribe/plan/', // /subscribe/plan/{adminUserId}/{planId}
      DELETE: '/subscribe/plan/', // /subscribe/plan/{adminUserId}/{planId}
    },
    REPORT: {
      BDM_PERFORMANCE: '/report/bdm/my-performance',
      BD_PERFORMANCE: '/report/bd/my-performance',
    },
    BANNERS: {
      GET_ALL: '/banner',
      CREATE: '/banner',
      UPDATE: '/banner', // e.g. PUT /banners/:id
      DELETE: '/banner/', // e.g. DELETE /banners/:id
    },
    COUPON: {
      CREATE: '/coupons/create',
      GET_ALL: '/coupons/', // append creatorId
      UPDATE: '/coupons/', // append couponId
      DELETE: '/coupons/', // append couponId
      VALIDATE: '/coupons/validate',
    },
    AGENT: {
      GET_ALL: '/admin/agents/',
      GET_SINGLE: '/admin/agents/',
      SUSPEND: '/admin/suspend-agent/',
      UNSUSPEND: '/admin/unsuspend-agent/',
      DELETE: '/admin/delete-agent/',
    },
    TRANSACTIONS: {
      GET_ALL: '/admin/transactions',
      GET_SINGLE: '/admin/transactions/',
      ANALYTICS: '/admin/transactions/analytics/dashboard',
      DELETE: '/admin/transactions/',
    },
    REGIONAL: {
      SET_TEAM_LEAD: '/admin/regional/management/team-lead',
      ASSIGN_MEMBER: '/admin/regional/management/assign-member',
      REASSIGN_MEMBER: '/admin/regional/management/reassign-member',
      GET_ALL_ZONES: '/admin/regional/zones',
      GET_ZONE_DETAILS: '/admin/regional/zones/', // append {zoneId}
      GET_ZONE_TEAMS: '/admin/regional/zones/', // append {zoneId}/teams
      GET_TEAM_MEMBERS: '/team-members/team/', // append {teamId}
      DELETE_TEAM_MEMBER: '/team-members/', // append {memberId}
      ASSIGN_ZONE_LEADER: '/admin/regional/zones/', // append {zoneId}/leader
      GET_ZONE_METRICS: '/admin/regional/zones/', // append {zoneId}/metrics
      GET_REGION_STATS: '/admin/regional/management/regions/', // append {zoneId}/details
    },
    WALLET: {
      GET_ALL_REGIONAL: '/zone-wallet/regional/all',
      GET_ZONE_TEAMS_WALLET: '/zone-wallet/regional/', // append {zoneId}/teams
      GET_ZONE_WALLET: '/zone-wallet/regional/', // append {zoneId}
      GET_TEAM_WALLET: '/zone-wallet/team/', // append {teamId}
    },
  },
}

export const apiUrl = (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`
