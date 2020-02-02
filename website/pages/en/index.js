/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const CompLibrary = require('../../core/CompLibrary.js');
const React = require('react');
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: '_self',
};

class HomeSplash extends React.Component {
  render() {
    return (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="logo">
            <img src={siteConfig.baseUrl + 'img/relay-white.svg'} />
          </div>
          <div className="wrapper homeWrapper">
            <h2 className="projectTitle">
              {siteConfig.title}
              <small>{siteConfig.tagline}</small>
              <small>{siteConfig.subtagline}</small>
            </h2>
          </div>
        </div>
      </div>
    );
  }
}

class Index extends React.Component {
  render() {
    let language = this.props.language || 'en';
    const showcase = siteConfig.users
      .filter(user => {
        return user.pinned;
      })
      .map((user, i) => {
        return (
          <a href={user.infoLink} key={i}>
            <img src={user.image} title={user.caption} />
            <div>
              <h6>{user.caption}</h6>
              <p>{user.description}</p>
            </div>
          </a>
        );
      });

    return (
      <div>
        <HomeSplash language={language} />
        <div className="homePage mainContainer">
          <Container className="textSection" background="light">
            <h2>대규모 개발</h2>
            <h3>
              Relay는 시작 단계부터 <b><em>수 천개</em></b> 컴포넌트에 이르기까지 더 빠른 개발을 돕기 위해 만들어졌습니다.
              개발 단계 동안 Relay는 데이터 요청이 잘 작동하도록 지켜주며, 어플리케이션의 더 빠른 성장과 변화를 돕습니다.
            </h3>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: '빠른 Iteration',
                  content:
                    '<p>Relay는 컴포넌트마다 필요한 데이터를 <em>근처</em>에 선언하기 위해 만들어졌습니다. 이것은 <em>어떻게</em> 데이터를 가져올지에 대한 걱정을 하지 않고 각 컴포넌트마다 <em>어떤</em> 데이터가 필요한지만 선언하는 방식을 말합니다. 각 컴포넌트에 데이터의 필요성을 적게되면, Relay는 해당 데이터를 알아서 가져오고 이 데이터는 컴포넌트 내에서 사용가능해집니다.</p><p>이를 통해 다른 부분 또는 시스템을 수정할 필요 없이, 혹시나 다른 컴포넌트가 깨질까 걱정할 필요 없이 컴포넌트는 자신의 데이터 의존성을 독립적으로 쉽게 수정할 수 있게 됩니다.</p>'
                },
                {
                  title: '적은 네트워크 요청',
                  content:
                    '<p>Relay는 전체 어플리케이션의 데이터 의존성을 모은 뒤에 하나의 GraphQL 요청으로 만들어 가져옵니다.</p><p>Relay는 각 컴포넌트의 선언된 데이터를 한번에 요청하는 것을 처리 할 때 가장 효율적인 방법으로 수행합니다. 예를 들면, 같은 필드를 하나로 합치는 것 등이 있겠지요.</p>',
                },
                {
                  title: '자동으로 데이터 일관성을 지켜줍니다',
                  content:
                    '<p>Relay는 데이터의 변화가 감지되었을때, 해당 변화에 영향을 받는 모든 컴포넌트의 데이터를 최신으로 맞춰줍니다. 그리고 꼭 필요할때 효율적으로 바꿉니다.</p><p>Relay는 또한 Optimistic Update(성공했다고 가정한 뒤 미리 UI에 반영하는 것)를 포함한 GraphQL Mutation 수행을 지원합니다. Mutation이 완료되면 로컬 데이터를 갱신하고 해당 갱신은 스크린에 표현되는 데이터를 바꿔, 항상 최신의 데이터만이 출력되도록 보장합니다.</p>',
                },
              ]}
            />
          </Container>
          <Container className="exampleSection">
            <div className="wrapperInner">
              <div className="radiusRight">
                <h2>Query Renderer</h2>
                <p>
                  새로운 화면을 시작할 때, <a href="/docs/query-renderer">
                    <code>QueryRenderer</code>
                  </a>를 통해 시작할 수 있습니다.
                </p>
                <p>
                  <code>QueryRenderer</code>는 Relay 컴포넌트 트리에 가장 최상단에서 React 컴포넌트로 사용할 수 있습니다.
                  <code>QueryRenderer</code>는 GraphQL Query를 Fetch하고, <code>render</code> prop을 이용해 받은 결과를 렌더링합니다.
                </p>
                <p>
                  <code>QueryRenderers</code>는 단순한 React 컴포넌트이기 때문에 React 컴포넌트가 렌더링될 수 있는 어디서든 사용할 수 있습니다.
                  따라서 최상단이 아닌 다른 컴포넌트 내부에서 사용 될 수 있는데, 예를 들면 팝업 창에서 추가적인 정보를 Lazy하게 Fetch할 때 <code>QueryRenderer</code>를 사용할 수 있습니다.
                </p>
              </div>

              <div className="radiusLeft">
                <pre>
                  <code>
                    {`
import React from "react"
import { createFragmentContainer, graphql, QueryRenderer } from "react-relay"
import environment from "./lib/createRelayEnvironment"
import ArtistHeader from "./ArtistHeader" // 아래

// 보통은 하나의 페이지당 하나의 Query Renderer를 사용합니다.
// 이 Query Renderers는 GraphQL Query의 Root을 나타냅니다.
export default function ArtistRenderer({artistID}) {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql\`
        query QueryRenderersArtistQuery($artistID: String!) {
          # 쿼리의 Root 필드
          artist(id: $artistID) {
            # Fragment 컨테이너에 대한 Reference
            ...ArtistHeader_artist
          }
        }
      \`}
      variables={{artistID}}
      render={({error, props}) => {
        if (error) {
          return <div>{error.message}</div>;
        } else if (props) {
          return <Artist artist={props.artist} />;
        }
        return <div>로딩중...</div>;
      }}
    />
  );
}
                  `}
                  </code>
                </pre>
              </div>

              <div>
                <h2>Fragment 컨테이너</h2>
                <p>
                  두번째 단계는 Relay를 통해 React 컴포넌트 트리를 렌더링하는 것입니다.
                  해당 부분은 <code>FragmentContainers</code>, <code>PaginationContainers</code> 또는 <code>RefetchContainers</code>를 포함합니다.
                </p>
                <p>
                  이 중 가장 많이 사용되는 것은 <code>FragmentContainers</code>입니다.
                  이것을 통해 컴포넌트를 그리는데 필요한 데이터에 대한 <em>요구사항</em>을 선언할 수 있습니다.
                  명심하세요. <code>FragmentContainer</code>는 직접적으로 데이터를 Fetch하지 않습니다.
                  대신, 이 데이터는 최상단에 존재하는 <code>QueryRenderer</code>를 통해 합쳐져서 다른 Relay 컴포넌트들과 함께 단 한번의 요청으로 Fetch됩니다.
                </p>
                <p>
                  <code>FragmentContainer</code>를 통해 필요한 데이터를 선언하면 Relay는 컴포넌트가 렌더링 되기전에 해당 데이터를 사용할 수 있도록 보장합니다.
                </p>
              </div>
              <div>
                <pre>
                  <code>
                    {`
import React from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { Link, Image, Name, Bio, View,} from "./views"

function ArtistHeader(props) {
  const {name, href, image, bio} = props.artist;
  const imageUrl = image && image.url;

  return (
    <Link href={href}>
      <Image imageUrl={imageUrl} />
      <View>
        <Name>{name}</Name>
        <Bio>{bio}</Bio>
      </View>
    </Link>
  );
}

export default createFragmentContainer(ArtistHeader, {
  artist: graphql\`
    # 이 fragment를 통해 이 컴포넌트를 그리기 위해서는 Artist 모델 내의 특정한 필드가 필요함을 선언합니다.
    # Relay는 이 데이터를 Fetch해 컴포넌트 내에서 사용할 수 있는 상태가 되도록 보장합니다.
    fragment ArtistHeader_artist on Artist {
      href
      bio
      name
      image {
        url
      }
    }
  \`,
});
                  `}
                  </code>
                </pre>
              </div>
            </div>
          </Container>

          <Container className="textSection graphqlSection" background="light">
            <h2>GraphQL의 모범 사례들이 녹아 들어있습니다</h2>
            <h3>
              Relay는 GraphQL의 모범 사례들에 의존하고 있으며, 해당 사례들을 적용했습니다.
              Relay의 최신 기능들을 채택하기 위해서는 GraphQL 서버를 일반적인 모범 사례에 맞추어 개발해야 합니다.
            </h3>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: 'Fragments',
                  content: `<p>GraphQL <a href="https://graphql.org/learn/queries/#fragments" target="_blank">Fragment</a>는 재사용을 위해 만들어진 GraphQL 타입의 부분입니다. Fragment는 다른 Fragment를 포함되어 구성될 수 있고, 또한 GraphQL Query의 한 부분으로 포함될 수 있습니다.</p><p>Relay는 각 컴포넌트 내 데이터 요구사항을 선언하고 합치는데에 Fragment를 사용합니다.</p><p>자세한 사항은 <a href='/docs' + '/fragment-container'}>Fragment Container</a> 문서를 확인하세요.`,
                },
                {
                  title: 'Connections',
                  content: `<p>GraphQL <a href="https://graphql.org/learn/pagination/#complete-connection-model" target="_blank">Connections</a>는 GraphQL에서 여러개의 데이터 목록을 표현하기 위한 모델입니다. Connections를 통해 목록의 앞뒤 어느 방향으로든 쉽게 이동할 수 있으며, 모델 간의 관계 정보를 쉽게 정의할 수 있습니다.</p><p>GraphQL Connections는 <a href="https://graphql.org/learn/pagination/">GraphQL에서의 Pagination</a> 구현의 모범사례로 유명합니다. Relay는 GraphQL Server가 해당 스펙을 지원하기 시작한때부터 GraphQL Connections를 우선 지원을 제공하고 있습니다.</p><p>자세한 사항은 <a href='/docs/graphql-server-specification.html#connections'>Connections</a> 문서를 확인하세요.`,
                },
                {
                  title: 'Global Object Identification',
                  content: `<p>Relay는 신뢰성 높은 캐싱과 네트워크 재요청, 그리고 객체의 변화를 자동으로 합치는 기능을 구현하기 위해 <a href="https://graphql.org/learn/global-object-identification/" target="_blank">Global Object Identification</a>을 활용합니다.</p><p>Global Object Identification를 만족하기 위해서는 전체 스키마의 모든 타입을 통틀어 globally unique id를 보장해야하며, GraphQL Node interface를 통해 구현합니다.</p><p>자세한 사항은 <a href='/docs/graphql-server-specification.html#object-identification'>Object Identification</a> 문서를 확인하세요.</p>`,
                },
              ]}
            />
          </Container>

          <Container
            className="textSection declarativeSection"
            background="light">
            <h2>유연한 Mutations</h2>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: '데이터 변화를 표현하세요',
                  content: `<p>GraphQL Mutation을 이용하면, 선언적으로 Mutation에 영향을 받는 데이터를 정의하고 <em>단 한번의 네트워크 요청</em>에 가져올 수 있습니다. 그리고 Relay는 해당 변화를 자동으로 병합하고 전파시킵니다.</p>`,
                },
                {
                  title: '자동 업데이트',
                  content: `<p>Global Object Identification을 이용해, Relay는 Mutation의 변화를 영향을 받는 객체와 컴포넌트에 한해서 자동으로 반영합니다.</p><p>자동적으로 병합되지 못하는 복잡한 경우를 대비해 Relay는 Mutation 수행시 수동으로 로컬 Relay 데이터를 수정할 수 있는 API를 제공합니다.</p>`
                },
                {
                  title: '훌륭한 UX를 위해 설계됨',
                  content: `<p>Relay의 Mutation API는 즉각적인 피드백을 유저에게 보여줄수 있도록 Optimistic Update 및 에러 핸들링을 지원하며, 또한 Mutation이 실패할 경우 자동으로 변화를 되돌립니다.</p>`,
                },
              ]}
            />
          </Container>

          <Container className="textSection aheadSection">
            <h2>미리 안전을 챙기세요</h2>
            <GridBlock
              layout="threeColumn"
              contents={[
                {
                  title: '마음의 안정을 되찾으세요',
                  content:
                    '<p>Relay 프로젝트를 진행하는 동안 Relay 컴파일러는 서버의 GraphQL 스키마를 보고 프로젝트 전역에서 일관성 및 안정성을 지키도록 도와줍니다.</p>',
                },
                {
                  title: '최적화 된 런타임 성능',
                  content:
                    '<p>브라우저 및 기타 디바이스 런타임에서 어플리케이션이 더 빠르게 동작할 수 있도록 Relay는 쿼리를 처리하거나 최적화하는 등의 많은 일들을 빌드 타임에 미리 처리합니다.</p>',
                },
                {
                  title: '타입 안정성',
                  content:
                    '<p>Relay는 컴포넌트가 받게되는 데이터의 형태에 대한 Flow 또는 TypeScript 타입을 생성합니다. 이러한 타입 안정성을 통해 더 빠르고 안전하게 어플리케이션을 수정할 수 있습니다.</p>',
                },
              ]}
            />
          </Container>

          <Container className="textSection relaySection">
            <h2>Relay가 나에게 필요할까요?</h2>
            <GridBlock
              layout="twoColumn"
              contents={[
                {
                  title: '조금씩 도입하세요',
                  content:
                    '<p>만약 React 컴포넌트를 이미 사용중이라면, 사실 대부분의 준비는 이미 끝났습니다. Babel 플러그인만 추가하면 Relay Compiler를 바로 동작시킬 수 있습니다.</p><p>적당한 설정을 마치고 나면 <code>create-react-app</code>이나 Next.js와 사용할 수도 있습니다. </p>',
                },
                {
                  title: '골치아픈 일들을 명시적인 형태로 바꿔보세요',
                  content:
                    '<p>더 큰 팀과 높은 복잡도를 처리하기 위한 독립된 컴포넌트 아키텍쳐를 지원하기 위해 Relay는 조금 더 많은 앞단의 설정이나 도구가 필요합니다.</p><p>하지만 Relay의 원칙을 한번 배우고나면, 데이터를 처리하는 골치아픈 일 대신에 비즈니스 로직에 더 집중할 수 있습니다.</p>',
                },
                {
                  title: 'Facebook이 사용합니다',
                  content:
                    '<p>Relay는 Facebook의 가장 핵심적인 기반 기술입니다. Facebook의 수천, 수만개 컴포넌트를 Relay를 사용하고 있습니다. Relay는 GraphQL과 협력하여 만들어졌고, Facebook에는 Relay 담당 직원이 있습니다.</p>',
                },
                {
                  title: '단순히 대규모 앱만을 위한 것은 아닙니다',
                  content:
                    '<p>만약 Flow 또는 TypeScript를 이용해 오류를 미리 컴파일 타임에 감지할 수 있다고 믿고있다면, Relay는 당신에게 적절한 선택이 될 것입니다.</p><p>그렇지 않으면 Relay의 캐싱 및 UI Best Practice를 다시 만들어야할 것입니다. </p>',
                },
              ]}
            />
          </Container>

          <Container className="textSection" background="light">
            <h2>자랑스러운 이용 사례들</h2>
            <h3>
              Relay는 본래 페이스북 어플리케이션의 React Native 섹션을 위해 만들어졌습니다. 그리고 페이스북 내부와 바깥의 여러 팀에서 도입해 사용하고 있습니다.
            </h3>
            <div>
              <div className="logosHomepage">{showcase}</div>
            </div>
            <div className="more-users">
              <a
                className="button"
                href='/users'>
                더 많은 Relay 유저 보기
              </a>
            </div>
          </Container>
        </div>
      </div>
    );
  }
}

module.exports = Index;
