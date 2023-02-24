import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET, MONGO_URL } from "./config.js";
import typeDefs from "./schemaGql.js";

mongoose.connect(MONGO_URL, {
   useNewUrlParser: true,
   useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
   console.log("connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
   console.log("Error is connecting Mongo DB", err);
});

//import model here
import "./models/Quotes.js"
import "./models/User.js"

import resolvers from "./resolvers.js";

const context = ({ req }) => {
   const { authorization } = req.headers
   if (authorization) {
      const { userId } = jwt.verify(authorization, JWT_SECRET)
      return { userId }
   }
}

const server = new ApolloServer({
   typeDefs,
   resolvers,
   context,
   plugins: [ApolloServerPluginLandingPageGraphQLPlayground],
});

server.listen().then(({ url }) => {
   console.log(`Server ready at ${url}`);
});
