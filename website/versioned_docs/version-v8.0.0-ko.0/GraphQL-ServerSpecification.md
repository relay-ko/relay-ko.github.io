---
id: version-v8.0.0-ko.0-graphql-server-specification
title: GraphQL 서버 명세
original_id: graphql-server-specification
---

이 문서에선 Relay가 GraphQL 서버에 대해 가지고 있는 가정을 살펴보고, GraphQL 스키마 예제를 통해 실제 쓰임을 알아볼 수 있습니다.

목차:

- [시작하기](#시작하기)
- [스키마](#스키마)
- [오브젝트 식별](#오브젝트-식별)
- [커넥션](#커넥션)
- [뮤테이션](#뮤테이션)
- [더 읽어보기](#더-읽어보기)

## 시작하기

Relay는 GraphQL 서버가 아래의 세가지 기능을 제공한다고 가정합니다.

1. 객체를 다시 가져오는 (re-fetching) 하는 메커니즘.
2. 커넥션을 통해 페이지를 이동하는 방법.
3. 뮤테이션 작업을 추적가능하게 하는 구조.

이 문서의 예제에선 위의 세가지를 모두 다룹니다. 세세하진 않지만, Relay의 핵심 가정을 빠르게 살펴보고 더 구체화된 구현을 알아보기 위한 맥락을 제공하기 위해 고안되었습니다.

그럼, GraphQL 쿼리를 이용해 오리지널 스타워즈 삼부작의 함선(ships)과 팩션(faction)을 쿼리하는 상황을 생각해봅시다.

이미 GraphQL에 대해선 친숙하다고 가정합니다. 만약 아니라면, [GraphQL.js](https://github.com/graphql/graphql-js)의 README를 읽어보는 것이 좋습니다.

[스타워즈](https://en.wikipedia.org/wiki/Star_Wars)에 대해서도 잘 알고 있다는 가정을 하고 있습니다. 아직 접해보지 않으신 분들은 1977년 개봉작부터 시작하시면 됩니다. 참고로 예제는 1997년 스페셜 에디션작을 직접적으로 다루고 있습니다.

## 스키마

아래의 스키마는 Relay에서 사용되는 GraphQL 서버가 구현해야하는 기능을 표현하기 위해 사용됩니다. 
팩션과 함선이 핵심 타입이며, 하나의 팩션은 많은 함선을 가질 수 있습니다. 아래의 스키마는 GraphQL.js 의 [`schemaPrinter`](https://github.com/graphql/graphql-js/blob/master/src/utilities/schemaPrinter.js)의 결과물입니다.


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

## 오브젝트 식별

`Faction`과 `Ship`은 리페치(refetch)시 사용가능한 식별자를 가지고 있습니다. 식별자는 루트 쿼리 타입의 `Node` 인터페이스와 `node` 필드를 통해 Relay에 노출됩니다.

`Node` 인터페이스는 `ID!` 타입의 단일 필드 `id`를 가집니다. `node` 루트 필드는 `ID!`라는 단일 인자를 받고 `Node`를 반환합니다. 이 둘(`Node`와 `node`)를 통해 리페칭이 가능합니다. `node` 필드가 반환하는 `id`를 전달하면, 원하는 객체를 다시 가져올 수 있습니다.

반란군(rebels)의 ID를 쿼리해보며 직접 확인해봅시다.

```
query RebelsQuery {
  rebels {
    id
    name
  }
}
```

위의 쿼리는 아래를 반환합니다.

```json
{
  "rebels": {
    "id": "RmFjdGlvbjox",
    "name": "Alliance to Restore the Republic"
  }
}
```

이제 반란군의 ID를 알았으니, 다시 그 정보를 가져오는 것이 가능합니다.

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

RebelsRefetchQuery는 아래를 반환합니다.

```json
{
  "node": {
    "id": "RmFjdGlvbjox",
    "name": "Alliance to Restore the Republic"
  }
}
```

같은 걸 Empire에 대해 반복하면, 다른 ID가 반환됨을 볼 수 있습니다. 마찬가지로 반환된 ID를 이용해 다시 가져오는 리페칭 작업을 쉽게 할 수 있습니다. 

```
query EmpireQuery {
  empire {
    id
    name
  }
}
```

EmpireQuery는 아래를 반환합니다.

```json
{
  "empire": {
    "id": "RmFjdGlvbjoy",
    "name": "Galactic Empire"
  }
}
```

그리고

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

위의 쿼리는 아래를 반환합니다.

```json
{
  "node": {
    "id": "RmFjdGlvbjoy",
    "name": "Galactic Empire"
  }
}
```

`Node` 인터페이스와 `node` 필드는 리페칭을 위해 전역적으로 유일한 ID가 있다고 가정합니다. 전역적으로 유일한 ID가 없는 시스템이라면 보통 타입과 타입 특정 ID를 합성해서 만들어낼 수 있습니다.

이 예제에서의 ID는 base64 스트링입니다. ID의 정보는 쉽게 노출되선 안되기 때문에 (`node`의 `id` 인자에 전달되어야 하는 유일한 것은 변하지 않을 객체의 ID 값) base64 처리를 통해 불투명하게 만드는 것이 GraphQL에서의 관례입니다.

서버측 동작에 대한 자세한 가이드는 [GraphQL Object Identification](https://graphql.org/learn/global-object-identification/)에서 찾아보실 수 있습니다.

## 커넥션

스타워즈 세계관에서 한 팩션은 많은 함선을 가지고 있습니다. Relay는 일대다 관계를 표준화된 방식으로 표현하는 기능을 통해 이를 쉽게 조작할 수 있도록 합니다. 이 표준 커넥션 모델은 커넥션들을 원하는 만큼 자르고(slice) 페이지네이션 하는 방법을 제공합니다. 

rebels의 첫번째 함선을 요청해봅시다. 

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

위 쿼리는 

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

를 반환합니다.
`ships`에 `first` 인자를 사용하여 결과값의 첫번째를 잘라오도록 했습니다. 만약 이 ships에 페이지를 메기고 싶다면 어떻게 해야 할까요? 각각의 엣지엔 페이지를 메길 수 있도록 하는 커서가 존재합니다. 이번에는 첫 두개의 함선을 질의하며 커서도 가져오도록 해봅시다.

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

의 결과로 

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
를 얻습니다. 
커서가 base64 스트링임을 주목하세요. 이전처럼 서버는 의미를 쉽게 알아볼 수 없는 불투명한 스트링을 반환하고 있습니다. 이 스트링을 `ships` 필드의 `after` 인자로 보내서 이전 결과의 마지막 함선으로부터 다음 3개의 함선을 질의할 수 있습니다.

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

위의 쿼리는

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

를 반환합니다. 
좋군요! 그럼 계속해서 이 이후의 4개를 가져오도록 합시다!

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

위 쿼리는

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

를 반환합니다. 
흠. 이제 더 이상 함선이 없군요. 반란군은 함선이 다섯대 밖에 없었나봅니다. 커넥션의 끝에 다다랐다는 것을 추가적인 라운드트립 없이 알면 좋겠습니다. 커넥션 모델은 이 정보를 `PageInfo` 라는 타입에서 노출시킵니다. 함선을 반환했던 두 쿼리들에 이번에는 `hasNextPage`를 추가로 요청해봅시다. 

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

이 쿼리의 결과로 아래가 반환됩니다.

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

첫번째 함선에 대한 쿼리에서 GraphQL은 다음 페이지가 있다고 알려줬지만, 그 다음 쿼리에선 커넥션의 끝에 도달했다고 알려줬습니다. 

Relay는 위에서 설명한 모든 기능들로 커넥션에 대한 추상화를 할 수 있도록 합니다. 이렇게 함으로써 직접 클라이언트 측에서 커서를 관리할 필요없이 효율적인 처리가 가능해집니다.

서버 동작에 대한 더 자세한 내용은 [GraphQL Cursor Connections](/graphql/connections.htm)에 나와있습니다. 

## 뮤테이션

Relay의 뮤테이션도 공통된 패턴을 사용합니다. 뮤테이션의 루트 필드에는 `input` 이라는 단일 인자가 있고, `input`과 `output`에는 각각 클라이언트 뮤테이션 식별자가 있어 하나의 요청과 이에 대한 응답을 엮어 관리합니다.

뮤테이션은 동사로 이름짓는것이 관례이고, 인풋은 접미어로 "Input"이 붙습니다. 뮤테이션이 반환하는 객체에는 "Payload" 가 뒤에 붙습니다. 

이번에 살펴볼 `introduceShip` 뮤테이션에선 2개의 타입, `IntroduceShipInput`과 `IntroduceShipPayload`가 사용됩니다. 

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

입력과 페이로드를 가지고 아래의 뮤테이션을 실행할 수 있습니다.

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

IntroduceShipInput은 실제로 아래의 값들을 가집니다.

```json
{
  "input": {
    "shipName": "B-Wing",
    "factionId": "1"
  }
}
```

그리고 아래의 결과가 반환됩니다.

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

## 더 읽어보기 

이것으로 GraphQL 서버 명세를 알아보았습니다. Relay 스펙을 준수하는 GraphQL 서버의 요구사항에 대해 더 자세히 알아보고 싶다면 [Relay cursor connection](/graphql/connections.htm)과 [GraphQL global object identification](https://graphql.org/learn/global-object-identification/) 를 참고하면 됩니다.

[GraphQL.js Relay library](https://github.com/graphql/graphql-relay-js)에서 명세를 구현한 코드(노드, 커넥션, 뮤테이션을 생성하는 헬퍼 함수)를 볼 수 있습니다. [`__tests__`](https://github.com/graphql/graphql-relay-js/tree/master/src/__tests__) 폴더에는 위의 예제들의 구현에 대한 통합 테스트가 있습니다.
