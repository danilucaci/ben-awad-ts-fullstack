import {
  Ctx,
  Resolver,
  Arg,
  Mutation,
  InputType,
  Field,
  ObjectType,
} from "type-graphql";
import argon2 from "argon2";

import { User } from "../entities/User";
import { MyContextType } from "../types";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async register(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx()
    ctx: MyContextType
  ) {
    const hashPassword = await argon2.hash(options.password);

    try {
      const user = ctx.em.create(User, {
        username: options.username,
        password: hashPassword,
      });
      await ctx.em.persistAndFlush(user);
      return user;
    } catch (error) {
      return {
        errors: [
          {
            field: "username",
            message: "username already exists",
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options", () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx()
    ctx: MyContextType
  ): Promise<UserResponse> {
    const user = await ctx.em.findOne(User, { username: options.username });

    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username doesn't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "invalid password",
          },
        ],
      };
    }

    return {
      user,
    };
  }
}
