import { ApolloServerBase, Config, GraphQLOptions } from 'apollo-server-core';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
export interface ServerRegistration {
    path?: string;
    cors?: Record<string, unknown> | boolean;
    onHealthCheck?: (req: FastifyRequest) => Promise<any>;
    disableHealthCheck?: boolean;
}
export interface FastifyContext {
    request: FastifyRequest;
    reply: FastifyReply;
}
export declare type ApolloServerFastifyConfig = Config<FastifyContext>;
export declare class ApolloServer<ContextFunctionParams = FastifyContext> extends ApolloServerBase<ContextFunctionParams> {
    createGraphQLServerOptions(request: FastifyRequest, reply: FastifyReply): Promise<GraphQLOptions>;
    createHandler({ path, cors, disableHealthCheck, onHealthCheck, }?: ServerRegistration): (app: FastifyInstance) => Promise<void>;
}
//# sourceMappingURL=ApolloServer.d.ts.map