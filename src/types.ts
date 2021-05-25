import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";

export type MyContextType = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
};
