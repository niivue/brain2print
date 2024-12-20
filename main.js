import { Niivue, NVMeshUtilities, NVImage } from "@niivue/niivue"
import { inferenceModelsList, brainChopOpts } from "./brainchop-parameters.js"
import { isChrome, localSystemDetails } from "./brainchop-telemetry.js"
import MyWorker from "./brainchop-webworker.js?worker"
import { Niimath } from "@niivue/niimath"
import {
  antiAliasCuberille,
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

async function main() {
  const niimath = new Niimath()
  await niimath.init()
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
    if (nii.permRAS[0] !== -1 || nii.permRAS[1] !== 3 || nii.permRAS[2] !== -2)
      isConformed = false
    if (isConformed) return
    let nii2 = await nv1.conform(nii, false)
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
    if (isLocalhost) opts.rootURL = location.protocol + "//" + location.host
    if (workerCheck.checked) {
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
    } else {
      console.log(
        "Only provided with webworker code, see main brainchop github repository for main thread code"
      )
    }
  }
  saveBtn.onclick = function () {
    nv1.volumes[1].saveToDisk("Custom.nii")
  }
  workerCheck.onchange = function () {
    modelSelect.onchange()
  }
  clipCheck.onchange = function () {
    if (clipCheck.checked) {
      nv1.setClipPlane([0, 0, 90])
    } else {
      nv1.setClipPlane([2, 0, 90])
    }
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
    if (modelEntry.colormapPath) {
      let cmap = await fetchJSON(modelEntry.colormapPath)
      overlayVolume.setColormapLabel(cmap)
      // n.b. most models create indexed labels, but those without colormap mask scalar input
      overlayVolume.hdr.intent_code = 1002; // NIFTI_INTENT_LABEL
    } else {
      let colormap = opts.atlasSelectedColorTable.toLowerCase()
      const cmaps = nv1.colormaps()
      if (!cmaps.includes(colormap)) {
        colormap = "actc"
      }
      overlayVolume.colormap = colormap
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
    if (nv1.volumes.length < 1) {
      window.alert("Image not loaded. Drag and drop an image.")
    } else {
      remeshDialog.show()
    }
  }
  applyBtn.onclick = async function () {
    const volIdx = nv1.volumes.length - 1
    let hdr = nv1.volumes[volIdx].hdr
    let img = nv1.volumes[volIdx].img
    let hollowInt = Number(hollowSelect.value )
    if (hollowInt < 0){
      const vol = nv1.volumes[volIdx]
      const niiBuffer = await nv1.saveImage({volumeByIndex: nv1.volumes.length - 1}).buffer
      const niiBlob = new Blob([niiBuffer], { type: 'application/octet-stream' })
      const niiFile = new File([niiBlob], 'input.nii')
      // with niimath wasm ZLIB builds, isGz seems to be the default output type:
      // see: https://github.com/rordenlab/niimath/blob/9f3a301be72c331b90ef5baecb7a0232e9b47ba4/src/core.c#L201
      // also added new option to set outputDataType in niimath in version 0.3.0 (published 20 Dec 2024)
      niimath.setOutputDataType('input') // call before setting image since this is passed to the image constructor
      let image = niimath.image(niiFile)
      image = image.hollow(0.5, hollowInt)
      // must use .gz extension because niimath will create .nii.gz by default, so
      // wasm file system commands will look for this, not .nii. 
      // Error 44 will happen otherwise (file not found error)
      const outBlob = await image.run('output.nii.gz') 
      let outFile = new File([outBlob], 'hollow.nii.gz')
      const outVol = await NVImage.loadFromFile({
        file: outFile,
        name: outFile.name
      })
      
      hdr = outVol.hdr
      img = outVol.img
    }
    loadingCircle.classList.remove("hidden")
    meshProcessingMsg.classList.remove("hidden")
    meshProcessingMsg.textContent = "Generating mesh from segmentation"

    const itkImage = nii2iwi(hdr, img, false)
    itkImage.size = itkImage.size.map(Number)
    const { mesh } = await antiAliasCuberille(itkImage, { noClosing: true })
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
    saveMeshBtn.disabled = false
    meshProcessingMsg.textContent = "Smoothing and remeshing"
    const smooth = parseInt(smoothSlide.value)
    const shrink = parseFloat(shrinkPct.value)
    const { outputMesh: smoothedMesh } = await smoothRemesh(largestOnly, { newtonIterations: smooth, numberPoints: shrink })
    const niiMesh = iwm2meshCore(smoothedMesh)
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
  nv1.onImageLoaded = doLoadImage
  modelSelect.selectedIndex = -1
  workerCheck.checked = await isChrome(); //TODO: Safari does not yet support WebGL TFJS webworkers, test FireFox
  console.log('brain2print 20241218')
  // uncomment next two lines to automatically run segmentation when web page is loaded
  //   modelSelect.selectedIndex = 11
  //   modelSelect.onchange()
}

main()
