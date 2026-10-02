const imageInput = document.getElementById("imageInput");
const analyzeButton = document.getElementById("analyzeButton");
const detectorStatus = document.getElementById("detectorStatus");
const detectorResult = document.getElementById("detectorResult");

const WORKER_URL = "https://ai-image-detector.khelmy627.workers.dev/";

analyzeButton.addEventListener("click", async () => {

const file = imageInput.files[0];

if (!file) {
detectorStatus.textContent = "من فضلك اختر صورة أولًا.";
detectorResult.innerHTML = "";
return;
}

detectorStatus.textContent = "جاري تحليل الصورة...";
detectorResult.innerHTML = "";

analyzeButton.disabled = true;

try {

const formData = new FormData();

formData.append("media", file);

const response = await fetch(WORKER_URL, {
  method: "POST",
  body: formData
});

const data = await response.json();

if (!response.ok) {
  throw new Error(data.error || "حدث خطأ أثناء تحليل الصورة.");
}

detectorStatus.textContent = "تم تحليل الصورة.";

if (data.type && data.type === "genai") {

  const aiProbability =
    typeof data.ai_score === "number"
      ? data.ai_score
      : null;

  if (aiProbability !== null) {

    const percentage = Math.round(aiProbability * 100);

    detectorResult.innerHTML = `
      <div>
        <h3>نتيجة التحليل</h3>
        <p>
          احتمالية أن تكون الصورة مولدة بالذكاء الاصطناعي:
          <strong>${percentage}%</strong>
        </p>
      </div>
    `;

  } else {

    detectorResult.innerHTML = `
      <div>
        <h3>نتيجة التحليل</h3>
        <p>تم تحليل الصورة، ولكن لم يتم العثور على نسبة واضحة.</p>
      </div>
    `;

  }

} else {

  detectorResult.innerHTML = `
    <div>
      <h3>نتيجة التحليل</h3>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </div>
  `;

}

} catch (error) {

detectorStatus.textContent = "حدث خطأ.";

detectorResult.innerHTML = `
  <p>
    ${error.message}
  </p>
`;

} finally {

analyzeButton.disabled = false;

}

});
