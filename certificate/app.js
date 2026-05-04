;(() => {
  const SPIRAL_PATH =
    "M50.291 360.72C19.742 347.992.831 325.527 2.057 303.782c.787-14.144 9.873-23.766 11.997-25.904 34.069-34.273 131.226-8.904 138.153 25.764 2.458 12.3-6.005 27.993-17.943 31.99-31.158 10.43-106.234-51.896-95.473-116.504 4.932-29.55 27.365-57.137 56.208-67.53 33.332-12.013 63.316 3.085 111.569 28.322 33.513 17.526 150.912 78.962 139.082 132.193-2.869 12.9-12.852 23.163-23.353 27.717-40.582 17.612-121.947-35.474-136.509-108.242-8.42-42.128 4.435-96.512 46.466-126.884 48.152-34.795 105.224-16.86 118.918-12.56 74.592 23.436 132.402 105.354 113.893 151.503-5.023 12.537-17.257 26.348-31.958 27.382-35.525 2.496-82.941-65.676-80.32-131.665 1.784-45.071 27.605-105.48 78.458-118.143 35.529-8.857 66.478 9.798 77.854 16.65 51.113 30.826 84.76 99.784 63.281 131.456-8.292 12.205-26.471 21.36-39.924 16.13-40.99-15.96-39.229-165.702 3.422-181.952 13.05-4.972 34.272.88 70.703 38.585"

  const CZ_MONTHS = [
    "ledna",
    "února",
    "března",
    "dubna",
    "května",
    "června",
    "července",
    "srpna",
    "září",
    "října",
    "listopadu",
    "prosince",
  ]

  function formatCzechDate(isoDate) {
    if (!isoDate) return ""
    const [y, m, d] = isoDate.split("-").map(Number)
    return `${d}. ${CZ_MONTHS[m - 1]} ${y}`
  }

  function slugify(s) {
    return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-")
  }

  function spiralSvg(strokeWidth = 4) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 608 363" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="${strokeWidth}"><path d="${SPIRAL_PATH}"></path></svg>`
  }

  function renderCert({ name, workshop, hours, workshopDate, issueDate }) {
    const isPlaceholder = !name || !name.trim()
    const displayName = isPlaceholder ? "JMÉNO" : name.trim()
    const wsDateStr = workshopDate ? formatCzechDate(workshopDate) : "DD. MM. RRRR"
    const issueDateStr = issueDate ? formatCzechDate(issueDate) : "DD. MM. RRRR"
    const hoursStr = `${hours} ${hours === 1 ? "hodina" : hours >= 2 && hours <= 4 ? "hodiny" : "hodin"}`

    return `
<div class="cert" role="document" aria-label="Potvrzení o účasti">
  <div class="deco deco-spiral" aria-hidden="true">${spiralSvg(4)}</div>
  <div class="deco deco-spiral-sm" aria-hidden="true">${spiralSvg(6)}</div>
  <div class="deco deco-spiral-left" aria-hidden="true">${spiralSvg(4)}</div>

  <div class="content">
    <header class="header">
      <div class="wordmark">
        <div class="mark"><img src="assets/logomark-circle.svg" alt=""></div>
        <div class="text">
          <div class="name">Jedlík‑nejedlík, z.&nbsp;s.</div>
          <div class="tagline">Výživa a&nbsp;výchova v&nbsp;propojení</div>
        </div>
      </div>
    </header>

    <main class="body">
      <h1 class="title">Potvrzení o&nbsp;účasti</h1>
      <p class="lead">na praktickém workshopu</p>

      <div class="workshop">
        <div class="ws-title">
          <span class="quotes">&bdquo;</span>${escapeHtml(workshop)}<span class="quotes">&ldquo;</span>
        </div>
      </div>

      <div class="recipient">
        <div class="for">vystaveno pro</div>
        <div class="name-line">
          <div class="name${isPlaceholder ? " placeholder" : ""}">${escapeHtml(displayName)}</div>
        </div>
        <div class="scope">v&nbsp;rozsahu <strong>${hoursStr}</strong>, který se konal dne <strong>${wsDateStr}</strong></div>
      </div>
    </main>

    <footer class="footer">
      <div class="meta">
        <div class="label">Vydáno dne</div>
        <div class="value">${issueDateStr}</div>
      </div>
      <div class="signature">
        <div class="sig-line"></div>
        <div class="sig-name">Mgr. et&nbsp;Mgr. Zdeňka Trummová</div>
        <div class="sig-role">statutár organizace</div>
      </div>
    </footer>
  </div>
</div>`
  }

  function escapeHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    )
  }

  function getFormState() {
    const namesRaw = document.getElementById("names").value
    const names = namesRaw
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean)
    return {
      names,
      workshop: document.getElementById("workshop").value || "",
      hours: parseInt(document.getElementById("hours").value, 10) || 5,
      workshopDate: document.getElementById("workshopDate").value,
      issueDate: document.getElementById("issueDate").value,
    }
  }

  function updatePreview() {
    const state = getFormState()
    const firstName = state.names[0] || ""
    document.getElementById("preview").innerHTML = renderCert({
      ...state,
      name: firstName,
    })
    scalePreview()
  }

  function scalePreview() {
    const wrap = document.querySelector(".preview-wrap")
    const scaler = document.getElementById("previewScaler")
    if (!wrap || !scaler) return
    const certWidthPx = (297 * 96) / 25.4 // mm -> px @ 96dpi
    const certHeightPx = (210 * 96) / 25.4
    const available = wrap.clientWidth - 24
    const scale = Math.min(1, available / certWidthPx)
    scaler.style.transform = `scale(${scale})`
    scaler.style.transformOrigin = "top left"
    scaler.style.width = `${certWidthPx * scale}px`
    scaler.style.height = `${certHeightPx * scale}px`
  }

  async function renderToCanvas(html) {
    const stage = document.getElementById("stage")
    stage.innerHTML = html
    const certEl = stage.querySelector(".cert")
    // Wait for images to load
    const imgs = certEl.querySelectorAll("img")
    await Promise.all(
      [...imgs].map((img) => {
        if (img.complete) return Promise.resolve()
        return new Promise((res) => {
          img.onload = img.onerror = res
        })
      }),
    )
    // Small delay to let fonts settle
    await new Promise((r) => setTimeout(r, 50))
    const canvas = await html2canvas(certEl, {
      scale: 3,
      backgroundColor: "#fffaf2",
      useCORS: true,
      logging: false,
    })
    stage.innerHTML = ""
    return canvas
  }

  function canvasToPdfBlob(canvas) {
    const { jsPDF } = window.jspdf
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })
    const imgData = canvas.toDataURL("image/jpeg", 0.95)
    pdf.addImage(imgData, "JPEG", 0, 0, 297, 210, undefined, "FAST")
    return pdf.output("blob")
  }

  function buildFilename({ name, workshop, issueDate }) {
    const parts = [
      "Certifikat",
      slugify(name) || "ucastnik",
      slugify(workshop).slice(0, 40),
      issueDate || "",
    ].filter(Boolean)
    return `${parts.join("_")}.pdf`
  }

  function setStatus(msg) {
    document.getElementById("status").textContent = msg
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  function validate(state) {
    if (!state.names.length) return "Zadej alespoň jedno jméno."
    if (!state.workshop.trim()) return "Zadej název workshopu."
    if (!state.workshopDate) return "Zadej datum workshopu."
    if (!state.issueDate) return "Zadej datum vystavení."
    return null
  }

  async function generateAll() {
    const state = getFormState()
    const err = validate(state)
    if (err) {
      setStatus(err)
      return
    }

    const btn = document.getElementById("generate")
    btn.disabled = true
    try {
      const zip = new JSZip()
      for (let i = 0; i < state.names.length; i++) {
        const name = state.names[i]
        setStatus(`Generuji ${i + 1}/${state.names.length}: ${name}…`)
        const html = renderCert({ ...state, name })
        const canvas = await renderToCanvas(html)
        const blob = canvasToPdfBlob(canvas)
        zip.file(buildFilename({ ...state, name }), blob)
      }
      setStatus("Balím ZIP…")
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const zipName = `Certifikaty_${slugify(state.workshop).slice(0, 40)}_${state.issueDate}.zip`
      downloadBlob(zipBlob, zipName)
      setStatus(`Hotovo — ${state.names.length} certifikátů v ZIP.`)
    } catch (e) {
      console.error(e)
      setStatus(`Chyba: ${e.message}`)
    } finally {
      btn.disabled = false
    }
  }

  async function generateFirst() {
    const state = getFormState()
    const err = validate(state)
    if (err) {
      setStatus(err)
      return
    }
    const btn = document.getElementById("generateSingle")
    btn.disabled = true
    try {
      const name = state.names[0]
      setStatus(`Generuji: ${name}…`)
      const html = renderCert({ ...state, name })
      const canvas = await renderToCanvas(html)
      const blob = canvasToPdfBlob(canvas)
      downloadBlob(blob, buildFilename({ ...state, name }))
      setStatus("Hotovo.")
    } catch (e) {
      console.error(e)
      setStatus(`Chyba: ${e.message}`)
    } finally {
      btn.disabled = false
    }
  }

  function init() {
    // Default issue date = today
    const today = new Date()
    const iso = today.toISOString().slice(0, 10)
    document.getElementById("issueDate").value = iso
    document.getElementById("workshopDate").value = iso
    ;["names", "workshop", "hours", "workshopDate", "issueDate"].forEach((id) => {
      document.getElementById(id).addEventListener("input", updatePreview)
    })
    document.getElementById("generate").addEventListener("click", generateAll)
    document.getElementById("generateSingle").addEventListener("click", generateFirst)
    window.addEventListener("resize", scalePreview)

    updatePreview()
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
