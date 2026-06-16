import heroTrack from "../../assets/aboutyou.mp3";
import journeyTrack from "../../assets/dirayakan.mp3";
import letterTrack from "../../assets/bandaneira.mp3";
import encouragementTrack from "../../assets/masaini.mp3";
import wallTrack from "../../assets/kecilmesra.mp3";
import celebrationTrack from "../../assets/kekal.mp3";

export interface TrackMetadata {
  id: string;
  sectionName: string;
  songTitle: string;
  genre: string;
  tempo: string;
  vibe: string;
  color: string;
  src: string;
}

export const TRACKS: Record<string, TrackMetadata> = {
  hero: {
    id: "hero",
    sectionName: "Hero Opening",
    songTitle: "Rosé Romance",
    genre: "Ambient Romantic Pad",
    tempo: "78 BPM",
    vibe: "Warm, Dreamy, Endless Love",
    color: "#F4C2C2",
    src: heroTrack,
  },
  journey: {
    id: "journey",
    sectionName: "Your Beautiful Journey",
    songTitle: "Nostalgic Steps",
    genre: "Neo-Classical Piano",
    tempo: "85 BPM",
    vibe: "Reflective, Soft chimes, Sweet memories",
    color: "#E5B181",
    src: journeyTrack,
  },
  letter: {
    id: "letter",
    sectionName: "My Dearest Letter",
    songTitle: "Devotion Harp",
    genre: "Cascading Strings",
    tempo: "72 BPM",
    vibe: "Intimate, Sweetly plucking, True Devotion",
    color: "#7b5455",
    src: letterTrack,
  },
  encouragement: {
    id: "encouragement",
    sectionName: "You've Got This!",
    songTitle: "Grit & Golden Sunshine",
    genre: "Hopeful Uplifting Beats",
    tempo: "105 BPM",
    vibe: "Optimistic, Strong, Unstoppable energy",
    color: "#fdc795",
    src: encouragementTrack,
  },
  wall: {
    id: "wall",
    sectionName: "Congratulations Wall",
    songTitle: "Shimmering Wall of Wish",
    genre: "Sparkling Chimes & Crystals",
    tempo: "90 BPM",
    vibe: "Playful, Joyous, Sparkling wishes",
    color: "#7e562e",
    src: wallTrack,
  },
  celebration: {
    id: "celebration",
    sectionName: "The World is Yours",
    songTitle: "Victory Fanfare",
    genre: "Epic Celebratory Brass",
    tempo: "120 BPM",
    vibe: "Triumphant, Proud, Cinematic ending",
    color: "#ffc200",
    src: celebrationTrack,
  }
};

class AudioEngine {
  private currentTrackId: string = "hero";
  private currentAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.45;

  public onTrackChange: (trackId: string) => void = () => {};

  private createAudio(trackId: string) {
    const track = TRACKS[trackId];
    if (!track) return null;

    const audio = new Audio(track.src);
    audio.loop = true;
    audio.volume = this.volume;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";

    return audio;
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.currentAudio) {
      if (mute) {
        this.currentAudio.pause();
      } else {
        this.currentAudio.play().catch((err) => {
          console.warn("Audio play was prevented by browser autoplay policy", err);
        });
      }
    } else if (!mute) {
      this.startTrack(this.currentTrackId);
    }
  }

  syncMute(mute: boolean) {
    this.isMuted = mute;
    if (this.currentAudio) {
      this.currentAudio.muted = mute;
      if (mute) {
        this.currentAudio.pause();
      }
    }
  }

  getIsMuted() {
    return this.isMuted;
  }

  getCurrentTrackId() {
    return this.currentTrackId;
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume;
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  startTrack(trackId: string) {
    this.currentTrackId = trackId;
    this.onTrackChange(trackId);

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (this.isMuted) {
      console.log("[AudioEngine] Skipping autoplay - muted");
      return;
    }

    const nextAudio = this.createAudio(trackId);
    if (nextAudio) {
      this.currentAudio = nextAudio;
      console.log("[AudioEngine] Playing track:", trackId, "from", nextAudio.src);
      nextAudio.play().catch((err) => {
        console.error("[AudioEngine] Play failed:", err.message);
      });
    }
  }
}

const audioEngine = new AudioEngine();
export default audioEngine;
