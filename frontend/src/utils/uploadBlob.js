import { upload } from "@vercel/blob/client";

// Fungsi untuk upload sequential (lebih aman)
export const uploadImagesToBlob = async (files) => {
  try {
    const urls = [];
    
    // Validasi input
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('Invalid files array');
    }
    
    // Upload secara sequential untuk menghindari rate limiting
    for (let file of files) {
      console.log(`Uploading file: ${file.name}, size: ${file.size}`);
      
      // Validasi file
      if (!file || !file.name) {
        throw new Error('Invalid file object');
      }
      
      // Validasi ukuran file (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} too large. Max size: 10MB`);
      }
      
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `product_${timestamp}_${randomString}.${fileExtension}`;
      
      try {
        const { url } = await upload(uniqueFileName, file, {
          access: "public",
          token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_Y40IciQzFYRz7ifM_NqDIytx0kxjxFqgkQkGY8yz7fVlZdu",
          // handleUploadUrl: '/api/upload', // Hapus ini jika tidak diperlukan
          multipart: true, // Enable multipart upload for large files
        });
        
        console.log(`File uploaded successfully: ${url}`);
        urls.push(url);
        
        // Delay kecil untuk menghindari rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (uploadError) {
        console.error(`Error uploading file ${file.name}:`, uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }
    }
    
    return urls;
    
  } catch (error) {
    console.error('Upload batch failed:', error);
    throw error;
  }
};

// Fungsi untuk upload parallel (lebih cepat tapi berisiko rate limit)
export const uploadImagesToBlobParallel = async (files) => {
  try {
    // Validasi input
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('Invalid files array');
    }
    
    console.log(`Starting parallel upload of ${files.length} files`);
    
    const uploadPromises = files.map(async (file, index) => {
      // Validasi file
      if (!file || !file.name) {
        throw new Error(`Invalid file object at index ${index}`);
      }
      
      // Validasi ukuran file
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} too large. Max size: 10MB`);
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `product_${timestamp}_${index}_${randomString}.${fileExtension}`;
      
      console.log(`Uploading file ${index + 1}/${files.length}: ${file.name}`);
      
      const { url } = await upload(uniqueFileName, file, {
        access: "public",
        token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN || "vercel_blob_rw_Y40IciQzFYRz7ifM_NqDIytx0kxjxFqgkQkGY8yz7fVlZdu",
        multipart: true,
      });
      
      return url;
    });
    
    const urls = await Promise.all(uploadPromises);
    console.log(`All ${files.length} files uploaded successfully`);
    
    return urls;
    
  } catch (error) {
    console.error('Parallel upload failed:', error);
    throw error;
  }
};