import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  fileName?: string;
}

export class FileUploadService {
  private static readonly BUCKET_NAME = 'ticket-attachments';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  /**
   * Upload a single file to Supabase Storage
   */
  static async uploadFile(file: File, userId: string, ticketId?: string): Promise<UploadResult> {
    try {
      console.log('FileUploadService: Starting upload for file:', file.name);
      console.log('FileUploadService: File size:', file.size, 'bytes');
      console.log('FileUploadService: File type:', file.type);
      console.log('FileUploadService: User ID:', userId);
      console.log('FileUploadService: Ticket ID:', ticketId);
      
      // Validate file size
      if (file.size > this.MAX_FILE_SIZE) {
        return {
          success: false,
          error: `File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
        };
      }

      // Validate file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        return {
          success: false,
          error: `File type not allowed. Allowed types: JPG, PNG, GIF, PDF, DOC, DOCX, TXT`
        };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      console.log('FileUploadService: Generated fileName:', fileName);

      // Upload file to Supabase Storage
      console.log('FileUploadService: Attempting to upload to Supabase...');
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return {
          success: false,
          error: `Upload failed: ${error.message}`
        };
      }

      console.log('FileUploadService: Upload successful, data:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(fileName);

      console.log('FileUploadService: Public URL data:', urlData);

      return {
        success: true,
        url: urlData.publicUrl,
        fileName: fileName
      };

    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Upload multiple files to Supabase Storage
   */
  static async uploadMultipleFiles(files: File[], userId: string, ticketId?: string): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, userId, ticketId));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Supabase Storage
   */
  static async deleteFile(fileName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([fileName]);

      if (error) {
        console.error('Supabase delete error:', error);
        return {
          success: false,
          error: `Delete failed: ${error.message}`
        };
      }

      return { success: true };

    } catch (error) {
      console.error('File delete error:', error);
      return {
        success: false,
        error: `Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 10MB limit. Current size: ${this.formatFileSize(file.size)}`
      };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed. Allowed types: JPG, PNG, GIF, PDF, DOC, DOCX, TXT`
      };
    }

    return { valid: true };
  }
}

export default FileUploadService;
