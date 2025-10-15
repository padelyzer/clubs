/**
 * CategorySection Component
 * Extracted from page.tsx (lines 1247-1667)
 * Handles tournament categories organized by modality
 */

import React from 'react'
import { ChevronDown } from 'lucide-react'
import type { Category } from '../types/tournament'

type CategorySectionProps = {
  categories: Category[]
  sidebarCollapsed: boolean
  categoriesExpanded: boolean
  setCategoriesExpanded: (value: boolean) => void
  masculineExpanded: boolean
  setMasculineExpanded: (value: boolean) => void
  feminineExpanded: boolean
  setFeminineExpanded: (value: boolean) => void
  mixedExpanded: boolean
  setMixedExpanded: (value: boolean) => void
  selectedCategory: string | null
  setSelectedCategory: (value: string | null) => void
}

const colors = {
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    tertiary: '#9ca3af'
  },
  neutral: {
    100: '#f3f4f6',
    900: '#111827'
  },
  border: {
    light: '#e5e7eb'
  }
}

type ModalityConfig = {
  name: string
  emoji: string
  bgColor: string
  bgColorHover: string
  bgColorLight: string
  textColor: string
}

const modalityConfigs: Record<'masculine' | 'feminine' | 'mixed', ModalityConfig> = {
  masculine: {
    name: 'Masculino',
    emoji: '♂️',
    bgColor: 'rgba(59, 130, 246, 0.05)',
    bgColorHover: 'rgba(59, 130, 246, 0.08)',
    bgColorLight: 'rgba(59, 130, 246, 0.1)',
    textColor: 'rgb(59, 130, 246)'
  },
  feminine: {
    name: 'Femenino',
    emoji: '♀️',
    bgColor: 'rgba(236, 72, 153, 0.05)',
    bgColorHover: 'rgba(236, 72, 153, 0.08)',
    bgColorLight: 'rgba(236, 72, 153, 0.1)',
    textColor: 'rgb(236, 72, 153)'
  },
  mixed: {
    name: 'Mixto',
    emoji: '⚥',
    bgColor: 'rgba(168, 85, 247, 0.05)',
    bgColorHover: 'rgba(168, 85, 247, 0.08)',
    bgColorLight: 'rgba(168, 85, 247, 0.1)',
    textColor: 'rgb(168, 85, 247)'
  }
}

type ModalitySubmenuProps = {
  modality: 'masculine' | 'feminine' | 'mixed'
  categories: Category[]
  isExpanded: boolean
  setExpanded: (value: boolean) => void
  selectedCategory: string | null
  setSelectedCategory: (value: string | null) => void
}

function ModalitySubmenu({
  modality,
  categories,
  isExpanded,
  setExpanded,
  selectedCategory,
  setSelectedCategory
}: ModalitySubmenuProps) {
  const config = modalityConfigs[modality]

  if (categories.length === 0) return null

  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: '6px 12px',
          marginBottom: '4px',
          borderRadius: '6px',
          background: isExpanded ? config.bgColor : 'transparent',
          transition: 'all 0.2s',
        }}
        onClick={() => setExpanded(!isExpanded)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isExpanded
            ? config.bgColorHover
            : colors.neutral[100]
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isExpanded
            ? config.bgColor
            : 'transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{config.emoji}</span>
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: colors.text.secondary
          }}>
            {config.name}
          </span>
          <span style={{
            padding: '2px 6px',
            borderRadius: '10px',
            background: config.bgColorLight,
            color: config.textColor,
            fontSize: '10px',
            fontWeight: 600
          }}>
            {categories.length}
          </span>
        </div>
        <ChevronDown
          size={12}
          style={{
            color: colors.text.tertiary,
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s'
          }}
        />
      </div>
      {isExpanded && (
        <div style={{ paddingLeft: '20px', animation: 'slideDown 0.2s ease-out' }}>
          {categories.map((cat, idx) => {
            const categoryKey = `${cat.code}-${cat.modality}`
            const isSelected = selectedCategory === categoryKey

            return (
              <div
                key={`${modality}-${idx}`}
                onClick={() => setSelectedCategory(categoryKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isSelected ? config.bgColorLight : 'transparent',
                  color: isSelected ? config.textColor : colors.text.secondary
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = config.bgColor
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 500 }}>{cat.code}</span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '10px',
                  background: isSelected ? config.textColor : config.bgColorLight,
                  color: isSelected ? 'white' : config.textColor,
                  fontSize: '10px',
                  fontWeight: 600
                }}>
                  {cat.teams}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function CategorySection({
  categories,
  sidebarCollapsed,
  categoriesExpanded,
  setCategoriesExpanded,
  masculineExpanded,
  setMasculineExpanded,
  feminineExpanded,
  setFeminineExpanded,
  mixedExpanded,
  setMixedExpanded,
  selectedCategory,
  setSelectedCategory
}: CategorySectionProps) {
  const masculineCategories = categories.filter(cat => cat.modality === 'masculine')
  const feminineCategories = categories.filter(cat => cat.modality === 'feminine')
  const mixedCategories = categories.filter(cat => cat.modality === 'mixed')

  return (
    <div style={{ marginTop: '24px' }}>
      {!sidebarCollapsed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            padding: '8px 12px',
            marginBottom: '12px',
            borderRadius: '6px',
            transition: 'background 0.2s'
          }}
          onClick={() => setCategoriesExpanded(!categoriesExpanded)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.neutral[100]
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: colors.text.tertiary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            CATEGORÍAS
          </span>
          <ChevronDown
            size={14}
            style={{
              color: colors.text.tertiary,
              transform: categoriesExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s'
            }}
          />
        </div>
      )}

      {categoriesExpanded && !sidebarCollapsed && (
        <div style={{
          marginTop: '-8px',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <ModalitySubmenu
            modality="masculine"
            categories={masculineCategories}
            isExpanded={masculineExpanded}
            setExpanded={setMasculineExpanded}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <ModalitySubmenu
            modality="feminine"
            categories={feminineCategories}
            isExpanded={feminineExpanded}
            setExpanded={setFeminineExpanded}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          <ModalitySubmenu
            modality="mixed"
            categories={mixedCategories}
            isExpanded={mixedExpanded}
            setExpanded={setMixedExpanded}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>
      )}

      {sidebarCollapsed && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '8px 0'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: colors.neutral[100],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 600,
            color: colors.text.secondary
          }}>
            {categories.length}
          </div>
        </div>
      )}
    </div>
  )
}
