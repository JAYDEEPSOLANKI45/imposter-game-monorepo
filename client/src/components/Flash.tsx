import { useEffect, useRef, useState } from "react";

const Flash = ({
  message,
  type,
  duration = 3000,
  onClose,
}: {
  message: string;
  type: string;
  duration?: number;
  onClose: () => void; // concrete callback type
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (!message) return null;
  useEffect(() => {
    setIsVisible(true);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      onClose();
      timerRef.current = null;
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [message, onClose]);
  return (
    <div className={`flash-message ${type}`} hidden={!isVisible}>
      {message}
    </div>
  );
};

export default Flash;
