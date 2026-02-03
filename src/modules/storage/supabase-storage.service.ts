import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Opciones de procesamiento de imagen
 */
interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

/**
 * Resultado del upload
 */
interface UploadResult {
  url: string;
  path: string;
  size: number;
  format: string;
}

/**
 * Servicio de almacenamiento usando Supabase Storage
 * Procesa y optimiza imágenes antes de subirlas
 */
@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  // Configuración por defecto para optimización
  private readonly defaultOptions: ImageProcessingOptions = {
    maxWidth: 1000,
    maxHeight: 1000,
    quality: 80,
    format: 'webp',
  };

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    this.bucket = process.env.SUPABASE_BUCKET || 'nexocr-images';

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase credentials not configured. Storage will not work.');
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.logger.log(`Supabase Storage initialized with bucket: ${this.bucket}`);
  }

  /**
   * Sube un archivo con optimización automática
   * @param file - Archivo de Multer
   * @param folder - Carpeta destino (ej: 'logos', 'products', 'banners')
   * @param options - Opciones de procesamiento opcionales
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string,
    options?: Partial<ImageProcessingOptions>,
  ): Promise<UploadResult> {
    if (!this.supabase) {
      throw new BadRequestException('Supabase Storage no está configurado');
    }

    // Validar que sea una imagen
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Solo se permiten archivos de imagen');
    }

    // Validar tamaño máximo (10MB raw)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo es muy grande. Máximo 10MB');
    }

    const opts = { ...this.defaultOptions, ...options };

    try {
      // Procesar imagen con Sharp
      const processedBuffer = await this.processImage(file.buffer, opts);

      // Generar nombre único
      const fileName = `${uuidv4()}.${opts.format}`;
      const filePath = `${folder}/${fileName}`;

      // Subir a Supabase
      const { data, error } = await this.supabase.storage
        .from(this.bucket)
        .upload(filePath, processedBuffer, {
          contentType: `image/${opts.format}`,
          upsert: false,
        });

      if (error) {
        this.logger.error(`Error uploading to Supabase: ${error.message}`);
        throw new BadRequestException(`Error al subir imagen: ${error.message}`);
      }

      // Obtener URL pública
      const { data: urlData } = this.supabase.storage
        .from(this.bucket)
        .getPublicUrl(filePath);

      this.logger.log(`Image uploaded successfully: ${filePath} (${processedBuffer.length} bytes)`);

      return {
        url: urlData.publicUrl,
        path: filePath,
        size: processedBuffer.length,
        format: opts.format!,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Error processing image: ${error.message}`);
      throw new BadRequestException('Error al procesar la imagen');
    }
  }

  /**
   * Elimina un archivo del storage
   * @param path - Ruta del archivo en el bucket
   */
  async deleteFile(path: string): Promise<void> {
    if (!this.supabase) {
      throw new BadRequestException('Supabase Storage no está configurado');
    }

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw new BadRequestException(`Error al eliminar archivo: ${error.message}`);
    }

    this.logger.log(`File deleted: ${path}`);
  }

  /**
   * Extrae el path del archivo desde una URL completa de Supabase
   * @param url - URL completa del archivo
   */
  getPathFromUrl(url: string): string | null {
    if (!url) return null;

    try {
      const urlObj = new URL(url);
      // El path está después de /storage/v1/object/public/{bucket}/
      const regex = new RegExp(`/storage/v1/object/public/${this.bucket}/(.+)`);
      const match = urlObj.pathname.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Procesa una imagen: resize, conversión de formato y optimización
   */
  private async processImage(
    buffer: Buffer,
    options: ImageProcessingOptions,
  ): Promise<Buffer> {
    let sharpInstance = sharp(buffer);

    // Obtener metadata para decidir si resize es necesario
    const metadata = await sharpInstance.metadata();

    // Resize manteniendo aspect ratio (contain)
    if (
      (metadata.width && metadata.width > options.maxWidth!) ||
      (metadata.height && metadata.height > options.maxHeight!)
    ) {
      sharpInstance = sharpInstance.resize(options.maxWidth, options.maxHeight, {
        fit: 'inside', // Mantiene aspect ratio, no recorta
        withoutEnlargement: true, // No agranda imágenes pequeñas
      });
    }

    // Convertir a formato especificado con calidad
    switch (options.format) {
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: options.quality });
        break;
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality: options.quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality: options.quality });
        break;
    }

    return sharpInstance.toBuffer();
  }

  /**
   * Valida si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return !!this.supabase;
  }
}
