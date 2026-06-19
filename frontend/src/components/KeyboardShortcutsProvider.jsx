import { useState, useEffect, createContext } from 'react';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';

const KeyboardShortcutsContext = createContext();

const KeyboardShortcutsProvider = ({ children }) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleNewTask = () => {
    // Navigate to tasks page or open new task modal
    window.dispatchEvent(new CustomEvent('keyboard-shortcut', { detail: 'new-task' }));
  };

  const handleToggleSearch = () => {
    window.dispatchEvent(new CustomEvent('keyboard-shortcut', { detail: 'toggle-search' }));
  };

  const handleToggleDarkMode = () => {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  const handleCloseModal = () => {
    window.dispatchEvent(new CustomEvent('keyboard-shortcut', { detail: 'close-modal' }));
  };

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onToggleSearch: handleToggleSearch,
    onToggleDarkMode: handleToggleDarkMode,
    onCloseModal: handleCloseModal,
  });

  // Handle '?' key for help
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      if (e.key === '?') {
        setShowHelp(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <KeyboardShortcutsContext.Provider value={{ showHelp, setShowHelp }}>
      {children}
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </KeyboardShortcutsContext.Provider>
  );
};

export default KeyboardShortcutsProvider;
