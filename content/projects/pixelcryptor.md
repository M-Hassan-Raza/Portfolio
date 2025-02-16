---
title: "Obfuscating Images with Django & Azure Cloud Storage"
date: 2025-02-16
description: "A deep dive into my Django project that obfuscates images by embedding executable files and storing them securely on Azure Blob Storage."
tags: ["Django", "Azure", "Cloud Storage", "Image Obfuscation", "Security"]
ShowComments: true
---

## Obfuscating Images with Django & Azure Cloud Storage

### Introduction
For a recent project, I developed a Django-based web application that allows users to obfuscate images by embedding executable files within them. The processed images are then stored securely on Azure Blob Storage. This project blends Django’s powerful templating system with Azure’s cloud storage to offer a unique and secure way of handling sensitive data.

### Features
- Upload images and executable files via a Django form.
- Embed executables within images using a custom obfuscation technique.
- Store and retrieve obfuscated images on Azure Blob Storage.
- Deobfuscate images, extracting the original files.
- Secure file handling and cloud storage integration.

### Setting Up Azure Blob Storage in Django
We start by configuring Azure Blob Storage in our Django project. Using `dotenv`, we securely load credentials from an `.env` file:

```python
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

AZURE_CONNECTION_STRING = os.getenv("AZURE_CONNECTION_STRING")
CONTAINER_NAME = os.getenv("CONTAINER_NAME")

# Initialize BlobServiceClient
BLOB_SERVICE_CLIENT = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
```

### Uploading Files to Azure Blob Storage
A helper function to upload files to Azure Blob Storage:

```python
def upload_to_azure_blob(file, blob_name):
    try:
        container_client = BLOB_SERVICE_CLIENT.get_container_client(CONTAINER_NAME)
        blob_client = container_client.get_blob_client(blob=blob_name)
        blob_client.upload_blob(file, overwrite=True)
        print(f"File {blob_name} uploaded successfully!")
    except Exception as e:
        print(f"Error uploading file: {e}")
```

### Handling File Uploads in Django
A Django view to handle user file uploads and obfuscation:

```python
from django.shortcuts import render, redirect
from .forms import UploadFileForm

def upload_file(request):
    if request.method == "POST":
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            image_file = request.FILES.get("image")
            executable_file = request.FILES.get("executable")

            upload_to_azure_blob(image_file, image_file.name)
            upload_to_azure_blob(executable_file, executable_file.name)
            obfuscate_images(image_file.name, executable_file.name)
    else:
        form = UploadFileForm()

    return render(request, "core/obfuscator.html", {"form": form})
```

### Obfuscating Images
We embed the executable file within the image using a delimiter, then upload the modified file back to Azure:

```python
def obfuscate_images(image_blob_name, executable_blob_name):
    try:
        image_blob_client = BLOB_SERVICE_CLIENT.get_blob_client(CONTAINER_NAME, image_blob_name)
        executable_blob_client = BLOB_SERVICE_CLIENT.get_blob_client(CONTAINER_NAME, executable_blob_name)

        image_data = image_blob_client.download_blob().readall()
        executable_data = executable_blob_client.download_blob().readall()
        delimiter = b"---EXECUTABLE_BOUNDARY---"
        obfuscated_data = image_data + delimiter + executable_data

        obfuscated_blob_name = f"{image_blob_name}_OBFUSCATED.jpg"
        obfuscated_blob_client = BLOB_SERVICE_CLIENT.get_blob_client(CONTAINER_NAME, obfuscated_blob_name)
        obfuscated_blob_client.upload_blob(obfuscated_data, overwrite=True)
        print(f"File {obfuscated_blob_name} obfuscated and uploaded successfully!")
    except Exception as e:
        print(f"Error obfuscating file: {e}")
```

### Deobfuscating Images
The function below extracts the original image and executable file from the obfuscated image:

```python
def deobfuscate_images(obfuscated_blob_name):
    try:
        obfuscated_blob_client = BLOB_SERVICE_CLIENT.get_blob_client(CONTAINER_NAME, obfuscated_blob_name)
        obfuscated_data = obfuscated_blob_client.download_blob().readall()
        delimiter = b"---EXECUTABLE_BOUNDARY---"
        delimiter_index = obfuscated_data.find(delimiter)

        image_data = obfuscated_data[:delimiter_index]
        executable_data = obfuscated_data[delimiter_index + len(delimiter) :]

        image_name, image_extension = obfuscated_blob_name.split("_OBFUSCATED.")
        deobfuscated_image_blob_name = f"{image_name}.{image_extension}"
        deobfuscated_executable_blob_name = f"{image_name}_EXECUTABLE.exe"

        deobfuscated_image_blob_client = BLOB_SERVICE_CLIENT.get_blob_client(CONTAINER_NAME, deobfuscated_image_blob_name)
        deobfuscated_executable_blob_client = BLOB_SERVICE_CLIENT.get_blob_client(CONTAINER_NAME, deobfuscated_executable_blob_name)

        deobfuscated_image_blob_client.upload_blob(image_data, overwrite=True)
        deobfuscated_executable_blob_client.upload_blob(executable_data, overwrite=True)

        print(f"Deobfuscated files uploaded successfully!")
        return image_data, executable_data
    except Exception as e:
        print(f"Error deobfuscating file: {e}")
```

### Future Enhancements
- Adding user authentication to restrict access to uploaded files.
- Implementing additional security measures, such as file encryption.
- Developing a frontend UI with Django templates and JavaScript for a seamless user experience.
- Enhancing storage management with Azure lifecycle policies.

### Conclusion
This project showcases how Django and Azure Blob Storage can be leveraged to create a secure and efficient image obfuscation system. By embedding executables within images, we can transmit sensitive data in a unique and obscured format while utilizing the power of cloud storage.

Check out the full source code on my [GitHub](https://github.com/M-Hassan-Raza/malware_obfuscation)!

Got feedback or suggestions? Drop a comment below!

