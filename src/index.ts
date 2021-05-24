import { MikroORM } from "@mikro-orm/core";

import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

(async () => {
  try {
    const orm = await MikroORM.init(microConfig);

    // run the migrations before all
    await orm.getMigrator().up();

    // const post = orm.em.create(Post, { title: "my first post" });
    // await orm.em.persistAndFlush(post);

    const posts = await orm.em.find(Post, {});

    console.log(posts);
  } catch (error) {
    console.log(error);
  }
})();
