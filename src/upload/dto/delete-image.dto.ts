import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class DeleteImageDto {
  @ApiProperty({
    description: 'Full URL of the image to delete',
    example: 'https://your-supabase-url.supabase.co/storage/v1/object/public/e-commerce/products/filename.jpg'
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;
}