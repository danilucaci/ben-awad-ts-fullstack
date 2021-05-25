import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import morgan from "morgan";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";

import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { __prod__ } from "./constants";
import { MyContextType } from "./types";

async function main() {
  try {
    const orm = await MikroORM.init(microConfig);

    // run the migrations before all
    await orm.getMigrator().up();

    // const post = orm.em.create(Post, { title: "my first post" });
    // await orm.em.persistAndFlush(post);

    const posts = await orm.em.find(Post, {});
    console.log(posts);

    const app = express();

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
      session({
        name: "qid",
        store: new RedisStore({
          client: redisClient,
          disableTouch: true,
        }),
        cookie: {
          maxAge: 1000 * 60 * 60 * 24 * 365,
          httpOnly: true,
          sameSite: "lax", // csrf
          secure: __prod__,
        },
        secret: "my-super-secret-891h8912h8912h38912h39812h93",
        resave: false,
      })
    );

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [HelloResolver, PostResolver, UserResolver],
        validate: false,
      }),
      context: ({ req, res }): MyContextType => ({
        em: orm.em,
        req,
        res,
      }),
    });

    apolloServer.applyMiddleware({ app: app });

    app.use(morgan("dev"));

    app.listen(4000, () => {
      console.log(`Server running on: http://localhost:4000`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();
