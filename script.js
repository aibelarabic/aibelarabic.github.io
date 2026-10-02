const imageInput = document.getElementById("imageInput");
const analyzeButton = document.getElementById("analyzeButton");
const detectorStatus = document.getElementById("detectorStatus");
const detectorResult = document.getElementById("detectorResult");
const imagePreview = document.getElementById("imagePreview");
const resetDetector = document.getElementById("resetDetector");

const WORKER_URL = "https://ai-image-detector.khelmy627.workers.dev/";


// عرض الصورة عند اختيارها
imageInput.addEventListener("change", () => {

  const file = imageInput.files[0];

  detectorResult.innerHTML = "";
  detectorStatus.textContent = "";
  resetDetector.style.display = "none";

  if (!file) {
    imagePreview.innerHTML = "";
    return;
  }

  if (!file.type.startsWith("image/")) {
    detectorStatus.textContent = "من فضلك اختر ملف صورة.";
    imageInput.value = "";
    imagePreview.innerHTML = "";
    return;
  }

  const imageURL = URL.createObjectURL(file);

  imagePreview.innerHTML = `
    <img src="${imageURL}" alt="الصورة التي تم اختيارها">
  `;
});


// تحليل الصورة
analyzeButton.addEventListener("click", async () => {

  const file = imageInput.files[0];

  if (!file) {
    detectorStatus.textContent = "من فضلك اختر صورة أولًا.";
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
      throw new Error(
        data.error || "حدث خطأ أثناء تحليل الصورة."
      );
    }

    const aiScore = data.type?.ai_generated;

    if (typeof aiScore !== "number") {
      throw new Error("لم يتم العثور على نتيجة تحليل الصورة.");
    }

    const percentage = Math.round(aiScore * 100);

    detectorStatus.textContent = "تم تحليل الصورة بنجاح.";

   let resultText = "";
let resultClass = "";

if (percentage >= 80) {
  resultText =
    "تشير النتيجة إلى احتمال مرتفع أن تكون الصورة مولدة بالذكاء الاصطناعي.";
  resultClass = "high";

} else if (percentage >= 50) {
  resultText =
    "النتيجة غير حاسمة، وقد تحتاج الصورة إلى تحليل إضافي.";
  resultClass = "medium";

} else {
  resultText =
    "تشير النتيجة إلى احتمال منخفض أن تكون الصورة مولدة بالذكاء الاصطناعي.";
  resultClass = "low";
}

detectorResult.innerHTML = `
  <div class="detector-result ${resultClass}">

    <h3>نتيجة التحليل</h3>

    <div class="score-circle" style="--score: ${percentage * 3.6};">
      <div class="score-circle-inner">
        <span>${percentage}%</span>
      </div>
    </div>

    <p>
      احتمال أن تكون الصورة مولدة بالذكاء الاصطناعي
    </p>

    <div class="progress-container">
      <div
        class="progress-bar"
        style="width: ${percentage}%;">
      </div>
    </div>

    <p class="result-description">
      ${resultText}
    </p>

  </div>
`; 

    resetDetector.style.display = "block";

  } catch (error) {

    detectorStatus.textContent = "حدث خطأ أثناء التحليل.";

    detectorResult.innerHTML = `
      <div class="detector-error">
        ${error.message}
      </div>
    `;

  } finally {

    analyzeButton.disabled = false;

  }
});


// إعادة ضبط الأداة
resetDetector.addEventListener("click", () => {

  imageInput.value = "";

  imagePreview.innerHTML = "";

  detectorStatus.textContent = "";

  detectorResult.innerHTML = "";

  resetDetector.style.display = "none";

});
