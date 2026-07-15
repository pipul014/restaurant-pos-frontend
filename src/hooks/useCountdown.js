import { useEffect, useState } from "react";

const useCountdown = (readyAt) => {
  const [timeLeft, setTimeLeft] = useState("00:00");

  useEffect(() => {
    if (!readyAt) return;

    const interval = setInterval(() => {
      const diff = new Date(readyAt).getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft("00:00");
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);

      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0",
        )}`,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [readyAt]);

  return timeLeft;
};

export default useCountdown;
