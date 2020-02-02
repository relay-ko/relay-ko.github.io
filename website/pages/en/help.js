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

class Help extends React.Component {
  render() {
    const supportLinks1 = [
      {
        title: '🇰🇷 GraphQL Korea',
        content: 'GraphQL Korea는 항상 질문에 열려있습니다. [Facebook Group](https://www.facebook.com/groups/graphql.kr/)과 [Slack](http://bit.ly/graphql-korea-slack)을 통해 질문을 남기시면, 국내의 GraphQL 유저분들로부터 친절한 답변을 얻을 수 있습니다.',
      },
      {
        title: 'Stack Overflow',
        content: '많은 사람들은 Stack Overflow를 질문을 하기 위해 사용합니다. **#relayjs**로 태그된 [Existing Questions](https://stackoverflow.com/questions/tagged/relayjs?sort=active)를 찾아보시거나 [새 질문을 올리세요](https://stackoverflow.com/questions/ask?tags=relayjs)!',
      },
    ];

    const supportLinks2 = [
      {
        title: 'Slack',
        content: '많은 개발자와 유저가 [GraphQL Slack Community](https://graphql-slack.herokuapp.com/)내 [#relay](https://graphql.slack.com/messages/relay) 채널에 상주하고 있습니다.',
      },
      {
        title: 'Discord',
        content: '많은 유저가 [Reactiflux](https://www.reactiflux.com/) Discord 내 [#relay](https://discord.gg/0ZcbPKXt5bX40xsQ) 채널에 상주하고 있습니다.',
      },
      {
        title: 'Twitter',
        content: '가장 최신의 Relay 소식은 Twitter의 [#relayjs](https://twitter.com/search?q=%23relayjs) 태그를 통해 확인할 수 있습니다.',
      },
    ]

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <GridBlock contents={supportLinks1} layout="threeColumn" />
            <GridBlock contents={supportLinks2} layout="threeColumn" />
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Help;
