document.addEventListener("DOMContentLoaded", () => {
  const codeBlocks = document.querySelectorAll("pre > code");

  codeBlocks.forEach((code) => {
    const codeBlock = code.parentElement;
    if (!codeBlock || codeBlock.classList.contains("mermaid")) return;

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "copy-code-button";
    copyButton.textContent = "copy";
    copyButton.setAttribute("aria-label", "Copy code to clipboard");

    codeBlock.appendChild(copyButton);

    copyButton.addEventListener("click", async () => {
      const textToCopy = code.textContent || code.innerText;

      try {
        await navigator.clipboard.writeText(textToCopy);
        copyButton.textContent = "copied";
        copyButton.setAttribute("aria-label", "Code copied");
        window.setTimeout(() => {
          copyButton.textContent = "copy";
          copyButton.setAttribute("aria-label", "Copy code to clipboard");
        }, 2000);
      } catch (error) {
        copyButton.textContent = "failed";
        copyButton.setAttribute("aria-label", "Unable to copy code");
        console.error("Unable to copy code:", error);
      }
    });
  });
});
