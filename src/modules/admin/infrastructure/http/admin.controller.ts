import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AdminCatalogService } from '../../application/admin-catalog.service';
import { AdminOrdersService } from '../../application/admin-orders.service';
import { AdminSettingsService } from '../../application/admin-settings.service';
import { AdminStaffService } from '../../application/admin-staff.service';
import { AdminPagesService } from '../../application/admin-pages.service';
import { SupabaseStorageService } from '../../../storage/supabase-storage.service';
import { EmployeeWithServices } from '../../application/admin-staff.service';
import {
  CreateCatalogItemDto,
  UpdateCatalogItemDto,
  ListCatalogQueryDto,
  ListOrdersQueryDto,
  UpdateOrderStatusDto,
  UpdateSettingsDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  ReorderCategoriesDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  SetAvailabilityDto,
} from './dto';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../../auth/application/auth.service';

/**
 * Controlador Admin para dueños de negocio (TENANT_OWNER)
 * SEGURIDAD: Todos los endpoints usan tenantId del JWT, nunca de params
 */
@ApiTags('Admin (Tenant Dashboard)')
@ApiBearerAuth()
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TENANT_OWNER', 'SUPER_ADMIN')
export class AdminController {
  constructor(
    private readonly catalogService: AdminCatalogService,
    private readonly ordersService: AdminOrdersService,
    private readonly settingsService: AdminSettingsService,
    private readonly staffService: AdminStaffService,
    private readonly pagesService: AdminPagesService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  /**
   * Verifica que el usuario tiene un tenantId asignado
   */
  private getTenantId(user: AuthenticatedUser): string {
    if (!user.tenantId) {
      throw new ForbiddenException('Usuario no tiene un negocio asignado');
    }
    return user.tenantId;
  }

  // ==================== DASHBOARD ====================

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  @ApiResponse({ status: 200, description: 'Estadísticas del negocio' })
  async getDashboard(@CurrentUser() user: AuthenticatedUser) {
    const tenantId = this.getTenantId(user);
    return this.ordersService.getDashboardStats(tenantId);
  }

  // ==================== CATÁLOGO ====================

  @Get('catalog')
  @ApiOperation({ summary: 'Listar productos y servicios del catálogo' })
  @ApiResponse({ status: 200, description: 'Lista del catálogo' })
  async listCatalog(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListCatalogQueryDto,
  ) {
    const tenantId = this.getTenantId(user);
    return this.catalogService.listItems(tenantId, query);
  }

  @Post('catalog')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo producto o servicio' })
  @ApiResponse({ status: 201, description: 'Item creado' })
  async createCatalogItem(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCatalogItemDto,
  ) {
    const tenantId = this.getTenantId(user);
    return this.catalogService.createItem(tenantId, dto);
  }

  @Patch('catalog/:id')
  @ApiOperation({ summary: 'Actualizar producto o servicio' })
  @ApiResponse({ status: 200, description: 'Item actualizado' })
  async updateCatalogItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCatalogItemDto,
  ) {
    const tenantId = this.getTenantId(user);
    return this.catalogService.updateItem(tenantId, id, dto);
  }

