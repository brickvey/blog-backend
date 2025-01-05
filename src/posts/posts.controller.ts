import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from 'src/dto/create-post.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Retrieve all posts with pagination' })
  @ApiResponse({ status: 200, description: 'Returns paginated posts' })
  @Get()
  getAllPosts(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.postsService.findAll(Number(page), Number(limit));
  }

  @ApiOperation({ summary: 'Retrieve a specific post by ID' })
  @ApiResponse({ status: 200, description: 'Returns the post' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @Get(':id')
  getPostById(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create a new post with an optional image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'The post has been created' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Invalid file type, only images are allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file: any,
  ) {
    console.log('File received (create):', file);
    return this.postsService.create(createPostDto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: CreatePostDto,
    @UploadedFile() file: any,
  ) {
    console.log('File received (update):', file);
    return this.postsService.update(id, updatePostDto, file);
  }

  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'The post has been deleted' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @Delete(':id')
  deletePost(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}
