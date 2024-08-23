// src/niimathOperators.json
var niimathOperators_default = {
  bptfm: {
    args: [
      "hp",
      "lp"
    ],
    help: "Same as bptf but does not remove mean (emulates fslmaths < 5.0.7)"
  },
  bwlabel: {
    args: [
      "conn"
    ],
    help: "Connected component labelling for non-zero voxels (conn sets neighbors: 6, 18, 26)"
  },
  c2h: {
    args: [],
    help: "reverse h2c transform"
  },
  ceil: {
    args: [],
    help: "round voxels upwards to the nearest integer"
  },
  conform: {
    args: [],
    help: "reslice to 1mm size in coronal slice direction with 256^3 voxels"
  },
  crop: {
    args: [
      "tmin",
      "tsize"
    ],
    help: "remove volumes, starts with 0 not 1! Inputting -1 for a size will set it to the full range"
  },
  dehaze: {
    args: [
      "mode"
    ],
    help: "set dark voxels to zero (mode 1..5; higher yields more surviving voxels)"
  },
  detrend: {
    args: [],
    help: "remove linear trend (and mean) from input"
  },
  demean: {
    args: [],
    help: "remove average signal across volumes (requires 4D input)"
  },
  edt: {
    args: [],
    help: "estimate Euler Distance Transform (distance field). Assumes isotropic input"
  },
  close: {
    args: [
      "thr",
      "dx1",
      "dx2"
    ],
    help: "morphological close that binarizes with `thr`, dilates with `dx1` and erodes with `dx2` (fills bubbles with `thr`)"
  },
  floor: {
    args: [],
    help: "round voxels downwards to the nearest integer"
  },
  h2c: {
    args: [],
    help: "convert CT scans from 'Hounsfield' to 'Cormack' units to emphasize soft tissue contrast"
  },
  mesh: {
    args: [],
    help: "meshify requires 'd'ark, 'm'edium, 'b'right or numeric isosurface ('niimath bet -mesh -i d mesh.gii')",
    subOperations: {
      i: {
        args: [
          "isovalue"
        ],
        help: "'d'ark, 'm'edium, 'b'right or numeric isosurface"
      },
      a: {
        args: [
          "atlasFile"
        ],
        help: "roi based atlas to mesh"
      },
      b: {
        args: [
          "fillBubbles"
        ],
        help: "fill bubbles"
      },
      l: {
        args: [
          "onlyLargest"
        ],
        help: "only largest"
      },
      o: {
        args: [
          "originalMC"
        ],
        help: "original marching cubes"
      },
      q: {
        args: [
          "quality"
        ],
        help: "quality"
      },
      s: {
        args: [
          "postSmooth"
        ],
        help: "post smooth"
      },
      r: {
        args: [
          "reduceFraction"
        ],
        help: "reduce fraction"
      },
      v: {
        args: [
          "verbose"
        ],
        help: "verbose"
      }
    }
  },
  hollow: {
    args: [
      "threshold",
      "thickness"
    ],
    help: "hollow out a mesh"
  },
  mod: {
    args: [],
    help: "modulus fractional remainder - same as '-rem' but includes fractions"
  },
  otsu: {
    args: [
      "mode"
    ],
    help: "binarize image using Otsu's method (mode 1..5; higher yields more bright voxels)"
  },
  power: {
    args: [
      "exponent"
    ],
    help: "raise the current image by following exponent"
  },
  qform: {
    args: [
      "code"
    ],
    help: "set qform_code"
  },
  sform: {
    args: [
      "code"
    ],
    help: "set sform_code"
  },
  p: {
    args: [
      "threads"
    ],
    help: "set maximum number of parallel threads. DISABLED: recompile for OpenMP support"
  },
  resize: {
    args: [
      "X",
      "Y",
      "Z",
      "m"
    ],
    help: "grow (>1) or shrink (<1) image. Method <m> (0=nearest,1=linear,2=spline,3=Lanczos,4=Mitchell)"
  },
  round: {
    args: [],
    help: "round voxels to the nearest integer"
  },
  sobel: {
    args: [],
    help: "fast edge detection"
  },
  sobel_binary: {
    args: [],
    help: "sobel creating binary edge"
  },
  tensor_2lower: {
    args: [],
    help: "convert FSL style upper triangle image to NIfTI standard lower triangle order"
  },
  tensor_2upper: {
    args: [],
    help: "convert NIfTI standard lower triangle image to FSL style upper triangle order"
  },
  tensor_decomp_lower: {
    args: [],
    help: "as tensor_decomp except input stores lower diagonal (AFNI, ANTS, Camino convention)"
  },
  trunc: {
    args: [],
    help: "truncates the decimal value from floating point value and returns integer value"
  },
  unsharp: {
    args: [
      "sigma",
      "scl"
    ],
    help: "edge enhancing unsharp mask (sigma in mm, not voxels; 1.0 is typical)"
  },
  dog: {
    args: [
      "sPos",
      "sNeg"
    ],
    help: "difference of gaussian with zero-crossing edges (positive and negative sigma mm)"
  },
  dogr: {
    args: [
      "sPos",
      "sNeg"
    ],
    help: "as dog, without zero-crossing (raw rather than binarized data)"
  },
  dogx: {
    args: [
      "sPos",
      "sNeg"
    ],
    help: "as dog, zero-crossing for 2D sagittal slices"
  },
  dogy: {
    args: [
      "sPos",
      "sNeg"
    ],
    help: "as dog, zero-crossing for 2D coronal slices"
  },
  dogz: {
    args: [
      "sPos",
      "sNeg"
    ],
    help: "as dog, zero-crossing for 2D axial slices"
  },
  add: {
    args: [
      "input"
    ],
    help: "add following input to current image"
  },
  sub: {
    args: [
      "input"
    ],
    help: "subtract following input from current image"
  },
  mul: {
    args: [
      "input"
    ],
    help: "multiply current image by following input"
  },
  div: {
    args: [
      "input"
    ],
    help: "divide current image by following input"
  },
  rem: {
    args: [
      "number"
    ],
    help: "modulus remainder - divide current image by following input and take remainder"
  },
  mas: {
    args: [
      "file"
    ],
    help: "use (following image>0) to mask current image"
  },
  thr: {
    args: [
      "number"
    ],
    help: "use following number to threshold current image (zero anything below the number)"
  },
  thrp: {
    args: [
      "input"
    ],
    help: "use following percentage (0-100) of ROBUST RANGE to threshold current image (zero anything below the number)"
  },
  thrP: {
    args: [
      "input"
    ],
    help: "use following percentage (0-100) of ROBUST RANGE of non-zero voxels and threshold below"
  },
  uthr: {
    args: [
      "number"
    ],
    help: "use following number to upper-threshold current image (zero anything above the number)"
  },
  uthrp: {
    args: [
      "input"
    ],
    help: "use following percentage (0-100) of ROBUST RANGE to upper-threshold current image (zero anything above the number)"
  },
  uthrP: {
    args: [
      "input"
    ],
    help: "use following percentage (0-100) of ROBUST RANGE of non-zero voxels and threshold above"
  },
  clamp: {
    args: [
      "input"
    ],
    help: "use following percentage (0-100) of ROBUST RANGE to threshold current image (anything below set to this threshold)"
  },
  uclamp: {
    args: [
      "input"
    ],
    help: "use following percentage (0-100) of ROBUST RANGE to threshold current image (anything above set to this threshold)"
  },
  max: {
    args: [
      "input"
    ],
    help: "take maximum of following input and current image"
  },
  min: {
    args: [
      "input"
    ],
    help: "take minimum of following input and current image"
  },
  seed: {
    args: [
      "number"
    ],
    help: "seed random number generator with following number"
  },
  restart: {
    args: [
      "file"
    ],
    help: "replace the current image with input for future processing operations"
  },
  save: {
    args: [],
    help: "save the current working image to the input filename"
  },
  inm: {
    args: [
      "mean"
    ],
    help: "(-i i ip.c) intensity normalisation (per 3D volume mean)"
  },
  ing: {
    args: [
      "mean"
    ],
    help: "(-I i ip.c) intensity normalisation, global 4D mean)"
  },
  s: {
    args: [
      "sigma"
    ],
    help: "create a gauss kernel of sigma mm and perform mean filtering"
  },
  exp: {
    args: [],
    help: "exponential"
  },
  log: {
    args: [],
    help: "natural logarithm"
  },
  sin: {
    args: [],
    help: "sine function"
  },
  cos: {
    args: [],
    help: "cosine function"
  },
  tan: {
    args: [],
    help: "tangent function"
  },
  asin: {
    args: [],
    help: "arc sine function"
  },
  acos: {
    args: [],
    help: "arc cosine function"
  },
  atan: {
    args: [],
    help: "arc tangent function"
  },
  sqr: {
    args: [],
    help: "square"
  },
  sqrt: {
    args: [],
    help: "square root"
  },
  recip: {
    args: [],
    help: "reciprocal (1/current image)"
  },
  abs: {
    args: [],
    help: "absolute value"
  },
  bin: {
    args: [],
    help: "use (current image>0) to binarise"
  },
  binv: {
    args: [],
    help: "binarise and invert (binarisation and logical inversion)"
  },
  fillh: {
    args: [],
    help: "fill holes in a binary mask (holes are internal - i.e. do not touch the edge of the FOV)"
  },
  fillh26: {
    args: [],
    help: "fill holes using 26 connectivity"
  },
  index: {
    args: [],
    help: "replace each nonzero voxel with a unique (subject to wrapping) index number"
  },
  grid: {
    args: [
      "value",
      "spacing"
    ],
    help: "add a 3D grid of intensity <value> with grid spacing <spacing>"
  },
  edge: {
    args: [],
    help: "edge strength"
  },
  tfce: {
    args: [
      "H",
      "E",
      "connectivity"
    ],
    help: "enhance with TFCE, e.g. -tfce 2 0.5 6 (maybe change 6 to 26 for skeletons)"
  },
  tfceS: {
    args: [
      "H",
      "E",
      "connectivity",
      "X",
      "Y",
      "Z",
      "tfce_thresh"
    ],
    help: "show support area for voxel (X,Y,Z)"
  },
  nan: {
    args: [],
    help: "replace NaNs (improper numbers) with 0"
  },
  nanm: {
    args: [],
    help: "make NaN (improper number) mask with 1 for NaN voxels, 0 otherwise"
  },
  rand: {
    args: [],
    help: "add uniform noise (range 0:1)"
  },
  randn: {
    args: [],
    help: "add Gaussian noise (mean=0 sigma=1)"
  },
  range: {
    args: [],
    help: "set the output calmin/max to full data range"
  },
  tensor_decomp: {
    args: [],
    help: "convert a 4D (6-timepoint )tensor image into L1,2,3,FA,MD,MO,V1,2,3 (remaining image in pipeline is FA)"
  },
  kernel: {
    subOperations: {
      "3D": {
        args: [],
        help: "3x3x3 box centered on target voxel (set as default kernel)"
      },
      "2D": {
        args: [],
        help: "3x3x1 box centered on target voxel"
      },
      box: {
        args: [
          "size"
        ],
        help: "all voxels in a cube of width <size> mm centered on target voxel"
      },
      boxv: {
        args: [
          "size"
        ],
        help: "all voxels in a cube of width <size> voxels centered on target voxel, CAUTION: size should be an odd number"
      },
      boxv3: {
        args: [
          "X",
          "Y",
          "Z"
        ],
        help: "all voxels in a cuboid of dimensions X x Y x Z centered on target voxel, CAUTION: size should be an odd number"
      },
      gauss: {
        args: [
          "sigma"
        ],
        help: "gaussian kernel (sigma in mm, not voxels)"
      },
      sphere: {
        args: [
          "size"
        ],
        help: "all voxels in a sphere of radius <size> mm centered on target voxel"
      },
      file: {
        args: [
          "filename"
        ],
        help: "use external file as kernel"
      }
    }
  },
  dilM: {
    args: [],
    help: "Mean Dilation of non-zero voxels"
  },
  dilD: {
    args: [],
    help: "Maximum Dilation of non-zero voxels (emulating output of fslmaths 6.0.1, max not modal)"
  },
  dilF: {
    args: [],
    help: "Maximum filtering of all voxels"
  },
  dilall: {
    args: [],
    help: "Apply -dilM repeatedly until the entire FOV is covered"
  },
  ero: {
    args: [],
    help: "Erode by zeroing non-zero voxels when zero voxels found in kernel"
  },
  eroF: {
    args: [],
    help: "Minimum filtering of all voxels"
  },
  fmedian: {
    args: [],
    help: "Median Filtering"
  },
  fmean: {
    args: [],
    help: "Mean filtering, kernel weighted (conventionally used with gauss kernel)"
  },
  fmeanu: {
    args: [],
    help: "Mean filtering, kernel weighted, un-normalized (gives edge effects)"
  },
  subsamp2: {
    args: [],
    help: "downsamples image by a factor of 2 (keeping new voxels centered on old)"
  },
  subsamp2offc: {
    args: [],
    help: "downsamples image by a factor of 2 (non-centered)"
  },
  Tmean: {
    args: [],
    help: "mean across time"
  },
  Tstd: {
    args: [],
    help: "standard deviation across time"
  },
  Tmax: {
    args: [],
    help: "max across time"
  },
  Tmaxn: {
    args: [],
    help: "time index of max across time"
  },
  Tmin: {
    args: [],
    help: "min across time"
  },
  Tmedian: {
    args: [],
    help: "median across time"
  },
  Tperc: {
    args: [
      "percentage"
    ],
    help: "nth percentile (0-100) of FULL RANGE across time"
  },
  Tar1: {
    args: [],
    help: "temporal AR(1) coefficient (use -odt float and probably demean first)"
  },
  pval: {
    args: [],
    help: "Nonparametric uncorrected P-value, assuming timepoints are the permutations; first timepoint is actual (unpermuted) stats image"
  },
  pval0: {
    args: [],
    help: "Same as -pval, but treat zeros as missing data"
  },
  cpval: {
    args: [],
    help: "Same as -pval, but gives FWE corrected P-values"
  },
  ztop: {
    args: [],
    help: "Convert Z-stat to (uncorrected) P"
  },
  ptoz: {
    args: [],
    help: "Convert (uncorrected) P to Z"
  },
  ztopc: {
    args: [],
    help: "Convert Z-stat to (uncorrected but clamped) P"
  },
  ptozc: {
    args: [],
    help: "Convert (uncorrected but clamped) P to Z"
  },
  rank: {
    args: [],
    help: "Convert data to ranks (over T dim)"
  },
  ranknorm: {
    args: [],
    help: "Transform to Normal dist via ranks"
  },
  roi: {
    args: [
      "xmin",
      "xsize",
      "ymin",
      "ysize",
      "zmin",
      "zsize",
      "tmin",
      "tsize"
    ],
    help: "zero outside roi (using voxel coordinates). Inputting -1 for a size will set it to the full image extent for that dimension"
  },
  bptf: {
    args: [
      "hp_sigma",
      "lp_sigma"
    ],
    help: "(-t in ip.c) Bandpass temporal filtering; nonlinear highpass and Gaussian linear lowpass (with sigmas in volumes, not seconds); set either sigma<0 to skip that filter"
  },
  roc: {
    args: [
      "AROC-thresh",
      "outfile",
      "truth"
    ],
    help: "take (normally binary) truth and test current image in ROC analysis against truth. <AROC-thresh> is usually 0.05 and is limit of Area-under-ROC measure FP axis. <outfile> is a text file of the ROC curve (triplets of values: FP TP threshold). If the truth image contains negative voxels these get excluded from all calculations. If <AROC-thresh> is positive then the [4Dnoiseonly] option needs to be set, and the FP rate is determined from this noise-only data, and is set to be the fraction of timepoints where any FP (anywhere) is seen, as found in the noise-only 4d-dataset. This is then controlling the FWE rate. If <AROC-thresh> is negative the FP rate is calculated from the zero-value parts of the <truth> image, this time averaging voxelwise FP rate over all timepoints. In both cases the TP rate is the average fraction of truth=positive voxels correctly found"
  }
};

