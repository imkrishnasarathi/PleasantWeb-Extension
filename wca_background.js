const Tessseract = require('tesseract.js'); 

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url.includes(".jpg") || tab.url.includes(".png") || tab.url.includes(".jpeg") || tab.url.includes(".webp")) {
        // processImage(tab.url);
        imageToText(tab.url)
    }
});

async function processImage(url){
    const apiKey = 'dc87e022d70c4af8bbea457c78cdd84f';
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
        console.log('Clarifai API Response:', info)
        console.log('Outputs:', info.outputs);
        try{
            if (info.outputs && info.outputs.length > 0) {
                const recognitionResults = info.outputs[0].data;
                console.log('Recognition Results:', recognitionResults);
                analyzeContent(`${recognitionResults["concepts"][0].name} ${recognitionResults["concepts"][1].name} ${recognitionResults["concepts"][2].name}`);
          } else {
                console.log('No recognition results found.');
          }
        }
        catch (err) {
          console.error('Error processing the image:', err);
        }
    }
    catch (err) {
        console.log("Error :" + err)
    }
}

async function imageToText(imagePath){
    const worker = new TesseractWorker();
  try {
    const result = await worker.recognize(imagePath);
    return result.data.text;
  } catch (error) {
    console.error('Error performing OCR:', error);
    return null;
  } finally {
    worker.terminate();
  }
}

// Function to process the image and perform OCR
async function imageToTextWithOCR(imagePath) {
  try {
    // Read the image using OpenCV
    const image = await cv.imreadAsync(imagePath);
    if (!image) {
      console.error('Error reading the image.');
      return null;
    }

    // Convert the image to grayscale (Tesseract performs better with grayscale images)
    const grayImage = image.cvtColor(cv.COLOR_BGR2GRAY);

    // Save the grayscale image to a temporary file
    const tempImagePath = 'temp_grayscale_image.png';
    cv.imwrite(tempImagePath, grayImage);

    // Perform OCR using Tesseract on the grayscale image
    const ocrResult = await performOCR(tempImagePath);

    // Delete the temporary grayscale image
    cv.fs.unlink(tempImagePath);

    return ocrResult;
  } catch (error) {
    console.error('Error processing the image:', error);
    return null;
  }
}

async function analyzeContent(content){
    const api = "AIzaSyCHjwjNwyaa-GXk3dU_lCbvta36TDkxImg";

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

  for (const attr in result.attributeScores) {
    const score = result.attributeScores[attr].summaryScore.value;
    if (score > 0.6) {
      console.warn(`Content contains potentially harmful attribute: ${attr}. Score: ${score}`);
    }
  }
}
