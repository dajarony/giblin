import { useCallback, useEffect, useRef, useState } from 'react';

export interface ToastState {
  message: string | null;
  speaker?: string;
  avatar?: string;
}

const INITIAL_TOAST: ToastState = {
  message: 'Welcome aboard Aethelgard Tramways! Hold [W] to power the tram 🚂',
  speaker: 'Conductor Guild',
  avatar: '🚡',
};

export function useToast() {
  const [toast, setToast] = useState<ToastState>(INITIAL_TOAST);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, speaker?: string, avatar?: string, duration = 3200) => {
    setToast({ message, speaker, avatar });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToast({ message: null }), duration);
  }, []);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  return { toast, showToast };
}
