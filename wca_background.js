chrome.tabs.onCreated.addListener(function (tab) {
    console.log("New tab opened:", tab.url);
});

const apiKey = 'dc87e022d70c4af8bbea457c78cdd84f';
const imageUrl = 'URL_TO_YOUR_IMAGE';

const endpointUrl = 'https://api.clarifai.com/v2/models/general-v1.3/outputs';

fetch(endpointUrl, {
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
                        url: imageUrl,
                    },
                },
            },
        ],
    }),
})
.then(response => response.json())
.then(data => {
    // Process the response data here
    console.log(data);
})
.catch(error => {
    console.error('Error:', error);
});
