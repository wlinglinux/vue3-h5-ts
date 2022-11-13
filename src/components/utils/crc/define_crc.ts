export default function(model: string, calc: any) {
  const fn = (buf, previous) => calc(buf, previous) >>> 0;
  fn.signed = calc;
  fn.unsigned = fn;
  fn.model = model;

  return fn;
}
