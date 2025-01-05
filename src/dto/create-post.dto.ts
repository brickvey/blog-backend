import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Title of the post' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Short description of the post' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Content of the post in HTML format' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file',
    required: false,
  })
  @IsOptional()
  image?: string;
}
