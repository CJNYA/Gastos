document.addEventListener("DOMContentLoaded", () => {

 let datos = JSON.parse(localStorage.getItem("datos")) || {
  fijo: [],
  var: [],
  ing: []
};

// 🔥 FIX IMPORTANTE
if (!datos.fijo || !datos.var || !datos.ing) {
  datos = { fijo: [], var: [], ing: [] };
}

  function guardar() {
    localStorage.setItem("datos", JSON.stringify(datos));
  }

  function render() {

    // FIJO
    const tf = document.getElementById("tablaFijo");
    tf.innerHTML = "";
    datos.fijo.forEach((f, i) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><input type="checkbox" data-i="${i}"></td>
        <td contenteditable>${f.d}</td>
        <td contenteditable>${f.v}</td>
      `;

      const celdas = tr.querySelectorAll("td");

      celdas[1].oninput = e => { f.d = e.target.innerText; guardar(); };
      celdas[2].oninput = e => { f.v = parseFloat(e.target.innerText) || 0; guardar(); };

      tf.appendChild(tr);
    });

    // VARIABLE
    const tv = document.getElementById("tablaVar");
    tv.innerHTML = "";
    datos.var.forEach((f, i) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><input type="checkbox" data-i="${i}"></td>
        <td contenteditable>${f.d}</td>
        <td contenteditable>${f.v}</td>
      `;

      const celdas = tr.querySelectorAll("td");

      celdas[1].oninput = e => { f.d = e.target.innerText; guardar(); };
      celdas[2].oninput = e => { f.v = parseFloat(e.target.innerText) || 0; guardar(); };

      tv.appendChild(tr);
    });

    // INGRESOS
    const ti = document.getElementById("tablaIng");
    ti.innerHTML = "";
    datos.ing.forEach((f, i) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td><input type="checkbox" data-i="${i}"></td>
        <td><input type="date" value="${f.d}"></td>
        <td contenteditable>${f.v}</td>
      `;

      const celdas = tr.querySelectorAll("td");

      celdas[1].querySelector("input").onchange = e => {
        f.d = e.target.value;
        guardar();
      };

      celdas[2].oninput = e => {
        f.v = parseFloat(e.target.innerText) || 0;
        guardar();
      };

      ti.appendChild(tr);
    });

    guardar();
  }

  // =====================
  // BOTONES
  // =====================

  document.getElementById("addFijo").onclick = () => {
    datos.fijo.push({ d:"", v:0 });
    render();
  };

  document.getElementById("addVar").onclick = () => {
    datos.var.push({ d:"", v:0 });
    render();
  };

  document.getElementById("addIng").onclick = () => {
    datos.ing.push({ d:"", v:0 });
    render();
  };

  document.getElementById("delFijo").onclick = () => eliminar("tablaFijo", "fijo");
  document.getElementById("delVar").onclick = () => eliminar("tablaVar", "var");
  document.getElementById("delIng").onclick = () => eliminar("tablaIng", "ing");

  document.getElementById("resetFijo").onclick = () => reset("tablaFijo", "fijo");
  document.getElementById("resetVar").onclick = () => reset("tablaVar", "var");
  document.getElementById("resetIng").onclick = () => reset("tablaIng", "ing");

  function eliminar(tablaId, tipo) {
    const checks = document.querySelectorAll(`#${tablaId} input[type=checkbox]:checked`);
    const indices = [...checks].map(c => parseInt(c.dataset.i));

    datos[tipo] = datos[tipo].filter((_, i) => !indices.includes(i));
    render();
  }

  function reset(tablaId, tipo) {
    const checks = document.querySelectorAll(`#${tablaId} input[type=checkbox]:checked`);

    checks.forEach(c => {
      const i = parseInt(c.dataset.i);
      datos[tipo][i] = { d:"", v:0 };
    });

    render();
  }

  // =====================
  // CHECKBOX GENERAL
  // =====================

  function checkAll(checkId, tablaId) {
    document.getElementById(checkId).addEventListener("change", e => {
      document.querySelectorAll(`#${tablaId} input[type=checkbox]`)
        .forEach(cb => cb.checked = e.target.checked);
    });
  }

  checkAll("checkFijo", "tablaFijo");
  checkAll("checkVar", "tablaVar");
  checkAll("checkIng", "tablaIng");

  // =====================
  // EXCEL
  // =====================

  document.getElementById("excelBtn").onclick = () => {

  const datos = JSON.parse(localStorage.getItem("datos")) || {
    fijo: [],
    var: [],
    ing: []
  };

  let fijoTotal = 0;
  let varTotal = 0;
  let ingTotal = 0;

  const wsData = [];

  // =====================
  // FIJOS
  // =====================
  wsData.push(["GASTOS FIJOS"]);
  wsData.push(["Descripción", "Cantidad"]);

  datos.fijo.forEach(f => {
    wsData.push([f.d, f.v]);
    fijoTotal += f.v;
  });

  wsData.push([]);
  wsData.push([]);

  // =====================
  // VARIABLES
  // =====================
  wsData.push(["GASTOS VARIABLES"]);
  wsData.push(["Descripción", "Cantidad"]);

  datos.var.forEach(f => {
    wsData.push([f.d, f.v]);
    varTotal += f.v;
  });

  wsData.push([]);
  wsData.push([]);

  // =====================
  // INGRESOS
  // =====================
  wsData.push(["INGRESOS"]);
  wsData.push(["Fecha", "Cantidad"]);

  datos.ing.forEach(f => {
    wsData.push([f.d, f.v]);
    ingTotal += f.v;
  });

  wsData.push([]);
  wsData.push([]);

  // =====================
  // RESUMEN
  // =====================
  wsData.push(["RESUMEN"]);
  wsData.push(["Total Fijos", fijoTotal]);
  wsData.push(["Total Variables", varTotal]);
  wsData.push(["Total Ingresos", ingTotal]);
  wsData.push(["BENEFICIO", ingTotal - (fijoTotal + varTotal)]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  XLSX.utils.book_append_sheet(wb, ws, "Peluquería");
  XLSX.writeFile(wb, "peluqueria.xlsx");
};

document.getElementById("pdfBtn").onclick = () => {

  generarResumenParaPDF();

  setTimeout(() => {
    window.print();

    // volver a ocultarlo después
    document.getElementById("resumenPDF").style.display = "none";

  }, 200);
};
  render();

});

function generarResumenParaPDF() {

  const datos = JSON.parse(localStorage.getItem("datos")) || {
    fijo: [],
    var: [],
    ing: []
  };

  let fijo = datos.fijo.reduce((a,b) => a + (b.v || 0), 0);
  let variable = datos.var.reduce((a,b) => a + (b.v || 0), 0);
  let ingreso = datos.ing.reduce((a,b) => a + (b.v || 0), 0);

  const contenedor = document.getElementById("resumenPDF");

  contenedor.innerHTML = `
    <div class="resumen-box">
      <h2>📊 RESUMEN</h2>
      <p>💰 Gastos Fijos: ${fijo.toFixed(2)} €</p>
      <p>💸 Gastos Variables: ${variable.toFixed(2)} €</p>
      <p>📈 Ingresos: ${ingreso.toFixed(2)} €</p>
      <hr>
      <h2>🧮 Beneficios: ${(ingreso - (fijo + variable)).toFixed(2)} €</h2>
    </div>
  `;

  contenedor.style.display = "block";
}

function actualizarCostes() {

  const datos = JSON.parse(localStorage.getItem("datos")) || {
    fijo: [],
    var: [],
    ing: []
  };

  let fijo = datos.fijo.reduce((a,b) => a + b.v, 0);
  let variable = datos.var.reduce((a,b) => a + b.v, 0);
  let ingreso = datos.ing.reduce((a,b) => a + b.v, 0);

  const contenedor = document.getElementById("resumen");

  if (!contenedor) return;

  contenedor.innerHTML = `
    <h3>💰 Gastos Fijos: ${fijo.toFixed(2)} €</h3>
    <h3>💸 Gastos Variables: ${variable.toFixed(2)} €</h3>
    <h3>📈 Ingresos: ${ingreso.toFixed(2)} €</h3>
    <hr>
    <h2>🧮 Beneficios: ${(ingreso - (fijo + variable)).toFixed(2)} €</h2>
  `;
}

// Ejecutar al cargar
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("resumen")) {
    actualizarCostes();

    // 🔥 actualización en tiempo real
    setInterval(actualizarCostes, 1000);
  }
});

