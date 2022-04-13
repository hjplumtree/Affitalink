export default function encodeToTokenkey(id, secret) {
  return Buffer.from(`${id}:${secret}`).toString("base64");
}
