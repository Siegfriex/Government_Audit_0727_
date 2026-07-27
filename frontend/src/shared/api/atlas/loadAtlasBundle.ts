import {
  parseAtlasNodes,
  parseAtlasSummary,
  parseCentroids,
  parseEvidenceSummaries,
  parseProjectionMeta,
  parseTopicBins,
  type AtlasManifestFileTransport,
  type AtlasNodeTransport,
  type AtlasSummaryTransport,
  type CentroidTransport,
  type EvidenceSummaryTransport,
  type FrontendManifestTransport,
  type ProjectionMetaTransport,
  type TopicBinTransport,
} from '@/shared/api/atlas/atlasTransportSchema';
import { AtlasLoadError } from '@/shared/api/atlas/loadAtlasManifest';

export interface AtlasTransportBundle {
  manifest: FrontendManifestTransport;
  summary: AtlasSummaryTransport;
  nodes: AtlasNodeTransport[];
  topicBins: TopicBinTransport[];
  centroids: CentroidTransport[];
  evidence: EvidenceSummaryTransport[];
  projectionMeta: ProjectionMetaTransport;
}

const REQUIRED_JSON_FILES = {
  summary: 'atlas-summary',
  nodes: 'atlas-nodes-all',
  topicBins: 'atlas-topic-bins',
  centroids: 'atlas-centroids',
  evidence: 'evidence-index',
  projectionMeta: 'projection-meta',
  methodMeta: 'method-meta',
  assetsManifest: 'assets-manifest',
} as const;

function requiredFile(
  manifest: FrontendManifestTransport,
  logicalName: string,
): AtlasManifestFileTransport {
  const file = manifest.files.find((candidate) => candidate.logical_name === logicalName);
  if (!file || file.format !== 'json') {
    throw new AtlasLoadError(`Approved manifest is missing required JSON file: ${logicalName}`);
  }
  return file;
}

function fileUrl(baseUrl: string, file: AtlasManifestFileTransport): string {
  const encodedPath = file.path.split('/').map((part) => encodeURIComponent(part)).join('/');
  return `${baseUrl}/${encodedPath}`;
}

async function fetchJson(
  baseUrl: string,
  file: AtlasManifestFileTransport,
  fetchImpl: typeof fetch,
  signal?: AbortSignal,
): Promise<unknown> {
  const response = await fetchImpl(fileUrl(baseUrl, file), {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new AtlasLoadError(`${file.logical_name} returned HTTP ${response.status}`);
  const bytes = await response.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes));
  const actualSha = [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, '0')).join('');
  if (actualSha !== file.sha256) {
    throw new AtlasLoadError(`${file.logical_name} SHA-256 does not match the approved manifest`);
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch (error) {
    throw new AtlasLoadError(`${file.logical_name} is not valid JSON`, { cause: error });
  }
}

export async function loadAtlasBundle(
  manifest: FrontendManifestTransport,
  baseUrl: string,
  fetchImpl: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<AtlasTransportBundle> {
  requiredFile(manifest, REQUIRED_JSON_FILES.methodMeta);
  requiredFile(manifest, REQUIRED_JSON_FILES.assetsManifest);
  const files = {
    summary: requiredFile(manifest, REQUIRED_JSON_FILES.summary),
    nodes: requiredFile(manifest, REQUIRED_JSON_FILES.nodes),
    topicBins: requiredFile(manifest, REQUIRED_JSON_FILES.topicBins),
    centroids: requiredFile(manifest, REQUIRED_JSON_FILES.centroids),
    evidence: requiredFile(manifest, REQUIRED_JSON_FILES.evidence),
    projectionMeta: requiredFile(manifest, REQUIRED_JSON_FILES.projectionMeta),
  };
  const [summaryJson, nodesJson, topicBinsJson, centroidsJson, evidenceJson, projectionMetaJson] = await Promise.all([
    fetchJson(baseUrl, files.summary, fetchImpl, signal),
    fetchJson(baseUrl, files.nodes, fetchImpl, signal),
    fetchJson(baseUrl, files.topicBins, fetchImpl, signal),
    fetchJson(baseUrl, files.centroids, fetchImpl, signal),
    fetchJson(baseUrl, files.evidence, fetchImpl, signal),
    fetchJson(baseUrl, files.projectionMeta, fetchImpl, signal),
  ]);

  const bundle: AtlasTransportBundle = {
    manifest,
    summary: parseAtlasSummary(summaryJson),
    nodes: parseAtlasNodes(nodesJson),
    topicBins: parseTopicBins(topicBinsJson),
    centroids: parseCentroids(centroidsJson),
    evidence: parseEvidenceSummaries(evidenceJson),
    projectionMeta: parseProjectionMeta(projectionMetaJson),
  };

  const projectionIds = new Set([
    bundle.projectionMeta.projection_id,
    ...bundle.nodes.map((node) => node.projection_id),
    ...bundle.topicBins.map((bin) => bin.projection_id),
    ...bundle.centroids.map((centroid) => centroid.projection_id),
  ]);
  if (projectionIds.size !== 1 || !projectionIds.has(manifest.projection_id)) {
    throw new AtlasLoadError('Bundle projection IDs do not match the approved manifest');
  }
  if (bundle.projectionMeta.projection_hash !== manifest.projection_hash) {
    throw new AtlasLoadError('Projection hash does not match the approved manifest');
  }
  if (bundle.summary.release_id !== manifest.release_id
    || bundle.summary.projection_id !== manifest.projection_id
    || bundle.summary.projection_hash !== manifest.projection_hash) {
    throw new AtlasLoadError('Atlas summary release or projection metadata does not match the approved manifest');
  }
  if (bundle.summary.atlas_node_count !== bundle.nodes.length) {
    throw new AtlasLoadError('Atlas summary node count does not match the approved node bundle');
  }
  if (bundle.summary.topic_bin_count !== bundle.topicBins.length) {
    throw new AtlasLoadError('Atlas summary topic-bin count does not match the approved topic-bin bundle');
  }
  if (bundle.summary.public_evidence_count !== bundle.evidence.length) {
    throw new AtlasLoadError('Atlas summary evidence count does not match the approved Evidence bundle');
  }
  if (bundle.summary.projection_point_count !== bundle.summary.analysis_entity_count) {
    throw new AtlasLoadError('Atlas summary projection point count does not match its analysis entity count');
  }
  if (Object.values(bundle.summary.status_distribution).reduce((sum, count) => sum + count, 0)
    !== bundle.summary.analysis_entity_count) {
    throw new AtlasLoadError('Atlas summary status distribution does not match its analysis entity count');
  }
  if (Object.values(bundle.summary.primary_behavior_distribution).reduce((sum, count) => sum + count, 0)
    !== bundle.summary.analysis_entity_count) {
    throw new AtlasLoadError('Atlas summary primary behavior distribution does not match its analysis entity count');
  }
  const nodeIds = new Set(bundle.nodes.map((node) => node.atlas_node_id));
  if (bundle.summary.story_preview_node_ids.some((nodeId) => !nodeIds.has(nodeId))) {
    throw new AtlasLoadError('Atlas summary Story preview IDs are absent from the approved node bundle');
  }

  return bundle;
}
