// window.onload = () => {
//     const url = document.URL;
//     if ([".jpg", ".png", ".jpeg", ".webp"].filter(ext=> url.includes(ext)).length){
//         processImage(url).then((data) => {
//             // console.log(data);
//             let dataToStore = {
//                 date: new Date().toUTCString(),
//                 score: data.averageScore,
//                 status: data.isContentInappropriate? "Inappropriate" : "Not Inappropriate",
//                 url
//             };
//             chrome.runtime.sendMessage({ target: "setStorageData", data: dataToStore });
//         });
//     }
//     else{
//       const content = document.body.innerText;
//       analyzeContent(content).then((data) => {
//         // console.log(data.isContentInappropriate, data.averageScore);
//         // console.log(data);
//         let dataToStore = {
//             date: new Date().toUTCString(),
//             score: data.averageScore,
//             status: data.isContentInappropriate? "Inappropriate" : "Not Inappropriate",
//             url
//         };
//         chrome.runtime.sendMessage({ target: "setStorageData", data: dataToStore });
//       })
//       .catch((err) => {
//         console.error(err);
//       });   
//     }
// };

window.onload = () => {
  analyzeAndStoreData();
}

function setStorageData(data) {
  chrome.runtime.sendMessage({ target: "setStorageData", data: data });
}

async function analyzeAndStoreData() {
  const url = document.URL;
  let dataToStore = {};
  if ([".jpg", ".png", ".jpeg", ".webp"].some(ext => url.includes(ext))) {
    const data = await processImage(url);
    dataToStore = {
      date: new Date().toLocaleString("en-Us", {timeZone: 'Asia/Kolkata'}),
      score: data.averageScore,
      status: data.isContentInappropriate ? "Inappropriate" : "Not Inappropriate",
      url
    };
  } else {
    const content = document.body.innerText;
    const data = await analyzeContent(content);
    dataToStore = {
      date: new Date().toLocaleString("en-Us", {timeZone: 'Asia/Kolkata'}),
      score: data.averageScore,
      status: data.isContentInappropriate ? "Inappropriate" : "Not Inappropriate",
      url
    };
  }
  setStorageData(dataToStore);
}

async function analyzeContent(content){
    const api = "Perspective_AI_API_KEY";

    const response = await fetch(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${api}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: { text:content },
      languages: ['en'], 
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        IDENTITY_ATTACK: {},
        SEXUALLY_EXPLICIT: {},
        THREAT: {},
        PROFANITY: {},
        FLIRTATION: {},
      },
    }),
  });

  const result = await response.json();
  const allScores = [];
  let isContentInappropriate = false;

  for (const attr in result.attributeScores) {
    const score = result.attributeScores[attr].summaryScore.value;
    if (score > 0.45) {
    // console.warn(`Content contains potentially harmful attribute: ${attr}. Score: ${score}`);
      isContentInappropriate = true;
    }
    allScores.push(score);
  }
  let averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
  return { averageScore, isContentInappropriate };
}

async function processImage(url){
    const apiKey = 'CLARIFAI_API_KEY';
    try{
        const result  = await fetch('https://api.clarifai.com/v2/models/aaa03c23b3724a16a56b629203edc62c/outputs', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: [
                    {
                        data: {
                            image: {
                                url: url,
                            },
                        },
                    },
                ],
            }),
        });
        const info = await result.json();
        // console.log('Clarifai API Response:', info)
        try{
            let analyzedContent = {};
            if (info.outputs && info.outputs.length > 0) {
                const recognitionResults = info.outputs[0].data;
                console.log('Recognition Results:', recognitionResults);
                
                analyzedContent = await analyzeContent(`${recognitionResults["concepts"][0].name} ${recognitionResults["concepts"][1].name} ${recognitionResults["concepts"][2].name}`);
                
          } else {
                console.log('No recognition results found.');
          }
          return analyzedContent;
        }
        catch (err) {
          console.error(err);
          return false;
        }
    }
    catch (err) {
        console.error(err)
        return false;
    }
}
