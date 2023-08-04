document.addEventListener("DOMContentLoaded", function() {
    chrome.runtime.sendMessage({ target: "getStorageData" }, response => {
      console.log('Script.js: ', response);
      if (response.length > 0) {
        let strHtml = "";
        response.forEach(data => {
          strHtml += `<tr><td>${data.date}</td><td>${data.score}</td><td>${data.status==="Inappropriate"?"⚠️":"✅"}</td><td>${data.url}</td></tr>`;
        });
        document.getElementById("storeDataBody").innerHTML = strHtml;
      }
    });
  });
  