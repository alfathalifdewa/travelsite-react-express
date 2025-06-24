import { upload } from "@vercel/blob/client";

export const uploadImagesToBlob = async (files) => {
  const urls = [];
  for (let file of files) {
    const { url } = await upload(file.name, file, {
      access: "public",
      token: "vercel_blob_rw_Y40IciQzFYRz7ifM_NqDIytx0kxjxFqgkQkGY8yz7fVlZdu",
    });
    urls.push(url);
  }
  return urls;
};
