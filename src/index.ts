import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import express from "express";
import morgan from "morgan";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

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

    const apolloServer = new ApolloServer({
      schema: await buildSchema({
        resolvers: [HelloResolver, PostResolver],
        validate: false,
      }),
      context: () => ({
        em: orm.em,
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
