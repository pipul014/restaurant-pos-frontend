import { useCallback, useEffect, useRef, useState } from "react";

const SOUND_BASE = "/sounds/";

const stopAudio = (audio) => {
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
  audio.src = "";
};

const useNotificationSound = () => {
  const repeatAudioRef = useRef(null);
  const oneTimeAudioRef = useRef(null);
  const [soundUnlocked, setSoundUnlocked] = useState(false);

  const unlockSound = useCallback(async () => {
    try {
      const audio = new Audio(`${SOUND_BASE}new-order.mp3`);

      audio.volume = 0;
      await audio.play();

      audio.pause();
      audio.currentTime = 0;
      audio.src = "";

      setSoundUnlocked(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const playRepeatSound = useCallback((fileName = "new-order.mp3") => {
    try {
      if (repeatAudioRef.current) {
        stopAudio(repeatAudioRef.current);
        repeatAudioRef.current = null;
      }

      const audio = new Audio(`${SOUND_BASE}${fileName}`);
      audio.loop = true;
      audio.volume = 1;

      repeatAudioRef.current = audio;

      audio.play().catch(() => {
        console.log("Sound blocked. Click Enable Sound first.");
      });
    } catch (error) {
      console.log("Repeat sound error:", error.message);
    }
  }, []);

  const playOneTimeAlert = useCallback((fileName = "cancel-order.mp3") => {
    try {
      if (oneTimeAudioRef.current) {
        stopAudio(oneTimeAudioRef.current);
        oneTimeAudioRef.current = null;
      }

      const audio = new Audio(`${SOUND_BASE}${fileName}`);
      audio.loop = false;
      audio.volume = 1;

      oneTimeAudioRef.current = audio;

      const clearOneTimeAudio = () => {
        if (oneTimeAudioRef.current === audio) {
          stopAudio(audio);
          oneTimeAudioRef.current = null;
        }

        audio.removeEventListener("ended", clearOneTimeAudio);
        audio.removeEventListener("error", clearOneTimeAudio);
      };

      audio.addEventListener("ended", clearOneTimeAudio);
      audio.addEventListener("error", clearOneTimeAudio);

      audio.play().catch(() => {
        clearOneTimeAudio();
        console.log("Alert sound blocked. Click Enable Sound first.");
      });
    } catch (error) {
      console.log("Alert sound error:", error.message);
    }
  }, []);

  const stopSound = useCallback(() => {
    if (repeatAudioRef.current) {
      stopAudio(repeatAudioRef.current);
      repeatAudioRef.current = null;
    }

    if (oneTimeAudioRef.current) {
      stopAudio(oneTimeAudioRef.current);
      oneTimeAudioRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (repeatAudioRef.current) {
        stopAudio(repeatAudioRef.current);
        repeatAudioRef.current = null;
      }

      if (oneTimeAudioRef.current) {
        stopAudio(oneTimeAudioRef.current);
        oneTimeAudioRef.current = null;
      }
    };
  }, []);

  return {
    soundUnlocked,
    unlockSound,
    playRepeatSound,
    playOneTimeAlert,
    stopSound,
  };
};

export default useNotificationSound;
