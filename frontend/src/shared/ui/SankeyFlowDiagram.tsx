import React, { useState } from 'react';
import { Badge } from './Badge';
import { Info, RotateCcw, ArrowRight } from 'lucide-react';

interface SankeyNode {
  id: string;
  title: string;
  count: number;
  unit: string;
  color: string;
  textColor: string;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  desc?: string;
}

interface SankeyLink {
  id: string;
  source: string;
  target: string;
  value: number;
  label: string;
  color: string;
  x1: number;
  y1Top: number;
  y1Bot: number;
  x2: number;
  y2Top: number;
  y2Bot: number;
  labelX: number;
  labelY: number;
}

export const SankeyFlowDiagram: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);

  const activeId = hoveredNodeId || selectedNodeId;

  // Nodes definition
  const nodes: SankeyNode[] = [
    {
      id: 'step1_req',
      title: '시정요구',
      count: 5000,
      unit: '건',
      color: '#3B82F6', // Blue
      textColor: '#FFFFFF',
      col: 1,
      x: 30,
      y: 80,
      width: 140,
      height: 320,
      desc: '국정감사 시정요구 총 5,000건의 최초 발특 데이터',
    },
    {
      id: 'step2_active',
      title: '조치중',
      count: 1800,
      unit: '건',
      color: '#10B981', // Mint/Teal
      textColor: '#FFFFFF',
      col: 2,
      x: 370,
      y: 60,
      width: 140,
      height: 135,
      desc: '피감기관이 조치 이행 중이라 보고했으나 멈추거나 장기 지연된 1,800건',
    },
    {
      id: 'step2_done',
      title: '조치완료',
      count: 3200,
      unit: '건',
      color: '#22C55E', // Green
      textColor: '#FFFFFF',
      col: 2,
      x: 370,
      y: 225,
      width: 140,
      height: 195,
      desc: '공식 보고서상 "조치 완료"로 제출된 3,200건의 안건',
    },
    {
      id: 'step3_unresolved',
      title: '미완료(재발)',
      count: 600,
      unit: '건',
      color: '#EF4444', // Red
      textColor: '#FFFFFF',
      col: 3,
      x: 710,
      y: 50,
      width: 140,
      height: 70,
      desc: '조치중 단계에서 멈추고 결국 미완료 상태로 남은 600건',
    },
    {
      id: 'step3_reoccurred',
      title: '재발(재지적)',
      count: 1800, // Total incoming re-occurred (900 from active + 900 from done)
      unit: '건',
      color: '#F97316', // Orange
      textColor: '#FFFFFF',
      col: 3,
      x: 710,
      y: 160,
      width: 140,
      height: 120,
      desc: '완료 보고(900건) 및 조치중(900건) 중 매년 반복 재지적된 실질 미개선 1,800건',
    },
    {
      id: 'step3_closed',
      title: '정상종결',
      count: 2600,
      unit: '건',
      color: '#10B981', // Green
      textColor: '#FFFFFF',
      col: 3,
      x: 710,
      y: 305,
      width: 140,
      height: 115,
      desc: '실질적인 법안 개정 및 현장 이행이 완결된 2,600건',
    },
  ];

  // Flow links definition
  const links: SankeyLink[] = [
    {
      id: 'link_req_active',
      source: 'step1_req',
      target: 'step2_active',
      value: 1800,
      label: '1,800',
      color: 'rgba(59, 130, 246, 0.25)',
      x1: 170,
      y1Top: 80,
      y1Bot: 195.2,
      x2: 370,
      y2Top: 60,
      y2Bot: 195,
      labelX: 270,
      labelY: 125,
    },
    {
      id: 'link_req_done',
      source: 'step1_req',
      target: 'step2_done',
      value: 3200,
      label: '3,200',
      color: 'rgba(59, 130, 246, 0.22)',
      x1: 170,
      y1Top: 195.2,
      y1Bot: 400,
      x2: 370,
      y2Top: 225,
      y2Bot: 420,
      labelX: 270,
      labelY: 310,
    },
    {
      id: 'link_active_unresolved',
      source: 'step2_active',
      target: 'step3_unresolved',
      value: 600,
      label: '600',
      color: 'rgba(239, 68, 68, 0.3)',
      x1: 510,
      y1Top: 60,
      y1Bot: 105,
      x2: 710,
      y2Top: 50,
      y2Bot: 120,
      labelX: 610,
      labelY: 75,
    },
    {
      id: 'link_active_reoccurred',
      source: 'step2_active',
      target: 'step3_reoccurred',
      value: 900,
      label: '900',
      color: 'rgba(249, 115, 22, 0.3)',
      x1: 510,
      y1Top: 105,
      y1Bot: 195,
      x2: 710,
      y2Top: 160,
      y2Bot: 220,
      labelX: 610,
      labelY: 165,
    },
    {
      id: 'link_done_reoccurred',
      source: 'step2_done',
      target: 'step3_reoccurred',
      value: 900,
      label: '900',
      color: 'rgba(249, 115, 22, 0.3)',
      x1: 510,
      y1Top: 225,
      y1Bot: 280,
      x2: 710,
      y2Top: 220,
      y2Bot: 280,
      labelX: 610,
      labelY: 250,
    },
    {
      id: 'link_done_closed',
      source: 'step2_done',
      target: 'step3_closed',
      value: 2300,
      label: '2,300',
      color: 'rgba(16, 185, 129, 0.25)',
      x1: 510,
      y1Top: 280,
      y1Bot: 420,
      x2: 710,
      y2Top: 305,
      y2Bot: 420,
      labelX: 610,
      labelY: 350,
    },
  ];

  const isLinkActive = (link: SankeyLink) => {
    if (!activeId) return true;
    if (hoveredLinkId === link.id) return true;
    return link.source === activeId || link.target === activeId;
  };

  const isNodeActive = (nodeId: string) => {
    if (!activeId) return true;
    if (activeId === nodeId) return true;
    return links.some(
      (l) =>
        (l.source === activeId && l.target === nodeId) ||
        (l.target === activeId && l.source === nodeId)
    );
  };

  // Helper to build SVG cubic bezier path for ribbons
  const createRibbonPath = (link: SankeyLink) => {
    const { x1, y1Top, y1Bot, x2, y2Top, y2Bot } = link;
    const dx = (x2 - x1) * 0.5;
    return `
      M ${x1} ${y1Top}
      C ${x1 + dx} ${y1Top}, ${x2 - dx} ${y2Top}, ${x2} ${y2Top}
      L ${x2} ${y2Bot}
      C ${x2 - dx} ${y2Bot}, ${x1 + dx} ${y1Bot}, ${x1} ${y1Bot}
      Z
    `;
  };

  return (
    <div className="w-full bg-[var(--color-surface)] border border-[var(--color-neutral-200)] p-6 md:p-8 rounded-none shadow-sm">
      {/* Title & Stage Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--color-neutral-200)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="type-mono text-xs font-bold text-[var(--color-behavior-blue-deep)] uppercase tracking-wider">
              SANKEY FLOW DIAGRAM
            </span>
            <Badge label="가로 수치 흐름" variant="neutral" />
          </div>
          <h3 className="type-heading-2 font-serif text-[var(--color-ink)]">
            시정요구 → 조치중 → 조치완료 → 재발(재지적)
          </h3>
          <p className="type-caption text-[var(--color-neutral-700)] mt-1">
            국정감사 시정요구부터 최종 이행 및 재발(재지적)까지의 수치 연결 흐름도
          </p>
        </div>

        {activeId && (
          <button
            onClick={() => {
              setSelectedNodeId(null);
              setHoveredNodeId(null);
              setHoveredLinkId(null);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-[var(--color-neutral-200)] hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        )}
      </div>

      {/* Main Interactive Horizontal Sankey Chart */}
      <div
        className="relative w-full overflow-x-auto hide-scrollbar pb-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-behavior-red-deep)]"
        role="region"
        aria-label="시정요구 처리 흐름 가로 도표"
        tabIndex={0}
      >
        <div className="min-w-[880px] relative">
          <svg
            viewBox="0 0 880 460"
            className="w-full h-auto select-none"
            style={{ minHeight: '420px' }}
          >
            {/* Background Grid Lines / Column Indicators */}
            <g className="opacity-30">
              <line x1="30" y1="20" x2="850" y2="20" stroke="var(--color-neutral-300)" strokeDasharray="3 3" />
              <text x="100" y="38" textAnchor="middle" fill="var(--color-neutral-600)" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                1단계: 시정요구 (발단)
              </text>
              <text x="440" y="38" textAnchor="middle" fill="var(--color-neutral-600)" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                2단계: 이행보고 (조치상태)
              </text>
              <text x="780" y="38" textAnchor="middle" fill="var(--color-neutral-600)" fontSize="11" fontFamily="sans-serif" fontWeight="bold">
                3단계: 최종실질결과 (귀결)
              </text>
            </g>

            {/* Render Flow Ribbons */}
            <g className="flow-ribbons">
              {links.map((link) => {
                const active = isLinkActive(link);
                return (
                  <g key={link.id} className="cursor-pointer group">
                    <path
                      d={createRibbonPath(link)}
                      fill={link.color}
                      opacity={active ? (hoveredLinkId === link.id ? 0.85 : 0.6) : 0.08}
                      className="transition-all duration-300 hover:opacity-80"
                      onMouseEnter={() => setHoveredLinkId(link.id)}
                      onMouseLeave={() => setHoveredLinkId(null)}
                    />
                    {/* Flow Count Badge along path */}
                    <g
                      transform={`translate(${link.labelX}, ${link.labelY})`}
                      className="pointer-events-none"
                    >
                      <rect
                        x="-24"
                        y="-11"
                        width="48"
                        height="22"
                        rx="3"
                        fill="var(--color-paper)"
                        stroke={active ? 'var(--color-ink)' : 'var(--color-neutral-300)'}
                        strokeWidth={active ? '1.5' : '1'}
                        opacity={active ? 1 : 0.4}
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill={active ? 'var(--color-ink)' : 'var(--color-neutral-500)'}
                        fontFamily="sans-serif"
                      >
                        {link.label}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>

            {/* Render Nodes */}
            <g className="sankey-nodes">
              {nodes.map((node) => {
                const active = isNodeActive(node.id);
                const isSelected = selectedNodeId === node.id;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer group"
                    onClick={() =>
                      setSelectedNodeId(selectedNodeId === node.id ? null : node.id)
                    }
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {/* Node Box */}
                    <rect
                      x="0"
                      y="0"
                      width={node.width}
                      height={node.height}
                      rx="6"
                      fill={node.color}
                      opacity={active ? 1 : 0.25}
                      stroke={isSelected ? '#000000' : 'none'}
                      strokeWidth="2.5"
                      className="transition-all duration-200 group-hover:filter group-hover:brightness-105"
                    />

                    {/* Node Content */}
                    <foreignObject
                      x="0"
                      y="0"
                      width={node.width}
                      height={node.height}
                      className="pointer-events-none p-3 overflow-hidden"
                    >
                      <div
                        className="h-full flex flex-col justify-between"
                        style={{ color: node.textColor }}
                      >
                        <div>
                          <div className="text-sm font-bold font-serif leading-tight">
                            {node.title}
                          </div>
                          <div className="text-xs opacity-90 font-mono mt-0.5">
                            ({node.count.toLocaleString()}
                            {node.unit})
                          </div>
                        </div>

                        {node.height > 90 && (
                          <div className="text-[10px] opacity-80 font-sans leading-tight hidden md:block">
                            {node.title === '시정요구' && '국감 요구안건 전체'}
                            {node.title === '조치완료' && '보고서 완료 제출'}
                            {node.title === '재발(재지적)' && '약 28% 반복 재지적'}
                            {node.title === '정상종결' && '실질적 완결 처리'}
                          </div>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>

      {/* Detailed Description Box matching the reference image's '설명' card */}
      <div className="mt-6 p-5 bg-[var(--color-paper)] border border-[var(--color-neutral-200)] flex flex-col md:flex-row items-start gap-4">
        <div className="flex items-center gap-2 bg-[var(--color-behavior-blue-deep)] text-white px-3 py-1 text-xs font-bold font-mono shrink-0">
          <Info className="w-3.5 h-3.5" />
          <span>설명 및 저널리즘 분석</span>
        </div>

        <div className="flex-1 text-sm text-[var(--color-ink)] leading-relaxed font-sans">
          {activeId === 'step3_reoccurred' ? (
            <p className="font-bold text-[var(--color-behavior-amber-deep)]">
              [재발(재지적) 집중 조명]: 공식 조치완료된 3,200건 중 900건(28%) 및 조치중 900건, 총 1,800건이 다음 해에 똑같이 다시 지적되었습니다.
            </p>
          ) : activeId === 'step2_active' ? (
            <p className="font-bold text-[var(--color-behavior-amber-deep)]">
              [조치중 1,800건]: 시정요구 5,000건 중 1,800건은 "조치중" 상태로 멈추어, 이 중 600건은 미완료 상태로 남고 900건은 재발합니다.
            </p>
          ) : (
            <p>
              시정요구 <strong className="font-bold text-[var(--color-behavior-blue-deep)]">5,000건</strong> 중{' '}
              <strong className="font-bold">1,800건</strong>은 조치중에서 멈추고,{' '}
              <strong className="font-bold text-[var(--color-behavior-red-deep)]">600건</strong>은 미완료 상태로 남습니다.{' '}
              조치완료된 <strong className="font-bold">3,200건</strong> 중에서도{' '}
              <strong className="font-bold text-[var(--color-behavior-amber-deep)]">900건(약 28%)</strong>이 재발(재지적)하여 실질적 개선이 이루어지지 않았음을 보여줍니다.
            </p>
          )}

          {/* Key metrics horizontal pill flow */}
          <div className="mt-3 pt-3 border-t border-[var(--color-neutral-200)] flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--color-neutral-700)]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#3B82F6] inline-block rounded-xs" />
              시정요구: 5,000건 (100%)
            </span>
            <ArrowRight className="w-3 h-3 text-[var(--color-neutral-400)]" />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#10B981] inline-block rounded-xs" />
              조치중: 1,800건 (36%)
            </span>
            <ArrowRight className="w-3 h-3 text-[var(--color-neutral-400)]" />
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-[#22C55E] inline-block rounded-xs" />
              조치완료: 3,200건 (64%)
            </span>
            <ArrowRight className="w-3 h-3 text-[var(--color-neutral-400)]" />
            <span className="flex items-center gap-1 text-[var(--color-behavior-amber-deep)] font-bold">
              <span className="w-2.5 h-2.5 bg-[#F97316] inline-block rounded-xs" />
              재발(재지적): 1,800건
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
