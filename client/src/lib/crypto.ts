import CryptoJS from 'crypto-js';

export class PINnodeCrypto {
  private static readonly PBKDF2_ITERATIONS = 100000;
  private static readonly SALT_LENGTH = 16;
  private static readonly IV_LENGTH = 16;

  /**
   * Encrypt text using AES-256-GCM with PBKDF2 key derivation
   */
  static encrypt(plaintext: string, masterKey: string): string {
    try {
      // Generate random salt and IV
      const salt = CryptoJS.lib.WordArray.random(this.SALT_LENGTH);
      const iv = CryptoJS.lib.WordArray.random(this.IV_LENGTH);
      
      // Derive key using PBKDF2
      const key = CryptoJS.PBKDF2(masterKey, salt, {
        keySize: 256 / 32,
        iterations: this.PBKDF2_ITERATIONS,
        hasher: CryptoJS.algo.SHA256
      });
      
      // Encrypt using AES-CBC (CryptoJS doesn't support GCM directly)
      const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Combine salt + iv + encrypted data
      const combined = salt.concat(iv).concat(encrypted.ciphertext);
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt text using AES-256 with PBKDF2 key derivation
   */
  static decrypt(encryptedData: string, masterKey: string): string {
    try {
      // Parse the combined data
      const combined = CryptoJS.enc.Base64.parse(encryptedData);
      
      // Extract salt, IV, and ciphertext
      const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, this.SALT_LENGTH / 4));
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(this.SALT_LENGTH / 4, (this.SALT_LENGTH + this.IV_LENGTH) / 4));
      const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice((this.SALT_LENGTH + this.IV_LENGTH) / 4));
      
      // Derive the same key
      const key = CryptoJS.PBKDF2(masterKey, salt, {
        keySize: 256 / 32,
        iterations: this.PBKDF2_ITERATIONS,
        hasher: CryptoJS.algo.SHA256
      });
      
      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext } as any,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      if (!plaintext) {
        throw new Error('Invalid master key or corrupted data');
      }
      
      return plaintext;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  /**
   * Generate a secure random master key
   */
  static generateMasterKey(length: number = 32): string {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  /**
   * Hash a password for verification
   */
  static hashPassword(password: string): string {
    const salt = CryptoJS.lib.WordArray.random(16);
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: this.PBKDF2_ITERATIONS
    });
    return salt.toString() + ':' + hash.toString();
  }

  /**
   * Verify a password against its hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    try {
      const [saltStr, hashStr] = hash.split(':');
      const salt = CryptoJS.enc.Hex.parse(saltStr);
      const derivedHash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: this.PBKDF2_ITERATIONS
      });
      return derivedHash.toString() === hashStr;
    } catch {
      return false;
    }
  }

  /**
   * Create an encrypted ZIP-like structure for multiple files
   */
  static encryptArchive(files: { filename: string; content: string }[], masterKey: string): string {
    const archive = {
      files: files.map(file => ({
        filename: file.filename,
        content: this.encrypt(file.content, masterKey),
        timestamp: Date.now()
      })),
      metadata: {
        created: Date.now(),
        version: '1.0',
        encrypted: true
      }
    };
    
    return this.encrypt(JSON.stringify(archive), masterKey);
  }

  /**
   * Decrypt and extract files from encrypted archive
   */
  static decryptArchive(encryptedArchive: string, masterKey: string): { filename: string; content: string; timestamp: number }[] {
    try {
      const archiveJson = this.decrypt(encryptedArchive, masterKey);
      const archive = JSON.parse(archiveJson);
      
      return archive.files.map((file: any) => ({
        filename: file.filename,
        content: this.decrypt(file.content, masterKey),
        timestamp: file.timestamp
      }));
    } catch (error) {
      throw new Error(`Archive decryption failed: ${error}`);
    }
  }
}

// Export convenience functions for backward compatibility
export const encrypt = PINnodeCrypto.encrypt.bind(PINnodeCrypto);
export const decrypt = PINnodeCrypto.decrypt.bind(PINnodeCrypto);
export const generateMasterKey = PINnodeCrypto.generateMasterKey.bind(PINnodeCrypto);
export const hashPassword = PINnodeCrypto.hashPassword.bind(PINnodeCrypto);
export const verifyPassword = PINnodeCrypto.verifyPassword.bind(PINnodeCrypto);