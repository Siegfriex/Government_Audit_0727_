import {
  ANSWER_TYPES,
  ATLAS_NODE_STATUSES,
  type AnswerType,
  type AtlasNodeStatus,
  type BehaviorFamily,
} from '@/shared/types/atlas';

export type AtlasManifestFormat = 'json' | 'arrow';
export type EvidenceDetailTransport = 'route-json' | 'arrow';

export interface AtlasManifestFileTransport {
  logical_name: string;
  path: string;
  format: AtlasManifestFormat;
  sha256: string;
  row_count: number | null;
  size_bytes: number;
  cache_policy: string;
}

export interface FrontendManifestTransport {
  manifest_version: string;
  release_id: string;
  app_contract_version: string;
  data_version: string;
  pipeline_run_id: string;
  projection_id: string;
  projection_hash: string;
  publication_ready: true;
  generated_at: string;
  status_partitioned: boolean;
  evidence_detail_transport: EvidenceDetailTransport;
  files: AtlasManifestFileTransport[];
}

export interface AtlasReleasePointerTransport {
  schema_version: '1.0';
  release_id: string;
  manifest_path: string;
  manifest_sha256: string;
  projection_id: string;
  projection_hash: string;
  generated_at: string;
}

export interface AtlasSummaryTransport {
  release_id: string;
  projection_id: string;
  projection_hash: string;
  analysis_entity_count: number;
  atlas_node_count: number;
  behavior_child_count: number;
  primary_behavior_distribution: Record<AnswerType, number>;
  projection_point_count: number;
  public_evidence_count: number;
  status_distribution: Record<AtlasNodeStatus, number>;
  topic_bin_count: number;
  warnings: string[];
  story_preview_node_ids: string[];
}

export interface AtlasNodeTransport {
  atlas_node_id: string;
  projection_id: string;
  status_canvas: AtlasNodeStatus;
  topic_bin_id: string;
  answer_type_code: AnswerType;
  behavior_family: BehaviorFamily;
  anchor_x: number;
  anchor_y: number;
  display_x: number;
  display_y: number;
  raw_answer_count: number;
  raw_link_count: number;
  weighted_mass: number;
  normalized_mass: number;
  node_radius: number;
  mean_similarity: number | null;
  mean_qa_confidence: number | null;
  mean_label_confidence: number | null;
  representative_evidence_id: string | null;
  node_version: string;
  pipeline_run_id: string;
  data_version: string;
}

export interface TopicBinTransport {
  topic_bin_id: string;
  projection_id: string;
  dominant_topic_label: string | null;
  center_x: number;
  center_y: number;
  member_count: number;
  representative_target_issue_id: string | null;
}

export interface CentroidTransport {
  centroid_id: string;
  projection_id: string;
  centroid_type: string;
  status_canvas: AtlasNodeStatus | null;
  answer_type_code: AnswerType | null;
  position_x: number;
  position_y: number;
  member_count: number;
  medoid_entity_id: string | null;
}

export interface EvidenceSummaryTransport {
  evidence_id: string;
  title: string;
  reported_status: string | null;
  verification_status: string | null;
  meeting_id: string;
  page_start_no: string;
  page_end_no: string;
  pdf_asset_id: string;
  review_status: 'approved';
  publish_status: 'approved';
  public_visibility: true;
}

export interface EvidenceDetailRecordTransport {
  evidence_id: string;
  title: string;
  request_text: string;
  question_text: string;
  answer_text: string;
  evidence_excerpt: string;
  reported_status: string;
  verification_status: string;
  meeting_id: string;
  page_start_no: string;
  page_end_no: string;
  pdf_asset_id: string;
  source_pdf_sha256: string;
  pipeline_run_id: string;
  review_status: 'approved';
  publish_status: 'approved';
  public_visibility: true;
}

export interface ProjectionMetaTransport {
  projection_id: string;
  projection_hash: string;
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
  fit_scope: 'all_statuses';
}

export class AtlasSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AtlasSchemaError';
  }
}

function fail(path: string, expected: string): never {
  throw new AtlasSchemaError(`${path} must be ${expected}`);
}

function objectAt(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return fail(path, 'an object');
  return value as Record<string, unknown>;
}

function stringAt(value: unknown, path: string): string {
  if (typeof value !== 'string' || value.length === 0 || value === '<NA>') return fail(path, 'a non-empty string excluding <NA>');
  return value;
}

