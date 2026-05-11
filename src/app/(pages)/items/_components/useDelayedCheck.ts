import { useEffect, useRef, useState } from "react";
import { debounceDuration } from "./utils";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const useDelayedCheck = ({ checked, onChange }: Props) => {
  const [pendingChecked, setPendingChecked] = useState<boolean | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCheckedRef = useRef<boolean | null>(null);
  const onChangeRef = useRef(onChange);
  const visualChecked = pendingChecked ?? checked;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const flushPending = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    const nextChecked = pendingCheckedRef.current;
    if (nextChecked === null) return;
    pendingCheckedRef.current = null;
    onChangeRef.current(nextChecked);
  };

  const onDelayedCheck = () => {
    const nextChecked = !visualChecked;
    setPendingChecked(nextChecked);
    pendingCheckedRef.current = nextChecked;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      onChangeRef.current(nextChecked);
      pendingCheckedRef.current = null;
      setPendingChecked(null);
      timeout.current = null;
    }, debounceDuration);
  };

  useEffect(() => {
    return flushPending;
  }, []);

  return { checked: visualChecked, onChange: onDelayedCheck };
};
