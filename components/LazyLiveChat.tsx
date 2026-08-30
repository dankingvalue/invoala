"use client";

import { useEffect, useState } from "react";

export function LazyLiveChat() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let done = false;
    const timer = window.setTimeout(() => {
      if (!done) {
        done = true;
        setShow(true);
        cleanup();
      }
    }, 6000);

    function onInteraction() {
      if (!done) {
        done = true;
        setShow(true);
        cleanup();
      }
    }
    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
    }
    window.addEventListener("scroll", onInteraction, { passive: true });
    window.addEventListener("pointerdown", onInteraction);
    window.addEventListener("keydown", onInteraction);

    return cleanup;
  }, []);

  if (!show) return null;
  return <LiveChatInner />;
}

function LiveChatInner() {
  const [Chat, setChat] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    let mounted = true;
    import("@/components/LiveChat")
      .then((mod) => {
        if (mounted) setChat(() => mod.LiveChat);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!Chat) return null;
  return <Chat />;
}
