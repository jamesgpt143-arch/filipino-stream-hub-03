// Disable developer tools and inspect element
export const disableDevTools = () => {
  // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
      e.preventDefault();
      return false;
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault();
      return false;
    }
    // Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
      e.preventDefault();
      return false;
    }
  });

  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable text selection
  document.addEventListener('selectstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable drag
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Detect DevTools
  let devtools = {
    open: false,
    orientation: null
  };

  const threshold = 160;

  const detectDevTools = () => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true;
        // Redirect to blank page or show warning
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial;color:#666;"><h2>Developer tools are not allowed!</h2></div>';
      }
    } else {
      devtools.open = false;
    }
  };

  // Check every 500ms
  setInterval(detectDevTools, 500);

  // Disable console methods
  if (typeof console !== 'undefined') {
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.error = () => {};
    console.clear = () => {};
    console.dir = () => {};
    console.dirxml = () => {};
    console.table = () => {};
    console.trace = () => {};
    console.group = () => {};
    console.groupCollapsed = () => {};
    console.groupEnd = () => {};
    console.time = () => {};
    console.timeEnd = () => {};
    console.timeStamp = () => {};
    console.profile = () => {};
    console.profileEnd = () => {};
    console.count = () => {};
    console.assert = () => {};
  }
};