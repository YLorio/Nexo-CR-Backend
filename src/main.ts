import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ==========================================================================
  // SECURITY: Helmet - HTTP Security Headers
  // ==========================================================================
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Permitir embeds para Swagger UI
    }),
  );

  // ==========================================================================
  // SECURITY: CORS Configuration
  // ==========================================================================
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3012'];

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('NexoCR API')
    .setDescription(
      'API REST para la plataforma SaaS Multi-tenant de E-commerce + Booking para Costa Rica',
    )
    .setVersion('1.0')
    .addTag('Tenants', 'Información pública de negocios')
    .addTag('Catalog', 'Catálogo de productos y servicios')
    .addTag('Booking', 'Gestión de disponibilidad y reservas')
    .addTag('Orders', 'Gestión de pedidos')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 NexoCR API Server                                    ║
║                                                           ║
║   Server:     http://localhost:${port}                      ║
║   API Docs:   http://localhost:${port}/api/docs             ║
║                                                           ║
║   Endpoints:                                              ║
║   • GET  /api/v1/tenants/:slug                           ║
║   • GET  /api/v1/catalog                                 ║
║   • GET  /api/v1/booking/slots                           ║
║   • POST /api/v1/orders                                  ║
║   • GET  /api/v1/orders/:id                              ║
║   • POST /api/v1/orders/:id/cancel                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
