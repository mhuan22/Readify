let utterance = new SpeechSynthesisUtterance("");
let textChunks = [];
let currentChunkIndex = 0;
let currentPosition = 0;

function performOCR() {
  const imageInput = document.getElementById("imageInput").files[0];
  const outputDiv = document.getElementById("output");

  if (!imageInput) {
    alert("Please select an image first.");
    return;
  }

  // Create an image URL from the file input for Tesseract
  const imageURL = URL.createObjectURL(imageInput);

  // Clear any previous output
  outputDiv.innerHTML = "Processing...";

  // Perform OCR using Tesseract.js
  Tesseract.recognize(
    imageURL,
    "eng" // Language, 'eng' for English (can be changed to other languages if supported)
  )
    .then(({ data: { text } }) => {
      outputDiv.innerHTML = `<h3>Extracted Text:</h3><p>${text}</p>`;

      // Split the text into chunks for more manageable TTS control
      textChunks = splitTextIntoChunks(text);
      currentChunkIndex = 0;
      currentPosition = 0;
      utterance.text = textChunks[currentChunkIndex];
    })
    .catch((error) => {
      console.error(error);
      outputDiv.innerHTML = "<p>Error processing image.</p>";
    });
}

function splitTextIntoChunks(text) {
  const chunkSize = 200;
  let chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

function speakText() {
  speechSynthesis.cancel();
  utterance = new SpeechSynthesisUtterance(textChunks[currentChunkIndex]);
  speechSynthesis.speak(utterance);

  utterance.onboundary = function (event) {
    currentPosition = event.charIndex;
  };
}

function playAudio() {
  if (speechSynthesis.speaking) {
    return;
  }
  speakText();
}

function pauseAudio() {
  speechSynthesis.pause();
}

function resumeAudio() {
  speechSynthesis.resume();
}

function rewindAudio() {
  if (currentChunkIndex > 0) {
    currentChunkIndex--;
    utterance.text = textChunks[currentChunkIndex];
    speakText();
  }
}

function forwardAudio() {
  if (currentChunkIndex < textChunks.length - 1) {
    currentChunkIndex++;
    utterance.text = textChunks[currentChunkIndex];
    speakText();
  }
}
