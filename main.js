import { Niivue, NVMeshUtilities } from "@niivue/niivue"
import { Niimath } from "@niivue/niimath"
// import {runInference } from './brainchop-mainthread.js'
import { inferenceModelsList, brainChopOpts } from "./brainchop-parameters.js"
import { isChrome, localSystemDetails } from "./brainchop-telemetry.js"
import MyWorker from "./brainchop-webworker.js?worker"

// class NiiMathWrapper {
//   constructor(workerScript) {
//     this.worker = new Worker(workerScript)
//   }
//   static async load(workerScript = './niimathWorker.js') {
//     return new NiiMathWrapper(workerScript)
//   }
//   niimath(niiBuffer, operationsText) {
//     return new Promise((resolve, reject) => {
//       const niiBlob = new Blob([niiBuffer], { type: 'application/octet-stream' })
//       const inName = 'input.nii' // or derive from context
//       let outName = inName
//       if (operationsText.includes("-mesh")) {
//         outName = 'output.mz3' // or derive from context
//       }
//       const args = operationsText.trim().split(/\s+/)
//       args.unshift(inName)
//       args.push(outName)
//       const file = new File([niiBlob], inName)
//       this.worker.onmessage = (e) => {
//         if (e.data.blob instanceof Blob) {
//           const reader = new FileReader()
//           reader.onload = () => {
//             resolve(reader.result) // return ArrayBuffer
//           }
//           reader.onerror = () => {
//             reject(new Error('Failed to read the Blob as an ArrayBuffer'))
//           }
//           reader.readAsArrayBuffer(e.data.blob)
//         } else {
//           reject(new Error('Expected Blob from worker'))
//         }
//       }
//       this.worker.onerror = (e) => {
//         reject(new Error(e.message))
//       }
//       this.worker.postMessage({ blob: file, cmd: args, outName: outName })
//     })
//   }
//   terminate() {
//     this.worker.terminate()
//   }
// }

