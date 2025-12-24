import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import {
  InvalidCredentialsError,
  UserInactiveError,
} from '../domain/errors';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string | null;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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
      throw new InvalidCredentialsError();
    }

    // Verificar contraseña
    if (!user.passwordHash) {
      throw new InvalidCredentialsError();
    }
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Verificar estado activo
    if (user.status !== UserStatus.ACTIVE) {
      throw new UserInactiveError();
    }

    // Actualizar último login
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
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name,
        role: user.role,
        tenantId,
        tenant,
      },
    };
  }

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
  }
}