function calcularCostes() {

  const datos = JSON.parse(localStorage.getItem("datos")) || {
    fijo: [],
    var: [],
    ing: []
  };

  let fijo = datos.fijo.reduce((a,b) => a + (b.v || 0), 0);
  let variable = datos.var.reduce((a,b) => a + (b.v || 0), 0);
  let ingreso = datos.ing.reduce((a,b) => a + (b.v || 0), 0);

  const res = document.getElementById("resumen");
  if (!res) return;

  res.innerHTML = `
    <h3>💰 Gastos Fijos: ${fijo.toFixed(2)} €</h3>
    <h3>💸 Gastos Variables: ${variable.toFixed(2)} €</h3>
    <h3>📈 Ingresos: ${ingreso.toFixed(2)} €</h3>
    <hr>
    <h2>🧮 Beneficios: ${(ingreso - (fijo + variable)).toFixed(2)} €</h2>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("resumen")) {
    calcularCostes();
  }
});

document.getElementById("exportJsonBtn")?.addEventListener("click", () => {

  const datos = JSON.parse(localStorage.getItem("datos")) || {
    fijo: [],
    var: [],
    ing: []
  };

  const blob = new Blob([JSON.stringify(datos, null, 2)], {
    type: "application/json"
  });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "backup_peluqueria.json";
  a.click();
});

const fileInput = document.getElementById("fileInput");

document.getElementById("importJsonBtn")?.addEventListener("click", () => {
  fileInput.click();
});

fileInput?.addEventListener("change", (e) => {

  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const datos = JSON.parse(event.target.result);

      // Validación básica
      if (!datos.fijo || !datos.var || !datos.ing) {
        alert("Archivo no válido");
        return;
      }

      localStorage.setItem("datos", JSON.stringify(datos));

      alert("Datos importados correctamente ✔");
      location.reload();

    } catch {
      alert("Error al leer el archivo");
    }
  };

  reader.readAsText(file);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

