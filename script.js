const drop = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileBtn = document.getElementById('fileBtn');

fileBtn.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', e => handleFiles(e.target.files));

drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag'); });
drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('drag'); handleFiles(e.dataTransfer.files); });

function toast(msg){ alert(msg); }

async function handleFiles(files){
  const file = files[0];
  if(!file) return;
  if(!/\.xlsx|\.xls$/i.test(file.name)) return toast('Format harus .xlsx atau .xls');

  const reader = new FileReader();
  reader.onload = async (evt) => {
    try{
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const first = workbook.SheetNames[0];
      const sheetArr = XLSX.utils.sheet_to_json(workbook.Sheets[first], { header:1 });

      // send to serverless endpoint
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: sheetArr })
      });

      if(!res.ok){
        const txt = await res.text();
        throw new Error(txt || 'Upload gagal');
      }
      const text = await res.text();
      toast(text);
    }catch(err){
      console.error(err);
      toast('Error: ' + (err.message || err));
    }
  };
  reader.readAsArrayBuffer(file);
}
