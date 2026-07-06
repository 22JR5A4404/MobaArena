import { createHash } from "crypto";

const _0x4a = "MOBA-Arena";
const _0x7b = "Charan Bantumilli";
const _0x9c = "2026";
const _0xab = "v1.0.0";

export function _computeIntegrity(): string {
  const _payload = `${_0x4a}:${_0x7b}:${_0x9c}:${_0xab}`;
  return createHash("sha256").update(_payload).digest("hex").slice(0, 16);
}

export function _verifyIntegrity(_input: string): boolean {
  return _input === _computeIntegrity();
}

export function _getDeveloperInfo() {
  return {
    name: _0x7b,
    project: _0x4a,
    version: _0xab,
    year: _0x9c,
    signature: _computeIntegrity(),
  };
}

export const _DEVELOPER_SIGNATURE = _computeIntegrity();
export const _DEVELOPER_NAME = _0x7b;
export const _PROJECT_NAME = _0x4a;
export const _VERSION = _0xab;