function nullableStringAt(value: unknown, path: string): string | null {
  if (value === null) return null;
  return stringAt(value, path);
}

function numberAt(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fail(path, 'a finite number');
  return value;
}

function integerAt(value: unknown, path: string): number {
  const number = numberAt(value, path);
  if (!Number.isInteger(number)) return fail(path, 'an integer');
  return number;
}

function nonNegativeIntegerAt(value: unknown, path: string): number {
  const number = integerAt(value, path);
  if (number < 0) return fail(path, 'a non-negative integer');
  return number;
}

function nonNegativeNumberAt(value: unknown, path: string): number {
  const number = numberAt(value, path);
  if (number < 0) return fail(path, 'a non-negative number');
  return number;
}

function booleanAt(value: unknown, path: string): boolean {
  if (typeof value !== 'boolean') return fail(path, 'a boolean');
  return value;
}

function literalAt<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  if (typeof value !== 'string' || !allowed.includes(value as T)) return fail(path, allowed.join('|'));
  return value as T;
}

function nullableNumberAt(value: unknown, path: string): number | null {
  if (value === null) return null;
  return numberAt(value, path);
}

function probabilityAt(value: unknown, path: string): number {
  const number = numberAt(value, path);
  if (number < 0 || number > 1) return fail(path, 'a number in [0,1]');
  return number;
}

function nullableProbabilityAt(value: unknown, path: string): number | null {
  if (value === null) return null;
  return probabilityAt(value, path);
}

function shaAt(value: unknown, path: string): string {
  const sha = stringAt(value, path);
  if (!/^[a-f0-9]{64}$/.test(sha)) return fail(path, 'a lowercase SHA-256 hex string');
  return sha;
}

function safeRelativePathAt(value: unknown, path: string): string {
  const filePath = stringAt(value, path);
  if (filePath.startsWith('/') || filePath.includes('..') || /^[a-z]+:/i.test(filePath)) {
    return fail(path, 'a safe relative bundle path');
  }
  return filePath;
}

function stringArrayAt(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) return fail(path, 'an array');
  return value.map((entry, index) => stringAt(entry, `${path}[${index}]`));
}

export function parseAtlasReleasePointer(value: unknown): AtlasReleasePointerTransport {
  const input = objectAt(value, 'current release pointer');
  const manifestPath = stringAt(input.manifest_path, 'pointer.manifest_path');
  if (!/^\/data\/releases\/[A-Za-z0-9._-]+\/frontend-manifest\.json$/.test(manifestPath)) {
    fail('pointer.manifest_path', 'an approved manifest public path');
  }
  return {
    schema_version: literalAt(input.schema_version, ['1.0'] as const, 'pointer.schema_version'),
    release_id: stringAt(input.release_id, 'pointer.release_id'),
    manifest_path: manifestPath,
    manifest_sha256: shaAt(input.manifest_sha256, 'pointer.manifest_sha256'),
    projection_id: stringAt(input.projection_id, 'pointer.projection_id'),
    projection_hash: shaAt(input.projection_hash, 'pointer.projection_hash'),
    generated_at: stringAt(input.generated_at, 'pointer.generated_at'),
  };
}

