import { useEffect, useRef } from 'react';

interface SessionExitGuardOptions {
  enabled: boolean;
  message: string;
  onConfirmedExit: () => void;
}

export function useSessionExitGuard({
  enabled,
  message,
  onConfirmedExit,
}: SessionExitGuardOptions): void {
  const enabledRef = useRef(enabled);
  const messageRef = useRef(message);
  const exitRef = useRef(onConfirmedExit);

  useEffect(() => {
    enabledRef.current = enabled;
    messageRef.current = message;
    exitRef.current = onConfirmedExit;
  }, [enabled, message, onConfirmedExit]);

  useEffect(() => {
    if (!enabled) return undefined;

    const marker = `session-exit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const currentUrl = window.location.href;
    window.history.pushState(
      { ...window.history.state, __mathSessionExitGuard: marker },
      '',
      currentUrl,
    );

    const confirmExit = (): boolean => {
      if (!enabledRef.current) return true;
      const confirmed = window.confirm(messageRef.current);
      if (confirmed) {
        exitRef.current();
        enabledRef.current = false;
      }
      return confirmed;
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (!enabledRef.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin === window.location.origin &&
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search &&
        destination.hash === window.location.hash
      )
        return;

      if (!confirmExit()) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!enabledRef.current) return;
      exitRef.current();
      event.preventDefault();
      event.returnValue = '';
    };

    const handlePopState = () => {
      if (!enabledRef.current) return;

      if (confirmExit()) {
        window.history.back();
        return;
      }

      window.history.pushState(
        { ...window.history.state, __mathSessionExitGuard: marker },
        '',
        currentUrl,
      );
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [enabled]);
}
