// Temporary local test entry: export this page from pages/__storage-check.js,
// visit affitalink-storage.localhost:7777/__storage-check, then remove the entry.
import { useState } from "react";
import * as workspace from "../../lib/client/browserWorkspace";
import { runBrowserStorageChecks, checkBrowserReload, cleanBrowserTestData } from "./browserStorageChecks";

export default function StorageCheckPage() {
  const [result, setResult] = useState("Storage checks: isolated test data only");
  async function run(check) {
    setResult("Running…");
    try { setResult(await check(workspace)); }
    catch (error) { setResult(`FAIL: ${error.message}`); }
  }
  return <main><h1>Step 3 storage checks</h1>
    <button onClick={() => run(runBrowserStorageChecks)}>Run storage checks</button>{" | "}
    <button onClick={() => run(checkBrowserReload)}>Check after reload</button>{" | "}
    <button onClick={() => run(cleanBrowserTestData)}>Clean test data</button>
    <pre role="status">{result}</pre>
  </main>;
}
