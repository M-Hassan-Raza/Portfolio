---
title: "PixelCryptor: Hiding Executables Inside Images"
date: 2025-02-16
description: "A Django project that embeds executable files within images using delimiter-based concatenation — and why real steganography is harder than this."
tags: ["Django", "Azure", "Security", "Steganography"]
ShowComments: true
---

PixelCryptor is a Django app that lets you embed an executable file inside an image. Upload both files, it concatenates them with a delimiter, and stores the result on Azure Blob Storage. You can later extract the original files back out.

## How It Works

The approach is deliberately simple: append the executable bytes to the image bytes with a known delimiter between them.

```python
def obfuscate_images(image_blob_name, executable_blob_name):
    image_data = image_blob_client.download_blob().readall()
    executable_data = executable_blob_client.download_blob().readall()

    delimiter = b"---EXECUTABLE_BOUNDARY---"
    obfuscated_data = image_data + delimiter + executable_data

    obfuscated_blob_client.upload_blob(obfuscated_data, overwrite=True)
```

Image formats like JPEG and PNG store their data length in headers. Most viewers stop reading at the image data boundary, so the appended executable bytes are invisible when you open the file as an image. Deobfuscation finds the delimiter and splits the bytes back apart.

## Why This Is Naive (And That's the Point)

This isn't real steganography. Real steganography modifies the least significant bits of pixel data to encode hidden information, making it undetectable even under statistical analysis. This project just concatenates bytes — anyone who looks at the file size or runs `hexdump` will immediately see the appended data.

I built it as a university project to understand binary file manipulation, Azure Blob Storage integration, and Django file handling. The interesting part wasn't the "obfuscation" itself — it was learning how image formats define their data boundaries and why appending arbitrary bytes doesn't corrupt the image.

## The Azure Integration

Files are stored and retrieved from Azure Blob Storage. The upload/download logic is straightforward, but the useful lesson was handling binary data through Django's file upload pipeline without corrupting bytes — `request.FILES` gives you `UploadedFile` objects that need to be read as binary, not decoded as text.

Check out the source on [GitHub](https://github.com/M-Hassan-Raza/malware_obfuscation).
