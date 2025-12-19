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

function downloadPDF(data: any, filename: string, role?: string) {
  const doc = new jsPDF()
  const isBD = role === 'bd'
  const {
    bdmName,
    bdName,
    period,
    agents,
    fullyActiveVendors,
    inactiveVendors,
    fullyActiveUsers,
    inactiveUsers,
    numberOfBDs,
    bdsUnderBDM,
  } = data

  const displayName = isBD ? bdName : bdmName
  const totalVendors =
    (fullyActiveVendors?.count || 0) + (inactiveVendors?.count || 0)
  const totalCustomers =
    (fullyActiveUsers?.count || 0) + (inactiveUsers?.count || 0)

  doc.setFontSize(18)
  doc.text(`Performance Report for ${displayName || 'Manager'}`, 14, 22)
  doc.setFontSize(12)
  doc.text(`Period: ${period}`, 14, 30)

  doc.setFontSize(14)
  doc.text('Summary', 14, 45)

  const summaryBody = isBD
    ? [
        ['Total Agents', agents?.count ?? 0],
        ['Total Vendors', totalVendors],
        ['Total Customers', totalCustomers],
      ]
    : [
        ['Total BD count', numberOfBDs ?? 0],
        ['Total Agents', agents?.count ?? 0],
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
  doc.text(isBD ? 'Agent List' : 'BD Performance Breakdown', 14, lastY + 15)

  if (isBD) {
    const agentsList = agents?.names || []
    doc.autoTable({
      startY: lastY + 20,
      head: [['S/N', 'Agent Name', 'Email', 'Phone', 'Reg. Date']],
      body: agentsList.map((agent: any, index: number) => [
        index + 1,
        agent.name,
        agent.email,
        agent.phone,
        agent.registrationDate
          ? new Date(agent.registrationDate).toLocaleDateString()
          : '-',
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 160, 133] },
    })
  } else {
    const sortedBDs = [...(bdsUnderBDM || [])]
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
        bd.agentCount || 0,
        bd.activeVendors || 0,
        bd.inactiveVendors || 0,
        bd.activeCustomers || 0,
        bd.inactiveCustomers || 0,
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
        console.log(`${role === 'bd' ? 'BD' : 'BDM'} Report Response:`, res.data)
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
      }
    )
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
