// main.js

const sizeDictionary = {
  "FQ803-3": {
    "21": { length: 55, width: 35, height: 25 },
    "25": { length: 60, width: 38, height: 28 }
  },
  "FQ801-1": {
    "28": { length: 70, width: 45, height: 30 }
  }
};

const containerVolumes = {
  "40HQ": 2350,
  "40GP": 2000,
  "20GP": 900
};

const cuftPerCubicCm = 0.0000353;

window.onload = function() {
  const modelSelect = document.getElementById("model");
  const sizeSelect = document.getElementById("size");

  for (const model in sizeDictionary) {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    modelSelect.appendChild(option);
  }

  modelSelect.addEventListener("change", function () {
    sizeSelect.innerHTML = "";
    const sizes = sizeDictionary[modelSelect.value];
    for (const size in sizes) {
      const opt = document.createElement("option");
      opt.value = size;
      opt.textContent = size;
      sizeSelect.appendChild(opt);
    }
  });

  modelSelect.dispatchEvent(new Event("change"));
};

function simulateStuffing() {
  const model = document.getElementById("model").value;
  const size = document.getElementById("size").value;
  const qty = parseInt(document.getElementById("qty").value);
  const container = document.getElementById("container").value;

  const dims = sizeDictionary[model][size];
  const volumePerUnitCm = dims.length * dims.width * dims.height;
  const volumePerUnitCuft = volumePerUnitCm * cuftPerCubicCm;
  const totalVolume = volumePerUnitCuft * qty;
  const containerVolume = containerVolumes[container];

  const maxQty = Math.floor(containerVolume / volumePerUnitCuft);
  const usedQty = Math.min(qty, maxQty);
  const leftover = qty - usedQty;
  const usedVolume = usedQty * volumePerUnitCuft;
  const usagePercent = (usedVolume / containerVolume) * 100;

  document.getElementById("result").innerHTML = `
    <strong>Ukuran per item:</strong> ${dims.length}x${dims.width}x${dims.height} cm<br/>
    <strong>Volume per item:</strong> ${volumePerUnitCuft.toFixed(2)} cuft<br/>
    <strong>Total barang dimasukkan:</strong> ${usedQty}<br/>
    <strong>Sisa barang:</strong> ${leftover}<br/>
    <strong>Total volume terpakai:</strong> ${usedVolume.toFixed(2)} cuft<br/>
    <strong>Persentase kontainer terisi:</strong> ${usagePercent.toFixed(1)}%<br/>
  `;

  document.getElementById("load-bar").style.width = `${Math.min(usagePercent, 100)}%`;
}
