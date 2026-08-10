const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const syncHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 10);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const yearTarget = document.getElementById("year");
if (yearTarget) {
  yearTarget.textContent = new Date().getFullYear();
}

const compareButton = document.getElementById("compareSchema");
const beforeSchema = document.getElementById("beforeSchema");
const afterSchema = document.getElementById("afterSchema");
const schemaResults = document.getElementById("schemaResults");

const renderSchemaDiff = () => {
  if (!beforeSchema || !afterSchema || !schemaResults) return;

  try {
    const before = JSON.parse(beforeSchema.value);
    const after = JSON.parse(afterSchema.value);
    const messages = [];

    Object.keys(after).forEach((key) => {
      if (!(key in before)) {
        messages.push(`<li class="status-added">Added <strong>${key}</strong> as <strong>${after[key]}</strong>.</li>`);
        return;
      }

      if (before[key] !== after[key]) {
        messages.push(`<li class="status-changed">Changed <strong>${key}</strong> from <strong>${before[key]}</strong> to <strong>${after[key]}</strong>.</li>`);
      }
    });

    Object.keys(before).forEach((key) => {
      if (!(key in after)) {
        messages.push(`<li class="status-removed">Removed <strong>${key}</strong>, previously <strong>${before[key]}</strong>.</li>`);
      }
    });

    schemaResults.innerHTML = messages.length
      ? `<ul>${messages.join("")}</ul>`
      : "<p>No differences found. These schemas match.</p>";
  } catch (error) {
    schemaResults.innerHTML = `<p>Please enter valid JSON in both boxes. ${error.message}</p>`;
  }
};

compareButton?.addEventListener("click", renderSchemaDiff);

const architecturePatterns = {
  batch: {
    explanation:
      "Batch ELT works well when freshness matters, but minute-by-minute updates are not the goal. It keeps the flow predictable and easier to monitor.",
    nodes: [
      ["Source apps", "scheduled exports"],
      ["Object storage", "landing zone"],
      ["Warehouse", "central store"],
      ["dbt", "transform and test"],
      ["BI layer", "reporting and decisions"],
    ],
  },
  stream: {
    explanation:
      "Streaming patterns are useful when latency matters more than simplicity. The tradeoff is higher operational attention and more moving parts.",
    nodes: [
      ["Event producers", "continuous updates"],
      ["Broker", "buffer and fan-out"],
      ["Stream processing", "windowing and transforms"],
      ["Serving store", "fast access"],
      ["Monitoring", "health and lag"],
    ],
  },
  lakehouse: {
    explanation:
      "A lakehouse pattern helps when you need open storage with stronger table semantics. Governance and metadata discipline become part of the core design.",
    nodes: [
      ["Raw zone", "immutable landing"],
      ["Open table format", "Iceberg metadata"],
      ["Processing engine", "Spark or SQL"],
      ["Curated layer", "trusted datasets"],
      ["Consumers", "analytics and ML"],
    ],
  },
};

const archTabs = Array.from(document.querySelectorAll(".arch-tab"));
const archCanvas = document.getElementById("archCanvas");
const archExplanation = document.getElementById("archExplanation");

const renderArchitecture = (key) => {
  if (!archCanvas || !archExplanation || !architecturePatterns[key]) return;

  const pattern = architecturePatterns[key];
  archCanvas.innerHTML = pattern.nodes
    .map(
      ([title, subtitle], index) =>
        `${index > 0 ? '<span class="arch-arrow">→</span>' : ""}<div class="arch-node"><strong>${title}</strong><span>${subtitle}</span></div>`
    )
    .join("");
  archExplanation.innerHTML = `<p>${pattern.explanation}</p>`;
};

archTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    archTabs.forEach((button) => button.classList.remove("is-active"));
    tab.classList.add("is-active");
    renderArchitecture(tab.dataset.arch);
  });
});

if (archTabs.length) {
  renderArchitecture("batch");
}
