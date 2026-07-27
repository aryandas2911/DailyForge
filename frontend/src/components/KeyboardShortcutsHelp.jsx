const shortcuts = [
  { keys: ['Ctrl', 'N'], description: 'New task' },
  { keys: ['Ctrl', 'K'], description: 'Toggle search' },
  { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
  { keys: ['Esc'], description: 'Close modal' },
];

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" role="presentation">
      <div
        className="surface-bg rounded-lg p-6 max-w-md w-full mx-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold text-main">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            aria-label="Close keyboard shortcuts help"
            className="text-muted hover:text-main transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-muted">{shortcut.description}</span>
              <div className="flex gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono text-main border border-soft"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-muted">
          Press <kbd className="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded border border-soft font-mono text-main">?</kbd> to open this help
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
