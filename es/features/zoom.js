import { MODE_IDLE, MODE_ZOOMING } from '../constants';
import { set, getSVGPoint } from './common';
import { Matrix } from 'transformation-matrix-js';
import { calculateBox } from '../utils';

export function zoom(value, SVGPointX, SVGPointY, scaleFactor) {
  var a = value.a,
      b = value.b,
      c = value.c,
      d = value.d,
      e = value.e,
      f = value.f;

  var matrix = Matrix.from(a, b, c, d, e, f);

  var act = new Matrix();
  act = act.translate(SVGPointX, SVGPointY);
  act = act.scaleU(scaleFactor);
  act = act.translate(-SVGPointX, -SVGPointY);

  matrix = matrix.multiply(act);

  return set(value, {
    mode: MODE_IDLE,
    a: matrix.a,
    b: matrix.b,
    c: matrix.c,
    d: matrix.d,
    e: matrix.e,
    f: matrix.f,
    startX: null,
    startY: null,
    endX: null,
    endY: null
  });
}

export function fitSelection(value, selectionSVGPointX, selectionSVGPointY, selectionWidth, selectionHeight) {
  var viewerWidth = value.viewerWidth,
      viewerHeight = value.viewerHeight;


  var scaleX = viewerWidth / selectionWidth;
  var scaleY = viewerHeight / selectionHeight;

  var scale = Math.min(scaleX, scaleY);

  var matrix = new Matrix();
  matrix = matrix.scaleU(scale);
  matrix = matrix.translate(-selectionSVGPointX, -selectionSVGPointY);

  return set(value, {
    mode: MODE_IDLE,
    a: matrix.a,
    b: matrix.b,
    c: matrix.c,
    d: matrix.d,
    e: matrix.e,
    f: matrix.f,
    startX: null,
    startY: null,
    endX: null,
    endY: null
  });
}

export function fitToViewer(value) {
  return fitSelection(value, 0, 0, value.SVGWidth, value.SVGHeight);
}

export function zoomOnViewerCenter(value, scaleFactor) {
  var viewerWidth = value.viewerWidth,
      viewerHeight = value.viewerHeight;

  var SVGPoint = getSVGPoint(value, viewerWidth / 2, viewerHeight / 2);
  return zoom(value, SVGPoint.x, SVGPoint.y, scaleFactor);
}

export function startZooming(value, viewerX, viewerY) {
  return set(value, {
    mode: MODE_ZOOMING,
    startX: viewerX,
    startY: viewerY,
    endX: viewerX,
    endY: viewerY
  });
}

export function updateZooming(value, viewerX, viewerY) {
  if (value.mode !== MODE_ZOOMING) throw new Error('update selection not allowed in this mode ' + value.mode);

  return set(value, {
    endX: viewerX,
    endY: viewerY
  });
}

export function stopZooming(value, viewerX, viewerY, scaleFactor) {
  var startX = value.startX,
      startY = value.startY,
      endX = value.endX,
      endY = value.endY;


  var start = getSVGPoint(value, startX, startY);
  var end = getSVGPoint(value, endX, endY);

  if (Math.abs(startX - endX) > 7 && Math.abs(startY - endY) > 7) {
    var box = calculateBox(start, end);
    return fitSelection(value, box.x, box.y, box.width, box.height);
  } else {
    var SVGPoint = getSVGPoint(value, viewerX, viewerY);
    return zoom(value, SVGPoint.x, SVGPoint.y, scaleFactor);
  }
}