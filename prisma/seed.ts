import { PrismaClient, UserRole, UserStatus, PlanType, Currency } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // ============================================================================
  // 1. CREAR SUPER ADMIN
  // ============================================================================
  const superAdminEmail = 'admin@nexocr.com';
  const superAdminPassword = 'Admin123!';

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });

    console.log('✅ Super Admin creado:');
    console.log(`   Email: ${superAdminEmail}`);
    console.log(`   Password: ${superAdminPassword}`);
    console.log(`   ID: ${superAdmin.id}\n`);
  } else {
    console.log('ℹ️  Super Admin ya existe\n');
  }

  // ============================================================================
  // 2. CREAR TENANT DE DEMO
  // ============================================================================
  const tenantSlug = 'demo-store';

  let tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Tienda Demo',
        slug: tenantSlug,
        whatsappNumber: '+50688888888',
        email: 'demo@nexocr.com',
        primaryColor: '#10b981',
        accentColor: '#f59e0b',
        planType: PlanType.PREMIUM,
        defaultCurrency: Currency.CRC,
        isActive: true,
      },
    });

    console.log('✅ Tenant Demo creado:');
    console.log(`   Nombre: ${tenant.name}`);
    console.log(`   Slug: ${tenant.slug}`);
    console.log(`   ID: ${tenant.id}\n`);
  } else {
    console.log('ℹ️  Tenant Demo ya existe\n');
  }

  // ============================================================================
  // 3. CREAR TENANT OWNER (Dueño del negocio)
  // ============================================================================
  const ownerEmail = 'owner@demo.com';
  const ownerPassword = 'Owner123!';

  const existingOwner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  });

  let ownerUser = existingOwner;

  if (!existingOwner) {
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    ownerUser = await prisma.user.create({
      data: {
        email: ownerEmail,
        passwordHash: hashedPassword,
        firstName: 'Juan',
        lastName: 'Pérez',
        phone: '+50677777777',
        role: UserRole.TENANT_OWNER,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });

    console.log('✅ Tenant Owner creado:');
    console.log(`   Email: ${ownerEmail}`);
    console.log(`   Password: ${ownerPassword}`);
    console.log(`   ID: ${ownerUser.id}\n`);
  } else {
    console.log('ℹ️  Tenant Owner ya existe\n');
  }

  // ============================================================================
  // 4. ASIGNAR OWNER AL TENANT (TenantStaff)
  // ============================================================================
  if (ownerUser) {
    const existingStaff = await prisma.tenantStaff.findFirst({
      where: {
        userId: ownerUser.id,
        tenantId: tenant.id,
      },
    });

    if (!existingStaff) {
      await prisma.tenantStaff.create({
        data: {
          userId: ownerUser.id,
          tenantId: tenant.id,
          jobTitle: 'Propietario',
          isActive: true,
          canReceiveBookings: true,
        },
      });

      console.log('✅ Owner asignado al Tenant\n');
    } else {
      console.log('ℹ️  Owner ya está asignado al Tenant\n');
    }
  }

  // ============================================================================
  // 5. CREAR CATEGORÍAS DE EJEMPLO
  // ============================================================================
  const existingCategories = await prisma.category.count({
    where: { tenantId: tenant.id },
  });

  if (existingCategories === 0) {
    await prisma.category.createMany({
      data: [
        {
          tenantId: tenant.id,
          name: 'Productos',
          slug: 'productos',
          path: 'productos',
          description: 'Productos físicos',
          sortOrder: 1,
        },
        {
          tenantId: tenant.id,
          name: 'Servicios',
          slug: 'servicios',
          path: 'servicios',
          description: 'Servicios y citas',
          sortOrder: 2,
        },
      ],
    });

    console.log('✅ Categorías de ejemplo creadas\n');
  } else {
    console.log('ℹ️  Categorías ya existen\n');
  }

  // ============================================================================
  // RESUMEN
  // ============================================================================
  console.log('═'.repeat(60));
  console.log('🎉 Seed completado exitosamente!\n');
  console.log('📋 CREDENCIALES DE ACCESO:');
  console.log('─'.repeat(60));
  console.log('');
  console.log('🔐 SUPER ADMIN (Panel /sysadmin):');
  console.log(`   Email:    ${superAdminEmail}`);
  console.log(`   Password: ${superAdminPassword}`);
  console.log('');
  console.log('🏪 TENANT OWNER (Panel /admin):');
  console.log(`   Email:    ${ownerEmail}`);
  console.log(`   Password: ${ownerPassword}`);
  console.log(`   Tienda:   ${tenant.slug} (${tenant.name})`);
  console.log('');
  console.log('🌐 URLs:');
  console.log('   Admin:     http://localhost:3000/admin');
  console.log('   SysAdmin:  http://localhost:3000/sysadmin');
  console.log(`   Storefront: http://localhost:3000/${tenant.slug}`);
  console.log('═'.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
