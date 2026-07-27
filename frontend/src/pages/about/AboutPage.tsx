import React from 'react';
import { PageFrame } from '../../shared/ui/PageFrame';
import { Badge } from '../../shared/ui/Badge';
import { Database, Feather, Files, Landmark, Shield } from 'lucide-react';

import './about-page.css';

const teamMembers = [
  {
    number: '01',
    name: '류지환',
    role: 'Data Modeler · Data Miner · Developer',
    roleKo: '데이터 모델링 · 데이터 마이닝 · 개발',
    bio: '원천 데이터를 분석 가능한 구조로 모델링하고, 데이터 마이닝부터 웹 구현까지 프로젝트의 기술 흐름을 연결합니다.',
    Icon: Database,
  },
  {
    number: '02',
    name: '한종우',
    role: 'Decision Maker · Researcher',
    roleKo: '의사결정 · 국회 및 대한체육회 리서치',
    bio: '프로젝트의 연구 방향과 주요 의사결정을 조율하고, 국회 및 대한체육회 관련 자료를 조사합니다.',
    Icon: Landmark,
  },
  {
    number: '03',
    name: '배민희',
    role: 'Article Archive · Labeling',
    roleKo: '기사 수집 및 정리 · 라벨링',
    bio: '관련 기사와 자료를 수집·정리하고, 분석 기준에 따라 기록을 분류하고 라벨링합니다.',
    Icon: Files,
  },
];

export const AboutPage: React.FC = () => {
  return (
    <main id="main-content" className="about-page" tabIndex={-1}>
      <PageFrame>
        <header className="about-hero">
          <div className="about-hero__edition" aria-label="팀 및 과정">
            <span>SBS DataScience 5</span>
            <span>Team EDGE</span>
          </div>
          <div className="about-hero__copy">
            <Badge label="프로젝트 소개" variant="neutral" />
            <h1>프로젝트 정체성 <span>&amp; 팀 저널리즘</span></h1>
            <p>
              "문체위 국정감사 6년"은 데이터의 시각적 장식이 아닌, 의회 민주주의와 피감기관의 답변 행태 사이의 간극을
              엄밀하게 기록하고 탐색하기 위해 설계된 디지털 저널리즘 에세이 작품입니다.
            </p>
          </div>
          <div className="about-hero__mark" aria-hidden="true">
            <span>EDGE</span>
            <small>Evidence · Data · Governance · Editorial</small>
          </div>
        </header>

        <section className="about-team" aria-labelledby="team-heading">
          <header className="about-section-heading">
            <div>
              <p className="about-eyebrow">The people behind the project</p>
              <h2 id="team-heading">Team EDGE</h2>
            </div>
            <p>
              서로 다른 역할이 하나의 증거 흐름을 만듭니다. 자료를 찾고 분류하며,
              분석 가능한 구조로 연결해 독자가 탐색할 수 있는 화면으로 구현합니다.
            </p>
          </header>

          <div className="about-team__grid">
            {teamMembers.map(({ number, name, role, roleKo, bio, Icon }) => (
              <article className="about-member" key={name}>
                <div className="about-member__topline">
                  <span className="about-member__number" aria-hidden="true">{number}</span>
                  <Icon aria-hidden="true" />
                </div>
                <div className="about-member__identity">
                  <p>{role}</p>
                  <h3>{name}</h3>
                </div>
                <dl className="about-member__details">
                  <div>
                    <dt>소속</dt>
                    <dd>SBS DataScience 5 · EDGE</dd>
                  </div>
                  <div>
                    <dt>담당</dt>
                    <dd>{roleKo}</dd>
                  </div>
                </dl>
                <p className="about-member__bio">{bio}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-principles" aria-label="프로젝트 원칙">
          <article>
            <h2>
              <Feather aria-hidden="true" />
              디자인 원칙 (Design Principles)
            </h2>
            <ul>
              <li>Editorial Long-form Scrollytelling: 스크롤에 따라 서사가 응축되는 구조</li>
              <li>Grid-first Typography: 타이포그래피와 여백 중심의 높은 가독성</li>
              <li>Evidence Line Language: 공식 문서를 관통하는 고유의 선 언어 (Solid, Dashed, Dotted, Break, Loop)</li>
              <li>No Dashboard Cliché: 과도한 KPI 카드나 상용 SaaS 대시보드 틀 배제</li>
            </ul>
          </article>

          <article>
            <h2>
              <Shield aria-hidden="true" />
              저널리틱 윤리 (Editorial Ethics)
            </h2>
            <p>
              본 프로젝트는 특정 정당이나 개인을 비난하기 위한 목적이 아니며,
              공식 회의록과 시정 및 처리결과 보고서의 문장 비교를 통해 행정부의 수용 및 이행 메커니즘을 검토합니다.
            </p>
          </article>
        </section>
      </PageFrame>
    </main>
  );
};
