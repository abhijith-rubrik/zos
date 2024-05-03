import openai from "https://cdn.jsdelivr.net/npm/openai@4.40.2/+esm";

let apiKey = "";
let transcript = "";
let ai = null;

function getTranscriptSummaryAndActionItems(rawTranscript) {
  return new Promise(async (resolve, reject) => {
    try {
      let cTranscript = await cleanTranscript(rawTranscript);
      let summary = await abstractSummaryExtraction(cTranscript);
      let actionItems = await actionItemExtraction(cTranscript);

      resolve({ summary, actionItems });
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

function abstractSummaryExtraction(transcription) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await ai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are a highly skilled AI trained in language comprehension and summarization. I would like you to read the following text and summarize it into a concise abstract paragraph. Aim to retain the most important points, providing a coherent and readable summary that could help a person understand the main points of the discussion without needing to read the entire text. Please avoid unnecessary details or tangential points.",
          },
          {
            role: "user",
            content: transcription,
          },
        ],
      });

      resolve(response["choices"][0]["message"]["content"]);
    } catch (error) {
      reject(error);
    }
  });
}

function actionItemExtraction(transcription) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await ai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are an AI expert in analyzing conversations and extracting action items. Please review the text and identify any tasks, assignments, or actions that were agreed upon or mentioned as needing to be done. These could be tasks assigned to specific individuals, or general actions that the group has decided to take. Please list these action items clearly and concisely.",
          },
          {
            role: "user",
            content: transcription,
          },
        ],
      });

      resolve(response["choices"][0]["message"]["content"]);
    } catch (error) {
      reject(error);
    }
  });
}

function cleanTranscript(transcript) {
  return new Promise(async (resolve, reject) => {
    try {
      let lines = "";
      let splitLines = transcript.split("\n");

      for (var i = 0; i < splitLines.length; i++) {
        let line = splitLines[i];
        if (
          line !== "WEBVTT" &&
          line !== "" &&
          !line.match(/^\d+$/) &&
          !line.match(/^[0-9:.]{12} --> [0-9:.]{12}/)
        ) {
          lines += line + "\n";
        }
      }

      resolve(lines);
    } catch (error) {
      reject(error);
    }
  });
}

function reset() {
  document.querySelector("#accordion-summary-content").innerHTML = "";
  document.querySelector("#accordion-ai-content").innerHTML = "";
  document.querySelector(".accordion").classList.add("d-none");
}

async function main() {
  document.querySelector("input#apiKey").addEventListener("change", (e) => {
    if (e.target.value === "") return;
    apiKey = e.target.value;
  });

  document
    .querySelector("textarea#transcript")
    .addEventListener("change", (e) => {
      if (e.target.value === "") return;
      transcript = e.target.value;
    });

  document
    .querySelector("button#generateSummary")
    .addEventListener("click", async () => {
      reset();

      if (apiKey === "" || transcript === "") {
        alert("Please enter your API key and transcript");
        return;
      }

      document.querySelector("#spinner-container").classList.remove("d-none");
      document.querySelector("button#generateSummary").disabled = true;

      ai = new openai({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      let output = await getTranscriptSummaryAndActionItems(transcript);

      document.querySelector("#accordion-summary-content").innerHTML =
        output.summary;
      document.querySelector("#accordion-ai-content").innerHTML =
        output.actionItems;

      document.querySelector("#spinner-container").classList.add("d-none");
      document.querySelector(".accordion").classList.remove("d-none");
      document.querySelector("button#generateSummary").disabled = false;
    });
}

main();
