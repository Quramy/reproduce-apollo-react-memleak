import React from "react";

import fs from "fs";
import heapdump from "heapdump";

import { renderToString, renderToStaticMarkup } from "react-dom/server";
import { Query, ApolloProvider, getDataFromTree } from "react-apollo";
import gql from "graphql-tag";
import { ApolloClient } from "apollo-client";
import fetch from "node-fetch";
import { createHttpLink } from "apollo-link-http";
import express from "express";
import { InMemoryCache } from "apollo-cache-inmemory";

const app = express();

let heapList: number[] = [];
process.on("SIGUSR1", () => {
  const suffix = new Date().toISOString().replace(/(:|\.)/g, "_");
  const fname = `./heap_${suffix}.heapsnapshot`
  console.warn(`Dump snapshot to "${fname}"`);
  heapdump.writeSnapshot(fname);
});

process.on("SIGINT", () => {
  fs.writeFileSync("heap.json", JSON.stringify(heapList, null, 2), "utf8");
  process.exit();
});

const query_light= gql`
query {
  products(count: 2) {
    id,
    price,
  }
}
`;

const query_heavy = gql`
query {
  products(count: 2) {
    id,
    price,
    relatedProducts(count: 2) {
      id,
      price,
      relatedProducts(count: 2) {
        id,
        price,
        relatedProducts(count: 2) {
          id,
          price,
          relatedProducts(count: 2) {
            id,
            price,
            relatedProducts(count: 2) {
              id,
              price,
              relatedProducts(count: 2) {
                id,
              }
            }
          }
        }
      }
    }
  }
}
`;

const query = query_light;
// const query = query_heavy;

const MyQuery = () => (
  <Query query={query}>
    {({ loading, data }: any) => (
      <div>
        loading: {!!loading}
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    )}
  </Query>
);

const Html = ({ content, state }: { content: string, state: any }) => (
  <html>
    <body>
      <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
      <script dangerouslySetInnerHTML={{
        __html: `window.__APOLLO_STATE__=${JSON.stringify(state).replace(/</g, '\\u003c')};`,
      }} />
    </body>
  </html>
);

app.use("/", async (req, res) => {

  global.gc();

  const client = new ApolloClient({
    ssrMode: true,
    link: createHttpLink({
      uri: "http://localhost:4000/graphql",
      fetch: fetch as any,
    }),
    cache: new InMemoryCache({ resultCaching: false }),
  });

  const App = (
    <ApolloProvider client={client}>
      <MyQuery />
    </ApolloProvider>
  );

  await getDataFromTree(App);

  const content = renderToString(App);
  const initialState = client.extract();

  res.status(200);
  res.end(`<!doctype html>\n${renderToStaticMarkup(<Html content={content} state={initialState} />)}`);

  const heapSize = process.memoryUsage().heapUsed;
  console.log(heapSize);
  heapList.push(heapSize);

  global.gc();
  
});

app.listen(4010 , () => console.log(
  `React SSR server is now running on http://localhost:4010`
));
