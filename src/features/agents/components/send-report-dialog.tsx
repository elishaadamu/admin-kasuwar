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
  agentId: string
  managerName: string
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

function downloadPDF(data: any, filename: string) {
  const doc = new jsPDF()
  const {
    bdmName,
    period,
    summary,
    agents,
    fullyActiveUsers,
    fullyActiveVendors,
    inactiveUsers,
    inactiveVendors,
    numberOfBDs,
  } = data

  doc.setFontSize(18)
  doc.text(`Performance Report for ${bdmName}`, 14, 22)
  doc.setFontSize(12)
  doc.text(`Period: ${period}`, 14, 30)

  doc.setFontSize(14)
  doc.text('Summary', 14, 45)
  doc.autoTable({
    startY: 50,
    head: [['Metric', 'Value']],
    body: [
      ['Total New Registrations', summary.totalNewRegistrations],
      ['Total Active Entities', summary.activeEntities],
      ['Total Inactive Entities', summary.inactiveEntities],
      ['Number of BDs under BDM', numberOfBDs],
    ],
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 133] },
  })

  let lastY = (doc as any).lastAutoTable.finalY || 80

  const createSection = (
    title: string,
    items: { count: number; names: string[] }
  ) => {
    doc.addPage()
    doc.setFontSize(14)
    doc.text(title, 14, 20)
    doc.setFontSize(12)
    doc.text(`Count: ${items.count}`, 14, 28)

    if (items.names && items.names.length > 0) {
      doc.autoTable({
        startY: 34,
        head: [['Name']],
        body: items.names.map((name) => [name]),
        theme: 'grid',
      })
      lastY = (doc as any).lastAutoTable.finalY
    } else {
      doc.text('No names to display.', 14, 34)
      lastY = 34
    }
    return lastY + 15
  }

  createSection('Agents', agents)
  createSection('Fully Active Users', fullyActiveUsers)
  createSection('Fully Active Vendors', fullyActiveVendors)
  createSection('Inactive Users', inactiveUsers)
  createSection('Inactive Vendors', inactiveVendors)

  doc.save(filename)
}

export function SendReportDialog({
  agentId,
  managerName,
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
    const payload = { bdmId: agentId, month, year }

    toast.promise(
      axios.post(apiUrl(API_CONFIG.ENDPOINTS.REPORT.BDM_PERFORMANCE), payload),
      {
        loading: 'Generating and downloading report...',
        success: (res) => {
          const reportData = res.data.report
          downloadPDF(
            reportData,
            `performance-report-${managerName}-${month}-${year}.pdf`
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
