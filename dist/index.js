"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@mikro-orm/core");
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const Post_1 = require("./entities/Post");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const orm = yield core_1.MikroORM.init(mikro_orm_config_1.default);
            yield orm.getMigrator().up();
            const posts = yield orm.em.find(Post_1.Post, {});
            console.log(posts);
            const app = express_1.default();
            const apolloServer = new apollo_server_express_1.ApolloServer({
                schema: yield type_graphql_1.buildSchema({
                    resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
                    validate: false,
                }),
                context: () => ({
                    em: orm.em,
                }),
            });
            apolloServer.applyMiddleware({ app: app });
            app.use(morgan_1.default("dev"));
            app.listen(4000, () => {
                console.log(`Server running on: http://localhost:4000`);
            });
        }
        catch (error) {
            console.log(error);
        }
    });
}
main();
//# sourceMappingURL=index.js.map