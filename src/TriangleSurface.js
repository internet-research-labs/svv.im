import TriangleMesh from './TriangleMesh.js';
import {sub, cross, normalize} from './math3.js';

/**
 * Construct a surface with a triangular mesh
 * [x, y, f(x, y)], where x,y in set of triangular points
 *
 */
export default class TriangleSurface {
  constructor(f, radius, width, height) {
    this.f = f;
    this.mesh = new TriangleMesh(radius);
  }

  vector(v) {
    return [v.x, this.f(v.x, v.y), v.y];
  }

  build() {

    let k = 0;
    let f = this.f;
    let geo = new THREE.Geometry();

    for (let i=-50; i < 50; i++) {
      for (let j=-50; j < 50; j++) {

        let [a, b, c] = this.mesh.get(i, j).getPointList();

        let pointList = this.mesh.get(i, j).getPointList();

        let u = sub(this.vector(pointList[0]), this.vector(pointList[1]));
        let v = sub(this.vector(pointList[1]), this.vector(pointList[2]));
        let n = cross(u, v);
        let n_vec = new THREE.Vector3(n[0], n[1], n[2]);

        pointList.forEach(function (t) {
          geo.vertices.push(new THREE.Vector3(t.x, f(t.x, t.y), t.y));
        });

        geo.faces.push(new THREE.Face3(k+0, k+1, k+2, n_vec));

        k += 3;
      }
    }

    return geo;
  }
}