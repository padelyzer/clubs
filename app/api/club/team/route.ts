import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/actions'
import { prisma } from '@/lib/config/prisma'
import { hash } from '@node-rs/argon2'
import { nanoid } from 'nanoid'
import { getEnabledModulesForClub } from '@/lib/saas/get-enabled-modules'

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    console.log('Session in GET /api/club/team:', session)

    if (!session || !session.clubId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo el dueño del club puede gestionar usuarios
    if (session.role !== 'CLUB_OWNER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos para gestionar usuarios' },
        { status: 403 }
      )
    }

    console.log('Fetching users for clubId:', session.clubId)

    // Obtener todos los usuarios del club con sus permisos
    const users = await prisma.user.findMany({
      where: {
        clubId: session.clubId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        permissions: {
          select: {
            moduleCode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Found users:', users.length)

    // Obtener los módulos habilitados para este club
    const enabledModules = await getEnabledModulesForClub(session.clubId)
    const enabledModuleCodes = enabledModules
      .filter(m => m.isIncluded)
      .map(m => m.code)

    console.log('Enabled modules for club:', enabledModuleCodes)

    // Mapear usuarios con sus permisos reales desde la base de datos
    const members = users.map(user => ({
      ...user,
      name: user.name || 'Sin nombre',
      phone: '', // Campo simulado por ahora
      permissions: user.role === 'CLUB_OWNER'
        ? enabledModuleCodes // El owner tiene acceso a todos los módulos habilitados
        : user.permissions.map(p => p.moduleCode) // Otros usuarios tienen los permisos guardados
    }))

    // Crear un mapeo de módulos disponibles con sus nombres display
    const availableModules = enabledModules
      .filter(m => m.isIncluded)
      .map(m => ({
        id: m.code,
        name: m.name || m.code,
        enabled: true
      }))

    return NextResponse.json({
      members,
      availableModules // Enviamos también los módulos disponibles para el club
    })

  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Error al obtener el equipo' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!session || !session.clubId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo el dueño del club puede agregar usuarios
    if (session.role !== 'CLUB_OWNER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos para agregar usuarios' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { name, email, password, role, permissions } = data

    // Validar campos requeridos
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar que la contraseña tenga al menos 8 caracteres
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        Club: {
          select: {
            name: true
          }
        }
      }
    })

    if (existingUser) {
      // Si el usuario ya pertenece a otro club
      if (existingUser.clubId && existingUser.clubId !== session.clubId) {
        return NextResponse.json(
          {
            error: `Este email ya está registrado en otro club (${existingUser.Club?.name || 'Otro club'}). Cada usuario solo puede pertenecer a un club.`,
            details: 'Por seguridad, un email no puede usarse en múltiples clubs. El usuario debe usar un email diferente.'
          },
          { status: 400 }
        )
      }

      // Si el usuario ya pertenece a este mismo club
      if (existingUser.clubId === session.clubId) {
        return NextResponse.json(
          { error: 'Este usuario ya es miembro de tu club' },
          { status: 400 }
        )
      }

      // Si existe pero no tiene club (caso raro)
      return NextResponse.json(
        { error: 'Este email ya está registrado en el sistema' },
        { status: 400 }
      )
    }

    // Hashear la contraseña proporcionada con Argon2
    const hashedPassword = await hash(password)

    console.log('Creating user with data:', {
      name,
      email: email.toLowerCase(),
      role: role || 'CLUB_STAFF',
      clubId: session.clubId
    })

    // Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        id: nanoid(),
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || 'CLUB_STAFF',
        clubId: session.clubId,
        active: true,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Guardar permisos si se proporcionan
    if (permissions && permissions.length > 0) {
      const permissionData = permissions.map((moduleCode: string) => ({
        userId: newUser.id,
        moduleCode: moduleCode
      }))

      await prisma.userPermission.createMany({
        data: permissionData
      })

      console.log(`Permisos guardados para usuario ${email}:`, permissions)
    }

    // TODO: Enviar email de bienvenida al usuario
    console.log(`Usuario creado exitosamente: ${email}`)

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      message: 'Usuario creado exitosamente. El usuario puede iniciar sesión con su email y contraseña.'
    })

  } catch (error) {
    console.error('Error creating team member:', error)

    // Determinar el tipo de error y devolver mensaje específico
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Este email ya está registrado' },
          { status: 400 }
        )
      }

      console.error('Detailed error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      { error: 'Error al crear el usuario. Verifica que todos los campos estén completos.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!session || !session.clubId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo el dueño del club puede editar usuarios
    if (session.role !== 'CLUB_OWNER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos para editar usuarios' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const { id, name, password, permissions } = data

    // Preparar datos de actualización
    const updateData: any = {
      name
    }

    // Si se proporciona contraseña, hashearla y agregarla a los datos de actualización
    if (password) {
      // Validar que la contraseña tenga al menos 8 caracteres
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'La contraseña debe tener al menos 8 caracteres' },
          { status: 400 }
        )
      }
      const hashedPassword = await hash(password)
      updateData.password = hashedPassword
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    })

    // Actualizar permisos si se proporcionan
    if (permissions !== undefined) {
      // Primero eliminar todos los permisos existentes
      await prisma.userPermission.deleteMany({
        where: { userId: id }
      })

      // Luego crear los nuevos permisos
      if (permissions && permissions.length > 0) {
        const permissionData = permissions.map((moduleCode: string) => ({
          userId: id,
          moduleCode: moduleCode
        }))

        await prisma.userPermission.createMany({
          data: permissionData
        })

        console.log(`Permisos actualizados para usuario ${id}:`, permissions)
      }
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: password
        ? 'Usuario actualizado exitosamente. La contraseña ha sido cambiada.'
        : 'Usuario actualizado exitosamente.'
    })

  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el usuario' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!session || !session.clubId) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Solo el dueño del club puede eliminar usuarios
    if (session.role !== 'CLUB_OWNER' && session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Sin permisos para eliminar usuarios' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID de usuario requerido' },
        { status: 400 }
      )
    }

    // No permitir eliminar al dueño del club
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (user?.role === 'CLUB_OWNER') {
      return NextResponse.json(
        { error: 'No se puede eliminar al dueño del club' },
        { status: 400 }
      )
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    })

  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el usuario' },
      { status: 500 }
    )
  }
}