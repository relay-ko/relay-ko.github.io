---
id: version-v8.0.0-ko.0-thinking-in-relay
title: Thinking in Relay
original_id: thinking-in-relay
---

Relay의 Data-fetching에 대한 접근 방식은 React에서 얻은 저희의 경험으로부터 많은 영감을 받았습니다. 일반적으로 React는 복잡한 인터페이스를 재사용가능한 컴포넌트로 쪼갭니다. 이를 통해 개발자들은 어플리케이션을 분리할 구체적인 단위에 대해 생각할 수 있게 되고, 어플리케이션 내 다른 역할을 하는 부분들 사이의 연관관계를 줄일 수 있습니다. 그리고 무엇보다 중요한 부분은 바로 **선언적**이라는 것입니다: 선언적으로 UI를 그리는 방법은 개발자로 하여금 *어떻게* UI를 그릴지에 대한 염려없이, 주어진 State로 *무엇을* 그릴지만 고민하게 만들어줍니다. 절차적 프로그래밍으로 네이티브 뷰(예: DOM)를 조작하는 이전의 접근과 다르게, React는 UI 명세를 가지고 자동으로 꼭 필요한 행동만 하게됩니다.

자 이제, 어떻게 이 아이디어를 Relay에 어떻게 적용했는지 몇가지 Product Use-case들을 통해 살펴봅시다. (React에 이미 익숙하시다고 가정한 뒤 설명하겠습니다.)

## 뷰를 위한 데이터를 가져오는 것

우리의 경험에 따르면, 대부분의 어플리케이션이 원하는 구동 방식은 로딩 인디케이터가 보여질때 View Hierarchy내에서 필요한 데이터를 한번에 모두 Fetch하고 데이터가 준비되면 *전체 뷰*를 한번에 그리는 것입니다. 

이를 위한 첫번째 솔루션은 루트 컴포넌트에서 자식에게 필요한 모든 데이터를 가져오는 것입니다. 하지만 이것은 Coupling을 발생시킵니다: 하위 컴포넌트에서 변경이 발생할때마다 루트 컴포넌트가 변경 될 필요가 생깁니다. 이러한 Coupling은 버그를 만날 확률을 높이고 개발 속도를 느리게 만듭니다. 궁극적으로는, 이러한 접근방식은 React의 컴포넌트 모델의 장점을 얻을수 없게 만듭니다. 필요한 데이터를 정의하는 가장 자연스러운 부분은 루트가 아닌 각 컴포넌트 내부일것입니다.

두번째로 시도할 수 있는 접근방법은 `render()`를 첫 데이터 요청으로 사용하는 것입니다. 일단 간단하게 어플리케이션을 그린 뒤에, 어떤 데이터가 필요한지 파악하고, 데이터를 요청한 뒤, 다시 그릴 수 있습니다. 이것은 처음에는 좋게 보이나, 문제는 *컴포넌트가 어떤걸 그려야할지가 데이터를 통해서만 알 수 있다는 것입니다!* 다른 말로 이야기하자면, 이것은 데이터 요청을 여러번에 나눠서 실행하게 됩니다: 첫번째로 그려질때는 루트를 보고 데이터를 가져오고, 그리고 그 이후에 자식은 뭐가 필요한지를 파악한 후에 데이터를 가져오게 됩니다. 이렇게 컴포넌트 트리의 맨 아래까지 내려가게 됩니다. 만약 각 단계마다 네트워크 요청이 일어나게 된다면, 렌더링이 느려지고, 연속적인 데이터 왕복이 필요하게 됩니다. 그래서 이 문제를 해결하기 위해 우리는 전체적인 데이터 요구를 한번에, 정적으로 파악할 수 있는 방법이 필요합니다.

This is where GraphQL comes into play. Components specify one or multiple GraphQL fragments for some of their props describing their data requirements.

Each GraphQL fragment has a unique name within an application which allows us to determine the query needed to fetch the full query tree in a build step and load all the required data in a single network request efficiently at runtime.

## Data Components aka Containers