  @Delete('catalog/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (desactivar) producto o servicio' })
  @ApiResponse({ status: 204, description: 'Item eliminado' })
  async deleteCatalogItem(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const tenantId = this.getTenantId(user);
    await this.catalogService.deleteItem(tenantId, id);
  }

  // ==================== CATEGORÍAS ====================

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías (plano)' })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  async listCategories(@CurrentUser() user: AuthenticatedUser) {
    const tenantId = this.getTenantId(user);
    return this.catalogService.listCategories(tenantId);
  }

  @Get('categories/tree')
  @ApiOperation({ summary: 'Obtener árbol jerárquico de categorías' })
  @ApiResponse({ status: 200, description: 'Árbol de categorías' })
  async getCategoryTree(@CurrentUser() user: AuthenticatedUser) {
    const tenantId = this.getTenantId(user);
    return this.catalogService.getCategoryTree(tenantId);
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear categoría' })
  @ApiResponse({ status: 201, description: 'Categoría creada' })
  async createCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoryDto,
  ) {
    const tenantId = this.getTenantId(user);
    return this.catalogService.createCategoryHierarchy(tenantId, dto);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  @ApiResponse({ status: 200, description: 'Categoría actualizada' })
  async updateCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    const tenantId = this.getTenantId(user);
    return this.catalogService.updateCategory(tenantId, id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar categoría' })
  @ApiResponse({ status: 204, description: 'Categoría eliminada' })
  async deleteCategory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const tenantId = this.getTenantId(user);
    await this.catalogService.deleteCategory(tenantId, id);
  }

  @Post('categories/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reordenar categorías' })
  async reorderCategories(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ReorderCategoriesDto,
  ) {
    const tenantId = this.getTenantId(user);
    await this.catalogService.reorderCategories(tenantId, dto);
    return { message: 'Categorías reordenadas correctamente' };
  }

  // ==================== ÓRDENES ====================

  @Get('orders')
  @ApiOperation({ summary: 'Listar órdenes' })
  @ApiResponse({ status: 200, description: 'Lista de órdenes' })
  async listOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListOrdersQueryDto,
  ) {
    const tenantId = this.getTenantId(user);
    return this.ordersService.listOrders(tenantId, query);
  }

  @Get('orders/kanban')
  @ApiOperation({ summary: 'Obtener órdenes agrupadas para el Kanban' })
  @ApiResponse({ status: 200, description: 'Órdenes por estado' })
  async getKanbanOrders(@CurrentUser() user: AuthenticatedUser) {
    const tenantId = this.getTenantId(user);
    return this.ordersService.getOrdersForKanban(tenantId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Obtener una orden por ID' })
  @ApiResponse({ status: 200, description: 'Detalle de la orden' })
  async getOrderById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const tenantId = this.getTenantId(user);
    return this.ordersService.getOrderById(tenantId, id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de una orden' })
  @ApiResponse({ status: 200, description: 'Orden actualizada' })
  async updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const tenantId = this.getTenantId(user);
    return this.ordersService.updateOrderStatus(tenantId, id, dto.status);
  }

  // ==================== CONFIGURACIÓN DEL NEGOCIO ====================

  @Get('settings')
  @ApiOperation({ summary: 'Obtener configuración del negocio' })
  @ApiResponse({ status: 200, description: 'Configuración actual del negocio' })
  async getSettings(@CurrentUser() user: AuthenticatedUser) {
    const tenantId = this.getTenantId(user);
    return this.settingsService.getSettings(tenantId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Actualizar configuración del negocio' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada' })
  async updateSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSettingsDto,
  ) {
    const tenantId = this.getTenantId(user);
    return this.settingsService.updateSettings(tenantId, dto);
  }

  @Patch('settings/theme/layout')
  @ApiOperation({ summary: 'Actualizar configuración del layout del tema (Header/Footer)' })
  @ApiResponse({ status: 200, description: 'Layout actualizado' })
  async updateThemeLayout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { layoutConfig: any },
  ) {
    const tenantId = this.getTenantId(user);
    return this.settingsService.updateThemeLayout(tenantId, body.layoutConfig);
  }

  // ==================== UPLOAD DE IMÁGENES ====================

  @Post('upload/product-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Subir imagen de producto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Imagen subida correctamente' })
  async uploadProductImage(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.getTenantId(user); // Verificar que tiene tenant

    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    const result = await this.storageService.uploadFile(file, 'products');
    return { url: result.url };
  }

  @Post('upload/category-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Subir imagen de categoría' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Imagen subida correctamente' })
  async uploadCategoryImage(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.getTenantId(user); // Verificar que tiene tenant

    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    const result = await this.storageService.uploadFile(file, 'categories', {
      maxWidth: 600,
      maxHeight: 600,
    });
    return { url: result.url };
  }

  @Post('upload/logo')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Subir logo del negocio' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Logo subido correctamente' })
  async uploadLogo(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const tenantId = this.getTenantId(user);

    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    // Logos pueden ser más pequeños
    const result = await this.storageService.uploadFile(file, 'logos', {
      maxWidth: 500,
      maxHeight: 500,
    });

    // Actualizar el logo del tenant automáticamente
    await this.settingsService.updateSettings(tenantId, { logoUrl: result.url });

    return { url: result.url };
  }

  @Post('upload/banner')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Subir y agregar un banner a la tienda (máximo 3)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Banner subido y agregado correctamente' })
  async uploadBanner(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const tenantId = this.getTenantId(user);

    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    // Banners pueden ser más grandes para mejor calidad
    const result = await this.storageService.uploadFile(file, 'banners', {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 85,
    });

    // Agregar el banner al array (máximo 3)
    const bannerResult = await this.settingsService.addBanner(tenantId, result.url);

    return bannerResult;
  }

  @Post('settings/banner')
  @ApiOperation({ summary: 'Agregar un banner por URL (máximo 3)' })
  @ApiResponse({ status: 201, description: 'Banner agregado correctamente' })
  async addBannerByUrl(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { url: string },
  ) {
    const tenantId = this.getTenantId(user);
    return this.settingsService.addBanner(tenantId, body.url);
  }

  @Delete('settings/banner/:index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar un banner por índice' })
  @ApiResponse({ status: 200, description: 'Banner eliminado' })
  async removeBanner(
    @CurrentUser() user: AuthenticatedUser,
    @Param('index') index: string,
  ) {
    const tenantId = this.getTenantId(user);
    const indexNum = parseInt(index, 10);
    if (isNaN(indexNum)) {
      throw new BadRequestException('Índice inválido');
    }
    return this.settingsService.removeBanner(tenantId, indexNum);
  }

  // ==================== EQUIPO (STAFF) ====================

  @Get('staff')
  @ApiOperation({ summary: 'Listar empleados del negocio' })
  @ApiResponse({ status: 200, description: 'Lista de empleados' })
  async listEmployees(@CurrentUser() user: AuthenticatedUser): Promise<EmployeeWithServices[]> {
    const tenantId = this.getTenantId(user);
    return this.staffService.listEmployees(tenantId);
  }

  @Get('staff/:id')
  @ApiOperation({ summary: 'Obtener un empleado por ID' })
  @ApiResponse({ status: 200, description: 'Datos del empleado' })
  async getEmployee(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<EmployeeWithServices> {
    const tenantId = this.getTenantId(user);
    return this.staffService.getEmployee(tenantId, id);
  }

  @Post('staff')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado' })
  async createEmployee(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEmployeeDto,
  ): Promise<EmployeeWithServices> {
    const tenantId = this.getTenantId(user);
    return this.staffService.createEmployee(tenantId, dto);
  }

  @Patch('staff/:id')
  @ApiOperation({ summary: 'Actualizar empleado' })
  @ApiResponse({ status: 200, description: 'Empleado actualizado' })
  async updateEmployee(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<EmployeeWithServices> {
    const tenantId = this.getTenantId(user);
    return this.staffService.updateEmployee(tenantId, id, dto);
  }

  @Delete('staff/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (desactivar) empleado' })
  @ApiResponse({ status: 204, description: 'Empleado eliminado' })
  async deleteEmployee(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    const tenantId = this.getTenantId(user);
    await this.staffService.deleteEmployee(tenantId, id);
  }

  @Post('staff/:id/availability')
  @ApiOperation({ summary: 'Configurar horario de disponibilidad del empleado' })
  @ApiResponse({ status: 200, description: 'Horario configurado' })
  async setEmployeeAvailability(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SetAvailabilityDto,
  ): Promise<{ message: string }> {
    const tenantId = this.getTenantId(user);
    await this.staffService.setAvailabilityBlocks(tenantId, id, dto.blocks);
    return { message: 'Horario actualizado correctamente' };
  }

  @Post('upload/staff-photo')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Subir foto de empleado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Foto subida correctamente' })
  async uploadStaffPhoto(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    this.getTenantId(user); // Verificar que tiene tenant

    if (!file) {
      throw new BadRequestException('No se proporcionó ninguna imagen');
    }

    const result = await this.storageService.uploadFile(file, 'staff', {
      maxWidth: 400,
      maxHeight: 400,
    });
    return { url: result.url };
  }

  // ==================== PÁGINAS (BUILDER) ====================

  @Get('pages/home')
  @ApiOperation({ summary: 'Obtener configuración de la página de inicio' })
  async getHomePage(@CurrentUser() user: AuthenticatedUser) {
    const tenantId = this.getTenantId(user);
    return this.pagesService.getHomePageConfig(tenantId);
  }

  @Patch('pages/home')
  @ApiOperation({ summary: 'Actualizar configuración de la página de inicio' })
  @ApiBody({ schema: { type: 'object' } }) // Generic JSON body
  async updateHomePage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() config: any,
  ) {
    const tenantId = this.getTenantId(user);
    return this.pagesService.updateHomePageConfig(tenantId, config);
  }
}