export function parseAtlasSummary(value: unknown): AtlasSummaryTransport {
  const input = objectAt(value, 'atlas summary');
  const primaryBehaviorInput = objectAt(input.primary_behavior_distribution, 'atlasSummary.primary_behavior_distribution');
  const statusInput = objectAt(input.status_distribution, 'atlasSummary.status_distribution');
  const storyPreviewNodeIds = stringArrayAt(input.story_preview_node_ids, 'atlasSummary.story_preview_node_ids');
  if (storyPreviewNodeIds.length === 0) fail('atlasSummary.story_preview_node_ids', 'a non-empty array');
  if (new Set(storyPreviewNodeIds).size !== storyPreviewNodeIds.length) {
    fail('atlasSummary.story_preview_node_ids', 'unique');
  }
  return {
    release_id: stringAt(input.release_id, 'atlasSummary.release_id'),
    projection_id: stringAt(input.projection_id, 'atlasSummary.projection_id'),
    projection_hash: shaAt(input.projection_hash, 'atlasSummary.projection_hash'),
    analysis_entity_count: nonNegativeIntegerAt(input.analysis_entity_count, 'atlasSummary.analysis_entity_count'),
    atlas_node_count: nonNegativeIntegerAt(input.atlas_node_count, 'atlasSummary.atlas_node_count'),
    behavior_child_count: nonNegativeIntegerAt(input.behavior_child_count, 'atlasSummary.behavior_child_count'),
    primary_behavior_distribution: Object.fromEntries(
      ANSWER_TYPES.map((answerType) => [
        answerType,
        nonNegativeIntegerAt(primaryBehaviorInput[answerType], `atlasSummary.primary_behavior_distribution.${answerType}`),
      ]),
    ) as Record<AnswerType, number>,
    projection_point_count: nonNegativeIntegerAt(input.projection_point_count, 'atlasSummary.projection_point_count'),
    public_evidence_count: nonNegativeIntegerAt(input.public_evidence_count, 'atlasSummary.public_evidence_count'),
    status_distribution: Object.fromEntries(
      ATLAS_NODE_STATUSES.map((status) => [
        status,
        nonNegativeIntegerAt(statusInput[status], `atlasSummary.status_distribution.${status}`),
      ]),
    ) as Record<AtlasNodeStatus, number>,
    topic_bin_count: nonNegativeIntegerAt(input.topic_bin_count, 'atlasSummary.topic_bin_count'),
    warnings: stringArrayAt(input.warnings, 'atlasSummary.warnings'),
    story_preview_node_ids: storyPreviewNodeIds,
  };
}

export function parseFrontendManifest(value: unknown): FrontendManifestTransport {
  const input = objectAt(value, 'manifest');
  const filesValue = input.files;
  if (!Array.isArray(filesValue)) fail('manifest.files', 'an array');
  const publicationReady = booleanAt(input.publication_ready, 'manifest.publication_ready');
  if (!publicationReady) fail('manifest.publication_ready', 'true');

  const files = filesValue.map((entry, index): AtlasManifestFileTransport => {
    const file = objectAt(entry, `manifest.files[${index}]`);
    const rowCount = file.row_count === null ? null : nonNegativeIntegerAt(file.row_count, `manifest.files[${index}].row_count`);
    return {
      logical_name: stringAt(file.logical_name, `manifest.files[${index}].logical_name`),
      path: safeRelativePathAt(file.path, `manifest.files[${index}].path`),
      format: literalAt(file.format, ['json', 'arrow'] as const, `manifest.files[${index}].format`),
      sha256: shaAt(file.sha256, `manifest.files[${index}].sha256`),
      row_count: rowCount,
      size_bytes: nonNegativeIntegerAt(file.size_bytes, `manifest.files[${index}].size_bytes`),
      cache_policy: stringAt(file.cache_policy, `manifest.files[${index}].cache_policy`),
    };
  });
  if (new Set(files.map((file) => file.logical_name)).size !== files.length) {
    fail('manifest.files.logical_name', 'unique');
  }

  return {
    manifest_version: stringAt(input.manifest_version, 'manifest.manifest_version'),
    release_id: stringAt(input.release_id, 'manifest.release_id'),
    app_contract_version: stringAt(input.app_contract_version, 'manifest.app_contract_version'),
    data_version: stringAt(input.data_version, 'manifest.data_version'),
    pipeline_run_id: stringAt(input.pipeline_run_id, 'manifest.pipeline_run_id'),
    projection_id: stringAt(input.projection_id, 'manifest.projection_id'),
    projection_hash: shaAt(input.projection_hash, 'manifest.projection_hash'),
    publication_ready: true,
    generated_at: stringAt(input.generated_at, 'manifest.generated_at'),
    status_partitioned: booleanAt(input.status_partitioned, 'manifest.status_partitioned'),
    evidence_detail_transport: literalAt(input.evidence_detail_transport, ['route-json', 'arrow'] as const, 'manifest.evidence_detail_transport'),
    files,
  };
}

