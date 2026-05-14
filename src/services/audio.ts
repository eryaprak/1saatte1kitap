import { Audio, AVPlaybackStatus } from 'expo-av';
import type { Book } from '../types';
import { usePlayerStore } from '../stores/playerStore';

let soundInstance: Audio.Sound | null = null;

async function configureAudioSession(): Promise<void> {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

function onPlaybackStatusUpdate(status: AVPlaybackStatus): void {
  if (!status.isLoaded) {
    if (status.error) {
      console.error('[AudioService] Playback error:', status.error);
    }
    return;
  }

  const store = usePlayerStore.getState();

  const positionSec = status.positionMillis / 1000;
  const durationSec = status.durationMillis ? status.durationMillis / 1000 : 0;

  store.setPosition(positionSec);

  if (durationSec > 0 && store.duration !== durationSec) {
    store.setDuration(durationSec);
  }

  if (status.didJustFinish) {
    store.setIsPlaying(false);
    store.setPosition(0);
  }
}

export async function loadAndPlay(book: Book): Promise<void> {
  try {
    // Tear down existing sound if any
    await unloadSound();

    await configureAudioSession();

    const store = usePlayerStore.getState();
    store.setCurrentBook(book);
    store.setIsPlaying(false);
    store.setPosition(0);
    store.setDuration(0);

    const { sound } = await Audio.Sound.createAsync(
      { uri: book.audioUrl },
      {
        shouldPlay: true,
        rate: store.playbackRate,
        progressUpdateIntervalMillis: 500,
      },
      onPlaybackStatusUpdate
    );

    soundInstance = sound;
    store.setIsPlaying(true);
  } catch (error) {
    console.error('[AudioService] loadAndPlay error:', error);
    usePlayerStore.getState().setIsPlaying(false);
  }
}

export async function togglePlayPause(): Promise<void> {
  if (!soundInstance) return;

  const store = usePlayerStore.getState();
  try {
    if (store.isPlaying) {
      await soundInstance.pauseAsync();
      store.setIsPlaying(false);
    } else {
      await soundInstance.playAsync();
      store.setIsPlaying(true);
    }
  } catch (error) {
    console.error('[AudioService] togglePlayPause error:', error);
  }
}

export async function seekTo(seconds: number): Promise<void> {
  if (!soundInstance) return;
  try {
    await soundInstance.setPositionAsync(seconds * 1000);
  } catch (error) {
    console.error('[AudioService] seekTo error:', error);
  }
}

export async function seekForward(seconds: number = 30): Promise<void> {
  const position = usePlayerStore.getState().position;
  await seekTo(position + seconds);
}

export async function seekBackward(seconds: number = 15): Promise<void> {
  const position = usePlayerStore.getState().position;
  await seekTo(Math.max(0, position - seconds));
}

export async function setRate(rate: 1 | 1.5 | 2): Promise<void> {
  if (!soundInstance) return;
  try {
    await soundInstance.setRateAsync(rate, true);
    usePlayerStore.getState().setPlaybackRate(rate);
  } catch (error) {
    console.error('[AudioService] setRate error:', error);
  }
}

export async function unloadSound(): Promise<void> {
  if (!soundInstance) return;
  try {
    await soundInstance.stopAsync();
    await soundInstance.unloadAsync();
  } catch {
    // Ignore errors during cleanup
  } finally {
    soundInstance = null;
  }
}

export function getSoundInstance(): Audio.Sound | null {
  return soundInstance;
}
