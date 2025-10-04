import { Niivue, NVMeshUtilities, NVImage } from "@niivue/niivue"
import { inferenceModelsList, brainChopOpts } from "./brainchop-parameters.js"
import { isChrome, localSystemDetails } from "./brainchop-telemetry.js"
import MyWorker from "./brainchop-webworker.js?worker"
import { Niimath } from "@niivue/niimath"
import {
  antiAliasCuberille, cuberille,
  setPipelinesBaseUrl as setCuberillePipelinesUrl
} from "@itk-wasm/cuberille"
import {
  repair,
  smoothRemesh,
  keepLargestComponent,
  setPipelinesBaseUrl as setMeshFiltersPipelinesUrl,
} from "@itk-wasm/mesh-filters"
import { nii2iwi, iwm2meshCore } from "@niivue/cbor-loader"

// Use local, vendored WebAssembly module assets
const viteBaseUrl = import.meta.env.BASE_URL
const pipelinesBaseUrl = new URL(`${viteBaseUrl}pipelines`, document.location.origin).href
setCuberillePipelinesUrl(pipelinesBaseUrl)
setMeshFiltersPipelinesUrl(pipelinesBaseUrl)

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("app-static-v1").then((cache) => {
      return cache.addAll([
        "./", 
        "./index.html", 
        "./manifest.json", 
        "./models",
        "./pipelines",
        "./assets",
        "./t1_crop.nii.gz",
        "./niivue.css"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

async function main() {
  const niimath = new Niimath()
  await niimath.init()
  niimath.setOutputDataType('input') // call before setting image since this is passed to the image constructor
  aboutBtn.onclick = function () {
    const url = "https://github.com/niivue/brain2print"
    window.open(url, "_blank")
  }
  opacitySlider0.oninput = function () {
    nv1.setOpacity(0, opacitySlider0.value / 255)
    nv1.updateGLVolume()
  }
  opacitySlider1.oninput = function () {
    if (nv1.volumes.length < 2) return
    nv1.setOpacity(1, opacitySlider1.value / 255)
  }
  async function ensureConformed() {
    let nii = nv1.volumes[0]
    let isConformed =
      nii.dims[1] === 256 && nii.dims[2] === 256 && nii.dims[3] === 256
       && nii.img instanceof Uint8Array && nii.img.length === 256 * 256 * 256
    if (nii.permRAS[0] !== -1 || nii.permRAS[1] !== 3 || nii.permRAS[2] !== -2)
      isConformed = false
    if (isConformed) return
    let nii2 = await nv1.conform(nii, false, true, false, true)
    await nv1.removeVolume(nv1.volumes[0])
    await nv1.addVolume(nii2)
  }
  async function closeAllOverlays() {
    while (nv1.volumes.length > 1) {
      await nv1.removeVolume(nv1.volumes[1])
    }
  }
  modelSelect.onchange = async function () {
    if (this.selectedIndex < 0) modelSelect.selectedIndex = 11
    await closeAllOverlays()
    await ensureConformed()
    let model = inferenceModelsList[this.selectedIndex]
    model.isNvidia = false
    model.isScalar = scalarCheck.checked
    const rendererInfo = nv1.gl.getExtension("WEBGL_debug_renderer_info")
    if (rendererInfo) {
      model.isNvidia = nv1.gl
        .getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)
        .includes("NVIDIA")
    }
    let opts = brainChopOpts
    opts.rootURL = location.href
    const isLocalhost = Boolean(
      window.location.hostname === "localhost" ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === "[::1]" ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
          /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
    )
    if (isLocalhost) {
      opts.rootURL = location.protocol + "//" + location.host
    }
    if (typeof chopWorker !== "undefined") {
      console.log(
        "Unable to start new segmentation: previous call has not completed"
      )
      return
    }
    chopWorker = await new MyWorker({ type: "module" })
    let hdr = {
      datatypeCode: nv1.volumes[0].hdr.datatypeCode,
      dims: nv1.volumes[0].hdr.dims,
    }
    let msg = {
      opts: opts,
      modelEntry: model,
      niftiHeader: hdr,
      niftiImage: nv1.volumes[0].img,
    }
    chopWorker.postMessage(msg)
    chopWorker.onmessage = function (event) {
      let cmd = event.data.cmd
      if (cmd === "ui") {
        if (event.data.modalMessage !== "") {
          chopWorker.terminate()
          chopWorker = undefined
        }
        callbackUI(
          event.data.message,
          event.data.progressFrac,
          event.data.modalMessage
        )
      }
      if (cmd === "img") {
        chopWorker.terminate()
        chopWorker = undefined
        callbackImg(event.data.img, event.data.opts, event.data.modelEntry)
      }
    }
  }
  saveBtn.onclick = function () {
    nv1.volumes[1].saveToDisk("Custom.nii")
  }
  clipCheck.onchange = function () {
    if (clipCheck.checked) {
      nv1.setClipPlane([0, 0, 90])
    } else {
      nv1.setClipPlane([2, 0, 90])
    }
  }
  scalarCheck.onchange = function () {
    modelSelect.selectedIndex = -1
  }
  function doLoadImage() {
    saveBtn.disabled = true
    opacitySlider0.oninput()
  }
  async function fetchJSON(fnm) {
    const response = await fetch(fnm)
    const js = await response.json()
    return js
  }
  async function callbackImg(img, opts, modelEntry) {
    closeAllOverlays()
    let overlayVolume = await nv1.volumes[0].clone()
    overlayVolume.zeroImage()
    overlayVolume.hdr.scl_inter = 0
    overlayVolume.hdr.scl_slope = 1
    overlayVolume.img = new Uint8Array(img)
    const isScalar = modelEntry.isScalar === true
    if (isScalar) {
      overlayVolume.hdr.scl_slope = 1 / 255
      overlayVolume.colormap = "viridis"
    } else {
      
      if (modelEntry.colormapPath) {
        let cmap = await fetchJSON(modelEntry.colormapPath)
        overlayVolume.setColormapLabel(cmap)
        // n.b. most models create indexed labels, but those without colormap mask scalar input
        overlayVolume.hdr.intent_code = 1002 // NIFTI_INTENT_LABEL
      } else {
        let colormap = opts.atlasSelectedColorTable.toLowerCase()
        const cmaps = nv1.colormaps()
        if (!cmaps.includes(colormap)) {
          colormap = "actc"
        }
        overlayVolume.colormap = colormap
      }

    }
    overlayVolume.opacity = opacitySlider1.value / 255
    await nv1.addVolume(overlayVolume)
    saveBtn.disabled = false
    createMeshBtn.disabled = false
  }
  function callbackUI(
    message = "",
    progressFrac = -1,
    modalMessage = ""
  ) {
    if (message !== "") {
      console.log(message)
      document.getElementById("location").innerHTML = message
    }
    if (isNaN(progressFrac)) {
      //memory issue
      memstatus.style.color = "red"
      memstatus.innerHTML = "Memory Issue"
    } else if (progressFrac >= 0) {
      modelProgress.value = progressFrac * modelProgress.max
    }
    if (modalMessage !== "") {
      window.alert(modalMessage)
    }
  }
  function handleLocationChange(data) {
    document.getElementById("location").innerHTML =
      "&nbsp;&nbsp;" + data.string
  }
  let defaults = {
    backColor: [0.4, 0.4, 0.4, 1],
    show3Dcrosshair: true,
    onLocationChange: handleLocationChange,
  }
  createMeshBtn.onclick = function () {
    if (nv1.meshes.length > 0) nv1.removeMesh(nv1.meshes[0])
    saveMeshBtn.disabled = true
    if (nv1.volumes.length < 1) {
      window.alert("Image not loaded. Drag and drop an image.")
    } else {
      remeshDialog.show()
    }
  }
  qualitySelect.onchange = function () {
    const isBetterQuality = Boolean(Number(qualitySelect.value))
    const opacity = 1.0 - (0.5 * Number(isBetterQuality))
    largestCheck.disabled = isBetterQuality
    largestClusterGroup.style.opacity = opacity
    hollowGroup.style.opacity = opacity
    hollowSelect.disabled = isBetterQuality
    bubbleCheck.disabled = isBetterQuality
    bubbleGroup.style.opacity = opacity
    closeMM.disabled = isBetterQuality
    closeGroup.style.opacity = opacity
  }
  applyBtn.onclick = async function () {
    const isBetterQuality = Boolean(Number(qualitySelect.value))
    const startTime = performance.now()
    if (isBetterQuality)
      await applyQuality()
    else
      await applyFaster()
    console.log(`Execution time: ${Math.round(performance.now() - startTime)} ms`)
  }
  async function applyFaster() {
    const niiBuffer = await nv1.saveImage({volumeByIndex: nv1.volumes.length - 1})
    const niiFile = new File([niiBuffer], 'image.nii')
    let processor = niimath.image(niiFile)
    loadingCircle.classList.remove('hidden')
    //mesh with specified isosurface
    let isoValue = 0.5
    if (nv1.volumes[nv1.volumes.length - 1].hdr.intent_code === 0) {
      isoValue = 240 //isScalar
    }
    //const largestCheckValue = largestCheck.checked
    let reduce = Math.min(Math.max(Number(shrinkPct.value) / 100, 0.01), 1)
    let hollowSz = Number(hollowSelect.value )
    let closeSz = Number(closeMM.value)
    const pixDim = Math.min(Math.min(nv1.volumes[0].hdr.pixDims[1],nv1.volumes[0].hdr.pixDims[2]), nv1.volumes[0].hdr.pixDims[3])
    if ((pixDim < 0.2) && ((hollowSz !== 0) || (closeSz !== 0))) {
      hollowSz *= pixDim
      closeSz *= pixDim
      console.log('Very small pixels, scaling hollow and close values by ', pixDim)
    }
    if (hollowSz < 0) {
      processor = processor.hollow(0.5, hollowSz)
    }
    if ((isFinite(closeSz)) && (closeSz > 0)){
      processor = processor.close(isoValue, closeSz, 2 * closeSz)
    }
    processor = processor.mesh({
      i: isoValue,
      l: largestCheck.checked ? 1 : 0,
      r: reduce,
      b: bubbleCheck.checked ? 1 : 0
    })
    console.log('niimath operation', processor.commands)
    const retBlob = await processor.run('test.mz3')
    const arrayBuffer = await retBlob.arrayBuffer()
    loadingCircle.classList.add('hidden')
    if (nv1.meshes.length > 0)
      nv1.removeMesh(nv1.meshes[0])
    await nv1.loadFromArrayBuffer(arrayBuffer, 'test.mz3')
    nv1.reverseFaces(0)
  }
  async function applyQuality() {
    const volIdx = nv1.volumes.length - 1
    let hdr = nv1.volumes[volIdx].hdr
    let img = nv1.volumes[volIdx].img
    /*let hollowInt = Number(hollowSelect.value )
    if (hollowInt < 0){
      const vol = nv1.volumes[volIdx]
      const niiBuffer = await nv1.saveImage({volumeByIndex: nv1.volumes.length - 1})
      const niiBlob = new Blob([niiBuffer], { type: 'application/octet-stream' })
      const niiFile = new File([niiBlob], 'input.nii')
      niimath.setOutputDataType('input') // call before setting image since this is passed to the image constructor
      let image = niimath.image(niiFile)
      image = image.gz(0)
      image = image.ras()
      image = image.hollow(0.5, hollowInt)
      const outBlob = await image.run('output.nii') 
      let outFile = new File([outBlob], 'hollow.nii')
      const outVol = await NVImage.loadFromFile({
        file: outFile,
        name: outFile.name
      })
      hdr = outVol.hdr
      img = outVol.img
    }*/
    loadingCircle.classList.remove("hidden")
    meshProcessingMsg.classList.remove("hidden")
    meshProcessingMsg.textContent = "Generating mesh from segmentation"
    const itkImage = nii2iwi(hdr, img, false)
    itkImage.size = itkImage.size.map(Number)
    let mesh
    if (nv1.volumes[nv1.volumes.length - 1].hdr.intent_code === 0) {
      ({ mesh } = await cuberille(itkImage, { isoSurfaceValue: 240 }))
    } else {
      // Binarize the image: set all values >= 1 to 1
      for (let i = 0; i < itkImage.data.length; i++) {
        if (itkImage.data[i] >= 1) {
          itkImage.data[i] = 1;
        }
      }
      ({ mesh } = await antiAliasCuberille(itkImage, { noClosing: true }))
    }

    meshProcessingMsg.textContent = "Generating manifold"
    const { outputMesh: repairedMesh } = await repair(mesh, { maximumHoleArea: 50.0 })
    meshProcessingMsg.textContent = "Keep largest mesh component"
    const { outputMesh: largestOnly } = await keepLargestComponent(repairedMesh)
    while (nv1.meshes.length > 0) {
      nv1.removeMesh(nv1.meshes[0])
     }
    const initialNiiMesh = iwm2meshCore(largestOnly)
    const initialNiiMeshBuffer = NVMeshUtilities.createMZ3(initialNiiMesh.positions, initialNiiMesh.indices, false)
    await nv1.loadFromArrayBuffer(initialNiiMeshBuffer, 'trefoil.mz3')
    meshProcessingMsg.textContent = "Smoothing and remeshing"
    const smooth = parseInt(smoothSlide.value)
    const shrink = parseFloat(shrinkPct.value)
    console.log(`smoothing iterations ${smooth} shrink percent ${shrink}`)
    const { outputMesh: smoothedMesh } = await smoothRemesh(largestOnly, { newtonIterations: smooth, numberPoints: shrink })
    const { outputMesh: smoothedRepairedMesh } = await repair(smoothedMesh, { maximumHoleArea: 50.0 })
    const niiMesh = iwm2meshCore(smoothedRepairedMesh)
    loadingCircle.classList.add("hidden")
    meshProcessingMsg.classList.add("hidden")
    while (nv1.meshes.length > 0) {
      nv1.removeMesh(nv1.meshes[0])
     }
    const meshBuffer = NVMeshUtilities.createMZ3(niiMesh.positions, niiMesh.indices, false)
    await nv1.loadFromArrayBuffer(meshBuffer, 'trefoil.mz3')
  }
  saveMeshBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert("No mesh open for saving. Use 'Create Mesh'.")
    } else {
      saveDialog.show()
    }
  }
  applySaveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      return
    }
    let format = "obj"
    if (formatSelect.selectedIndex === 0) {
      format = "mz3"
    }
    if (formatSelect.selectedIndex === 2) {
      format = "stl"
    }
    const scale = 1 / Number(scaleSelect.value)
    const pts = nv1.meshes[0].pts.slice()
    for (let i = 0; i < pts.length; i++) pts[i] *= scale
    NVMeshUtilities.saveMesh(pts, nv1.meshes[0].tris, `mesh.${format}`, true)
  }
  var chopWorker
  let nv1 = new Niivue(defaults)
  nv1.attachToCanvas(gl1)
  nv1.opts.dragMode = nv1.dragModes.pan
  nv1.opts.multiplanarForceRender = true
  nv1.opts.yoke3Dto2DZoom = true
  nv1.opts.crosshairGap = 11
  await nv1.loadVolumes([{ url: "./t1_crop.nii.gz" }])
  for (let i = 0; i < inferenceModelsList.length; i++) {
    var option = document.createElement("option")
    option.text = inferenceModelsList[i].modelName
    option.value = inferenceModelsList[i].id.toString()
    modelSelect.appendChild(option)
  }
  qualitySelect.onchange()
  nv1.onImageLoaded = doLoadImage
  nv1.onMeshLoaded = (volume) => {
    saveMeshBtn.disabled = false
  }
  modelSelect.selectedIndex = -1
  console.log('brain2print 20241230')
  // uncomment next two lines to automatically run segmentation when web page is loaded
  // modelSelect.selectedIndex = 11
  // modelSelect.onchange()
}

main()
