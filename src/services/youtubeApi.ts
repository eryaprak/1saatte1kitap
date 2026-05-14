// YouTube Data API v3 helper
import { YOUTUBE_API_KEY } from '../constants';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function fetchVideoDetails(videoId: string) {
  const url = `${BASE_URL}/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const json = (await res.json()) as { items?: unknown[] };
  return json.items?.[0] ?? null;
}
