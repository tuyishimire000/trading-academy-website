import { NextRequest, NextResponse } from "next/server"
import { checkAdminAccess } from "@/lib/auth/admin"
import { User } from "@/lib/sequelize/models"
import bcrypt from "bcrypt"

export async function GET(request: NextRequest) {
  try {
    const { isAdmin, user, error } = await checkAdminAccess(request)
    
    if (!isAdmin || !user) {
      return NextResponse.json({ error }, { status: 401 })
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_admin: user.is_admin
    })
  } catch (error) {
    console.error('Admin profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isAdmin, user, error } = await checkAdminAccess(request)
    
    if (!isAdmin || !user) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const body = await request.json()
    const { email, currentPassword, newPassword, first_name, last_name } = body

    const adminUser = await User.findByPk(user.id)
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Update basic info
    if (first_name !== undefined) {
      adminUser.first_name = first_name
    }
    if (last_name !== undefined) {
      adminUser.last_name = last_name
    }

    // Update email if provided
    if (email && email !== adminUser.email) {
      // Check if email already exists
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser && existingUser.id !== adminUser.id) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
      adminUser.email = email
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        )
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminUser.password_hash)
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      // Hash new password
      const saltRounds = 10
      adminUser.password_hash = await bcrypt.hash(newPassword, saltRounds)
    }

    await adminUser.save()

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: adminUser.id,
        email: adminUser.email,
        first_name: adminUser.first_name,
        last_name: adminUser.last_name,
        is_admin: adminUser.is_admin
      }
    })
  } catch (error) {
    console.error('Admin profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update admin profile' },
      { status: 500 }
    )
  }
}