export function parseAtlasNodes(value: unknown): AtlasNodeTransport[] {
  if (!Array.isArray(value)) fail('atlas nodes', 'an array');
  return value.map((entry, index): AtlasNodeTransport => {
    const node = objectAt(entry, `nodes[${index}]`);
    const behaviorFamily = literalAt(
      node.behavior_family,
      ['information_non_direct', 'deferral_procedural', 'action_evidence'] as const,
      `nodes[${index}].behavior_family`,
    );
    const normalizedMass = probabilityAt(node.normalized_mass, `nodes[${index}].normalized_mass`);
    const nodeRadius = numberAt(node.node_radius, `nodes[${index}].node_radius`);
    if (nodeRadius <= 0) fail(`nodes[${index}].node_radius`, 'a positive number');
    return {
      atlas_node_id: stringAt(node.atlas_node_id, `nodes[${index}].atlas_node_id`),
      projection_id: stringAt(node.projection_id, `nodes[${index}].projection_id`),
      status_canvas: literalAt(node.status_canvas, ATLAS_NODE_STATUSES, `nodes[${index}].status_canvas`),
      topic_bin_id: stringAt(node.topic_bin_id, `nodes[${index}].topic_bin_id`),
      answer_type_code: literalAt(node.answer_type_code, ANSWER_TYPES, `nodes[${index}].answer_type_code`),
      behavior_family: behaviorFamily,
      anchor_x: numberAt(node.anchor_x, `nodes[${index}].anchor_x`),
      anchor_y: numberAt(node.anchor_y, `nodes[${index}].anchor_y`),
      display_x: numberAt(node.display_x, `nodes[${index}].display_x`),
      display_y: numberAt(node.display_y, `nodes[${index}].display_y`),
      raw_answer_count: nonNegativeIntegerAt(node.raw_answer_count, `nodes[${index}].raw_answer_count`),
      raw_link_count: nonNegativeIntegerAt(node.raw_link_count, `nodes[${index}].raw_link_count`),
      weighted_mass: nonNegativeNumberAt(node.weighted_mass, `nodes[${index}].weighted_mass`),
      normalized_mass: normalizedMass,
      node_radius: nodeRadius,
      mean_similarity: nullableNumberAt(node.mean_similarity, `nodes[${index}].mean_similarity`),
      mean_qa_confidence: nullableProbabilityAt(node.mean_qa_confidence, `nodes[${index}].mean_qa_confidence`),
      mean_label_confidence: nullableProbabilityAt(node.mean_label_confidence, `nodes[${index}].mean_label_confidence`),
      representative_evidence_id: nullableStringAt(node.representative_evidence_id, `nodes[${index}].representative_evidence_id`),
      node_version: stringAt(node.node_version, `nodes[${index}].node_version`),
      pipeline_run_id: stringAt(node.pipeline_run_id, `nodes[${index}].pipeline_run_id`),
      data_version: stringAt(node.data_version, `nodes[${index}].data_version`),
    };
  });
}

export function parseTopicBins(value: unknown): TopicBinTransport[] {
  if (!Array.isArray(value)) fail('topic bins', 'an array');
  return value.map((entry, index) => {
    const bin = objectAt(entry, `topicBins[${index}]`);
    return {
      topic_bin_id: stringAt(bin.topic_bin_id, `topicBins[${index}].topic_bin_id`),
      projection_id: stringAt(bin.projection_id, `topicBins[${index}].projection_id`),
      dominant_topic_label: nullableStringAt(bin.dominant_topic_label, `topicBins[${index}].dominant_topic_label`),
      center_x: numberAt(bin.center_x, `topicBins[${index}].center_x`),
      center_y: numberAt(bin.center_y, `topicBins[${index}].center_y`),
      member_count: nonNegativeIntegerAt(bin.member_count, `topicBins[${index}].member_count`),
      representative_target_issue_id: nullableStringAt(bin.representative_target_issue_id, `topicBins[${index}].representative_target_issue_id`),
    };
  });
}

export function parseCentroids(value: unknown): CentroidTransport[] {
  if (!Array.isArray(value)) fail('centroids', 'an array');
  return value.map((entry, index) => {
    const centroid = objectAt(entry, `centroids[${index}]`);
    return {
      centroid_id: stringAt(centroid.centroid_id, `centroids[${index}].centroid_id`),
      projection_id: stringAt(centroid.projection_id, `centroids[${index}].projection_id`),
      centroid_type: stringAt(centroid.centroid_type, `centroids[${index}].centroid_type`),
      status_canvas: centroid.status_canvas === null
        ? null
        : literalAt(centroid.status_canvas, ATLAS_NODE_STATUSES, `centroids[${index}].status_canvas`),
      answer_type_code: centroid.answer_type_code === null
        ? null
        : literalAt(centroid.answer_type_code, ANSWER_TYPES, `centroids[${index}].answer_type_code`),
      position_x: numberAt(centroid.position_x, `centroids[${index}].position_x`),
      position_y: numberAt(centroid.position_y, `centroids[${index}].position_y`),
      member_count: nonNegativeIntegerAt(centroid.member_count, `centroids[${index}].member_count`),
      medoid_entity_id: nullableStringAt(centroid.medoid_entity_id, `centroids[${index}].medoid_entity_id`),
    };
  });
}

