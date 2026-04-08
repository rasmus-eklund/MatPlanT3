"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Spinner } from "~/components/ui/spinner";

const HIDDEN_REFRESH_THRESHOLD_MS = 15000;
const recipeFormPathRegex = /^\/recipes\/(?:new\/empty|[^/]+\/edit)$/;

const AppStatus = () => {
  const router = useRouter();
  const pathname = usePathname();
  const hiddenAtRef = useRef<number | null>(null);
  const reconnectingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [isOffline, setIsOffline] = useState(
    typeof window !== "undefined" ? !window.navigator.onLine : false,
  );
  const [isReconnecting, setIsReconnecting] = useState(false);
  const shouldAutoRefresh = !recipeFormPathRegex.test(pathname);

  useEffect(() => {
    const refresh = () => {
      if (!shouldAutoRefresh) return;
      startTransition(() => {
        router.refresh();
      });
    };

    const refreshIfNeeded = () => {
      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;
      if (!hiddenAt) return;
      if (Date.now() - hiddenAt < HIDDEN_REFRESH_THRESHOLD_MS) return;
      refresh();
    };

    const clearReconnecting = () => {
      if (reconnectingTimeoutRef.current) {
        clearTimeout(reconnectingTimeoutRef.current);
        reconnectingTimeoutRef.current = null;
      }
    };

    const showReconnecting = () => {
      clearReconnecting();
      setIsReconnecting(true);
      reconnectingTimeoutRef.current = setTimeout(() => {
        setIsReconnecting(false);
        reconnectingTimeoutRef.current = null;
      }, 4000);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }
      if (document.visibilityState === "visible") refreshIfNeeded();
    };

    const handleOnline = () => {
      setIsOffline(false);
      showReconnecting();
      refresh();
    };

    const handleOffline = () => {
      clearReconnecting();
      setIsReconnecting(false);
      setIsOffline(true);
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) refresh();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", refreshIfNeeded);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      clearReconnecting();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", refreshIfNeeded);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router, shouldAutoRefresh]);

  const status = isOffline
    ? "offline"
    : isPending
      ? "loading"
      : isReconnecting
        ? "reconnecting"
        : null;

  if (!status) return null;

  const message =
    status === "offline"
      ? "Du är offline"
      : status === "reconnecting"
        ? "Återansluter..."
        : "Uppdaterar sidan...";

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="absolute inset-x-0 top-1/3 flex justify-center px-4">
        <div className="text-c2 flex items-center gap-2 rounded-full py-2 px-4 text-sm ring-1 bg-c5">
          {status !== "offline" ? <Spinner className="size-4" /> : null}
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};

export default AppStatus;
