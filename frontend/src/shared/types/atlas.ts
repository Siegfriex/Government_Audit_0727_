export const ATLAS_STATUSES = ['all', 'complete', 'active', 'unresolved'] as const;
export const ATLAS_NODE_STATUSES = ['complete', 'active', 'unresolved'] as const;
export const ANSWER_TYPES = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'] as const;

export type AtlasStatus = (typeof ATLAS_STATUSES)[number];
export type AtlasNodeStatus = (typeof ATLAS_NODE_STATUSES)[number];
export type AnswerType = (typeof ANSWER_TYPES)[number];
export type AtlasViewMode = 'map' | 'relations' | 'evidence';

export const ATLAS_RELATION_TYPES = [
  'semantic_neighbor',
  'shared_target',
  'same_topic_cross_behavior',
  'shared_evidence_context',
  'temporal_continuity',
] as const;

export type AtlasRelationType = (typeof ATLAS_RELATION_TYPES)[number];

export type BehaviorFamily =
  | 'information_non_direct'
  | 'deferral_procedural'
  | 'action_evidence';

export type AtlasShapeToken = 'circle' | 'diamond' | 'square';

export interface Point2D {
  x: number;
  y: number;
}

export interface AtlasEncodingViewModel {
  shapeToken: AtlasShapeToken;
  fillToken: string;
  strokeToken: string;
  opacity: number;
}

export interface AtlasNodeViewModel {
  id: string;
  projectionId: string;
  topicBinId: string;
  topicLabel: string | null;
  status: AtlasNodeStatus;
  answerType: AnswerType;
  behaviorFamily: BehaviorFamily;
  anchor: Point2D;
  display: Point2D;
  screen: Point2D;
  radiusPx: number;
  normalizedMass: number;
  answerCount: number;
  linkCount: number;
  confidence: number | null;
  meanSimilarity: number | null;
  representativeEvidenceId: string | null;
  isPublicEvidenceAvailable: boolean;
  encoding: AtlasEncodingViewModel;
}

export interface TopicBinViewModel {
  id: string;
  label: string | null;
  center: Point2D;
  screen: Point2D;
  memberCount: number;
  representativeTargetIssueId: string | null;
}

export interface CentroidViewModel {
  id: string;
  type: string;
  status: AtlasNodeStatus | null;
  answerType: AnswerType | null;
  position: Point2D;
  screen: Point2D;
  memberCount: number;
  medoidEntityId: string | null;
}

export interface EvidenceSummaryViewModel {
  id: string;
  title: string;
  reportedStatus: string | null;
  verificationStatus: string | null;
  meetingId: string;
  pageStartNo: string;
  pageEndNo: string;
  pdfAssetId: string;
  publicVisibility: true;
}

export interface EvidenceDetailViewModel {
  id: string;
  title: string;
  requestText: string;
  questionText: string;
  answerText: string;
  excerpt: string;
  reportedStatus: string;
  verificationStatus: string;
  meetingId: string;
  pageStartNo: string;
  pageEndNo: string;
  pdfAssetId: string;
  sourcePdfSha256: string;
  pipelineRunId: string;
  publicVisibility: true;
}

export interface EvidenceRepository {
  getSummary(evidenceId: string): EvidenceSummaryViewModel | null;
  getDetail(evidenceId: string, signal?: AbortSignal): Promise<EvidenceDetailViewModel>;
}

export interface ProjectionBounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface AtlasPlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AtlasQueryState {
  status: AtlasStatus;
  types: AnswerType[];
  nodeId: string | null;
  view: AtlasViewMode;
  relationType: AtlasRelationType | null;
  depth: 1;
}

export interface AtlasRelationViewModel {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: AtlasRelationType;
  directed: boolean;
  weight: number;
  confidence: number | null;
  rankWithinSource: number;
  evidenceCount: number;
  label: string;
  explanation: string | null;
  source: Point2D;
  target: Point2D;
  encoding: {
    lineToken: string;
    widthToken: string;
    dashToken: string;
    opacity: number;
    markerToken: string | null;
  };
}

export interface AtlasRelationSummaryViewModel {
  selectedNodeId: string;
  directRelationCount: number;
  semanticNeighborCount: number;
  sharedTargetCount: number;
  crossBehaviorCount: number;
  sharedEvidenceCount: number;
  temporalContinuityCount: number;
}

export interface AtlasStorySummaryViewModel {
  analysisEntityCount: number;
  atlasNodeCount: number;
  behaviorChildCount: number;
  primaryBehaviorDistribution: Record<AnswerType, number>;
  projectionPointCount: number;
  publicEvidenceCount: number;
  statusDistribution: Record<AtlasNodeStatus, number>;
  topicBinCount: number;
  warnings: string[];
}

export interface AtlasViewModelBundle {
  releaseId: string;
  dataVersion: string;
  projectionId: string;
  projectionHash: string;
  bounds: ProjectionBounds;
  nodes: AtlasNodeViewModel[];
  topicBins: TopicBinViewModel[];
  centroids: CentroidViewModel[];
  evidence: EvidenceSummaryViewModel[];
  storySummary: AtlasStorySummaryViewModel;
  storyPreviewNodeIds: string[];
  evidenceRepository: EvidenceRepository;
  relations: AtlasRelationViewModel[] | null;
}
