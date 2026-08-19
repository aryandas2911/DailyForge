import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = ({ onNewTask, onToggleSearch, onToggleDarkMode, onCloseModal }) => {
  const handleKeyDown = useCallback((e) => {
    // Ignore if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    // Ctrl/Cmd + N: New task
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      onNewTask?.();
    }

    // Ctrl/Cmd + K: Toggle search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      onToggleSearch?.();
    }

    // Ctrl/Cmd + D: Toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      onToggleDarkMode?.();
    }

    // Escape: Close modal
    if (e.key === 'Escape') {
      onCloseModal?.();
    }
  }, [onNewTask, onToggleSearch, onToggleDarkMode, onCloseModal]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
