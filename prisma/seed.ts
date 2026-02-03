import { PrismaClient, RolUsuario, EstadoUsuario, Moneda, TipoPlan } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de base de datos...');

  // Crear hash de contraseña
  const contrasenaHash = await bcrypt.hash('Admin123!', 10);

  // ============================================================================
  // SUPER ADMIN
  // ============================================================================
  const adminUsuario = await prisma.usuario.upsert({
    where: { email: 'admin@nexocr.com' },
    update: {},
    create: {
      email: 'admin@nexocr.com',
      contrasenaHash,
      nombre: 'Super',
      apellido: 'Admin',
      rol: RolUsuario.SUPER_ADMIN,
      estado: EstadoUsuario.ACTIVO,
      emailVerificadoEn: new Date(),
    },
  });

  console.log('Super Admin creado:', adminUsuario.email);

  // ============================================================================
  // NEGOCIO DEMO
  // ============================================================================
  const negocioDemo = await prisma.negocio.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      slug: 'demo',
      nombre: 'Tienda Demo',
      nombreLegal: 'Demo Store S.A.',
      email: 'demo@nexocr.com',
      telefono: '+506 8888-8888',
      whatsapp: '+50688888888',
      colorPrimario: '#6366f1',
      colorSecundario: '#f59e0b',
      moneda: Moneda.CRC,
      tipoPlan: TipoPlan.PREMIUM,
      activo: true,
    },
  });

  console.log('Negocio Demo creado:', negocioDemo.slug);

  // ============================================================================
  // USUARIO DUEÑO
  // ============================================================================
  const usuarioDueno = await prisma.usuario.upsert({
    where: { email: 'owner@demo.com' },
    update: { negocioId: negocioDemo.id },
    create: {
      email: 'owner@demo.com',
      contrasenaHash,
      nombre: 'Demo',
      apellido: 'Owner',
      rol: RolUsuario.DUENO_NEGOCIO,
      estado: EstadoUsuario.ACTIVO,
      emailVerificadoEn: new Date(),
      negocioId: negocioDemo.id,
    },
  });

  console.log('Usuario Dueño creado:', usuarioDueno.email, '(negocio:', negocioDemo.slug, ')');

  // ============================================================================
  // CATEGORIAS
  // ============================================================================
  const categoriaGeneral = await prisma.categoria.upsert({
    where: {
      negocioId_slug: {
        negocioId: negocioDemo.id,
        slug: 'general',
      },
    },
    update: {},
    create: {
      negocioId: negocioDemo.id,
      nombre: 'General',
      slug: 'general',
      descripcion: 'Productos generales',
      ruta: '/general',
      profundidad: 0,
      orden: 0,
      visible: true,
    },
  });

  console.log('Categoria creada:', categoriaGeneral.nombre);

  // ============================================================================
  // CONTADOR DE PEDIDOS
  // ============================================================================
  await prisma.contadorPedidos.upsert({
    where: { negocioId: negocioDemo.id },
    update: {},
    create: {
      negocioId: negocioDemo.id,
      ultimoNumero: 0,
    },
  });

  console.log('Contador de pedidos creado para negocio demo');

  console.log('\n========================================');
  console.log('Seed completado!');
  console.log('========================================');
  console.log('\nCredenciales Admin:');
  console.log('  Email: admin@nexocr.com');
  console.log('  Contraseña: Admin123!');
  console.log('\nCredenciales Dueño:');
  console.log('  Email: owner@demo.com');
  console.log('  Contraseña: Admin123!');
  console.log('  Negocio: demo');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
