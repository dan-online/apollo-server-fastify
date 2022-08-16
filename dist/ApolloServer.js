"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApolloServer = void 0;
const apollo_server_core_1 = require("apollo-server-core");
const accepts_1 = __importDefault(require("@fastify/accepts"));
const cors_1 = __importDefault(require("@fastify/cors"));
class ApolloServer extends apollo_server_core_1.ApolloServerBase {
    async createGraphQLServerOptions(request, reply) {
        const contextParams = { request, reply };
        return this.graphQLServerOptions(contextParams);
    }
    createHandler({ path, cors, disableHealthCheck, onHealthCheck, } = {}) {
        this.graphqlPath = path || '/graphql';
        this.assertStarted('createHandler');
        const landingPage = this.getLandingPage();
        return async (app) => {
            if (!disableHealthCheck) {
                app.get('/.well-known/apollo/server-health', async (request, reply) => {
                    reply.type('application/health+json');
                    if (onHealthCheck) {
                        try {
                            await onHealthCheck(request);
                            reply.send('{"status":"pass"}');
                        }
                        catch (e) {
                            reply.status(503).send('{"status":"fail"}');
                        }
                    }
                    else {
                        reply.send('{"status":"pass"}');
                    }
                });
            }
            app.register(async (instance) => {
                instance.register(accepts_1.default);
                if (cors === true) {
                    instance.register(cors_1.default);
                }
                else if (cors !== false) {
                    instance.register(cors_1.default, cors);
                }
                instance.setNotFoundHandler((_request, reply) => {
                    reply.code(405);
                    reply.header('allow', 'GET, POST');
                    reply.send();
                });
                const preHandler = landingPage
                    ? async (request, reply) => {
                        if (request.raw.method === 'GET') {
                            const accept = request.accepts();
                            const types = accept.types();
                            const prefersHtml = types.find((x) => x === 'text/html' || x === 'application/json') === 'text/html';
                            if (prefersHtml) {
                                reply.type('text/html');
                                reply.send(landingPage.html);
                            }
                        }
                    }
                    : undefined;
                instance.route({
                    method: ['GET', 'POST'],
                    url: '/',
                    preHandler,
                    handler: async (request, reply) => {
                        try {
                            const { graphqlResponse, responseInit } = await (0, apollo_server_core_1.runHttpQuery)([], {
                                method: request.raw.method,
                                options: () => this.createGraphQLServerOptions(request, reply),
                                query: (request.raw.method === 'POST'
                                    ? request.body
                                    : request.query),
                                request: (0, apollo_server_core_1.convertNodeHttpToRequest)(request.raw),
                            }, this.csrfPreventionRequestHeaders);
                            if (responseInit.headers) {
                                for (const [name, value] of Object.entries(responseInit.headers)) {
                                    reply.header(name, value);
                                }
                            }
                            reply.status(responseInit.status || 200);
                            reply.serializer((payload) => payload);
                            reply.send(graphqlResponse);
                        }
                        catch (error) {
                            if (!(0, apollo_server_core_1.isHttpQueryError)(error)) {
                                throw error;
                            }
                            if (error.headers) {
                                for (const [header, value] of Object.entries(error.headers)) {
                                    reply.header(header, value);
                                }
                            }
                            reply.code(error.statusCode);
                            reply.serializer((payload) => payload);
                            reply.send(error.message);
                        }
                    },
                });
            }, {
                prefix: this.graphqlPath,
            });
        };
    }
}
exports.ApolloServer = ApolloServer;
//# sourceMappingURL=ApolloServer.js.map