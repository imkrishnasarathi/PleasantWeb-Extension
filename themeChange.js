function setTheme() {
  const root = document.documentElement;
  const newTheme = root.className === 'dark' ? 'light' : 'dark';
  root.className = newTheme;
  chrome.runtime.sendMessage({ target: "setTheme", theme: newTheme })
  }
  
  document.querySelector('.theme-toggle').addEventListener('click', setTheme)