Relay allows developers to annotate their React components with data dependencies by creating **containers**. These are regular React components that wrap the originals. A key design constraint is that React components are meant to be reusable, so Relay containers must be too. For example, a `<Story />` component might implement a view for rendering any `Story` item. The actual story to render would be determined by the data passed to the component: `<Story story={ ... } />`. The equivalent in GraphQL are **fragments**: named query snippets that specify what data to fetch *for an object of a given type*. We might describe the data needed by `<Story>` as follows:

```
fragment Story_story on Story {
  text
  author {
    name
    photo
  }
}
```

And this fragment can then be used to define the Story container:

```javascript
const {createFragmentContainer, graphql} = require('react-relay');

// Plain React component.
// Usage: `<Story story={ ... } />`
class Story extends React.Component { ... }

// Higher-order component that wraps `<Story />`
const StoryContainer = createFragmentContainer(Story, {
  // Define a fragment with a name matching the `story` prop expected above
  story: graphql`
    fragment Story_story on Story {
      text
      author {
        name
        photo
      }
    }
  `
})
```

## Rendering

In React, rendering a view requires two inputs: the *component* to render, and a *root* DOM (UI) node to render into. Rendering Relay containers is similar: we need a *container* to render, and a *root* in the graph from which to start our query. We also must ensure that the queries for the container are executed and may want to show a loading indicator while data is being fetched. Similar to `ReactDOM.render(component, domNode)`, Relay provides `<QueryRenderer query={...} variables={...} render={...}>` for this purpose. The `query` and `variables` define what data to fetch and `render` defines what to render. Here's how we might render `<StoryContainer>`:

```javascript
ReactDOM.render(
  <QueryRenderer
    query={graphql`
      query StoryQuery($storyID: ID!) {
        node(id: $storyID) {
          ...Story_story
        }
      }
    `}
    variables={{
      storyID: '123',
    }}
    render={(props, error) => {
      if (error) {
        return <ErrorView />;
      } else if (props) {
        return <StoryContainer story={props.story} />;
      } else {
        return <LoadingIndicator />;
      }
    }}
  />,
  rootElement
)
```

`QueryRenderer` will then fetch the data and render `StoryContainer` once the data is available. Just as React allows developers to render views without directly manipulating the underlying view, Relay removes the need to directly communicate with the network.

## Data Masking

With typical approaches to data-fetching we found that it was common for two components to have *implicit dependencies*. For example `<StoryHeader />` might use some data without directly ensuring that the data was fetched. This data would often be fetched by some other part of the system, such as `<Story />`. Then when we changed `<Story />` and removed that data-fetching logic, `<StoryHeader />` would suddenly and inexplicably break. These types of bugs are not always immediately apparent, especially in larger applications developed by larger teams. Manual and automated testing can only help so much: this is exactly the type of systematic problem that is better solved by a framework.

We've seen that Relay containers ensure that GraphQL fragments are fetched *before* the component is rendered. But containers also provide another benefit that isn't immediately obvious: **data masking**. Relay only allows components to access data they specifically ask for in GraphQL fragments &mdash; nothing more. So if one component queries for a Story's `text`, and another for its `author`, each can see *only* the field that they asked for. In fact, components can't even see the data requested by their *children*: that would also break encapsulation.

Relay also goes further: it uses opaque identifiers on `props` to validate that we've explicitly fetched the data for a component before rendering it. If `<Story />` renders `<StoryHeader />` but forgets to include its fragment, Relay will warn that the data for `<StoryHeader />` is missing. In fact, Relay will warn *even if* some other component happened to fetch the same data required by `<StoryHeader />`. This warning tells us that although things *might* work now they're highly likely to break later.

# Conclusion

GraphQL provides a powerful tool for building efficient, decoupled client applications. Relay builds on this functionality to provide a framework for **declarative data-fetching**. By separating *what* data to fetch from *how* it is fetched, Relay helps developers build applications that are robust, transparent, and performant by default. It's a great complement to the component-centric way of thinking championed by React. While each of these technologies &mdash; React, Relay, and GraphQL &mdash; are powerful on their own, the combination is a **UI platform** that allows us to *move fast* and *ship high-quality apps at scale*.
