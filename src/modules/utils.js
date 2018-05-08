
function convertPtToInch(pt) { return pt / 72; }
function convertInchToMM(inch) { return inch * 25.4; }
function convertPtToMM(pt) {
  return convertInchToMM(convertPtToInch(pt));
}
