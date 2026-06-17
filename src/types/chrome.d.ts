// Minimal global declaration for Chrome extension APIs used in the popup.
// This prevents "Cannot find name 'chrome'" TypeScript errors.
declare global {
  const chrome: any
}

export {}
