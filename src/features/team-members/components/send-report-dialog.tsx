// @ts-nocheck
import { useState } from 'react'
import axios from 'axios'
import { API_CONFIG, apiUrl } from '@/config/api'
import jsPDF from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

applyPlugin(jsPDF)

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

type SendReportDialogProps = {
  managerId: string
  managerName: string
  role?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 10 }, (_, i) => currentYear - i)

// Mask phone number for privacy (e.g., 08054****44)
function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 6) return phone
  const firstPart = phone.slice(0, 5)
  const lastPart = phone.slice(-2)
  const maskedMiddle = '*'.repeat(Math.max(0, phone.length - 7))
  return `${firstPart}${maskedMiddle}${lastPart}`
}

function downloadPDF(data: any, filename: string, role?: string) {
  const doc = new jsPDF()
  const isBD = role === 'bd'
  
  // Handle new BDM structure vs BD structure
  const {
    bdmName,
    bdName,
    period,
    summary,
    // BDM structure
    bdPerformance,
    overallSummary,
    totalBDs,
    // BD structure
    agents,
    standaloneVendors,
    users,
  } = data

  const displayName = isBD ? bdName : bdmName

  // Calculate totals based on structure
  let totalVendors, totalCustomers, totalAgents, bdCount

  if (isBD) {
    // BD report structure - use summary object
    totalAgents = summary?.agentsCount || 0
    totalVendors = summary?.totalVendors || 0
    totalCustomers = summary?.totalUsers || 0
  } else if (overallSummary) {
    // New BDM structure
    totalVendors = overallSummary.totalVendors || 0
    totalCustomers = overallSummary.totalUsers || 0
    totalAgents = overallSummary.totalAgents || 0
    bdCount = totalBDs || 0
  }

  doc.setFontSize(18)
  doc.text(`Performance Report for ${displayName || 'Manager'}`, 14, 22)
  doc.setFontSize(12)
  doc.text(`Period: ${period}`, 14, 30)

  doc.setFontSize(14)
  doc.text('Summary', 14, 45)

  const summaryBody = isBD
    ? [
        ['Total Agents', totalAgents],
        ['Total Vendors', totalVendors],
        ['Total Customers', totalCustomers],
      ]
    : [
        ['Total BD count', bdCount],
        ['Total Agents', totalAgents],
        ['Total Vendors', totalVendors],
        ['Total Customers', totalCustomers],
      ]

  doc.autoTable({
    startY: 50,
    head: [['Metric', 'Value']],
    body: summaryBody,
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 133] },
  })

  let lastY = (doc as any).lastAutoTable.finalY || 80

  doc.setFontSize(14)
  doc.text(isBD ? 'Agent Performance' : 'BD Performance Breakdown', 14, lastY + 15)

  if (isBD) {
    // BD Report: agents is an array with fullyActiveVendors/inactiveVendors
    const agentsList = Array.isArray(agents) ? agents : []
    
    // Sort agents by performance (active vendors + active customers, descending)
    const sortedAgents = [...agentsList].sort((a, b) => {
      const aPerformance = (a.fullyActiveVendors?.length || 0) + (a.fullyActiveCustomers?.length || 0)
      const bPerformance = (b.fullyActiveVendors?.length || 0) + (b.fullyActiveCustomers?.length || 0)
      return bPerformance - aPerformance
    })

    doc.autoTable({
      startY: lastY + 20,
      head: [
        [
          'S/N',
          'Agent Name',
          'No of Active Vendors',
          'No of Inactive Vendors',
          'No of Active Customers',
          'No of Inactive Customers',
        ],
      ],
      body: sortedAgents.map((agent: any, index: number) => [
        index + 1,
        agent.name,
        agent.fullyActiveVendors?.length || 0,
        agent.inactiveVendors?.length || 0,
        agent.fullyActiveCustomers?.length || 0,
        agent.inactiveCustomers?.length || 0,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133], fontSize: 8 },
      styles: { fontSize: 8 },
    })

    // Active Vendors List
    const activeVendors = agentsList.flatMap((a) =>
      (a.fullyActiveVendors || []).map((v: any) => ({ ...v, agentName: a.name }))
    )

    if (activeVendors.length > 0) {
      let finalY = (doc as any).lastAutoTable.finalY + 15
      const pageHeight = doc.internal.pageSize.height
      
      // Check if we have enough space for title + header (approx 30mm buffer)
      if (finalY + 30 > pageHeight) {
        doc.addPage()
        finalY = 20
      }

      doc.setFontSize(14)
      doc.text('Active Vendors List', 14, finalY)
      doc.autoTable({
        startY: finalY + 5,
        head: [['S/N', 'Vendor Name', 'Business Name', 'Phone', 'Agent', 'Date']],
        body: activeVendors.map((v: any, i: number) => [
          i + 1,
          v.name,
          v.businessName || 'N/A',
          maskPhoneNumber(v.phone),
          v.agentName,
          new Date(v.registrationDate).toLocaleDateString(),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113], fontSize: 8 },
        styles: { fontSize: 8 },
      })
    }

    // Inactive Vendors List
    const inactiveVendorsList = agentsList.flatMap((a) =>
      (a.inactiveVendors || []).map((v: any) => ({ ...v, agentName: a.name }))
    )

    if (inactiveVendorsList.length > 0) {
      let finalY = (doc as any).lastAutoTable.finalY + 15
      const pageHeight = doc.internal.pageSize.height

      // Check if we have enough space for title + header (approx 30mm buffer)
      if (finalY + 30 > pageHeight) {
        doc.addPage()
        finalY = 20
      }

      doc.setFontSize(14)
      doc.text('Inactive Vendors List', 14, finalY)
      doc.autoTable({
        startY: finalY + 5,
        head: [['S/N', 'Vendor Name', 'Business Name', 'Phone', 'Agent', 'Date']],
        body: inactiveVendorsList.map((v: any, i: number) => [
          i + 1,
          v.name,
          v.businessName || 'N/A',
          maskPhoneNumber(v.phone),
          v.agentName,
          new Date(v.registrationDate).toLocaleDateString(),
        ]),
        theme: 'grid',
        headStyles: { fillColor: [231, 76, 60], fontSize: 8 },
        styles: { fontSize: 8 },
      })
    }
  } else {
    // Handle new BDM structure with bdPerformance array
    let bdsData = []
    
    if (bdPerformance && Array.isArray(bdPerformance)) {
      // New structure: map bdPerformance to table format
      bdsData = bdPerformance.map((bd: any) => {
        const activeVendors = bd.standaloneVendors?.fullyActive?.length || 0
        const inactiveVendors = bd.standaloneVendors?.inactive?.length || 0
        const activeCustomers = bd.users?.fullyActive?.length || 0
        const inactiveCustomers = bd.users?.inactive?.length || 0
        const agentCount = bd.summary?.agentsCount || 0
        
        return {
          name: bd.bdName,
          agentCount,
          activeVendors,
          inactiveVendors,
          activeCustomers,
          inactiveCustomers,
          // Calculate performance for sorting
          performance: activeVendors + activeCustomers + agentCount
        }
      })
    }
    
    // Sort by performance (descending)
    const sortedBDs = [...bdsData].sort((a, b) => b.performance - a.performance)
    
    doc.autoTable({
      startY: lastY + 20,
      head: [
        [
          'S/N',
          'BD Name',
          'No of Agents',
          'No of Active Vendors',
          'No of Inactive Vendors',
          'No of Active Customers',
          'No of Inactive Customers',
        ],
      ],
      body: sortedBDs.map((bd: any, index: number) => [
        index + 1,
        bd.name,
        bd.agentCount,
        bd.activeVendors,
        bd.inactiveVendors,
        bd.activeCustomers,
        bd.inactiveCustomers,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
    })
  }

  doc.save(filename)
}

export function SendReportDialog({
  managerId,
  managerName,
  role,
  open,
  onOpenChange,
}: SendReportDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [year, setYear] = useState<number>(currentYear)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)

    const payload =
      role === 'bd'
        ? { bdId: managerId, month, year }
        : { bdmId: managerId, month, year }
    const endpoint =
      role === 'bd'
        ? API_CONFIG.ENDPOINTS.REPORT.BD_PERFORMANCE
        : API_CONFIG.ENDPOINTS.REPORT.BDM_PERFORMANCE

    console.log(payload)
    toast.promise(axios.post(apiUrl(endpoint), payload), {
      loading: 'Generating and downloading report...',
      success: (res) => {
        console.log(
          `${role === 'bd' ? 'BD' : 'BDM'} Report Response:`,
          res.data
        )
        const reportData = res.data.report
        downloadPDF(
          reportData,
          `performance-report-${managerName}-${month}-${year}.pdf`,
          role
        )
        onOpenChange(false)
        return 'Report downloaded successfully!'
      },
      error: (err) => {
        console.error('Failed to get report:', err)
        return (
          err.response?.data?.message ||
          'Failed to generate performance report.'
        )
      },
      finally: () => {
        setIsLoading(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Download Performance Report</DialogTitle>
          <DialogDescription>
            Select the month and year for the report for {managerName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='month' className='text-right'>
                Month
              </Label>
              <Select
                value={String(month)}
                onValueChange={(value) => setMonth(Number(value))}
              >
                <SelectTrigger className='col-span-3 w-full'>
                  <SelectValue placeholder='Select a month' />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='year' className='text-right'>
                Year
              </Label>
              <Select
                value={String(year)}
                onValueChange={(value) => setYear(Number(value))}
              >
                <SelectTrigger className='col-span-3 w-full'>
                  <SelectValue placeholder='Select a year' />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Downloading...' : 'Download Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
