import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async findAll(page: number, limit: number = 6) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.postModel
        .find()
        .sort({ _id: -1 }) // Sort by latest
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments().exec(),
    ]);

    return {
      posts: posts || [],
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
    };
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async create(createPostDto: any, file: any) {
    let imageUrl = null;

    if (file) {
      imageUrl = await this.uploadToCloudinary(file);
    }

    const newPost = new this.postModel({ ...createPostDto, image: imageUrl });
    return newPost.save();
  }

  async update(id: string, updatePostDto: any, file: any) {
    let imageUrl = null;

    if (file) {
      imageUrl = await this.uploadToCloudinary(file);
    }

    const updatedData = { ...updatePostDto, ...(imageUrl && { image: imageUrl }) };
    const updatedPost = await this.postModel.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true },
    ).exec();

    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return updatedPost;
  }

  async delete(id: string) {
    const deletedPost = await this.postModel.findByIdAndDelete(id).exec();
    if (!deletedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return deletedPost;
  }

  private async uploadToCloudinary(file: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'blog-images' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        },
      );

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }
}
