import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
<<<<<<< HEAD
import { EstadoUsuario } from '@prisma/client';
=======
import { UserStatus } from '@prisma/client';
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
import {
  InvalidCredentialsError,
  UserInactiveError,
} from '../domain/errors';

export interface JwtPayload {
  sub: string;
  email: string;
<<<<<<< HEAD
  rol: string;
  negocioId: string | null;
}

export interface UsuarioAutenticado {
=======
  role: string;
  tenantId: string | null;
}

export interface AuthenticatedUser {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
}

<<<<<<< HEAD
// Alias en inglés para compatibilidad con el código existente
export type AuthenticatedUser = UsuarioAutenticado;

// Mapeo de roles de español a inglés para consistencia con el frontend
function mapRoleToEnglish(rol: string): string {
  const roleMap: Record<string, string> = {
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'DUENO_NEGOCIO': 'TENANT_OWNER',
    'ADMIN_NEGOCIO': 'TENANT_ADMIN',
    'CLIENTE': 'CUSTOMER',
  };
  return roleMap[rol] || rol;
}

=======
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

<<<<<<< HEAD
  async login(email: string, contrasena: string) {
    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!usuario) {
=======
  async login(email: string, password: string) {
    // Buscar usuario con sus asignaciones de staff (para obtener tenantId)
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        staffAssignments: {
          where: { isActive: true, deletedAt: null },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          take: 1, // Tomar el primer tenant activo
        },
      },
    });

    if (!user) {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      throw new InvalidCredentialsError();
    }

    // Verificar contraseña
<<<<<<< HEAD
    if (!usuario.contrasenaHash) {
      throw new InvalidCredentialsError();
    }
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasenaHash);
    if (!contrasenaValida) {
=======
    if (!user.passwordHash) {
      throw new InvalidCredentialsError();
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      throw new InvalidCredentialsError();
    }

    // Verificar estado activo
<<<<<<< HEAD
    if (usuario.estado !== EstadoUsuario.ACTIVO) {
=======
    if (user.status !== UserStatus.ACTIVE) {
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      throw new UserInactiveError();
    }

    // Actualizar último login
<<<<<<< HEAD
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoLoginEn: new Date() },
    });

    // Obtener información del negocio si existe
    let negocio = null;
    if (usuario.negocioId) {
      negocio = await this.prisma.negocio.findUnique({
        where: { id: usuario.negocioId },
        select: {
          id: true,
          nombre: true,
          slug: true,
        },
      });
    }

    // Construir nombre completo
    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || usuario.email;

    // Generar token
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      negocioId: usuario.negocioId,
=======
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Obtener tenantId del primer staff assignment
    const staffAssignment = user.staffAssignments[0];
    const tenantId = staffAssignment?.tenantId || null;
    const tenant = staffAssignment?.tenant || null;

    // Construir nombre
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    // Generar token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
<<<<<<< HEAD
        id: usuario.id,
        email: usuario.email,
        name: nombreCompleto,
        role: mapRoleToEnglish(usuario.rol),
        tenantId: usuario.negocioId,
        tenant: negocio ? {
          id: negocio.id,
          name: negocio.nombre,
          slug: negocio.slug,
        } : null,
=======
        id: user.id,
        email: user.email,
        name,
        role: user.role,
        tenantId,
        tenant,
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
      },
    };
  }

<<<<<<< HEAD
  async validarUsuarioPorId(usuarioId: string): Promise<UsuarioAutenticado | null> {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        id: usuarioId,
        estado: EstadoUsuario.ACTIVO,
        eliminadoEn: null,
      },
    });

    if (!usuario) {
      return null;
    }

    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || usuario.email;

    return {
      id: usuario.id,
      email: usuario.email,
      name: nombreCompleto,
      role: mapRoleToEnglish(usuario.rol),
      tenantId: usuario.negocioId,
    };
  }

  async obtenerUsuarioConNegocio(usuarioId: string) {
    const usuario = await this.prisma.usuario.findFirst({
      where: {
        id: usuarioId,
        estado: EstadoUsuario.ACTIVO,
        eliminadoEn: null,
      },
    });

    if (!usuario) {
      return null;
    }

    // Obtener información del negocio si existe
    let negocio = null;
    if (usuario.negocioId) {
      negocio = await this.prisma.negocio.findUnique({
        where: { id: usuario.negocioId },
        select: {
          id: true,
          nombre: true,
          slug: true,
        },
      });
    }

    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ') || usuario.email;

    return {
      id: usuario.id,
      email: usuario.email,
      name: nombreCompleto,
      role: mapRoleToEnglish(usuario.rol),
      tenantId: usuario.negocioId,
      tenant: negocio ? {
        id: negocio.id,
        name: negocio.nombre,
        slug: negocio.slug,
      } : null,
    };
  }

  // Alias en inglés para compatibilidad
  async validateUserById(userId: string): Promise<UsuarioAutenticado | null> {
    return this.validarUsuarioPorId(userId);
  }

  // Alias en inglés para compatibilidad
  async getUserWithTenant(userId: string) {
    return this.obtenerUsuarioConNegocio(userId);
=======
  async validateUserById(userId: string): Promise<AuthenticatedUser | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      include: {
        staffAssignments: {
          where: { isActive: true, deletedAt: null },
          take: 1,
        },
      },
    });

    if (!user) {
      return null;
    }

    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
    const tenantId = user.staffAssignments[0]?.tenantId || null;

    return {
      id: user.id,
      email: user.email,
      name,
      role: user.role,
      tenantId,
    };
  }

  async getUserWithTenant(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        status: UserStatus.ACTIVE,
        deletedAt: null,
      },
      include: {
        staffAssignments: {
          where: { isActive: true, deletedAt: null },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          take: 1,
        },
      },
    });

    if (!user) {
      return null;
    }

    const staffAssignment = user.staffAssignments[0];
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

    return {
      id: user.id,
      email: user.email,
      name,
      role: user.role,
      tenantId: staffAssignment?.tenantId || null,
      tenant: staffAssignment?.tenant || null,
    };
>>>>>>> 66dea1032b6ec2617a2dac12f0fdb510837b194d
  }
}