async function main() {
  const niimath = new Niimath()
  await niimath.init()
  // const wrapper = await NiiMathWrapper.load()
  /*smoothCheck.onchange = function () {
    nv1.setInterpolation(!smoothCheck.checked)
  }*/
  aboutBtn.onclick = function () {
    const url = "https://github.com/neurolabusc/niivue-brainchop";
    window.open(url, '_blank');
  }
  /*diagnosticsBtn.onclick = function () {
    if (diagnosticsString.length < 1) {
      window.alert('No diagnostic string generated: run a model to create diagnostics')
      return
    }
    navigator.clipboard.writeText(diagnosticsString)
    window.alert('Diagnostics copied to clipboard\n' + diagnosticsString)
  }*/
  opacitySlider0.oninput = function () {
    nv1.setOpacity(0, opacitySlider0.value / 255)
    nv1.updateGLVolume()
  }
  opacitySlider1.oninput = function () {
    nv1.setOpacity(1, opacitySlider1.value / 255)
  }
  async function ensureConformed() {
    let nii = nv1.volumes[0]
    let isConformed = ((nii.dims[1] === 256) && (nii.dims[2] === 256) && (nii.dims[3] === 256))
    if ((nii.permRAS[0] !== -1) || (nii.permRAS[1] !== 3) || (nii.permRAS[2] !== -2))
      isConformed = false
    if (isConformed)
      return
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
    if (this.selectedIndex < 0)
      modelSelect.selectedIndex = 11
    await closeAllOverlays()
    await ensureConformed()
    let model = inferenceModelsList[this.selectedIndex]
    model.isNvidia = false
    const rendererInfo = nv1.gl.getExtension('WEBGL_debug_renderer_info')
    if (rendererInfo) {
      model.isNvidia = nv1.gl.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL).includes('NVIDIA')
      
    }
    
    let opts = brainChopOpts
    opts.rootURL = location.href
    const isLocalhost = Boolean(
      window.location.hostname === 'localhost' ||
      // [::1] is the IPv6 localhost address.
      window.location.hostname === '[::1]' ||
      // 127.0.0.1/8 is considered localhost for IPv4.
      window.location.hostname.match(
          /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    )
    if (isLocalhost)
      opts.rootURL = location.protocol + '//' + location.host
    if (workerCheck.checked) {
      if(typeof(chopWorker) !== "undefined") {
          console.log('Unable to start new segmentation: previous call has not completed')
          return
      }
      chopWorker = await new MyWorker({ type: "module" })
      let hdr = {datatypeCode: nv1.volumes[0].hdr.datatypeCode, dims: nv1.volumes[0].hdr.dims}
      let msg = {opts:opts, modelEntry: model, niftiHeader: hdr, niftiImage: nv1.volumes[0].img}
      chopWorker.postMessage(msg)
      chopWorker.onmessage = function(event) {
        let cmd = event.data.cmd
        if (cmd === 'ui') {
            if (event.data.modalMessage !== "") {
              chopWorker.terminate()
              chopWorker = undefined
            }
            callbackUI(event.data.message, event.data.progressFrac, event.data.modalMessage, event.data.statData)
        }
        if (cmd === 'img') {
            chopWorker.terminate()
            chopWorker = undefined
            callbackImg(event.data.img, event.data.opts, event.data.modelEntry)
        }
      }
    } else {
      console.log('Only provided with webworker code, see main brainchop github repository for main thread code')
      // runInference(opts, model, nv1.volumes[0].hdr, nv1.volumes[0].img, callbackImg, callbackUI)
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
      overlayVolume.hdr.intent_code = 1002 // NIFTI_INTENT_LABEL
    } else {
      let colormap = opts.atlasSelectedColorTable.toLowerCase()
      const cmaps = nv1.colormaps()
      if (!cmaps.includes(colormap)) {
        colormap = 'actc'
      }
      overlayVolume.colormap = colormap
    }
    overlayVolume.opacity = opacitySlider1.value / 255
    await nv1.addVolume(overlayVolume)
  }
  async function reportTelemetry(statData) {
    if (typeof statData === 'string' || statData instanceof String) {
      function strToArray(str) {
        const list = JSON.parse(str)
        const array = []
        for (const key in list) {
            array[key] = list[key]
        }
        return array
      }
      statData = strToArray(statData)
    }
    statData = await localSystemDetails(statData, nv1.gl)
    diagnosticsString = ':: Diagnostics can help resolve issues https://github.com/neuroneural/brainchop/issues ::\n'
    for (var key in statData){
      diagnosticsString +=  key + ': ' + statData[key]+'\n'
    }
  }
  function callbackUI(message = "", progressFrac = -1, modalMessage = "", statData = []) {
    if (message !== "") {
      console.log(message)
      document.getElementById("location").innerHTML = message
    }
    if (isNaN(progressFrac)) { //memory issue
      memstatus.style.color = "red"
      memstatus.innerHTML = "Memory Issue"
    } else if (progressFrac >= 0) {
      modelProgress.value = progressFrac * modelProgress.max
    }
    if (modalMessage !== "") {
      window.alert(modalMessage)
    }
    if (Object.keys(statData).length > 0) {
      reportTelemetry(statData)
    }
  }
  function handleLocationChange(data) {
    document.getElementById("location").innerHTML = "&nbsp;&nbsp;" + data.string
  }
  let defaults = {
    backColor: [0.4, 0.4, 0.4, 1],
    show3Dcrosshair: true,
    onLocationChange: handleLocationChange,
  }
  createMeshBtn.onclick = function () {
    if (nv1.meshes.length > 0)
      nv1.removeMesh(nv1.meshes[0])
    if (nv1.volumes.length < 1) {
      window.alert("Image not loaded. Drag and drop an image.")
    } else {
      remeshDialog.show()
    }
  }
  applyBtn.onclick = async function () {
    const niiBuffer = await nv1.saveImage({volumeByIndex: nv1.volumes.length - 1}).buffer
    const niiBlob = new Blob([niiBuffer], { type: 'application/octet-stream' })
    const niiFile = new File([niiBlob], 'input.nii')
    // get an ImageProcessor instance from niimath
    // so we can build up the operations we want to perform
    // based on the UI controls
    let image = niimath.image(niiFile)
    loadingCircle.classList.remove('hidden')
    // initialize the operations object for the niimath mesh function
    let ops = {
      i: 0.5,
    }
    //const largestCheckValue = largestCheck.checked
    if (largestCheck.checked) {
      ops.l = 1
    }
    let reduce = Math.min(Math.max(Number(shrinkPct.value) / 100, 0.01), 1)
    ops.r = reduce
    if (bubbleCheck.checked) {
      ops.b = 1
    }

    let hollowInt = Number(hollowSelect.value )
    if (hollowInt < 0){
      // append the hollow operation to the image processor
      // but dont run it yet. 
      image = image.hollow(0.5, hollowInt)
    }

    let closeFloat = Number(closeMM.value)
    if ((isFinite(closeFloat)) && (closeFloat > 0)){
      // append the close operation to the image processor
      // but dont run it yet.
      image = image.close(0.5, closeFloat, 2 * closeFloat)
    }
    // add the mesh operations
    image = image.mesh(ops)
    console.log('niimath mesh operation', image.commands)
    // finally, run the full set of operations
    const outFile = await image.run('output.mz3')
    const arrayBuffer = await outFile.arrayBuffer()
    loadingCircle.classList.add('hidden')
    if (nv1.meshes.length > 0)
      nv1.removeMesh(nv1.meshes[0])
    await nv1.loadFromArrayBuffer(arrayBuffer, 'output.mz3')
    nv1.reverseFaces(0)
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
    let format = 'obj'
    if (formatSelect.selectedIndex === 0) {
      format = 'mz3'
    }
    if (formatSelect.selectedIndex === 2) {
      format = 'stl'
    }
    const scale = 1 / Number(scaleSelect.value)
    const pts = nv1.meshes[0].pts.slice()
    for (let i = 0; i < pts.length; i++)
      pts[i] *= scale;
    NVMeshUtilities.saveMesh(pts, nv1.meshes[0].tris, `mesh.${format}`, true)
  }

  var diagnosticsString = ''
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
  workerCheck.checked = await isChrome() //TODO: Safari does not yet support WebGL TFJS webworkers, test FireFox
  // uncomment next two lines to automatically run segmentation when web page is loaded
  //   modelSelect.selectedIndex = 11
  //   modelSelect.onchange()

}

main()
