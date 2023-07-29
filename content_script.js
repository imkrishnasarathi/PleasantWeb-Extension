function extractAllText() {
    const allTextElements = document.querySelectorAll("body *"); 
    let allTextContent = "";
  
    for (const element of allTextElements) {
      if (element instanceof HTMLElement) {
        allTextContent += element.textContent.trim() + " ";
      }
    }
    chrome.runtime.sendMessage({ text: allTextContent.trim() });
  }

  extractAllText();
  