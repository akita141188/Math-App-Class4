import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SessionExitGuardOptions {
  enabled: boolean;
  message: string;
  onConfirmedExit: () => void;
}

export interface SessionExitGuardController {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-app navigation uses a React modal.
 *
 * Browser refresh/tab close is the one exception: browsers do not allow a custom DOM
 * dialog during beforeunload, so the browser-native leave-page prompt is still used there.
 */
export function useSessionExitGuard({
  enabled,
  message,
  onConfirmedExit,
}: SessionExitGuardOptions): SessionExitGuardController {
  const navigate = useNavigate();
  const enabledRef = useRef(enabled);
  const messageRef = useRef(message);
  const exitRef = useRef(onConfirmedExit);
  const navigateRef = useRef(navigate);
  const pendingActionRef = useRef<null | (() => void)>(null);
  const dialogOpenRef = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    enabledRef.current = enabled;
    messageRef.current = message;
    exitRef.current = onConfirmedExit;
    navigateRef.current = navigate;
  }, [enabled, message, navigate, onConfirmedExit]);

  const closeDialog = useCallback(() => {
    pendingActionRef.current = null;
    dialogOpenRef.current = false;
    setOpen(false);
  }, []);

  const requestExit = useCallback((action: () => void) => {
    if (!enabledRef.current) {
      action();
      return;
    }

    if (dialogOpenRef.current) return;

    pendingActionRef.current = action;
    dialogOpenRef.current = true;
    setOpen(true);
  }, []);

  const confirmExit = useCallback(() => {
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    dialogOpenRef.current = false;
    setOpen(false);

    if (enabledRef.current) {
      exitRef.current();
      enabledRef.current = false;
    }

    if (action) window.setTimeout(action, 0);
  }, []);

  useEffect(() => {
    if (!enabled) {
      closeDialog();
      return undefined;
    }

    const marker = `session-exit-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const currentUrl = window.location.href;

    window.history.pushState(
      { ...window.history.state, __mathSessionExitGuard: marker },
      '',
      currentUrl,
    );

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

      event.preventDefault();
      event.stopPropagation();

      requestExit(() => {
        if (destination.origin === window.location.origin) {
          void navigateRef.current(
            `${destination.pathname}${destination.search}${destination.hash}`,
          );
        } else {
          window.location.assign(destination.href);
        }
      });
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!enabledRef.current) return;

      exitRef.current();
      event.preventDefault();
      event.returnValue = '';
    };

    const handlePopState = () => {
      if (!enabledRef.current) return;

      window.history.pushState(
        { ...window.history.state, __mathSessionExitGuard: marker },
        '',
        currentUrl,
      );

      requestExit(() => window.history.back());
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [closeDialog, enabled, requestExit]);

  return {
    open,
    message: messageRef.current,
    onConfirm: confirmExit,
    onCancel: closeDialog,
  };
}
