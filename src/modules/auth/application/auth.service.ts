import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { EstadoUsuario } from '@prisma/client';
import {
  InvalidCredentialsError,
  UserInactiveError,
} from '../domain/errors';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: string;
  negocioId: string | null;
}

export interface UsuarioAutenticado {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
}

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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, contrasena: string) {
    // Buscar usuario
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!usuario) {
      throw new InvalidCredentialsError();
    }

    // Verificar contraseña
    if (!usuario.contrasenaHash) {
      throw new InvalidCredentialsError();
    }
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasenaHash);
    if (!contrasenaValida) {
      throw new InvalidCredentialsError();
    }

    // Verificar estado activo
    if (usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new UserInactiveError();
    }

    // Actualizar último login
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
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
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
      },
    };
  }

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
  }
}
