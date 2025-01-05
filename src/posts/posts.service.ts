import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async findAll(page: number, limit: number = 6) {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.postModel
        .find()
        .sort({ _id: -1 }) 
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

  async create(createPostDto: any) {
    const newPost = new this.postModel(createPostDto);
    return newPost.save();
  }

  async update(id: string, updatePostDto: any) {
    const updatedPost = await this.postModel.findByIdAndUpdate(
      id,
      { $set: updatePostDto }, 
      { new: true } 
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
}
