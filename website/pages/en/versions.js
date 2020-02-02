/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const CompLibrary = require('../../core/CompLibrary');
const React = require('react');
const Container = CompLibrary.Container;

const CWD = process.cwd();

const siteConfig = require(CWD + '/siteConfig.js');
const versions = require(CWD + '/versions.json');

class Versions extends React.Component {
  render() {
    const latestVersion = versions[0];
    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer versionsContainer">
          <div className="post">
            <header className="postHeader">
              <h2>{siteConfig.title + ' Versions'}</h2>
            </header>
            <a name="next" />
            <h3>다음 버전</h3>
            <p>
              아직 릴리즈되지 않은 문서와 코드를 확인할 수 있습니다.
            </p>
            <table className="versions">
              <tbody>
                <tr>
                  <th>next</th>
                  <td>
                    <a
                      href={`${
                        siteConfig.baseUrl
                      }docs/next/introduction-to-relay`}>
                      문서
                    </a>
                  </td>
                  <td>
                    <a href="https://github.com/facebook/relay">소스 코드</a>
                  </td>
                </tr>
              </tbody>
            </table>
            <a name="latest" />
            <h3>현재 버전 (안정적)</h3>
            <p>Relay Modern의 안정적인 가장 최신 버전</p>
            <table className="versions">
              <tbody>
                <tr>
                  <th>{latestVersion}</th>
                  <td>
                    <a
                      href={`${
                        siteConfig.baseUrl
                      }docs/introduction-to-relay`}>
                      문서
                    </a>
                  </td>
                  <td>
                    <a
                      href={`https://github.com/facebook/relay/releases/tag/${latestVersion}`}>
                      릴리즈 노트
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
            <a name="archive" />
            <h3>실험적 버전</h3>
            <table className="versions">
              <tbody>
                {versions.map(
                  version =>
                    version === 'experimental' && (
                      <tr key={version}>
                        <th>{version}</th>
                        <td>
                          <a
                            href={`${
                              siteConfig.baseUrl
                            }docs/${version}/step-by-step`}>
                            문서
                          </a>
                        </td>
                      </tr>
                    ),
                )}
              </tbody>
            </table>
            <h3>과거 버전</h3>
            <p>
              이 섹션은 이전 Relay 버전의 문서와 릴리즈 노트 뿐만 아니라 현재 Deprecated 된 Relay Classic 문서까지 포함합니다.
            </p>
            <table className="versions">
              <tbody>
                {versions.map(
                  version =>
                    version !== latestVersion &&
                    version !== 'experimental' && (
                      <tr key={version}>
                        <th>{version}</th>
                        <td>
                          <a
                            href={
                              version === 'classic'
                                ? `${
                                    siteConfig.baseUrl
                                  }docs/${version}/classic-guides-containers`
                                : `${
                                    siteConfig.baseUrl
                                  }docs/${version}/introduction-to-relay`
                            }>
                            문서
                          </a>
                        </td>
                        {version !== 'classic' ? (
                          <td>
                            <a
                              href={`https://github.com/facebook/relay/releases/tag/${version}`}>
                              릴리즈 노트
                            </a>
                          </td>
                        ) : null}
                      </tr>
                    ),
                )}
              </tbody>
            </table>
          </div>
        </Container>
      </div>
    );
  }
}

module.exports = Versions;
