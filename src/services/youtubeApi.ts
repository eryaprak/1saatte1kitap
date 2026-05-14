// YouTube Data API v3 helper
import { YOUTUBE_API_KEY } from '../constants';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

export interface YouTubeVideoSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  categoryId?: string;
}

export interface YouTubeContentDetails {
  duration: string; // ISO 8601 duration, e.g. "PT1H2M3S"
}

export interface YouTubeVideo {
  id: string;
  snippet: YouTubeVideoSnippet;
  contentDetails: YouTubeContentDetails;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: YouTubeVideoSnippet;
}

interface YouTubeSearchResponse {
  items?: YouTubeSearchItem[];
  nextPageToken?: string;
}

interface YouTubeVideosResponse {
  items?: YouTubeVideo[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts an ISO 8601 duration string (e.g. "PT1H23M45S") to total minutes.
 */
export function iso8601DurationToMinutes(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? '0', 10);
  const minutes = parseInt(match[2] ?? '0', 10);
  const seconds = parseInt(match[3] ?? '0', 10);
  return hours * 60 + minutes + Math.round(seconds / 60);
}

/**
 * Returns the best available thumbnail URL, preferring maxres > standard > high > medium > default.
 */
export function getBestThumbnailUrl(thumbnails: YouTubeThumbnails): string {
  return (
    thumbnails.maxres?.url ??
    thumbnails.standard?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    'https://picsum.photos/seed/youtube/300/400'
  );
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Fetches full video details (snippet + contentDetails) for an existing video ID.
 */
export async function fetchVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  const url = `${BASE_URL}/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const json = (await res.json()) as YouTubeVideosResponse;
  return json.items?.[0] ?? null;
}

/**
 * Fetches all videos from a channel using the Search API (costs 100 quota units per call),
 * then enriches them with contentDetails via the Videos API (1 unit per 50 videos).
 *
 * Default maxResults is 50 (the API maximum per request).
 */
export async function fetchChannelVideos(
  channelId: string,
  maxResults = 50,
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('[YouTube] API key not set — skipping channel fetch');
    return [];
  }

  // Step 1: Search for videos in the channel (100 quota units)
  const searchUrl =
    `${BASE_URL}/search` +
    `?channelId=${encodeURIComponent(channelId)}` +
    `&part=snippet` +
    `&type=video` +
    `&order=date` +
    `&maxResults=${maxResults}` +
    `&key=${YOUTUBE_API_KEY}`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    throw new Error(`YouTube Search API error: ${searchRes.status}`);
  }
  const searchJson = (await searchRes.json()) as YouTubeSearchResponse;
  const searchItems = searchJson.items ?? [];

  if (searchItems.length === 0) return [];

  // Step 2: Enrich with contentDetails (duration) — 1 quota unit per 50 IDs
  const ids = searchItems.map((item) => item.id.videoId).join(',');
  const videosUrl =
    `${BASE_URL}/videos` +
    `?part=snippet,contentDetails` +
    `&id=${ids}` +
    `&key=${YOUTUBE_API_KEY}`;

  const videosRes = await fetch(videosUrl);
  if (!videosRes.ok) {
    throw new Error(`YouTube Videos API error: ${videosRes.status}`);
  }
  const videosJson = (await videosRes.json()) as YouTubeVideosResponse;
  return videosJson.items ?? [];
}

/**
 * Searches for videos in a channel by query string.
 * Costs 100 quota units per call.
 */
export async function searchChannelVideos(
  channelId: string,
  query: string,
  maxResults = 25,
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('[YouTube] API key not set — skipping channel search');
    return [];
  }

  // Step 1: Search with query
  const searchUrl =
    `${BASE_URL}/search` +
    `?channelId=${encodeURIComponent(channelId)}` +
    `&q=${encodeURIComponent(query)}` +
    `&part=snippet` +
    `&type=video` +
    `&maxResults=${maxResults}` +
    `&key=${YOUTUBE_API_KEY}`;

  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    throw new Error(`YouTube Search API error: ${searchRes.status}`);
  }
  const searchJson = (await searchRes.json()) as YouTubeSearchResponse;
  const searchItems = searchJson.items ?? [];

  if (searchItems.length === 0) return [];

  // Step 2: Enrich with contentDetails
  const ids = searchItems.map((item) => item.id.videoId).join(',');
  const videosUrl =
    `${BASE_URL}/videos` +
    `?part=snippet,contentDetails` +
    `&id=${ids}` +
    `&key=${YOUTUBE_API_KEY}`;

  const videosRes = await fetch(videosUrl);
  if (!videosRes.ok) {
    throw new Error(`YouTube Videos API error: ${videosRes.status}`);
  }
  const videosJson = (await videosRes.json()) as YouTubeVideosResponse;
  return videosJson.items ?? [];
}
