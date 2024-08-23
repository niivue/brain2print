# brain2print

This is an extension of [brainchop](https://github.com/neuroneural/brainchop) that converts voxel-based MRI scans to 3D meshes that can be printed. No data is sent to a server. *Everything* happens in your browser window, on *your* machine. 

![image of web page](brain2print.png)

## Usage

1. Open the [live demo](https://niivue.github.io/brain2print/).
2. **Option 1** The web page automatically loads with a default T1 MRI scan. If you want to use this scan, go to step 5.
3. **Option 2** If your T1 MRI scan is in NIfTI format, drag and drop the file onto the web page.
4. **Option 3** If your image is in DICOM format, it may load if you drag and drop the files. If this fails, convert your images with dcm2niix.
5. Segment your brain scan by choosing a model from the `Segmentation Model` pull-down menu. Not all models with with all graphics cards. The `Tissue GWM (High Acc, Low Mem)` is a good starting point. Hopefully, it will accurately segment your brain into gray matter, white matter and cerebral spinal fluid.
6. Press the `Create Mesh` button and select your preferred settings:

  - ![settings dialog](Settings.png)

  - [Closing](https://en.wikipedia.org/wiki/Closing_(morphology)) removes small crevices and cavities in your mesh which can plague printing.
  - Fill bubbles will remove any cavities, this includes large cavities for example the ventricles for a brain scan.
  - The `Largest cluster only` will only extract a single mesh.
  - You can choose `Smoothing` to make the surfaces less jagged (note this can create self intersecting triangles that can confound some printers).
  - You can choose to `Simplify` [reduce the number of triangles](https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification) to create smaller files (note this can create self intersecting triangles that can confound some printers).
7. Once you have set your preferences, press `Apply`.
8. You will see the mesh appear and can interactively view it. If you are unhappy with the result, repeat step 6 with different settings. If you want to print the results, press the `Save Mesh` button.

## How it Works

This web application uses some of the latest browser technologies that allow the tissue segmentation model to run on your local GPU, regardless of the type of GPU. This is possible via the `WebGPU` browser API. Additionally, we leverage `WebAssembly` to run the `niimath` [WASM wrapper](https://www.npmjs.com/package/@niivue/niimath) to turn the tissue segmentation into a 3D mesh. No data ever leaves your machine.

### Developers - Running a Local Live Demo

```bash
git clone git@github.com:niivue/brain2print.git
cd brain2print
npm install
npm run dev
```


### Developers - Building the Web Page

```bash
npm run build
```


