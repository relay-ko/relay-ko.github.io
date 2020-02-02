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

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Users extends React.Component {
  render() {
    const showcase = siteConfig.users.map(user => {
      return (
        <a href={user.infoLink} key={user.caption}>
          <img src={user.image} title={user.caption} />
        </a>
      );
    });

    return (
      <div className="mainContainer">
        <Container padding={['bottom', 'top']}>
          <div className="showcaseSection">
            <div className="prose">
              <h1>Relay를 사용하시나요?</h1>
              <p>많은 사람들이 릴레이를 사용합니다</p>
            </div>
            <div className="logos">{showcase}</div>
            <p>이 프로젝트를 사용중이신가요?</p>
            <a
              href="https://github.com/facebook/relay/edit/master/website/siteConfig.js"
              className="button">
              내 프로젝트 추가하기
            </a>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Users;
