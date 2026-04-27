/** @file src/modules/documents/examples/storageAdapter.example.js */
export const storageAdapterExample = {
  async uploadBytes({ path, bytes, contentType }) {
    console.log('Upload bytes', { path, size: bytes.length, contentType });
    return { path, downloadURL: `https://example.com/${encodeURIComponent(path)}` };
  },
};
