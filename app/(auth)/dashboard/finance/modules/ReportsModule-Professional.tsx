'use client'

import React, { useState, useEffect } from 'react'
import { CardModern } from '@/components/design-system/CardModern'
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, FileText,
  Download, Calendar, Filter, Eye, DollarSign,
  ChevronLeft, ChevronRight, ArrowUp, ArrowDown,
  Activity, Target, Percent, Clock
} from 'lucide-react'
import { formatCurrency } from '@/lib/design-system/localization'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReportData {
  id: string
  category: string
  amount: number
  percentage?: number
  trend?: 'up' | 'down' | 'stable'
  comparison?: number
}

export default function ReportsModuleProfessional() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'comparison'>('summary')
  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchReportsData()
  }, [selectedPeriod])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/finance/reports?period=month')
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type: string = 'transactions') => {
    try {
      setExporting(true)
      const period = format(selectedPeriod, 'yyyy-MM')
      const response = await fetch(`/api/finance/export?type=${type}&format=csv&period=${period}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `reporte-${type}-${period}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setExporting(false)
    }
  }

  // Calculate metrics from real data
  const monthlyIncome = reportData?.totalIncome || 0
  const monthlyExpenses = reportData?.totalExpenses || 0
  const netProfit = monthlyIncome - monthlyExpenses
  const profitMargin = monthlyIncome > 0 ? (netProfit / monthlyIncome) * 100 : 0

  const incomeBreakdown: ReportData[] = reportData?.incomeByCategory?.map((cat: any, index: number) => ({
    id: String(index + 1),
    category: cat.category || 'Otros',
    amount: cat.amount || 0,
    percentage: cat.percentage || 0,
    trend: cat.trend || 'stable'
  })) || []

  const expenseBreakdown: ReportData[] = reportData?.expensesByCategory?.map((cat: any, index: number) => ({
    id: String(index + 1),
    category: cat.category || 'Otros',
    amount: cat.amount || 0,
    percentage: cat.percentage || 0,
    trend: cat.trend || 'stable'
  })) || []

  const kpis = reportData?.kpis || [
    { label: 'ROI', value: '0%', change: '0', positive: false },
    { label: 'Margen EBITDA', value: '0%', change: '0', positive: false },
    { label: 'Liquidez', value: '0', change: '0', positive: false },
    { label: 'Rotación', value: '0', change: '0', positive: false }
  ]

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: '#182A01',
          margin: '0 0 8px 0',
          letterSpacing: '-0.02em'
        }}>
          Reportes
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#516640',
          fontWeight: 400,
          margin: 0
        }}>
          Análisis financiero y reportes del club
        </p>
      </div>

      {/* Métricas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(164, 223, 78, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp style={{ width: '20px', height: '20px', color: '#A4DF4E' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#A4DF4E', fontWeight: 600 }}>+18%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Ingresos Totales</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(monthlyIncome)}
            </p>
          </div>
        </CardModern>

        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ArrowDown style={{ width: '20px', height: '20px', color: '#EF4444' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#EF4444', fontWeight: 600 }}>+8%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Gastos Totales</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(monthlyExpenses)}
            </p>
          </div>
        </CardModern>

        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <DollarSign style={{ width: '20px', height: '20px', color: '#3B82F6' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#3B82F6', fontWeight: 600 }}>+24%</span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Utilidad Neta</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>
              {formatCurrency(netProfit)}
            </p>
          </div>
        </CardModern>

        <CardModern variant="glass">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(147, 51, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Percent style={{ width: '20px', height: '20px', color: '#9333EA' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#516640', fontWeight: 600 }}>
                {profitMargin.toFixed(0)}%
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Margen de Utilidad</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#182A01' }}>Saludable</p>
          </div>
        </CardModern>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(164, 223, 78, 0.1)',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => setActiveTab('summary')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'summary' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeTab === 'summary' ? 600 : 500,
            cursor: 'pointer',
            borderBottom: activeTab === 'summary' ? '2px solid #A4DF4E' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Resumen Ejecutivo
        </button>
        <button
          onClick={() => setActiveTab('detailed')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'detailed' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeTab === 'detailed' ? 600 : 500,
            cursor: 'pointer',
            borderBottom: activeTab === 'detailed' ? '2px solid #A4DF4E' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Análisis Detallado
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          style={{
            padding: '10px 20px',
            background: 'transparent',
            border: 'none',
            color: activeTab === 'comparison' ? '#182A01' : '#516640',
            fontSize: '14px',
            fontWeight: activeTab === 'comparison' ? 600 : 500,
            cursor: 'pointer',
            borderBottom: activeTab === 'comparison' ? '2px solid #A4DF4E' : '2px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Comparativas
        </button>
      </div>

      {/* Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px',
        gap: '24px'
      }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Estado de Resultados */}
          {activeTab === 'summary' && (
            <>
              <CardModern variant="glass">
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <div>
                      <h3 style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#182A01',
                        letterSpacing: '-0.02em',
                        marginBottom: '4px'
                      }}>
                        Estado de Resultados
                      </h3>
                      <p style={{ fontSize: '14px', color: '#516640', margin: 0 }}>
                        {format(selectedPeriod, 'MMMM yyyy', { locale: es })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleExport('transactions')}
                      disabled={exporting}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: 'none',
                        background: exporting ? '#9CA3AF' : 'linear-gradient(135deg, #A4DF4E 0%, #66E7AA 100%)',
                        color: exporting ? 'white' : '#182A01',
                        fontSize: '14px',
                        fontWeight: 600,
                        cursor: exporting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 6px rgba(164, 223, 78, 0.2)',
                        transition: 'transform 0.2s',
                        opacity: exporting ? 0.7 : 1
                      }}
                      onMouseOver={(e) => !exporting && (e.currentTarget.style.transform = 'translateY(-2px)')}
                      onMouseOut={(e) => !exporting && (e.currentTarget.style.transform = 'translateY(0)')}
                    >
                      <Download style={{ width: '16px', height: '16px' }} />
                      {exporting ? 'Exportando...' : 'Exportar CSV'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Ingresos Section */}
                    <div style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'rgba(164, 223, 78, 0.03)',
                      border: '1px solid rgba(164, 223, 78, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.1), rgba(102, 231, 170, 0.1))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <TrendingUp style={{ width: '16px', height: '16px', color: '#A4DF4E' }} />
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#182A01', margin: 0 }}>
                          INGRESOS
                        </h4>
                      </div>
                      {incomeBreakdown.length > 0 ? (
                        incomeBreakdown.map((item, index) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              marginBottom: index < incomeBreakdown.length - 1 ? '8px' : '12px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.5)',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '2px', height: '20px', background: '#A4DF4E', borderRadius: '1px' }} />
                              <span style={{ fontSize: '14px', color: '#182A01', fontWeight: 500 }}>{item.category}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              {item.trend && (
                                <span style={{
                                  fontSize: '12px',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: item.trend === 'up' ? 'rgba(164, 223, 78, 0.1)' : 
                                             item.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                                  color: item.trend === 'up' ? '#A4DF4E' : 
                                         item.trend === 'down' ? '#EF4444' : '#9CA3AF'
                                }}>
                                  {item.trend === 'up' && '↑'}
                                  {item.trend === 'down' && '↓'}
                                  {item.trend === 'stable' && '→'}
                                </span>
                              )}
                              <span style={{ fontSize: '15px', fontWeight: 600, color: '#182A01' }}>
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ 
                          padding: '40px 20px', 
                          textAlign: 'center', 
                          color: '#9CA3AF',
                          background: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '8px'
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>No hay datos de ingresos disponibles</p>
                          <p style={{ margin: 0, fontSize: '12px' }}>Los datos aparecerán cuando se registren transacciones</p>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(164, 223, 78, 0.08), rgba(102, 231, 170, 0.08))',
                        border: '1px solid rgba(164, 223, 78, 0.2)'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#182A01' }}>
                          Total Ingresos
                        </span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: '#A4DF4E' }}>
                          {formatCurrency(monthlyIncome)}
                        </span>
                      </div>
                    </div>

                    {/* Gastos Section */}
                    <div style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'rgba(239, 68, 68, 0.02)',
                      border: '1px solid rgba(239, 68, 68, 0.1)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <TrendingDown style={{ width: '16px', height: '16px', color: '#EF4444' }} />
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#182A01', margin: 0 }}>
                          GASTOS
                        </h4>
                      </div>
                      {expenseBreakdown.length > 0 ? (
                        expenseBreakdown.map((item, index) => (
                          <div
                            key={item.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              marginBottom: index < expenseBreakdown.length - 1 ? '8px' : '12px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.5)',
                              transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '2px', height: '20px', background: '#EF4444', borderRadius: '1px' }} />
                              <span style={{ fontSize: '14px', color: '#182A01', fontWeight: 500 }}>{item.category}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              {item.trend && (
                                <span style={{
                                  fontSize: '12px',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background: item.trend === 'up' ? 'rgba(239, 68, 68, 0.1)' : 
                                             item.trend === 'down' ? 'rgba(164, 223, 78, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                                  color: item.trend === 'up' ? '#EF4444' : 
                                         item.trend === 'down' ? '#A4DF4E' : '#9CA3AF'
                                }}>
                                  {item.trend === 'up' && '↑'}
                                  {item.trend === 'down' && '↓'}
                                  {item.trend === 'stable' && '→'}
                                </span>
                              )}
                              <span style={{ fontSize: '15px', fontWeight: 600, color: '#182A01' }}>
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ 
                          padding: '40px 20px', 
                          textAlign: 'center', 
                          color: '#9CA3AF',
                          background: 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '8px'
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>No hay datos de gastos disponibles</p>
                          <p style={{ margin: 0, fontSize: '12px' }}>Los datos aparecerán cuando se registren gastos</p>
                        </div>
                      )}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        borderRadius: '10px',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#182A01' }}>
                          Total Gastos
                        </span>
                        <span style={{ fontSize: '24px', fontWeight: 700, color: '#EF4444' }}>
                          {formatCurrency(monthlyExpenses)}
                        </span>
                      </div>
                    </div>

                    {/* Utilidad Neta */}
                    <div style={{
                      padding: '24px',
                      borderRadius: '16px',
                      background: netProfit >= 0 
                        ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(164, 223, 78, 0.05))'
                        : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(251, 191, 36, 0.05))',
                      border: netProfit >= 0
                        ? '2px solid rgba(59, 130, 246, 0.2)'
                        : '2px solid rgba(239, 68, 68, 0.2)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: netProfit >= 0
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(164, 223, 78, 0.1))'
                            : 'rgba(239, 68, 68, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Activity style={{ width: '20px', height: '20px', color: netProfit >= 0 ? '#3B82F6' : '#EF4444' }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#182A01', margin: 0 }}>
                            UTILIDAD NETA
                          </h4>
                          <p style={{ fontSize: '12px', color: '#516640', margin: '2px 0 0 0' }}>
                            Resultado del período
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <p style={{ fontSize: '36px', fontWeight: 700, color: netProfit >= 0 ? '#3B82F6' : '#EF4444', margin: 0, letterSpacing: '-0.02em' }}>
                            {formatCurrency(Math.abs(netProfit))}
                          </p>
                          <p style={{ fontSize: '14px', color: '#516640', marginTop: '4px' }}>
                            {netProfit < 0 && 'Pérdida del período'}
                            {netProfit >= 0 && 'Ganancia del período'}
                          </p>
                        </div>
                        <div style={{
                          padding: '12px 20px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.8)',
                          backdropFilter: 'blur(10px)',
                          textAlign: 'center'
                        }}>
                          <p style={{ fontSize: '12px', color: '#516640', marginBottom: '4px' }}>Margen de Utilidad</p>
                          <p style={{ 
                            fontSize: '24px', 
                            fontWeight: 700, 
                            color: profitMargin >= 20 ? '#A4DF4E' : profitMargin >= 10 ? '#FBBF24' : profitMargin >= 0 ? '#9CA3AF' : '#EF4444',
                            margin: 0
                          }}>
                            {!isNaN(profitMargin) ? profitMargin.toFixed(1) : '0.0'}%
                          </p>
                        </div>
                      </div>
                      {(monthlyIncome > 0 || monthlyExpenses > 0) && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '12px',
                          marginTop: '20px',
                          paddingTop: '20px',
                          borderTop: '1px solid rgba(0, 0, 0, 0.06)'
                        }}>
                          <div>
                            <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Ingresos</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#182A01' }}>
                              {formatCurrency(monthlyIncome)}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Gastos</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#182A01' }}>
                              {formatCurrency(monthlyExpenses)}
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>Diferencia</p>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: netProfit >= 0 ? '#A4DF4E' : '#EF4444' }}>
                              {netProfit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netProfit))}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardModern>

              {/* KPIs */}
              <CardModern variant="glass">
                <div style={{ padding: '24px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#182A01',
                    marginBottom: '20px'
                  }}>
                    Indicadores Clave (KPIs)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {kpis.map((kpi: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          border: '1px solid rgba(164, 223, 78, 0.15)',
                          background: 'rgba(255, 255, 255, 0.5)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <p style={{ fontSize: '11px', color: '#516640', marginBottom: '4px' }}>
                          {kpi.label}
                        </p>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: '#182A01', marginBottom: '4px' }}>
                          {kpi.value}
                        </p>
                        <span style={{
                          fontSize: '11px',
                          color: kpi.positive ? '#A4DF4E' : '#EF4444'
                        }}>
                          {kpi.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardModern>
            </>
          )}

          {/* Análisis Detallado */}
          {activeTab === 'detailed' && (
            <CardModern variant="glass">
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#182A01',
                  marginBottom: '20px'
                }}>
                  Análisis por Categoría
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {incomeBreakdown.map((item, index) => (
                    <div key={item.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                            {item.category}
                          </p>
                          <p style={{ fontSize: '12px', color: '#516640' }}>
                            {item.percentage}% del total • {formatCurrency(item.amount)}
                          </p>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          background: item.trend === 'up' ? 'rgba(164, 223, 78, 0.1)' : 
                                     item.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 
                                     'rgba(156, 163, 175, 0.1)'
                        }}>
                          {item.trend === 'up' && <ArrowUp style={{ width: '12px', height: '12px', color: '#A4DF4E' }} />}
                          {item.trend === 'down' && <ArrowDown style={{ width: '12px', height: '12px', color: '#EF4444' }} />}
                          {item.trend === 'stable' && <Activity style={{ width: '12px', height: '12px', color: '#9CA3AF' }} />}
                          <span style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: item.trend === 'up' ? '#A4DF4E' : 
                                   item.trend === 'down' ? '#EF4444' : '#9CA3AF'
                          }}>
                            {item.trend === 'up' ? '+12%' : item.trend === 'down' ? '-8%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div style={{
                        height: '8px',
                        background: 'rgba(164, 223, 78, 0.1)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${item.percentage}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #A4DF4E, #66E7AA)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardModern>
          )}

          {/* Comparativas */}
          {activeTab === 'comparison' && (
            <CardModern variant="glass">
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#182A01',
                  marginBottom: '20px'
                }}>
                  Comparativa Mensual
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {['Octubre', 'Septiembre', 'Agosto'].map((month, index) => (
                    <div
                      key={month}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: '1px solid rgba(164, 223, 78, 0.15)',
                        background: 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>
                          {month} 2024
                        </h4>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: index === 0 ? 'rgba(164, 223, 78, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                          color: index === 0 ? '#A4DF4E' : '#6B7280'
                        }}>
                          {index === 0 ? 'Actual' : 'Histórico'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        <div>
                          <p style={{ fontSize: '11px', color: '#516640', marginBottom: '2px' }}>Ingresos</p>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#A4DF4E' }}>
                            {formatCurrency(1205000 - (index * 80000))}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '11px', color: '#516640', marginBottom: '2px' }}>Gastos</p>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>
                            {formatCurrency(821000 - (index * 50000))}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '11px', color: '#516640', marginBottom: '2px' }}>Utilidad</p>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#3B82F6' }}>
                            {formatCurrency(384000 - (index * 30000))}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardModern>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Period Selector */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#182A01'
                }}>
                  {format(selectedPeriod, 'MMMM yyyy', { locale: es })}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedPeriod)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setSelectedPeriod(newDate)
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChevronLeft style={{ width: '16px', height: '16px', color: '#516640' }} />
                  </button>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedPeriod)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setSelectedPeriod(newDate)
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid rgba(164, 223, 78, 0.2)',
                      background: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ChevronRight style={{ width: '16px', height: '16px', color: '#516640' }} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#516640' }}>Ingresos</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#A4DF4E' }}>
                    +{formatCurrency(monthlyIncome)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#516640' }}>Gastos</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#EF4444' }}>
                    -{formatCurrency(monthlyExpenses)}
                  </span>
                </div>
                <div style={{
                  borderTop: '1px solid rgba(164, 223, 78, 0.1)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#182A01' }}>Balance</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#3B82F6' }}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </CardModern>

          {/* Quick Actions */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01',
                marginBottom: '16px'
              }}>
                Acciones Rápidas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <FileText style={{ width: '16px', height: '16px' }} />
                  Generar P&L
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <BarChart3 style={{ width: '16px', height: '16px' }} />
                  Dashboard Visual
                </button>
                <button
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(164, 223, 78, 0.2)',
                    background: 'white',
                    color: '#182A01',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(164, 223, 78, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  Exportar PDF
                </button>
              </div>
            </div>
          </CardModern>

          {/* Tipos de Reporte */}
          <CardModern variant="glass">
            <div style={{ padding: '24px' }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#182A01',
                marginBottom: '16px'
              }}>
                Reportes Disponibles
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { name: 'Estado de Resultados', icon: <FileText />, color: '#3B82F6' },
                  { name: 'Flujo de Caja', icon: <TrendingUp />, color: '#A4DF4E' },
                  { name: 'Balance General', icon: <BarChart3 />, color: '#9333EA' },
                  { name: 'Análisis de Rentabilidad', icon: <PieChart />, color: '#FBBF24' }
                ].map((report, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid rgba(164, 223, 78, 0.15)',
                      background: 'rgba(255, 255, 255, 0.5)',
                      backdropFilter: 'blur(10px)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.3)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(164, 223, 78, 0.15)'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: `${report.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {React.cloneElement(report.icon, { 
                        style: { width: '16px', height: '16px', color: report.color }
                      })}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#182A01' }}>
                      {report.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardModern>
        </div>
      </div>
    </div>
  )
}