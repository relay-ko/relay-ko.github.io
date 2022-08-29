GraphQL 커서 연결 사양
--------------------------------------

본 문서는 GraphQL 클라이언트가 GraphQL 서버를 통해 관련 메타데이터를 지원하면서 [페이지네이션의 모범 사례](https://graphql.org/learn/pagination/)를 일관되게 처리하는 방법을 제공하는 것을 목표로 합니다. 본 문서는 이러한 패턴을 "커넥션"이라 부르고 표준화된 방식으로 노출하는 것을 제안합니다.

쿼리에서 이 커넥션 모델은 결과 집합에 슬라이싱과 페이지네이션을 하는 표준 메커니즘을 제공합니다. 

응답에선 이 커넥션 모델은 커서를 제공하는 표준화된 방법과 더 많은 리턴 값이 사용 가능할 때 클라이언트에게 알려주는 방법을 제공합니다.

다음 쿼리는 이러한 것들의 네 가지 예시입니다.

```graphql
{
  user {
    id
    name
    friends(first: 10, after: "opaqueCursor") {
      edges {
        cursor
        node {
          id
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

이 예시에서, `friends`는 커넥션입니다. 이 쿼리는 위에서 설명한 네 가지 특징을 보여줍니다.

 - 슬라이싱은 `friends`에 있는 `first` 인자 값으로 결정됩니다. 위 쿼리에선 커넥션에게 10명의 친구를 리턴해달라고 요청합니다.
 - 페이지네이션은 `friends`에 있는 `after` 인자 값으로 결정됩니다. 커서를 전달했기 때문에, 서버에게 커서 뒤에 있는 친구를 리턴해달라고 요청했습니다.
 - 커넥션에 있는 각 엣지에서 커서를 요청했습니다. 이 커서는 불투명 스트링이고, 정확히 엣지 이후부터 시작으로 페이징하기 위해 `after` 인자에 전달할 것입니다.
 - `hasNextPage`를 요청했습니다. `hasNextPage`는 사용 가능한 엣지가 있다거나 이 커넥션의 끝에 도착한다면 알려줄 것입니다.

이 섹션에서는 커넥션과 관련된 공식적인 요구사항을 설명합니다.

# 예약된 타입

이 스펙을 준수하는 GraphQL 서버는 커넥션의 페이지네이션 모델을 지원하기 위해 특정 타입과 타입 이름을 정해두고 있어야 합니다. 특히, 이 스펙은 다음 타입에 관한 가이드라인을 제공합니다.

 - 이름이 "Connection"으로 끝나는 모든 오브젝트.
 - `PageInfo`라는 이름의 오브젝트.

# 커넥션 타입

본 스펙에서는 "Connection"으로 끝나는 이름을 가진 모든 타입은 *커넥션 타입* 으로 간주됩니다. 커넥션 타입은 GraphQL 기술서의 "타입 시스템" 섹션에 정의된 "오브젝트"여야 합니다.

## 필드

커넥션 타입은 `edges`와 `pageInfo`라는 필드를 가져야 합니다. 스키마 설계자가 적합하다고 판단이 되면, 커넥션과 관련된 추가적인 필드를 가질 수 있습니다.

### 엣지

"커넥션 타입"은 `edges`라는 필드를 포함해야 합니다. 이 필드는 엣지 타입을 감싸는 리스트 타입을 리턴해야 합니다. 이 엣지 타입의 요구사항은 아래 "엣지 타입" 섹션에 정의되어 있습니다.

### PageInfo 필드

"커넥션 타입"은 `pageInfo`라는 필드를 포함해야 합니다. 이 필드는 밑의 "PageInfo" 섹션에 정의된 것처럼 null이 아닌 `pageInfo` 오브젝트를 리턴해야 합니다.

## 스키마 확인

`ExampleConnection`이 타입 시스템에 존재한다면, 이름이 "Connection"으로 끝나기 때문에 커넥션이 될 것입니다. 만약 이 커넥션의 엣지 타입이 `ExampleEdge`라고 이름 지어졌다면, 위의 요구사항을 올바르게 구현한 서버는 아래의 스키마 확인 쿼리를 받아들일 것이고, 아래처럼 제공된 응답을 리턴할 것입니다.

```graphql
{
  __type(name: "ExampleConnection") {
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
```

리턴

```json
{
  "data": {
    "__type": {
      "fields": [
        // May contain other items
        {
          "name": "pageInfo",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "PageInfo",
              "kind": "OBJECT"
            }
          }
        },
        {
          "name": "edges",
          "type": {
            "name": null,
            "kind": "LIST",
            "ofType": {
              "name": "ExampleEdge",
              "kind": "OBJECT"
            }
          }
        }
      ]
    }
  }
}
```

# 엣지 타입

커넥션 타입의 엣지 필드에서 리스트 형식으로 리턴된 타입은 본 스펙에 의해 *엣지 타입* 이라고 간주됩니다. 엣지 타입은 반드시 GraphQL 기술서의 "타입 시스템" 섹션에 정의된 대로 "오브젝트"여야 합니다. 

## 필드

엣지 타입은 `node`와 `cursor`라는 필드를 가져야 합니다. 스키마 설계자가 적합하다고 판단이 되면 엣지와 관련된 추가적인 필드를 가질 수도 있습니다.

### 노드

"엣지 타입"은 `node`라는 필드를 포함해야 합니다. 이 필드는 반드시 스칼라, Enum, 오브젝트, 인터페이스, 유니온 또는 이 타입 중 하나를 감싸는 null이 아닌 래퍼 중 하나를 리턴해야 합니다. 특히 이 필드는 *리스트를 리턴할 수 없습니다.*

NOTE 네이밍은 이 스펙의 마지막에 설명된 대로 "Node" 인터페이스와 "node" 루트 필드를 반영합니다. 이 필드가 노드를 상속받은 오브젝트를 리턴한다면 스펙을 충족하는 클라이언트는 특정한 최적화를 수행할 수 있습니다만, 이는 스펙 준수를 위한 엄격한 요구사항은 아닙니다.

### 커서

"엣지 타입"은 `cursor`라는 필드를 포함해야 합니다. 이 필드는 문자열로 직렬화한 타입을 리턴해야 합니다. 이 커서 필드는 String 타입이거나 String을 둘러싼 null이 아닌 wrapper, 문자열을 직렬화한 커스텀 스칼라 또는 String으로 직렬화한 커스텀 스칼라 타입으로 둘러싼 null이 아닌 wrapper 중 하나일 수 있습니다.

이 필드가 리턴하는 타입을 이후의 스펙 문서에서는 *커서 타입*이라 하겠습니다.

이 필드의 결과는 클라이언트에게는 불투명하게 간주되어야 합니다만, 아래의 "인수" 섹션에서 설명한 것처럼 서버로 다시 전달됩니다.

## 스키마 확인

"Example" 오브젝트를 리턴하는 스키마에서 `ExampleEdge`이 엣지 타입이라면, 위의 요구사항을 정확하게 충족하는 서버는 스키마 확인 쿼리를 받아들이고 주어진 응답을 리턴합니다.

```graphql
{
  __type(name: "ExampleEdge") {
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
```

리턴

```json
{
  "data": {
    "__type": {
      "fields": [
        // May contain other items
        {
          "name": "node",
          "type": {
            "name": "Example",
            "kind": "OBJECT",
            "ofType": null
          }
        },
        {
          "name": "cursor",
          "type": {
            // This shows the cursor type as String!, other types are possible
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String",
              "kind": "SCALAR"
            }
          }
        }
      ]
    }
  }
}
```

# 인수

*커넥션 타입*을 리턴하는 필드는 반드시 정방향 페이지네이션의 인수를 가져야 하거나 역방향 페이지네이션의 인수 또는 역방향, 정방향 페이지네이션 인수 둘 다 가지고 있어야 합니다. 이러한 페이지네이션 인수는 리턴하기 전에 클라이언트가 엣지 세트를 자를 수 있도록 합니다.

## 정방향 페이지네이션의 인수

정방향 페이지네이션을 하려면, 두 개의 인수가 필요합니다.

 - `first` : 음수가 아닌 정수.
 - `after` : `cursor` 필드 섹션에 설명되어 있는 *커서 타입*

서버는 커넥션에 의해 리턴되는 엣지를 수정하기 위해 두 인수를 사용해야 합니다. `after` 커서 뒤의 엣지를 리턴하고 최대 `first` 엣지만큼 리턴해야 합니다.

일반적으로 `after`에 이전 페이지에 있는 마지막 엣지의 `cursor`를 전달해야 합니다.

## 역방향 페이지네이션의 인수

역방향 페이지네이션을 하려면 두 개의 인수가 필요합니다.

 - `last` : 음수가 아닌 정수.
 - `before` : `cursor` 필드 섹션에 설명되어 있는 *커서 타입*.

서버는 커넥션에 의해 리턴되는 엣지를 수정하기 위해 두 인수를 사용해야 합니다. `before` 커서 앞의 엣지를 리턴하고 최대 `last`엣지만큼 리턴해야 합니다.

일반적으로 `before`에 다음 페이지에 있는 첫 번째 엣지의 `cursor`를 전달해야 합니다.

## 엣지 순서

비즈니스 로직이 가르키는 대로 엣지의 순서를 정할 수 있고, 본 문서에서 다루지 않은 추가적인 인수로 순서를 결정할 수 있습니다. 그러나 순서는 반드시 페이지마다 일관되어야 하며, 중요한 것은 *`first`/`after`를 사용할 때와 마찬가지로 `last`/`before`를 사용할 때 엣지의 순서는 똑같아야 하고, 다른 모든 인수는 동일해야 합니다.*  `last`/`before`를 사용할 때는 거꾸로 되어 있으면 안 됩니다. 좀 더 공식적으론

* `before: cursor`가 사용될 때, `cursor`와 가장 가까운 엣지는 반드시 `엣지` 결과의 가장 **마지막**에 와야 합니다.
* `after: cursor`가 사용될 땐, `cursor`와 가장 가까운 엣지는 반드시 `엣지` 결과의 **첫 번째**로 와야 합니다


## 페이지네이션 알고리즘

어떤 엣지를 리턴할지 결정하기 위해선, 커넥션은 엣지를 거르기 위해 `before` 와 `after` 커서를 평가합니다. 그다음 엣지를 자르기 위해 `first`를 평가한 후 `last`를 평가하여 엣지를 자릅니다.

NOTE `first` 와 `last`를 둘 다 가지는 것은 쿼리와 결과가 혼동될 수 있기에 강력히 권장하지 않습니다. 이 부분은 `PageInfo` 섹션에서 좀 더 자세히 설명합니다.

조금 더 공식적으로,

EdgesToReturn(allEdges, before, after, first, last):
  * {edges}를 ApplyCursorsToEdges(allEdges, before, after) 의 결과로 둡니다.
  * 만약 {first} 가 set면:
    * 만약 {first} 가 0 보다 작다면:
      * 에러를 발생시킵니다
    * 만약 {edges}가 {first}보다 더 긴 길이를 가진 경우:
      * {edges}의 끝에서 부터 엣지를 제거하여 {edges}와 {first}의 길이가 같도록 자릅니다
  * 만약 {last} 가 set면:
    * 만약 {last} 가 0 보다 작다면:
      * 에러를 발생시킵니다
    * 만약 {edges}가 {last}보다 더 긴 길이를 가진 경우:
      * {edges}의 시작에서 부터 엣지를 제거하여 {edges}와 {last}의 길이가 같도록 자릅니다
  * {edges}를 리턴합니다

ApplyCursorsToEdges(allEdges, before, after):
  * {edges}를 {allEdges}로 초기화
  * 만약 {after} 가 set면:
    * {afterEdge}를 {cursor}와 {after}의 인수가 동일한 {edges}의 엣지로 합니다
    * 만약 {afterEdge}가 존재한다면 :
      * {afterEdge}를 포함하여 이전 {edges}의 모든 요소를 제거합니다
  * 만약 {before} 가 set면:
    * {beforeEdge}를 {cursor}와 {before}의 인수가 동일한 {edges}의 엣지로 합니다
    * 만약 {beforeEdge} 가 존재한다면 :
      * {beforeEdge}를 포함하여 이후 {edges}의 모든 요소를 제거합니다
  * {edges}를 리턴합니다

# PageInfo

서버는 `PageInfo`라는 필드를 제공해야 합니다.

## 필드

`PageInfo`는 반드시 `hasPreviousPage` 와 `hasNextPage`라는 필드를 포함해야 합니다. 이 두 필드는 null이 아닌 boolean를 리턴합니다. 또한 `startCursor` 와 `endCursor` 라는 필드도 포함해야 합니다. 이 두 개의 필드는 null이 아닌 불투명 string을 리턴합니다.

`hasPreviousPage`는 클라이언트의 인수에 의해 집합이 정의되기 전에 더 많은 엣지가 존재하는지 나타내는데 사용됩니다.  클라이언트가 `last`/`before`로 페이지네이션을 하는 경우, 이전 엣지가 존재한다면 서버는 반드시 {true}를 리턴해야 하고, 그렇지 않다면 {false}를 리턴해야 합니다. 클라이언트가 `first`/`after`로 페이지네이션을 하는 경우, `after` 전에 엣지가 존재한다면 클라이언트는 {true}를 리턴할 것이고, 효율적으로 할 수 있으면 {false}를 리턴할 수 있습니다. 좀 더 공식적으론

HasPreviousPage(allEdges, before, after, first, last):
  * 만약 {last} 가 집합이면 :
    * {edges}를  {ApplyCursorsToEdges(allEdges, before, after)}의 호출 결과로 정해둡니다
    * 만약 {edges}가 {last}의 요소보다 많이 포함한다면 {true}를 리턴하고 아니면 {false}를 리턴합니다
  * 만약 {after} 가 집합이면 :
    * 만약 서버가 {after} 이전에 요소가 존재하는지 효율적으로 알 수 있으면 {true}를 리턴합니다
  * {false}를 리턴합니다

`hasNextPage`는 클라이언트 인수에 의해 정의된 집합 뒤에 더 많은 엣지가 존재하는지 나타내는데 사용됩니다. 클라이언트가 `first`/`after`로 페이지네이션을 하는 경우, 추가적인 엣지가 존재한다면 {true}를 리턴하고, 그렇지 않다면 {false}를 리턴합니다.  클라이언트가 `last`/`before`로 페이지네이션을 하는 경우, `before` 뒤에 엣지가 존재한다면 클라이언트는 {true}를 리턴할 것이고, 더 효율적으로 할 수 있으면 {false}를 리턴합니다. 좀 더 공식적으론

HasNextPage(allEdges, before, after, first, last):
  * 만약 {first} 가 set면 :
    * {edges}를 {ApplyCursorsToEdges(allEdges, before, after)}의 호출한 결과로 둡니다.
    * 만약 {edges}가 {first} 요소보다 많이 가지고 있으면 {true}를 리턴하고 아니면 {false}를 리턴합니다
  * 만약 {before} 가 set:
    * 만약 서버가 {before} 후에 요소가 존재하는지 효율적으로 알 수 있으면 {true}를 리턴합니다 
  * {false}를 리턴

NOTE `first` 와 `last` 둘 다 포함되어 있을 때, 위의 알고리즘에 따르면 두 필드 모두 set여야 합니다만, 페이지네이션에 관한 의미는 불분명해집니다. 이는 `first`와 `last` 두 개 모두 사용하여 페이지네이션을 권장하지 않은 이유 중 하나입니다.

`startCursor`와 `endCursor`는 각각 `edges`의 첫 번째와 마지막 노드에 해당되는 커서여야 합니다.

NOTE 이 스펙은 Relay Classic을 염두에 두고 만들어진 것이므로, Relay Legacy는 `startCursor` 와 `endCursor`를 정의하지 않았다는 점과 각각의 에지에서 `cursor`를 선택하는 것에 의존했다는 점은 주목할 만합니다. Relay Modern은 대역폭을 절약하는 것 대신에(그 사이에 커서를 사용하지 않기 때문에), `startCursor` 와 `endCursor`을 선정하기 시작했습니다.

## 스키마 확인

위의 요구사항을 정확하게 충족하는 서버는 아래의 스키마 확인 쿼리를 받아들이고 주어진 응답을 제공합니다.

```graphql
{
  __type(name: "PageInfo") {
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
```

리턴

```json
{
  "data": {
    "__type": {
      "fields": [
        // May contain other fields.
        {
          "name": "hasNextPage",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Boolean",
              "kind": "SCALAR"
            }
          }
        },
        {
          "name": "hasPreviousPage",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "Boolean",
              "kind": "SCALAR"
            }
          }
        },
        {
          "name": "startCursor",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String",
              "kind": "SCALAR"
            }
          }
        },
        {
          "name": "endCursor",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String",
              "kind": "SCALAR"
            }
          }
        }
      ]
    }
  }
}
```
