const WIDTH = 300;
export async function useGenerateImageThumbnail(file: File): Promise<File> {
  const imageString = await convertToBase64(file);

  const img = document.createElement('img');
  img.src = imageString;

  return new Promise((resolve, reject) => {
    img.onload = async (e: Event) => {
      const imgTarget = e.target as HTMLImageElement;
      const canvas = document.createElement('canvas');
      const ratio = WIDTH / imgTarget.width;

      canvas.width = WIDTH;
      canvas.height = imgTarget.height * ratio;

      const context = canvas.getContext('2d');
      context?.drawImage(img, 0, 0, canvas.width, canvas.height);

      const compressedImage = context?.canvas.toDataURL('image/jpeg', 0.2);

      if (!compressedImage) {
        reject();
        return;
      }

      const finalFile = await useDataUrlToFile(compressedImage, file.name);
      resolve(finalFile);
    };
  });
}

function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.readAsDataURL(file);

    fileReader.onload = (_) => {
      resolve(fileReader.result as string);
    };

    fileReader.onerror = (e) => reject(e);
  });
}

export async function useDataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res: Response = await fetch(dataUrl);
  const blob: Blob = await res.blob();
  return new File([blob], fileName, { type: 'image/jpeg' });
}
