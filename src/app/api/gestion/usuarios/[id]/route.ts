import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongoose';
import UserModel from '@/app/models/User';
import { verifyAdmin } from '@/app/lib/auth';

export async function PATCH(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin || (admin.role !== 'admin' && admin.role !== 'superadmin')) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    
    // 🛡️ PROTECCIÓN CLAVE: Bloquear auto-modificación de rol
    if (id === admin.id) {
      return NextResponse.json({ 
        message: 'No puedes cambiar tu propio rol por seguridad. Pídele a otro administrador que lo haga.' 
      }, { status: 403 });
    }

    const body = await req.json();
    const { role } = body;

    // Validación estricta de roles permitidos
    const allowedRoles = ['user', 'vendedor', 'admin', 'superadmin'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ message: 'Rol no válido' }, { status: 400 });
    }

    // 🛡️ PROTECCIÓN EXTRA: Un admin NO puede ascender a alguien a superadmin
    // Solo un superadmin puede crear otro superadmin
    if (role === 'superadmin' && admin.role !== 'superadmin') {
      return NextResponse.json({ 
        message: 'Solo un Superadministrador puede otorgar el rol de Superadministrador.' 
      }, { status: 403 });
    }

    await connectDB();

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpires');

    if (!updatedUser) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Rol actualizado a ${role}`, 
      user: updatedUser 
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error actualizando rol:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}