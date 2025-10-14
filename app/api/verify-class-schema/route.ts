import { NextResponse } from 'next/server'
import { prisma } from '@/lib/config/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Query the database schema to check if courtCost and instructorCost columns exist
    const schemaCheck: any = await prisma.$queryRaw`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Class'
      AND column_name IN ('courtCost', 'instructorCost', 'price', 'id')
      ORDER BY column_name;
    `

    // Get all columns for Class table to see full structure
    const allColumns: any = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Class'
      ORDER BY column_name;
    `

    // Try to query a class with the fields (will fail if columns don't exist)
    let queryTest = null
    let queryError = null

    try {
      queryTest = await prisma.class.findFirst({
        select: {
          id: true,
          price: true,
          courtCost: true,
          instructorCost: true
        }
      })
    } catch (error) {
      queryError = error instanceof Error ? error.message : String(error)
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checks: {
        requiredFields: schemaCheck,
        allClassColumns: allColumns,
        fieldsFound: {
          courtCost: schemaCheck.some((col: any) => col.column_name === 'courtCost'),
          instructorCost: schemaCheck.some((col: any) => col.column_name === 'instructorCost')
        },
        prismaQueryTest: {
          success: queryError === null,
          error: queryError,
          result: queryTest
        }
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
