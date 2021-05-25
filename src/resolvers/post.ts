import { Ctx, Query, Resolver, Int, Arg, Mutation } from "type-graphql";

import { Post } from "../entities/Post";
import { MyContextType } from "../types";

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() ctx: MyContextType): Promise<Post[]> {
    return ctx.em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx()
    ctx: MyContextType
  ): Promise<Post | null> {
    return ctx.em.findOne(Post, { id: id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title", () => String) title: string,
    @Ctx()
    ctx: MyContextType
  ): Promise<Post> {
    const post = ctx.em.create(Post, { title: title });
    await ctx.em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Ctx()
    ctx: MyContextType
  ): Promise<Post | null> {
    const post = await ctx.em.findOne(Post, { id: id });

    if (!post) {
      return null;
    }

    if (typeof title !== "undefined") {
      post.title = title;
      await ctx.em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx()
    ctx: MyContextType
  ): Promise<boolean> {
    await ctx.em.nativeDelete(Post, id);
    return true;
  }
}
