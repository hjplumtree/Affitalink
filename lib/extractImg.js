export default function extractImg(str) {
  const extract = str.match(/src="(.*?)"/)[1];
  return extract;
}
