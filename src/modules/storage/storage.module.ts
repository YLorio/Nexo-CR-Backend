import { Module, Global } from '@nestjs/common';
import { SupabaseStorageService } from './supabase-storage.service';

/**
 * Módulo de almacenamiento
 * Global para que esté disponible en toda la aplicación
 */
@Global()
@Module({
  providers: [SupabaseStorageService],
  exports: [SupabaseStorageService],
})
export class StorageModule {}
