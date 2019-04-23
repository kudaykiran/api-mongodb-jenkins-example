"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Hapi = require("hapi");
const Joi = require("joi");
const mongodb_1 = require("mongodb");
const Inert = require("inert");
const Vision = require("vision");
const HapiSwagger = require("hapi-swagger");
const server = new Hapi.Server();
const port = process.env.PORT || 3000;
server.connection({ port });
(async () => {
    const connectionString = `mongodb://${process.env.MONGO_URL ||
        "localhost"}/movies`;
    const connection = await mongodb_1.MongoClient.connect(connectionString);
    console.log("mongo db is running");
    const db = connection.db("movies").collection("movie");
    await server.register([
        Inert,
        Vision,
        {
            register: HapiSwagger,
            options: {
                info: {
                    title: "Node.js with MongoDB Example - TCC new",
                    version: "1.0"
                }
            }
        }
    ]);
    server.route([
        {
            method: "GET",
            path: "/movies",
            config: {
                handler: (req, reply) => {
                    return reply(db.find().toArray());
                },
                description: "List All movies",
                notes: "movies from database",
                tags: ["api"]
            }
        },
        {
            method: "POST",
            path: "/movies",
            config: {
                handler: (req, reply) => {
                    const { payload } = req;
                    return reply(db.insert(payload));
                },
                description: "Create a movie",
                notes: "create a movie",
                tags: ["api"],
                validate: {
                    payload: {
                        name: Joi.string().required(),
                        category: Joi.string().required()
                    }
                }
            }
        },
        {
            method: "DELETE",
            path: "/movies/{id}",
            config: {
                handler: (req, reply) => {
                    return reply(db.remove({ _id: req.params.id }));
                },
                description: "Delete a movie",
                notes: "Delete a movie",
                tags: ["api"],
                validate: {
                    params: {
                        id: Joi.string().required()
                    }
                }
            }
        }
    ]);
    await server.start();
    console.log("server running at", port);
})();