// src/index.js
var Niimath = class {
  constructor() {
    this.worker = null;
    this.operators = niimathOperators_default;
  }
  init() {
    this.worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (event) => {
        if (event.data && event.data.type === "ready") {
          resolve(true);
        }
      };
      this.worker.onerror = (error) => {
        reject(new Error(`Worker failed to load: ${error.message}`));
      };
    });
  }
  image(file) {
    return new ImageProcessor({ worker: this.worker, file, operators: this.operators });
  }
};
var ImageProcessor = class {
  constructor({ worker, file, operators }) {
    this.worker = worker;
    this.file = file;
    this.operators = operators;
    this.commands = [];
    this._generateMethods();
  }
  _addCommand(cmd, ...args) {
    this.commands.push(cmd, ...args.map(String));
    return this;
  }
  _generateMethods() {
    Object.keys(this.operators).forEach((methodName) => {
      const definition = this.operators[methodName];
      if (methodName === "kernel") {
        Object.keys(definition.subOperations).forEach((subOpName) => {
          const subOpDefinition = definition.subOperations[subOpName];
          this[`kernel${subOpName.charAt(0).toUpperCase() + subOpName.slice(1)}`] = (...args) => {
            if (args.length !== subOpDefinition.args.length) {
              throw new Error(`Expected ${subOpDefinition.args.length} arguments for kernel ${subOpName}, but got ${args.length}`);
            }
            return this._addCommand("-kernel", subOpName, ...args);
          };
        });
      } else if (methodName === "mesh") {
        this.mesh = (options = {}) => {
          const subCommands = [];
          Object.keys(options).forEach((subOptionKey) => {
            if (definition.subOperations[subOptionKey]) {
              const subOpDefinition = definition.subOperations[subOptionKey];
              const subOptionValue = options[subOptionKey];
              if (subOpDefinition.args.length > 0 && subOptionValue === void 0) {
                throw new Error(`Sub-option -${subOptionKey} requires a value.`);
              }
              subCommands.push(`-${subOptionKey}`);
              if (subOpDefinition.args.length > 0) {
                subCommands.push(subOptionValue);
              }
            } else {
              throw new Error(`Invalid sub-option -${subOptionKey} for mesh.`);
            }
          });
          return this._addCommand("-mesh", ...subCommands);
        };
      } else {
        this[methodName] = (...args) => {
          if (args.length < definition.args.length || !definition.optional && args.length > definition.args.length) {
            throw new Error(`Expected ${definition.args.length} arguments for ${methodName}, but got ${args.length}`);
          }
          return this._addCommand(`-${methodName}`, ...args);
        };
      }
    });
  }
  async run(outName = "output.nii") {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        if (e.data.type === "error") {
          reject(new Error(e.data.message));
        } else {
          const { blob, exitCode } = e.data;
          if (exitCode === 0) {
            resolve(blob);
          } else {
            reject(new Error(`niimath processing failed with exit code ${exitCode}`));
          }
        }
      };
      const args = [this.file.name, ...this.commands, outName];
      if (this.worker === null) {
        reject(new Error("Worker not initialized. Did you await the init() method?"));
      }
      this.worker.postMessage({ blob: this.file, cmd: args, outName });
    });
  }
};
export {
  Niimath
};
