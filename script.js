const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileBtn = document.getElementById("fileBtn");

fileBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleFile);
dropZone.addEventListener("dragover", e => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  handleFile({ target: { files: e.dataTransfer.files } });
});

async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

    const res = await fetch("/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: sheet }),
    });

    const text = await res.text();
    alert(text);
  };
  reader.readAsArrayBuffer(file);
}
