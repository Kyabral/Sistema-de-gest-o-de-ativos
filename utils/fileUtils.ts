

/**
 * Converts a File object to a Base64 string.
 * This allows storing small files directly in Firestore documents without setting up Storage buckets.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result);
        } else {
            reject(new Error('Failed to convert file to base64'));
        }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Validates file size (limit to 1MB for Firestore performance)
 */
export const validateFileSize = (file: File, limitMB: number = 1): boolean => {
    return file.size / 1024 / 1024 <= limitMB;
};

/**
 * Triggers a browser download from a Base64 string.
 * @param base64 The Base64 string (including data URI prefix e.g., "data:application/pdf;base64,...")
 * @param fileName The name to save the file as
 */
export const downloadBase64File = (base64: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = base64;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
