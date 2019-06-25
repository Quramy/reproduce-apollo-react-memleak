# Reproduce react-apollo memory leak

To reproduce https://github.com/apollographql/react-apollo/issues/2126 .

## Summary

I've measured heap size with 10,000 SSR request under the following condition.
All results indicate some memory increasing(about ~100 bytes / request).

### 1. No ApolloProvider, no apollo client

![](./graph_000_no_client.png)

### 2. No `<Query>` component
*Only instantiating an apollo client and rendering empty `<ApolloProvider>`*

![](./graph_001_no_query.png)


### 3. Not using getDataFromTree
*Using `<Query>` but not waiting for the result*

![](./graph_002_no_data_from_tree.png)

### 4. Light query
![](./graph_003_light_query.png)

### 5. Large query
![](./graph_004_heavy_query.png)

## How to measure heap size

### Install and build apps

```sh
$ yarn --pure-lockfile
$ yarn build
```

### Draw heap size graph

First, start GraphQL server process:

```sh
$ yarn start-gql
```

Second, start SSR server process, which is the target to monitor:

```sh
$ yarn start-ssr
```

Next benchmark via ab command:

```sh
$ ab -n 1000 http://localhost:4010
```

After shutdown the SSR server process, `heap.json` will be generated.

Finally, plot a heap size graph via the following:

```sh
$ ./plot.py
```

### Dump heap snapshot

Send `SIGUSR1` to the SSR server process.
