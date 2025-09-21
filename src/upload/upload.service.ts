import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private supabase: SupabaseClient | null = null;
  private isConfigured = false;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url') {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      this.isConfigured = true;
    } else {
      console.warn('Supabase credentials not configured. Image upload will not be available.');
    }
  }

  async uploadProductImage(
    file: Express.Multer.File,
    productId?: string,
  ): Promise<string> {
    if (!this.isConfigured || !this.supabase) {
      throw new BadRequestException('Image upload is not configured. Please set up Supabase credentials.');
    }

    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${productId || uuidv4()}-${Date.now()}.${fileExtension}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('e-commerce')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new BadRequestException(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = this.supabase.storage
        .from('e-commerce')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        throw new BadRequestException('Failed to get public URL');
      }

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to upload image');
    }
  }

  async deleteProductImage(imageUrl: string): Promise<void> {
    if (!this.isConfigured || !this.supabase) {
      throw new BadRequestException('Image deletion is not configured. Please set up Supabase credentials.');
    }

    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }

    try {
      // Extract file path from URL
      // URL format: https://your-project.supabase.co/storage/v1/object/public/e-commerce/products/filename.ext
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      
      // Find the bucket name and file path
      let bucketIndex = pathParts.findIndex(part => part === 'e-commerce');
      
      // If 'e-commerce' not found, try to find 'product-images' (old bucket name)
      if (bucketIndex === -1) {
        bucketIndex = pathParts.findIndex(part => part === 'product-images');
      }
      
      // If still not found, check if it's a generic Supabase storage URL
      if (bucketIndex === -1) {
        const publicIndex = pathParts.findIndex(part => part === 'public');
        if (publicIndex !== -1 && publicIndex < pathParts.length - 1) {
          bucketIndex = publicIndex;
        }
      }
      
      if (bucketIndex === -1) {
        throw new BadRequestException('Invalid image URL format - could not find bucket in URL');
      }
      
      // Get everything after the bucket name
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      
      if (!filePath) {
        throw new BadRequestException('Could not extract file path from URL');
      }

      const { error } = await this.supabase.storage
        .from('e-commerce')
        .remove([filePath]);

      if (error) {
        console.error('Failed to delete image:', error);
        throw new BadRequestException(`Failed to delete image: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete image');
    }
  }
}