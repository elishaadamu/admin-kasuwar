import axios from 'axios'
import { apiUrl, API_CONFIG } from '@/config/api'

export type TeamLeadPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password?: string
  gender?: string
  maritalStatus?: string
  dateOfBirth?: string
  address?: string
  state?: string
  localGovt?: string
  bankName?: string
  accountNumber?: string
  accountName?: string
  validId?: string
  passportPhoto?: string
  regionalId?: string
}

export const fetchZones = async () => {
  const zonesEndpoint = API_CONFIG.ENDPOINTS.REGIONAL.GET_ALL_ZONES || '/admin/regional/zones'
  const resp = await axios.get(apiUrl(zonesEndpoint), { withCredentials: true })
  return resp.data?.zones || []
}

export const fetchZoneTeams = async (zoneId: string) => {
  const base = API_CONFIG.ENDPOINTS.REGIONAL.GET_ZONE_TEAMS || '/admin/regional/zones/'
  const url = apiUrl(`${base}${zoneId}/teams`)
  const resp = await axios.get(url, { withCredentials: true })
  return resp.data?.teams || []
}

/** Create a Team Lead as an admin (TL-only). */
export const createTeamLeadAsAdmin = async (payload: TeamLeadPayload) => {
  const endpoint = API_CONFIG.ENDPOINTS.REGIONAL.SET_TEAM_LEAD || '/admin/regional/management/team-lead'

  const body: any = {
    ...payload,
    role: 'tl',
    isTeamLead: true,
    isRegionalLeader: false,
  }

  if (body.teamId) delete body.teamId
  if (body.password === '') delete body.password

  const resp = await axios.post(apiUrl(endpoint), body, { withCredentials: true })
  return resp.data
}

export default {
  fetchZones,
  fetchZoneTeams,
  createTeamLeadAsAdmin,
}
