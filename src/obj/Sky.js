function round(f, n) {
  let s = Math.pow(10, n);
  return Math.round(s*f)/s;
}


export class SkySimulacrum {
}


// Return Cartesian Coordinates from Normalized Spherical [Theta,Fi]
function cartesian([r, theta, fi]) {
  return [
    round(r*Math.sin(theta)*Math.cos(fi), 3),
    round(r*Math.sin(theta)*Math.sin(fi), 3),
    round(r*Math.cos(theta), 3),
  ];
}


// Return a box
function _box([x, y, z], c) {
  let size = 0.3;
  let box = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size));
  let mat = new THREE.LineBasicMaterial({
    color: 0xDDDDDD,
    linewidth: 10,
  });
  return new THREE.LineSegments(box, mat);
}


// Return a line from origin to [x, y, z]
function _dir([x, y, z], c) {
  let g = new THREE.Geometry();
  g.vertices.push(new THREE.Vector3(-x, -y, -z));
  g.vertices.push(new THREE.Vector3(x, y, z));
  let m = new THREE.LineBasicMaterial({color: c, linewidth: 100});
  return new THREE.Line(g, m);
}

// Return a global at [x, y, z] of color {{c}} size {{size}}
function _globe([x, y, z], c, size) {
  size = size || 0.1;
  let g = new THREE.Mesh(
    new THREE.SphereGeometry(size, 20, 20),
    new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      color: c,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    }),
  );

  g.position.set(x, y, z);

  return g;
}

export class Sky {
  // Constructor
  constructor({size, sunPosition, simulacrum}) {
    this.size = size;
    this.demoSun = new THREE.Group();
    this.geo = this.geometry();
    this.mat = this.material();
    this.sky = new THREE.Group();
    this.sky.add(new THREE.Mesh(this.geo, this.mat));
    this.params = {
      'rot': 0.0,
    };

    if (simulacrum) {
      this.simulacrum = this.simulacrum(-1.0, 0, 0);
      this.simulacrum.group.position.set(-1.0, -1.0, -1.0);
      console.log("[SIMULACRUM] Added");
    }
  }

  globe() {
    let g = new THREE.Group();

    let axes = new THREE.Group();
    let l = 0.3;
    axes.add(_dir([l, 0, 0], 0xFF0000));
    axes.add(_dir([0, l, 0], 0x00FF00));
    axes.add(_dir([0, 0, l], 0x0000FF));
    axes.add(_globe([0, 0, 0], 0xCCCCCC));
    g.add(axes);

    return g;
  }

  // Return the simulacrum
  simulacrum(x, y, z) {
    let objects = {};

    let g = new THREE.Group();

    let size = 0.2;
    let mat = new THREE.MeshBasicMaterial({
      color: 0xDDDDDD,
      wireframe: true,
    });
    objects.sun = new THREE.Mesh(
      new THREE.IcosahedronGeometry(size/4.0),
      mat,
    );
    objects.world = this.globe();
    objects.stars = _box([0, 0, 0], 0xCCCCCC);
    let pos = cartesian([1.0, 0.0, 0.0]);
    objects.pos = _globe(pos, 0x00CCCC, 0.025);

    // objects.sun.position.set(0.0, 0.1, 1.0);

    objects.world.add(objects.pos);
    g.add(objects.world);
    g.add(objects.sun);
    g.add(objects.stars);

    return {
      group: g,
      objects: objects,
    };
  }

  geometry() {
    let size = this.size;
    let geo = new THREE.BoxGeometry(size, size, size, 1, 1, 1);
    return geo;
  }

  // Return material for
  material() {
    return new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: require('./shaders/sky.vert'),
      fragmentShader: require('./shaders/sky.frag'),
      side: THREE.DoubleSide,
      uniforms: {
        rayleigh: {value: 4.0},
        turbidity: {value: 4.9},
        mieDirectionalG: {value: 0.0},
        mieCoefficient: {value: 0.0},
        luminance: {value: 1.0},
        sunPosition: {value: this.demoSun.position},

        theta: {value: 0.3},
        size: {value: this.size},
      },
    });
  }

  setSunPosition(x, y, z) {
    this.demoSun.position.x = x;
    this.demoSun.position.y = y;
    this.demoSun.position.z = z;

    if (this.simulacrum) {
      let v = 1.0;
      let [j, k, l] = [v*x, v*y, v*z];
      this.simulacrum.objects.sun.position.set(j, k, l);
      let r = -20.0;
      this.simulacrum.objects.sun.rotation.set(r*j, r*k, r*l);
    }
  }

  set(params) {
    this.mat.uniforms.rayleigh.value = params.rayleigh || this.mat.uniforms.rayleigh.value;
    this.mat.uniforms.turbidity.value = params.turbidity || this.mat.uniforms.turbidity.value;
    this.mat.uniforms.luminance.value = params.luminance || this.mat.uniforms.luminance.value;
  }

  // t in [0, 1)
  setGlobeRotation(t) {
    this.params.rot = (t % 1.0)*2.0*Math.PI;
    if (this.simulacrum) {
      let axis = new THREE.Vector3(0.0, 1.0, 0.0);
      axis.normalize();
      this.simulacrum.objects.world.setRotationFromAxisAngle(
        axis,
        this.params.rot,
      );
    }
  }


  setGlobePosition(theta, fi) {
    if (this.simulacrum) {
      let [x, y, z] = cartesian([0.1, theta, fi]);
      this.simulacrum.objects.pos.position.set(x, y, z);
    }
  }
}