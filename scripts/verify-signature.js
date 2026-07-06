const { createHash } = require("crypto");
const fs = require("fs");
const path = require("path");

const _0x4a = "MOBA-Arena";
const _0x7b = "Charan Bantumilli";
const _0x9c = "2026";
const _0xab = "v1.0.0";

function _compute() {
  return createHash("sha256").update(`${_0x4a}:${_0x7b}:${_0x9c}:${_0xab}`).digest("hex").slice(0, 16);
}

function _check() {
  const sig = _compute();

  const layoutPath = path.join(__dirname, "../src/app/layout.tsx");
  const layout = fs.readFileSync(layoutPath, "utf-8");
  if (!layout.includes("_DEVELOPER_SIGNATURE") || !layout.includes("_verifyIntegrity")) {
    console.error("\x1b[31m%s\x1b[0m", "INTEGRITY CHECK FAILED: layout.tsx signature references missing");
    process.exit(1);
  }

  const sigPath = path.join(__dirname, "../src/lib/x3.ts");
  const sigFile = fs.readFileSync(sigPath, "utf-8");
  if (!sigFile.includes("Charan Bantumilli") || !sigFile.includes("MOBA-Arena")) {
    console.error("\x1b[31m%s\x1b[0m", "INTEGRITY CHECK FAILED: x3.ts tampered");
    process.exit(1);
  }
  if (!sigFile.includes("_computeIntegrity") || !sigFile.includes("_verifyIntegrity")) {
    console.error("\x1b[31m%s\x1b[0m", "INTEGRITY CHECK FAILED: x3.ts functions removed");
    process.exit(1);
  }

  const proxyPath = path.join(__dirname, "../src/proxy.ts");
  const proxy = fs.readFileSync(proxyPath, "utf-8");
  if (!proxy.includes("_verifyIntegrity")) {
    console.error("\x1b[31m%s\x1b[0m", "INTEGRITY CHECK FAILED: proxy.ts verification removed");
    process.exit(1);
  }

  const adminPath = path.join(__dirname, "../src/app/admin/actions.ts");
  const admin = fs.readFileSync(adminPath, "utf-8");
  if (!admin.includes("_verifyIntegrity")) {
    console.error("\x1b[31m%s\x1b[0m", "INTEGRITY CHECK FAILED: admin/actions.ts verification removed");
    process.exit(1);
  }

  const userPath = path.join(__dirname, "../src/app/user/actions.ts");
  const user = fs.readFileSync(userPath, "utf-8");
  if (!user.includes("_verifyIntegrity")) {
    console.error("\x1b[31m%s\x1b[0m", "INTEGRITY CHECK FAILED: user/actions.ts verification removed");
    process.exit(1);
  }

  const devPath = path.join(__dirname, "../src/components/Ds7f.tsx");
  const dev = fs.readFileSync(devPath, "utf-8");
  if (!dev.includes("_DEVELOPER_SIGNATURE") || !dev.includes("_DEVELOPER_NAME")) {
    console.error("\x1b[31m%s\x1b[0m", "INTEGRITY CHECK FAILED: Ds7f.tsx tampered");
    process.exit(1);
  }

  const adminUsersPath = path.join(__dirname, "../src/app/admin/users/actions.ts");
  const adminUsers = fs.readFileSync(adminUsersPath, "utf-8");
  if (!adminUsers.includes("_verifyIntegrity")) {
    console.error("\x1b[31m%s\x1b[0m", "INTEGRITY CHECK FAILED: admin/users/actions.ts verification removed");
    process.exit(1);
  }

  const regPath = path.join(__dirname, "../src/app/admin/registrations/actions.ts");
  const reg = fs.readFileSync(regPath, "utf-8");
  if (!reg.includes("_verifyIntegrity")) {
    console.error("\x1b[31m%s\x1b[0m", "INTEGRITY CHECK FAILED: admin/registrations/actions.ts verification removed");
    process.exit(1);
  }

  console.log("\x1b[32m%s\x1b[0m", `INTEGRITY VERIFIED [${sig}] - All checks passed`);
}

_check();
