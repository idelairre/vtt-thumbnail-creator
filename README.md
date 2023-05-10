# vtt-thumbnail-creator
A quick and dirty commandline program for creatting webvtt files and thumbnail sprite sheets ready to load into ACE Pro

## Example Usage

In your terminal write: `node .\index.js AIC-0006.mp4`. Replace `AIC-0006.mp4` with whatever video you're trying to process. It will take a few seconds to process then you will have a folder named after your video (minus the extension) with a `vtt` file and a `jpg` ready to load.

## ChatGPT explains further

This program extracts frames from a video file and creates a sprite sheet of thumbnail images along with a corresponding WebVTT file for use in video players. 

The input video file is provided as a command line argument when running the program. The program uses the `fluent-ffmpeg` library to extract frames from the video file and saves them as PNG images in a `frames` directory. 

It then uses the `sharp` library to resize the frames and combines them into a sprite sheet image. The sprite sheet image and corresponding WebVTT file are saved in a directory named after the input video file (without the extension).

To use the program, you need to have Node.js installed on your system. Save the code to a file with a `.js` extension and run it using Node.js from the command line, passing the path to the input video file as a command line argument:

```
node index.js input_video.mp4
```

Replace `index.js` with the name of the file containing the program and `input_video.mp4` with the path to the input video file. 

After running the program, the output sprite sheet image and WebVTT file will be saved in a directory named after the input video file in the same directory as the input video file. Note that the `fps` option used in the `ffmpeg` command can be adjusted to control the rate at which frames are extracted.

## Potential improvements

Human: What are some improvements that could be made to this program?

ChatGPT: 

Here are some possible improvements that could be made to this program:

1. Command line options: The program could be made more flexible by adding support for command line options that allow the user to specify the number of columns in the output sprite sheet, the output image size, the frame rate of the extracted frames, and the location of the output files.

2. Error handling: The program could be made more robust by adding better error handling. For example, it could handle cases where the input video file does not exist or is not readable, or cases where the output directory cannot be created or written to.

3. Logging: The program could benefit from better logging to provide more informative feedback to the user. For example, it could log progress updates as frames are extracted and images are processed, or it could log error messages with more details about the cause of the error.

4. Thumbnail selection: The program currently extracts frames at a fixed rate of 1 frame per second. It could be improved by allowing the user to specify which frames to extract as thumbnails, such as by specifying a time range or by selecting frames based on some other criteria (e.g., based on the content of the frame).

5. Output formats: The program currently outputs a sprite sheet image and a WebVTT file. It could be improved by adding support for additional output formats, such as an animated GIF or a set of separate thumbnail images.

6. Performance optimizations: Depending on the size and length of the input video file, the program could be slow or memory-intensive. It could be improved by implementing optimizations such as caching or parallel processing to speed up the extraction and processing of frames.
