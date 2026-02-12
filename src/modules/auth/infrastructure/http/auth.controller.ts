import { Controller, Post, Body, Get, Patch, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, AuthenticatedUser } from '../../application/auth.service';
import { LoginDto, LoginResponseDto, RegisterCustomerDto, UpdateProfileDto, UpdateProfileResponseDto } from './dto';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo cliente' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: LoginResponseDto,
  })
  async register(@Body() registerDto: RegisterCustomerDto) {
    return this.authService.registerCustomer(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getUserWithTenant(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar perfil del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: UpdateProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto
  ): Promise<UpdateProfileResponseDto> {
    return this.authService.updateProfile(user.id, dto);
  }
}
