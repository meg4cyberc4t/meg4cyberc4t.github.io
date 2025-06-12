import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11.17.1/dist/mermaid.esm.min.mjs";

const script = document.getElementById("mermaid_script");
const lightTheme = script?.dataset.lightTheme || "default";
const darkTheme = script?.dataset.darkTheme || "dark";
const darkMode = window.matchMedia("(prefers-color-scheme: dark)");

function prefersDarkTheme() {
  return document.body.classList.contains("dark") ||
    (document.body.classList.contains("auto") && darkMode.matches);
}

async function runMermaid() {
  const items = [...document.querySelectorAll(".mermaid")];
  if (items.length === 0) return;

  for (const item of items) {
    item.dataset.source ||= item.textContent.trim();
    item.textContent = item.dataset.source;
    item.removeAttribute("data-processed");
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme: prefersDarkTheme() ? darkTheme : lightTheme,
  });

  try {
    await mermaid.run({ nodes: items });
  } catch (error) {
    console.error("Unable to render Mermaid diagram:", error);
  }
}

document.addEventListener("DOMContentLoaded", runMermaid);
darkMode.addEventListener("change", runMermaid);
