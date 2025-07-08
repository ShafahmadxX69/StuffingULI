// main.js

import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.152.2/examples/jsm/controls/OrbitControls.js';

const sizeDictionary = {
  "FQ803-3": {
    "21": { length: 55, width: 35, height: 25, color: 0xff0000 },
    "25": { length: 60, width: 38, height: 28, color: 0x00ff00 }
  },
  "FQ801-1": {
    "28": { length: 70, width: 45, height: 30, color: 0x0000ff }
  }
};

const containerDimensions = {
  "40HQ": { length: 1203.2, width: 235.2, height: 269.8, volume: 76 },
  "40GP": { length: 1203.2, width: 235.2, height: 239.3, volume: 67 },
  "20GP": { length: 589.8, width: 235.2, height: 239.3, volume: 33 }
};

const cuftPerCubicCm = 0.0000353;

window.onload = function() {
    const modelInput = document.getElementById("model");
  const sizeInput = document.getElementById("size");
  const modelList = document.getElementById("model-list");
  const sizeList = document.getElementById("size-list");

  for (const model in sizeDictionary) {
    const opt = document.createElement("option");
    opt.value = model;
    modelList.appendChild(opt);
  }

  modelInput.addEventListener("input", function () {
    const selectedModel = modelInput.value;
    sizeList.innerHTML = "";
    if (sizeDictionary[selectedModel]) {
      for (const size in sizeDictionary[selectedModel]) {
        const opt = document.createElement("option");
        opt.value = size;
        sizeList.appendChild(opt);
      }
    }
  });

  modelSelect.dispatchEvent(new Event("change"));
};

function simulateStuffing() {
  const model = document.getElementById("model").value;
  const size = document.getElementById("size").value;
  const qty = parseInt(document.getElementById("qty").value);
  const containerKey = document.getElementById("container").value;

  const dims = sizeDictionary[model][size];
  const container = containerDimensions[containerKey];

  const volumePerItemCM = dims.length * dims.width * dims.height;
  const volumePerItemCuft = volumePerItemCM * cuftPerCubicCm;
  const totalVolumeCuft = volumePerItemCuft * qty;
  const maxQty = Math.floor((container.volume * 1000000) / volumePerItemCM);
  const usedQty = Math.min(qty, maxQty);
  const leftover = qty - usedQty;
  const usedVolume = usedQty * volumePerItemCuft;
  const usagePercent = (usedVolume / container.volume) * 100;

  document.getElementById("result").innerHTML = `
    <strong>Ukuran per item:</strong> ${dims.length}x${dims.width}x${dims.height} cm<br/>
    <strong>Volume per item:</strong> ${volumePerItemCuft.toFixed(2)} cuft<br/>
    <strong>Total barang dimasukkan:</strong> ${usedQty}<br/>
    <strong>Sisa barang:</strong> ${leftover}<br/>
    <strong>Total volume terpakai:</strong> ${usedVolume.toFixed(2)} cuft<br/>
    <strong>Persentase kontainer terisi:</strong> ${usagePercent.toFixed(1)}%<br/>
  `;

  document.getElementById("load-bar").style.width = `${Math.min(usagePercent, 100)}%`;
  draw3D(container, dims, usedQty);
}

function draw3D(container, box, count) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / 400, 1, 5000);
  camera.position.set(800, 400, 800);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, 400);

  const canvasDiv = document.getElementById("canvas3d");
  canvasDiv.innerHTML = "";
  canvasDiv.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  const containerMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc, wireframe: true });
  const containerBox = new THREE.BoxGeometry(container.length, container.height, container.width);
  const containerMesh = new THREE.Mesh(containerBox, containerMaterial);
  containerMesh.position.y = container.height / 2;
  scene.add(containerMesh);

  const boxGeo = new THREE.BoxGeometry(box.length, box.height, box.width);
  const boxMat = new THREE.MeshLambertMaterial({ color: box.color });

  let x = -container.length / 2 + box.length / 2;
  let y = box.height / 2;
  let z = -container.width / 2 + box.width / 2;

  let maxX = container.length - box.length;
  let maxZ = container.width - box.width;
  let maxY = container.height - box.height;

  for (let i = 0; i < count; i++) {
    const cube = new THREE.Mesh(boxGeo, boxMat);
    cube.position.set(x, y, z);
    scene.add(cube);

    x += box.length;
    if (x > maxX) {
      x = -container.length / 2 + box.length / 2;
      z += box.width;
      if (z > maxZ) {
        z = -container.width / 2 + box.width / 2;
        y += box.height;
        if (y > maxY) break;
      }
    }
  }

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  renderer.render(scene, camera);
}
