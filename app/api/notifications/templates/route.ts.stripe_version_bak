import { NextRequest, NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth/actions'
import { NotificationTemplateService } from '@/lib/services/notification-template-service'

// Get all templates for a club
export async function GET(request: NextRequest) {
  try {
    const session = await requireStaffAuth()
    
    const templates = await NotificationTemplateService.getClubTemplates(session.clubId)
    
    return NextResponse.json({
      success: true,
      templates
    })
    
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Error fetching templates' },
      { status: 500 }
    )
  }
}

// Create or update template
export async function POST(request: NextRequest) {
  try {
    const session = await requireStaffAuth()
    const body = await request.json()
    
    const { name, type, body: templateBody, variables } = body
    
    if (!name || !type || !templateBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const template = await NotificationTemplateService.createTemplate(
      session.clubId,
      name,
      type,
      templateBody,
      variables
    )
    
    return NextResponse.json({
      success: true,
      template
    })
    
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Error creating template' },
      { status: 500 }
    )
  }
}

// Test template with sample data
export async function PUT(request: NextRequest) {
  try {
    await requireStaffAuth()
    const body = await request.json()
    
    const { templateId, sampleData } = body
    
    if (!templateId || !sampleData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const result = await NotificationTemplateService.testTemplate(
      templateId,
      sampleData
    )
    
    return NextResponse.json({
      success: true,
      preview: result
    })
    
  } catch (error) {
    console.error('Error testing template:', error)
    return NextResponse.json(
      { error: 'Error testing template' },
      { status: 500 }
    )
  }
}