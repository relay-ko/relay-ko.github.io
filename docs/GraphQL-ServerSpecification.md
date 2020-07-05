---
id: graphql-server-specification
title: GraphQL Server Specification
---

이 문서의 목표는 릴레이로 GraphQL 서버를 구성했다고 가정하고, GraphQL 스키마 예제를 통해 릴레이의 기능들을 설명하는 것입니다.

목차:

- [머릿말](#머릿말)
- [스키마](#스키마)
- [객체 식별](#객체-식별)
- [커넥션](#커넥션)
- [뮤테이션](#뮤테이션)
- [추가 자료](#추가-자료)

## 머릿말

릴레이가 GraphQL 서버에서 수행하는 3가지 핵심은 아래와 같습니다.

1. 객체를 다시 가져 오는 메커니즘.
2. 연결을 통해 페이징하는 방법에 대한 설명.
3. 뮤테이션(Mutations)을 예측할 수 있는 구조.

이 문서는 릴레이에 대한 자세한 설명을 다루지는 않지만 릴레이를 자세히 살펴보기 전에 릴레이의 핵심 내용을 빠르게 소개하기 위해 작성되었습니다. 아래에서는 앞서 설명한 세 가지 핵심 요소들을 보여줍니다.

예제에서는 GraphQL을 사용하여 오리지널 스타워즈 3부작의 배(Ships)와 진영(Factions)에 대한 정보를 쿼리하는 전제로 설명합니다.

이 문서를 읽는 여러분은 이미 [GraphQL](http://graphql.org/)에 익숙하다고 가정합니다. 만약 아직 GraphQL에 익숙하지 않다면 [GraphQL.js](https://github.com/graphql/graphql-js)의 README를 먼저 읽으시는 것을 권장합니다.

또한 이미 [스타 워즈](https://en.wikipedia.org/wiki/Star_Wars)에 익숙하다고 가정합니다. 만약 스타워즈를 보시지 않았다면, 원작인 1977 버전의 스타워즈가 최고라고 할 수 있겠지만, 여기서는 설명을 위해 스타 워즈 - 스페셜 에디션으로 설명합니다.
## 스키마

The schema described below will be used to demonstrate the functionality that a GraphQL server used by Relay should implement. The two core types are a faction and a ship in the Star Wars universe, where a faction has many ships associated with it. The schema below is the output of the GraphQL.js [`schemaPrinter`](https://github.com/graphql/graphql-js/blob/master/src/utilities/schemaPrinter.js).

```
interface Node {
  id: ID!
}

type Faction implements Node {
  id: ID!
  name: String
  ships: ShipConnection
}

type Ship implements Node {
  id: ID!
  name: String
}

type ShipConnection {
  edges: [ShipEdge]
  pageInfo: PageInfo!
}

type ShipEdge {
  cursor: String!
  node: Ship
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  rebels: Faction
  empire: Faction
  node(id: ID!): Node
}

input IntroduceShipInput {
  factionId: String!
  shipNamed: String!
}

type IntroduceShipPayload {
  faction: Faction
  ship: Ship
}

type Mutation {
  introduceShip(input: IntroduceShipInput!): IntroduceShipPayload
}
```

## 객체 식별

Both `Faction` and `Ship` have identifiers that we can use to refetch them. We expose this capability to Relay through the `Node` interface and the `node` field on the root query type.

The `Node` interface contains a single field, `id`, which is an `ID!`. The `node` root field takes a single argument, an `ID!`, and returns a `Node`. These two work in concert to allow refetching; if we pass the `id` returned in that field to the `node` field, we get the object back.

Let's see this in action, and query for the ID of the rebels:

```
query RebelsQuery {
  rebels {
    id
    name
  }
}
```

returns

```json
{
  "rebels": {
    "id": "RmFjdGlvbjox",
    "name": "Alliance to Restore the Republic"
  }
}
```

So now we know the ID of the Rebels in our system. We can now refetch them:

```
query RebelsRefetchQuery {
  node(id: "RmFjdGlvbjox") {
    id
    ... on Faction {
      name
    }
  }
}
```

returns

```json
{
  "node": {
    "id": "RmFjdGlvbjox",
    "name": "Alliance to Restore the Republic"
  }
}
```

If we do the same thing with the Empire, we'll find that it returns a different ID, and we can refetch it as well:

```
query EmpireQuery {
  empire {
    id
    name
  }
}
```

yields

```json
{
  "empire": {
    "id": "RmFjdGlvbjoy",
    "name": "Galactic Empire"
  }
}
```

and

```
query EmpireRefetchQuery {
  node(id: "RmFjdGlvbjoy") {
    id
    ... on Faction {
      name
    }
  }
}
```

yields

```json
{
  "node": {
    "id": "RmFjdGlvbjoy",
    "name": "Galactic Empire"
  }
}
```

The `Node` interface and `node` field assume globally unique IDs for this refetching. A system without globally unique IDs can usually synthesize them by combining the type with the type-specific ID, which is what was done in this example.

The IDs we got back were base64 strings. IDs are designed to be opaque (the only thing that should be passed to the `id` argument on `node` is the unaltered result of querying `id` on some object in the system), and base64ing a string is a useful convention in GraphQL to remind viewers that the string is an opaque identifier.

Complete details on how the server should behave are available in the [GraphQL Object Identification](https://graphql.org/learn/global-object-identification/) best practices guide in the GraphQL site.

## 커넥션

A faction has many ships in the Star Wars universe. Relay contains functionality to make manipulating one-to-many relationships easy, using a standardized way of expressing these one-to-many relationships. This standard connection model offers ways of slicing and paginating through the connection.

Let's take the rebels, and ask for their first ship:

```
query RebelsShipsQuery {
  rebels {
    name,
    ships(first: 1) {
      edges {
        node {
          name
        }
      }
    }
  }
}
```

yields

```json
{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "ships": {
      "edges": [
        {
          "node": {
            "name": "X-Wing"
          }
        }
      ]
    }
  }
}
```

That used the `first` argument to `ships` to slice the result set down to the first one. But what if we wanted to paginate through it? On each edge, a cursor will be exposed that we can use to paginate. Let's ask for the first two this time, and get the cursor as well:

```
query MoreRebelShipsQuery {
  rebels {
    name,
    ships(first: 2) {
      edges {
        cursor
        node {
          name
        }
      }
    }
  }
}
```

and we get back

```json
{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "ships": {
      "edges": [
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjA=",
          "node": {
            "name": "X-Wing"
          }
        },
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjE=",
          "node": {
            "name": "Y-Wing"
          }
        }
      ]
    }
  }
}
```

Notice that the cursor is a base64 string. That's the pattern from earlier: the server is reminding us that this is an opaque string. We can pass this string back to the server as the `after` argument to the `ships` field, which will let us ask for the next three ships after the last one in the previous result:

```
query EndOfRebelShipsQuery {
  rebels {
    name,
    ships(first: 3 after: "YXJyYXljb25uZWN0aW9uOjE=") {
      edges {
        cursor,
        node {
          name
        }
      }
    }
  }
}
```

gives us

```json

{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "ships": {
      "edges": [
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjI=",
          "node": {
            "name": "A-Wing"
          }
        },
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjM=",
          "node": {
            "name": "Millenium Falcon"
          }
        },
        {
          "cursor": "YXJyYXljb25uZWN0aW9uOjQ=",
          "node": {
            "name": "Home One"
          }
        }
      ]
    }
  }
}
```

Sweet! Let's keep going and get the next four!

```
query RebelsQuery {
  rebels {
    name,
    ships(first: 4 after: "YXJyYXljb25uZWN0aW9uOjQ=") {
      edges {
        cursor,
        node {
          name
        }
      }
    }
  }
}
```

yields

```json
{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "ships": {
      "edges": []
    }
  }
}
```

Hm. There were no more ships; guess there were only five in the system for the rebels. It would have been nice to know that we'd reached the end of the connection, without having to do another round trip in order to verify that. The connection model exposes this capability with a type called `PageInfo`. So let's issue the two queries that got us ships again, but this time ask for `hasNextPage`:

```
query EndOfRebelShipsQuery {
  rebels {
    name,
    originalShips: ships(first: 2) {
      edges {
        node {
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
    moreShips: ships(first: 3 after: "YXJyYXljb25uZWN0aW9uOjE=") {
      edges {
        node {
          name
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
}
```

and we get back

```json
{
  "rebels": {
    "name": "Alliance to Restore the Republic",
    "originalShips": {
      "edges": [
        {
          "node": {
            "name": "X-Wing"
          }
        },
        {
          "node": {
            "name": "Y-Wing"
          }
        }
      ],
      "pageInfo": {
        "hasNextPage": true
      }
    },
    "moreShips": {
      "edges": [
        {
          "node": {
            "name": "A-Wing"
          }
        },
        {
          "node": {
            "name": "Millenium Falcon"
          }
        },
        {
          "node": {
            "name": "Home One"
          }
        }
      ],
      "pageInfo": {
        "hasNextPage": false
      }
    }
  }
}
```

So on the first query for ships, GraphQL told us there was a next page, but on the next one, it told us we'd reached the end of the connection.

Relay uses all of this functionality to build out abstractions around connections, to make these easy to work with efficiently without having to manually manage cursors on the client.

Complete details on how the server should behave are available in the [GraphQL Cursor Connections](/graphql/connections.htm) spec.

## 뮤테이션

Relay uses a common pattern for mutations, where there are root fields on the mutation type with a single argument, `input`, and where the input and output both contain a client mutation identifier used to reconcile requests and responses.

By convention, mutations are named as verbs, their inputs are the name with "Input" appended at the end, and they return an object that is the name with "Payload" appended.

So for our `introduceShip` mutation, we create two types: `IntroduceShipInput` and `IntroduceShipPayload`:

```
input IntroduceShipInput {
  factionId: ID!
  shipName: String!
}

type IntroduceShipPayload {
  faction: Faction
  ship: Ship
}
```

With this input and payload, we can issue the following mutation:

```
mutation AddBWingQuery($input: IntroduceShipInput!) {
  introduceShip(input: $input) {
    ship {
      id
      name
    }
    faction {
      name
    }
  }
}
```

with these params:

```json
{
  "input": {
    "shipName": "B-Wing",
    "factionId": "1"
  }
}
```

and we'll get this result:

```json
{
  "introduceShip": {
    "ship": {
      "id": "U2hpcDo5",
      "name": "B-Wing"
    },
    "faction": {
      "name": "Alliance to Restore the Republic"
    }
  }
}
```

## 추가 자료

This concludes the overview of the GraphQL Server Specifications. For the detailed requirements of a Relay-compliant GraphQL server, a more formal description of the [Relay cursor connection](/graphql/connections.htm) model, the [GraphQL global object identification](https://graphql.org/learn/global-object-identification/) model are all available.

To see code implementing the specification, the [GraphQL.js Relay library](https://github.com/graphql/graphql-relay-js) provides helper functions for creating nodes, connections, and mutations; that repository's [`__tests__`](https://github.com/graphql/graphql-relay-js/tree/master/src/__tests__) folder contains an implementation of the above example as integration tests for the repository.