export function parseEvidenceSummaries(value: unknown): EvidenceSummaryTransport[] {
  if (!Array.isArray(value)) fail('evidence index', 'an array');
  return value.map((entry, index) => {
    const evidence = objectAt(entry, `evidence[${index}]`);
    if (evidence.review_status !== 'approved' || evidence.publish_status !== 'approved' || evidence.public_visibility !== true) {
      fail(`evidence[${index}]`, 'approved, published, public evidence');
    }
    return {
      evidence_id: stringAt(evidence.evidence_id, `evidence[${index}].evidence_id`),
      title: stringAt(evidence.title, `evidence[${index}].title`),
      reported_status: nullableStringAt(evidence.reported_status, `evidence[${index}].reported_status`),
      verification_status: nullableStringAt(evidence.verification_status, `evidence[${index}].verification_status`),
      meeting_id: stringAt(evidence.meeting_id, `evidence[${index}].meeting_id`),
      page_start_no: stringAt(evidence.page_start_no, `evidence[${index}].page_start_no`),
      page_end_no: stringAt(evidence.page_end_no, `evidence[${index}].page_end_no`),
      pdf_asset_id: stringAt(evidence.pdf_asset_id, `evidence[${index}].pdf_asset_id`),
      review_status: 'approved',
      publish_status: 'approved',
      public_visibility: true,
    };
  });
}

export function parseEvidenceDetail(value: unknown): EvidenceDetailRecordTransport {
  const evidence = objectAt(value, 'evidence detail');
  if (evidence.review_status !== 'approved' || evidence.publish_status !== 'approved' || evidence.public_visibility !== true) {
    fail('evidence detail', 'approved, published, public evidence');
  }
  return {
    evidence_id: stringAt(evidence.evidence_id, 'evidenceDetail.evidence_id'),
    title: stringAt(evidence.title, 'evidenceDetail.title'),
    request_text: stringAt(evidence.request_text, 'evidenceDetail.request_text'),
    question_text: stringAt(evidence.question_text, 'evidenceDetail.question_text'),
    answer_text: stringAt(evidence.answer_text, 'evidenceDetail.answer_text'),
    evidence_excerpt: stringAt(evidence.evidence_excerpt, 'evidenceDetail.evidence_excerpt'),
    reported_status: stringAt(evidence.reported_status, 'evidenceDetail.reported_status'),
    verification_status: stringAt(evidence.verification_status, 'evidenceDetail.verification_status'),
    meeting_id: stringAt(evidence.meeting_id, 'evidenceDetail.meeting_id'),
    page_start_no: stringAt(evidence.page_start_no, 'evidenceDetail.page_start_no'),
    page_end_no: stringAt(evidence.page_end_no, 'evidenceDetail.page_end_no'),
    pdf_asset_id: stringAt(evidence.pdf_asset_id, 'evidenceDetail.pdf_asset_id'),
    source_pdf_sha256: shaAt(evidence.source_pdf_sha256, 'evidenceDetail.source_pdf_sha256'),
    pipeline_run_id: stringAt(evidence.pipeline_run_id, 'evidenceDetail.pipeline_run_id'),
    review_status: 'approved',
    publish_status: 'approved',
    public_visibility: true,
  };
}

export function parseProjectionMeta(value: unknown): ProjectionMetaTransport {
  const meta = objectAt(value, 'projection meta');
  const parsed = {
    projection_id: stringAt(meta.projection_id, 'projectionMeta.projection_id'),
    projection_hash: shaAt(meta.projection_hash, 'projectionMeta.projection_hash'),
    x_min: numberAt(meta.x_min, 'projectionMeta.x_min'),
    x_max: numberAt(meta.x_max, 'projectionMeta.x_max'),
    y_min: numberAt(meta.y_min, 'projectionMeta.y_min'),
    y_max: numberAt(meta.y_max, 'projectionMeta.y_max'),
    fit_scope: literalAt(meta.fit_scope, ['all_statuses'] as const, 'projectionMeta.fit_scope'),
  };
  if (parsed.x_max <= parsed.x_min || parsed.y_max <= parsed.y_min) fail('projectionMeta bounds', 'positive finite spans');
  return parsed;
}
