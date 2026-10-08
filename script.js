// =========================
// AI IMAGE DETECTOR
// =========================

const imageInput = document.getElementById("imageInput");
const browseButton = document.getElementById("browseButton");
const dropZone = document.getElementById("dropZone");

const analyzeButton = document.getElementById("analyzeButton");
const detectorStatus = document.getElementById("detectorStatus");
const detectorResult = document.getElementById("detectorResult");

const imagePreview = document.getElementById("imagePreview");
const resetDetector = document.getElementById("resetDetector");

const WORKER_URL =
  "https://ai-image-detector.khelmy627.workers.dev/";


// =========================
// Run Detector Only If It Exists
// =========================

if (
  imageInput &&
  browseButton &&
  dropZone &&
  analyzeButton &&
  detectorStatus &&
  detectorResult &&
  imagePreview &&
  resetDetector
) {

  // Browse Button
  browseButton.addEventListener("click", (event) => {
    event.stopPropagation();
    imageInput.click();
  });


  // Click Drop Zone
  dropZone.addEventListener("click", () => {
    imageInput.click();
  });


  // File Selected
  imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (file) {
      handleFile(file);
    }

  });


  // Drag Over
  dropZone.addEventListener("dragover", (event) => {

    event.preventDefault();

    dropZone.classList.add("dragover");

  });


  // Drag Leave
  dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragover");

  });


  // Drop
  dropZone.addEventListener("drop", (event) => {

    event.preventDefault();

    dropZone.classList.remove("dragover");

    const file = event.dataTransfer.files[0];

    if (file) {
      handleFile(file);
    }

  });


  // Handle Image
  function handleFile(file) {

    if (!file.type.startsWith("image/")) {

      detectorStatus.textContent =
        "من فضلك اختر ملف صورة.";

      return;
    }


    const dataTransfer = new DataTransfer();

    dataTransfer.items.add(file);

    imageInput.files = dataTransfer.files;


    const imageURL = URL.createObjectURL(file);

    imagePreview.innerHTML = `
      <img
        src="${imageURL}"
        alt="الصورة التي تم اختيارها"
      >
    `;


    detectorStatus.textContent = "";

    detectorResult.innerHTML = "";

    resetDetector.style.display = "none";

  }


  // Analyze Image
  analyzeButton.addEventListener("click", async () => {

    const file = imageInput.files[0];


    if (!file) {

      detectorStatus.textContent =
        "من فضلك اختر صورة أولًا.";

      return;
    }


    detectorStatus.textContent =
      "جاري تحليل الصورة...";

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
          data.error ||
          "حدث خطأ أثناء تحليل الصورة."
        );

      }


      const aiScore =
        data.type?.ai_generated;


      if (typeof aiScore !== "number") {

        throw new Error(
          "لم يتم العثور على نتيجة تحليل الصورة."
        );

      }


      const percentage =
        Math.round(aiScore * 100);


      detectorStatus.textContent =
        "تم تحليل الصورة بنجاح.";


      let resultText = "";

      let resultClass = "";


      if (percentage >= 80) {

        resultText =
          "تشير النتيجة إلى احتمال مرتفع أن تكون الصورة مولدة بالذكاء الاصطناعي.";

        resultClass = "high";

      }

      else if (percentage >= 50) {

        resultText =
          "النتيجة غير حاسمة، وقد تحتاج الصورة إلى تحليل إضافي.";

        resultClass = "medium";

      }

      else {

        resultText =
          "تشير النتيجة إلى احتمال منخفض أن تكون الصورة مولدة بالذكاء الاصطناعي.";

        resultClass = "low";

      }


      detectorResult.innerHTML = `

        <div class="detector-result ${resultClass}">

          <h3>نتيجة التحليل</h3>

          <div
            class="score-circle"
            style="--score: ${percentage * 3.6}deg;"
          >

            <div class="score-circle-inner">

              <span>
                ${percentage}%
              </span>

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


    }

    catch (error) {

      detectorStatus.textContent =
        "حدث خطأ أثناء التحليل.";


      detectorResult.innerHTML = `

        <div class="detector-error">
          ${error.message}
        </div>

      `;

    }


    finally {

      analyzeButton.disabled = false;

    }

  });


  // Reset
  resetDetector.addEventListener("click", () => {

    imageInput.value = "";

    imagePreview.innerHTML = "";

    detectorStatus.textContent = "";

    detectorResult.innerHTML = "";

    resetDetector.style.display = "none";

  });

}


// =========================
// DARK MODE
// =========================

const darkModeToggle =
  document.getElementById("darkModeToggle");


if (darkModeToggle) {

  // Restore saved mode
  if (localStorage.getItem("darkMode") === "enabled") {

    document.body.classList.add("dark-mode");

    darkModeToggle.textContent =
      "☀️ الوضع الفاتح";

  }


  // Toggle mode
  darkModeToggle.addEventListener("click", () => {

    document.body.classList.toggle("dark-mode");


    if (document.body.classList.contains("dark-mode")) {

      localStorage.setItem(
        "darkMode",
        "enabled"
      );

      darkModeToggle.textContent =
        "☀️ الوضع الفاتح";

    }

    else {

      localStorage.setItem(
        "darkMode",
        "disabled"
      );

      darkModeToggle.textContent =
        "🌙 الوضع الداكن";

    }

  });

      }


document.addEventListener("DOMContentLoaded", function () {

  const searchInput = document.getElementById("siteSearch");
  const searchResults = document.getElementById("searchResults");

  if (!searchInput || !searchResults) return;

  const articles = [

    {
      title: "ما أفضل أداة ذكاء اصطناعي لكتابة المحتوى؟ مقارنة شاملة",
      description:
        "مقارنة بين ChatGPT وClaude وGemini وWriteSonic وJasper وRytr وأفضل استخدامات كل أداة.",
      url: "ai-writing-tools.html",
      keywords:
        "كتابة المحتوى أدوات الكتابة ذكاء اصطناعي محتوى مقالات شات جي بي تي كلود جيميني جيسبر رايتر وايت سونيك"
    },

    {
      title: "ما هو Jasper؟ دليلك لاستخدام أداة الذكاء الاصطناعي للتسويق وكتابة المحتوى",
      description:
        "تعرف على Jasper واستخداماته في التسويق وكتابة المحتوى وBrand Voice وMarketing Agents.",
      url: "jasper.html",
      keywords:
        "jasper جاسبر كتابة المحتوى التسويق التسويق بالذكاء الاصطناعي brand voice marketing"
    },

    {
      title: "ما هو Rytr؟ دليلك لاستخدام أداة الذكاء الاصطناعي لكتابة المحتوى",
      description:
        "تعرف على Rytr وكتابة المحتوى وإعادة صياغة النصوص وتحسينها.",
      url: "rytr.html",
      keywords:
        "rytr رايتر كتابة المحتوى كتابة مقالات إعادة صياغة نصوص"
    },

    {
      title: "ما هو WriteSonic؟ دليل شامل لصناعة المحتوى بالذكاء الاصطناعي",
      description:
        "تعرف على WriteSonic وكتابة المقالات وصناعة المحتوى وتحسين SEO.",
      url: "writesonic.html",
      keywords:
        "writesonic وايت سونيك كتابة المحتوى المقالات seo سيو صناعة المحتوى"
    },

    {
      title: "كيفية كتابة Prompt احترافي؟ دليل عملي",
      description:
        "تعلم كيفية كتابة Prompts واضحة واحترافية للحصول على نتائج أفضل من الذكاء الاصطناعي.",
      url: "prompt-guide.html",
      keywords:
        "prompt برومبت برومت prompts كتابة الطلبات أوامر الذكاء الاصطناعي"
    },

    {
      title: "ما هو Google Gemini؟ دليلك الكامل لفهم جيميني",
      description:
        "تعرف على Google Gemini ومميزاته واستخداماته والفرق بينه وبين ChatGPT وClaude.",
      url: "Gemini.html",
      keywords:
        "gemini جيميني جوجل جيميني google gemini جيميني ai ذكاء اصطناعي"
    },

    {
      title: "هل الذكاء الاصطناعي خطير؟ أهم المخاطر التي يجب أن تعرفها",
      description:
        "تعرف على مخاطر الذكاء الاصطناعي مثل الخصوصية والتحيز والمعلومات الخاطئة وتأثيره على الوظائف.",
      url: "ai-danger.html",
      keywords:
        "خطر الذكاء الاصطناعي مخاطر ai الخصوصية التحيز المعلومات الخاطئة الوظائف"
    },

    {
      title: "Claude AI vs ChatGPT: هل هما نفس الشيء؟",
      description:
        "مقارنة بين Claude وChatGPT من حيث الكتابة والبرمجة وتحليل الملفات والاستخدامات.",
      url: "claude-vs-chatgpt.html",
      keywords:
        "claude كلود chatgpt شات جي بي تي مقارنة كلود شات جي بي تي كتابة برمجة ملفات"
    },

    {
      title: "ما هو Claude AI؟ دليل شامل للمبتدئين",
      description:
        "تعرف على Claude واستخداماته في الكتابة والبرمجة وتحليل المعلومات والملفات.",
      url: "Claude.html",
      keywords:
        "claude كلود claude ai كلود ai كتابة برمجة تحليل ملفات مساعد ذكاء اصطناعي"
    },

    {
      title: "كيف تستخدم ChatGPT؟ دليل كامل للمبتدئين",
      description:
        "تعرف على طريقة استخدام ChatGPT وكتابة طلبات واضحة للحصول على إجابات أفضل.",
      url: "article.html",
      keywords:
        "chatgpt شات جي بي تي شاتش بي تي استخدام chat gpt كتابة التعلم البحث الذكاء الاصطناعي"
    }

  ];

  function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[أإآ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .replace(/[ًٌٍَُِّْـ]/g, "")
      .trim();
  }

  function searchArticles(query) {

    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      searchResults.innerHTML = "";
      return;
    }

    const words = normalizedQuery
      .split(/\s+/)
      .filter(word => word.length > 1);

    const results = articles
      .map(article => {

        const text = normalize(
          article.title + " " +
          article.description + " " +
          article.keywords
        );

        let score = 0;

        words.forEach(word => {

          if (text.includes(word)) {
            score += 2;
          }

          if (normalize(article.title).includes(word)) {
            score += 4;
          }

          if (normalize(article.keywords).includes(word)) {
            score += 3;
          }

        });

        return {
          article,
          score
        };

      })
      .filter(result => result.score > 0)
      .sort((a, b) => b.score - a.score);

    if (results.length === 0) {

      searchResults.innerHTML = `
        <div class="search-empty">
          مش لاقي مقال مناسب للبحث ده 😕
          <br>
          جرب كلمة مختلفة مثل: كلود، جيميني، ChatGPT أو كتابة المحتوى.
        </div>
      `;

      return;
    }

    searchResults.innerHTML = results
      .map(result => `
        <a href="${result.article.url}" class="search-result">

          <h3>${result.article.title}</h3>

          <p>${result.article.description}</p>

        </a>
      `)
      .join("");

  }

  searchInput.addEventListener("input", function () {
    searchArticles(this.value);
  });

  document.querySelectorAll("[data-search]").forEach(button => {

    button.addEventListener("click", function () {

      const query = this.dataset.search;

      searchInput.value = query;

      searchArticles(query);

      searchInput.focus();

    });

  });

});
