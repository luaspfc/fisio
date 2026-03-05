import { describe, expect, it } from "vitest";
import { encryptData, decryptData, hashData, verifyHash } from "./encryption";

describe("Encryption Helper", () => {
  it("should encrypt and decrypt data correctly", () => {
    const plaintext = "Diagnóstico: Tendinite do manguito rotador";
    const encrypted = encryptData(plaintext);

    expect(encrypted).not.toBe(plaintext);
    expect(encrypted.length).toBeGreaterThan(0);

    const decrypted = decryptData(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should produce different ciphertexts for same plaintext (due to random IV)", () => {
    const plaintext = "Plano terapêutico: 3x por semana";
    const encrypted1 = encryptData(plaintext);
    const encrypted2 = encryptData(plaintext);

    expect(encrypted1).not.toBe(encrypted2);
    expect(decryptData(encrypted1)).toBe(plaintext);
    expect(decryptData(encrypted2)).toBe(plaintext);
  });

  it("should hash data consistently", () => {
    const data = "12345678900";
    const hash1 = hashData(data);
    const hash2 = hashData(data);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 produces 64 hex characters
  });

  it("should verify hashed data correctly", () => {
    const data = "CREFITO123456";
    const hash = hashData(data);

    expect(verifyHash(data, hash)).toBe(true);
    expect(verifyHash("CREFITO654321", hash)).toBe(false);
  });

  it("should handle empty strings", () => {
    const plaintext = "";
    const encrypted = encryptData(plaintext);
    const decrypted = decryptData(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it("should handle special characters and unicode", () => {
    const plaintext = "Observações: Paciente com dor aguda. Recomendação: repouso 48h. Próxima sessão: 2024-01-25 às 14:30";
    const encrypted = encryptData(plaintext);
    const decrypted = decryptData(encrypted);

    expect(decrypted).toBe(plaintext);
  });

  it("should throw error on invalid encrypted data", () => {
    const invalidEncrypted = "invalid-base64-data";

    expect(() => {
      decryptData(invalidEncrypted);
    }).toThrow();
  });
});
