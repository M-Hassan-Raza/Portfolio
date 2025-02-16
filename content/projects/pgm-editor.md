---
title: "Building a C++ Image Editor"
date: 2025-02-16
description: "A deep dive into my university project - a simple yet powerful image editor built with C++."
tags: ["C++", "Image Processing", "University Project", "Programming"]
ShowComments: true
---
### Introduction
During my university coursework, I developed a C++-based grayscale image editor capable of performing fundamental image processing tasks. This project was an exploration into file handling, image manipulation, and efficient data structures in C++.

### Features of the Image Editor
The application supports:
- Loading and saving grayscale images in PGM format.
- Applying filters like mean and median filtering.
- Performing transformations such as flipping, rotating, and resizing.
- Combining images either side-by-side or top-to-bottom.
- Adjusting brightness and generating negative images.

### Core Implementation
The backbone of the editor is the `grayImage` struct, which stores pixel data and provides functions for image operations. Here’s a snippet demonstrating how pixels are set and retrieved:

```cpp
unsigned short setPixel(unsigned short value, int r, int c) {
    if (r >= Rows || c >= Cols || r < 0 || c < 0) {
        return -1;
    }
    Image[r][c] = value;
    return value;
}

int getPixel(int r, int c) {
    if (r >= Rows || c >= Cols || r < 0 || c < 0) {
        return -1;
    }
    return Image[r][c];
}
```

### Loading and Saving Images
The editor reads and writes images in PGM format. The `load()` and `Save()` functions handle file I/O:

```cpp
int load(string File_Name) {
    ifstream Input(File_Name.c_str());
    if (!Input) {
        return 1;
    }
    string MagicNumber, comment;
    int columns, rows, MaxValue, currentValue;
    getline(Input, MagicNumber);
    getline(Input, comment);
    Input >> columns >> rows >> MaxValue;
    setRows(rows);
    setCols(columns);
    Maximum = MaxValue;

    for (int i = 0; i < Rows; i++) {
        for (int j = 0; j < Cols; j++) {
            Input >> currentValue;
            Image[i][j] = currentValue;
        }
    }
    Input.close();
    Loaded = true;
    return 0;
}
```

### Applying a Negative Filter
One of the simplest transformations in image processing is creating a negative image, achieved using:

```cpp
void Negative(grayImage& Result) {
    for (int row = 0; row < Rows; row++) {
        for (int column = 0; column < Cols; column++) {
            Result.Image[row][column] = Maximum - Image[row][column];
        }
    }
    Result.Rows = Rows;
    Result.Cols = Cols;
    Result.Maximum = Maximum;
}
```

### Future Improvements
While this project successfully implements several essential image processing functions, future improvements could include:
- Adding support for colored images (PPM format).
- Implementing more advanced filters (e.g., Gaussian blur, edge detection).
- Providing a GUI using a library like Qt or OpenCV.

### Conclusion
This C++ image editor was a great learning experience in working with image data, file I/O, and algorithm optimization. It’s a stepping stone towards more advanced image processing applications.

Check out the full source code on my [GitHub](https://github.com/M-Hassan-Raza/PGMImageEditor)!

Have feedback or suggestions? Drop a comment below!

