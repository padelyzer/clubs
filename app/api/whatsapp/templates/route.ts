import { NextRequest, NextResponse } from 'next/server'
import { getTemplatesList, getTemplatePreview, validateTemplateData, buildTemplateData } from '@/lib/whatsapp/templates'

// Get available templates
export async function GET(request: NextRequest) {
  try {
    const templates = getTemplatesList()
    
    return NextResponse.json({
      success: true,
      templates
    })

  } catch (error: any) {
    console.error('WhatsApp templates API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Preview template with data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateType, data } = body

    if (!templateType) {
      return NextResponse.json(
        { error: 'Missing templateType' },
        { status: 400 }
      )
    }

    // Validate template data
    const isValid = validateTemplateData(templateType, data || {})
    
    if (!isValid) {
      const templateData = buildTemplateData(templateType, data || {})
      return NextResponse.json({
        success: false,
        error: 'Invalid template data',
        missingVariables: Object.entries(templateData)
          .filter(([_, value]) => !value || value.trim() === '')
          .map(([key]) => key)
      })
    }

    // Generate preview
    const preview = getTemplatePreview(templateType, data || {})
    const templateData = buildTemplateData(templateType, data || {})

    return NextResponse.json({
      success: true,
      preview,
      templateData,
      isValid
    })

  } catch (error: any) {
    console.error('WhatsApp template preview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}