
(() => {
  "use strict";

  const API = "https://ai-arabic-comments.khelmy627.workers.dev";

  // Prevent loading the component twice on the same page.
  if (document.getElementById("comments-section")) return;

  const filename = location.pathname.split("/").pop() || "index.html";
  const article = filename.replace(/\.html$/i, "");

  // Load the shared stylesheet.
  if (!document.querySelector('link[data-comments-css]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/comments.css";
    stylesheet.dataset.commentsCss = "true";
    document.head.appendChild(stylesheet);
  }

  // Build the component safely using DOM methods.
  const section = document.createElement("section");
  section.id = "comments-section";
  section.className = "comments-section";
  section.dir = "rtl";

  section.innerHTML = `
    <div class="comments-heading">
      <span class="comments-icon" aria-hidden="true">💬</span>
      <div>
        <h2>شاركنا رأيك</h2>
        <p>رأيك يهمنا! اكتب تعليقك وشارك تجربتك مع القراء.</p>
      </div>
    </div>

    <form id="comment-form" class="comments-form">
      <div class="comments-field">
        <label for="comment-author">الاسم <span>(اختياري)</span></label>
        <input id="comment-author" name="author"
          maxlength="40" autocomplete="nickname"
          placeholder="اكتب اسمك أو اتركه فارغًا">
      </div>

      <div class="comments-field">
        <label for="comment-content">تعليقك</label>
        <textarea id="comment-content" name="content"
          maxlength="2000" required
          placeholder="إيه رأيك في المقال؟ شاركنا رأيك..."
          rows="5"></textarea>
        <div class="comments-hint">الحد الأقصى 2000 حرف</div>
      </div>

      <div class="comments-honeypot" aria-hidden="true">
        <label for="comment-website">اترك هذا الحقل فارغًا</label>
        <input id="comment-website" name="website"
          tabindex="-1" autocomplete="off">
      </div>

      <button id="comment-submit" class="comments-submit" type="submit">
        <span>إرسال التعليق</span>
        <span aria-hidden="true">←</span>
      </button>

      <p id="comment-status" class="comments-status"
        role="status" aria-live="polite"></p>
    </form>

    <div class="comments-divider"></div>

    <div class="comments-list-heading">
      <h3>التعليقات المنشورة</h3>
      <span id="comments-count" class="comments-count">0</span>
    </div>

    <div id="comments-list" class="comments-list">
      <p class="comments-empty">جارٍ تحميل التعليقات...</p>
    </div>
  `;

  // Place comments before the footer when possible.
  const footer = document.querySelector("footer");
  if (footer && footer.parentNode) {
    footer.parentNode.insertBefore(section, footer);
  } else {
    document.body.appendChild(section);
  }

  const form = section.querySelector("#comment-form");
  const authorInput = section.querySelector("#comment-author");
  const contentInput = section.querySelector("#comment-content");
  const websiteInput = section.querySelector("#comment-website");
  const submitButton = section.querySelector("#comment-submit");
  const status = section.querySelector("#comment-status");
  const list = section.querySelector("#comments-list");
  const count = section.querySelector("#comments-count");

  function setStatus(message, type = "") {
    status.textContent = message;
    status.className = "comments-status";
    if (type) status.classList.add("is-" + type);
  }

  function formatDate(value) {
    if (!value) return "";

    // Cloudflare D1 datetime('now') is returned in UTC.
    const date = new Date(value.replace(" ", "T") + "Z");

    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(date);
  }

  function renderComments(comments) {
    list.replaceChildren();
    count.textContent = String(comments.length);

    if (!comments.length) {
      const empty = document.createElement("p");
      empty.className = "comments-empty";
      empty.textContent = "لسه مفيش تعليقات. كن أول من يشارك رأيه!";
      list.appendChild(empty);
      return;
    }

    comments.forEach(comment => {
      const card = document.createElement("article");
      card.className = "comment-card";

      const header = document.createElement("div");
      header.className = "comment-card-header";

      const avatar = document.createElement("span");
      avatar.className = "comment-avatar";
      avatar.textContent = "👤";
      avatar.setAttribute("aria-hidden", "true");

      const details = document.createElement("div");
      details.className = "comment-author-details";

      const name = document.createElement("strong");
      name.className = "comment-author";
      name.textContent = comment.author || "زائر";

      const date = document.createElement("time");
      date.className = "comment-date";
      date.textContent = formatDate(comment.created_at);

      details.append(name, date);
      header.append(avatar, details);

      const content = document.createElement("p");
      content.className = "comment-content";
      content.textContent = comment.content;

      card.append(header, content);
      list.appendChild(card);
    });
  }

  async function loadComments() {
    try {
      const response = await fetch(
        API + "/comments?article=" + encodeURIComponent(article)
      );

      if (!response.ok) throw new Error("تعذر تحميل التعليقات");

      const data = await response.json();
      renderComments(data.comments || []);
    } catch {
      list.replaceChildren();

      const error = document.createElement("p");
      error.className = "comments-empty";
      error.textContent = "تعذر تحميل التعليقات حاليًا. حاول تحديث الصفحة.";
      list.appendChild(error);
    }
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const author = authorInput.value.trim();
    const content = contentInput.value.trim();

    if (!content) {
      setStatus("اكتب تعليقك أولًا.", "error");
      contentInput.focus();
      return;
    }

    if (content.length > 2000 || author.length > 40) {
      setStatus("راجع طول الاسم أو التعليق.", "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.querySelector("span").textContent = "جارٍ الإرسال...";
    setStatus("");

    try {
      const response = await fetch(API + "/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article,
          author,
          content,
          website: websiteInput.value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "تعذر إرسال التعليق.");
      }

      setStatus(data.message || "تم إرسال تعليقك بنجاح!", "success");
      form.reset();

      // Reload the published comments after successful submission.
      await loadComments();
    } catch (error) {
      setStatus(
        error.message === "Failed to fetch"
          ? "تعذر الاتصال بخدمة التعليقات. حاول مرة أخرى."
          : error.message,
        "error"
      );
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector("span").textContent = "إرسال التعليق";
    }
  });

  loadComments();
})();
    
