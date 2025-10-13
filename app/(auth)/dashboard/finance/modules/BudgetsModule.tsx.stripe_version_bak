'use client'

import React, { useState } from 'react'
import { CardModern, CardModernHeader, CardModernTitle, CardModernContent } from '@/components/design-system/CardModern'
import { ButtonModern } from '@/components/design-system/ButtonModern'
import { 
  Target, TrendingUp, AlertCircle, Check, ChevronLeft
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'

interface BudgetsModuleProps {
  activeTab?: string
}

export default function BudgetsModule({ activeTab }: BudgetsModuleProps) {
  const [selectedPeriod] = useState(new Date().toISOString().slice(0, 7))
  const [activeView, setActiveView] = useState(
    activeTab === 'budgets-comparison' ? 'comparison' : 
    activeTab === 'budgets-history' ? 'history' : 'current'
  )
  
  const budgetCategories = [
    { category: 'Ingresos', budget: 10000000, actual: 8500000, percentage: 85 },
    { category: 'Gastos Fijos', budget: 5000000, actual: 4800000, percentage: 96 },
    { category: 'Gastos Variables', budget: 2000000, actual: 1500000, percentage: 75 },
    { category: 'Marketing', budget: 500000, actual: 300000, percentage: 60 }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Presupuesto Total</p>
                <p className="text-2xl font-bold">{formatCurrency(175000)}</p>
              </div>
              <Target className="w-8 h-8 text-blue-200" />
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ejecutado</p>
                <p className="text-2xl font-bold">{formatCurrency(146000)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </CardModernContent>
        </CardModern>

        <CardModern>
          <CardModernContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cumplimiento</p>
                <p className="text-2xl font-bold">83.4%</p>
              </div>
              <Check className="w-8 h-8 text-purple-200" />
            </div>
          </CardModernContent>
        </CardModern>
      </div>

      <CardModern>
        <CardModernHeader>
          <CardModernTitle>Presupuesto vs Real</CardModernTitle>
        </CardModernHeader>
        <CardModernContent>
          <div className="space-y-4">
            {budgetCategories.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-gray-600">
                    {formatCurrency(item.actual / 100)} / {formatCurrency(item.budget / 100)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.percentage > 90 ? 'bg-yellow-500' : 
                      item.percentage > 100 ? 'bg-red-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.percentage}% ejecutado</p>
              </div>
            ))}
          </div>
        </CardModernContent>
      </CardModern>
    </div>
  )
}