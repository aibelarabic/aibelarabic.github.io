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

if (!response.ok || data.status !== "success") {
  throw new Error(data.error || "حدث خطأ أثناء تحليل الصورة.");
}

const aiScore = data.type?.ai_generated;

if (typeof aiScore !== "number") {
  throw new Error("لم يتم العثور على نتيجة تحليل الصورة.");
}

const percentage = Math.round(aiScore * 100);

detectorStatus.textContent = "تم تحليل الصورة بنجاح.";

if (percentage >= 80) {
  detectorResult.innerHTML = `
    <div>
      <h3>النتيجة</h3>
      <p>احتمال أن تكون الصورة مولدة بالذكاء الاصطناعي:</p>
      <strong>${percentage}%</strong>
      <p>تشير النتيجة إلى احتمال مرتفع أن تكون الصورة مولدة بالذكاء الاصطناعي.</p>
    </div>
  `;
} else if (percentage >= 50) {
  detectorResult.innerHTML = `
    <div>
      <h3>النتيجة</h3>
      <p>احتمال أن تكون الصورة مولدة بالذكاء الاصطناعي:</p>
      <strong>${percentage}%</strong>
      <p>النتيجة غير حاسمة، وقد تحتاج الصورة إلى تحليل إضافي.</p>
    </div>
  `;
} else {
  detectorResult.innerHTML = `
    <div>
      <h3>النتيجة</h3>
      <p>احتمال أن تكون الصورة مولدة بالذكاء الاصطناعي:</p>
      <strong>${percentage}%</strong>
      <p>تشير النتيجة إلى احتمال منخفض أن تكون الصورة مولدة بالذكاء الاصطناعي.</p>
    </div>
  `;
}

} catch (error) {
detectorStatus.textContent = "حدث خطأ أثناء التحليل.";

detectorResult.innerHTML = `
  <p>${error.message}</p>
`;

} finally {analyzeButton.disabled = false;}});
