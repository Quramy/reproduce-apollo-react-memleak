import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { v4 as uuid } from "uuid";

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Product {
    id: ID!
    price: Int!
    imageUrlSmall: String!
    imageUrlLarge: String!
    comments: [String]!
    relatedProducts(count: Int!): [Product]!
  }
  type Query {
    hello: String
    products(count: Int!): [Product]!
  }
`;

// Provide resolver functions for your schema fields

const genProducts = (n = 5) => {
  const ret = [];
  for (let i = 0; i < n; i++) {
    ret.push({
      id: uuid(),
      price: ~~(Math.random() * 10000),
      imageUrlSmall: "",
      imageUrlLarge: "",
      comments: [],
    });
  }
  return ret;
}

const resolvers = {
  Query: {
    hello: () => "Hello world!",
    products(_: any, args: { count: number }) {
      return genProducts(args.count || 3);
    },
  },
  Product: {
    relatedProducts(_: any, args: { count: number }) {
      return genProducts(args.count || 3);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`GraphQL server ready at http://localhost:4000${server.graphqlPath}`)
);
