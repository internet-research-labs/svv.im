/**
 * Construct a grid where xy-coordinates correspond to triangles instead of squares
 * --------------------------------------
 * \1,1 /\1,3 /\
 *  \  /  \  /  \
 *   \/1,2 \/1,4 \
 *  ---------------
 *   /\2,2 /\    /
 *  /  \  /  \  /
 *   2,1\/    \/
 *  ---------------
 */
function TriangleMesh(rad, props) {
  this.x = props.x || 0;
  this.y = props.y || 0;
  this.rad = rad;

  // This is probably rounded-off too much, and creating
  // a slight overlap along the edges of the triangles
  // TODO: Generalize this for a given theta
  this.dx = 1.73/2. * this.rad;
  this.dy = this.rad/2.;

  // Finally
  this.grid = [];
  this.setup();
}

/**
 * Return the xy-coordinate
 */
TriangleMesh.prototype.getCenter = function (i, j) {
  var row = Math.floor(i / 2);
  var x = j * this.dx;
  var y = (4*i-2*row) * this.dy;

  if (i % 2 == 0 && j % 2 == 0) {
    y += this.dy;
  } else if (j % 2 == 0) {
    y -= this.dy;
  }

  return {
    'x': Math.round(x),
    'y': Math.round(y),
  };
};

/**
 * Return the xy-coordinate
 */
TriangleMesh.prototype.getPoints = function (i, j) {
  var row = Math.floor(i / 2);
  var x = j * this.dx;
  var y = (4*i-2*row) * this.dy;

  if (i % 2 == 0 && j % 2 == 0) {
    y += this.dy;
  } else if (j % 2 == 0) {
    y -= this.dy;
  }

  return {
    'x': Math.round(x),
    'y': Math.round(y),
  };
};

/**
 * Return the xy-coordinate
 */
TriangleMesh.prototype.getBoundingBox = function (i, j) {
  var row = Math.floor(i / 2);
  var x = j * this.dx;
  var y = (4*i-2*row) * this.dy;

  if (i % 2 == 0 && j % 2 == 0) {
    y += this.dy;
  } else if (j % 2 == 0) {
    y -= this.dy;
  }

  return {
    'x': Math.round(x),
    'y': Math.round(y),
  };
};

TriangleMesh.prototype.setup = function () {
  img = this.image;
  this.grid = [];

  for (var i=0; i < 20; i++) {
    for (var j=0; j < 20; j++) {
      var sig = (i+j) % 2 ? 1 : -1;
      var theta = sig * Math.PI/2.;
      var p = this.get(i, j);
      this.grid.push(new TriangleClip(p.x, p.y, this.rad, img, 'black', theta));
    }
  }

}

TriangleMesh.prototype.draw = function (ctx) {
  var self = this;
  ctx.save();
    self.grid.forEach(function (tri, i) {
      tri.draw(ctx);
    });
  ctx.restore();
}
