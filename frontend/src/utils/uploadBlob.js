import { upload } from "@vercel/blob/client";

// Fungsi untuk upload sequential (lebih aman untuk rate limiting)
export const uploadImagesToBlob = async (files) => {
  try {
    const urls = [];
    
    // Validasi input
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error('Invalid files array');
    }
    
    console.log(`Starting sequential upload of ${files.length} files`);
    
    // Upload secara sequential untuk menghindari rate limiting
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}, size: ${file.size}`);
      
      // Validasi file
      if (!file || !file.name) {
        throw new Error(`Invalid file object at index ${i}`);
      }
      
      // Validasi ukuran file (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} too large. Max size: 10MB`);
      }
      
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type for ${file.name}. Allowed: JPEG, PNG, WebP`);
      }
      
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const uniqueFileName = `products/product_${timestamp}_${i}_${randomString}.${fileExtension}`;
      
      try {
        const blob = await upload(uniqueFileName, file, {
          access: "public",
          token: "vercel_blob_rw_Y40IciQzFYRz7ifM_NqDIytx0kxjxFqgkQkGY8yz7fVlZdu",
          multipart: true, // Enable multipart upload for large files
        });
        
        console.log(`File uploaded successfully: ${blob.url}`);
        urls.push(blob.url);
        
        // Delay kecil untuk menghindari rate limiting
        if (i < files.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (uploadError) {
        console.error(`Error uploading file ${file.name}:`, uploadError);
        throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
      }
    }
    
    console.log(`All ${files.length} files uploaded successfully`);
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
    
    // Batasi jumlah upload concurrent untuk menghindari rate limiting
    const batchSize = 3;
    const urls = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (file, batchIndex) => {
        const globalIndex = i + batchIndex;
        
        // Validasi file
        if (!file || !file.name) {
          throw new Error(`Invalid file object at index ${globalIndex}`);
        }
        
        // Validasi ukuran file
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error(`File ${file.name} too large. Max size: 10MB`);
        }
        
        // Validasi tipe file
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Invalid file type for ${file.name}. Allowed: JPEG, PNG, WebP`);
        }
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const uniqueFileName = `products/product_${timestamp}_${globalIndex}_${randomString}.${fileExtension}`;
        
        console.log(`Uploading file ${globalIndex + 1}/${files.length}: ${file.name}`);
        
        const blob = await upload(uniqueFileName, file, {
          access: "public",
          token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN,
          multipart: true,
        });
        
        return blob.url;
      });
      
      const batchUrls = await Promise.all(batchPromises);
      urls.push(...batchUrls);
      
      // Delay antar batch
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`All ${files.length} files uploaded successfully`);
    return urls;
    
  } catch (error) {
    console.error('Parallel upload failed:', error);
    throw error;
  }
};

// Fungsi untuk validasi file sebelum upload
export const validateFiles = (files) => {
  const errors = [];
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxCount = 10;
  
  if (!files || !Array.isArray(files)) {
    errors.push('Invalid files array');
    return { isValid: false, errors };
  }
  
  if (files.length > maxCount) {
    errors.push(`Maximum ${maxCount} images allowed. You selected ${files.length} images.`);
  }
  
  files.forEach((file, index) => {
    if (!file || !file.name) {
      errors.push(`Invalid file at position ${index + 1}`);
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type for "${file.name}". Only JPEG, PNG, and WebP are allowed.`);
    }
    
    if (file.size > maxSize) {
      errors.push(`File "${file.name}" is too large. Maximum size is 10MB.`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Fungsi untuk delete image dari Vercel Blob
export const deleteImageFromBlob = async (imageUrl) => {
  try {
    // Import del dari @vercel/blob hanya saat dibutuhkan
    const { del } = await import('@vercel/blob');
    
    await del(imageUrl, {
      token: process.env.REACT_APP_BLOB_READ_WRITE_TOKEN,
    });
    
    console.log(`Successfully deleted image: ${imageUrl}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete image ${imageUrl}:`, error);
    return false;
  }
};