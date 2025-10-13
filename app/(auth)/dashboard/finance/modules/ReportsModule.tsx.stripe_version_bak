'use client'

import React, { useState } from 'react'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { 
  BarChart3, PieChart, TrendingUp, FileText,
  Download, Calendar, Filter, Eye, ChevronLeft
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReportsModuleProps {
  activeTab?: string
}

export default function ReportsModule({ activeTab }: ReportsModuleProps) {
  const getReportFromProp = (tab?: string) => {
    if (tab === 'reports-income') return 'income_statement'
    if (tab === 'reports-cashflow') return 'cash_flow'
    if (tab === 'reports-profitability') return 'profitability'
    if (tab === 'reports-export') return 'export'
    return 'income_statement'
  }
  
  const [activeReport, setActiveReport] = useState(getReportFromProp(activeTab))
  const [selectedPeriod, setSelectedPeriod] = useState(format(new Date(), 'yyyy-MM'))

  const reports = [
    {
      id: 'income_statement',
      title: 'Estado de Resultados',
      description: 'Ingresos y gastos del periodo',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      id: 'cash_flow',
      title: 'Flujo de Caja',
      description: 'Movimiento de efectivo',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      id: 'profitability',
      title: 'Análisis de Rentabilidad',
      description: 'Rentabilidad por servicio',
      icon: <PieChart className="w-5 h-5" />,
      color: 'bg-purple-500'
    },
    {
      id: 'trends',
      title: 'Tendencias',
      description: 'Análisis histórico',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reports.map((report) => (
          <CardModern
            key={report.id}
            className={`cursor-pointer ${activeReport === report.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveReport(report.id)}
          >
            <CardModernContent className="p-4">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${report.color} text-white mr-3`}>
                  {report.icon}
                </div>
                <div>
                  <p className="font-medium">{report.title}</p>
                  <p className="text-xs text-gray-500">{report.description}</p>
                </div>
              </div>
            </CardModernContent>
          </CardModern>
        ))}
      </div>

      <CardModern>
        <CardModernHeader>
          <CardModernTitle>
            {reports.find(r => r.id === activeReport)?.title}
          </CardModernTitle>
          <div className="flex gap-2">
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <ButtonModern variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </ButtonModern>
          </div>
        </CardModernHeader>
        <CardModernContent>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Selecciona un periodo para generar el reporte</p>
            <ButtonModern className="mt-4">
              Generar Reporte
            </ButtonModern>
          </div>
        </CardModernContent>
      </CardModern>
    </div>
  )
}