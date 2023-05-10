const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const columns = 5;
const inputVideo = process.argv[2];

if (!inputVideo) {
    console.error('Please provide an input video');
    process.exit(1);
}

const videoName = path.basename(inputVideo, path.extname(inputVideo));
const outputFolder = path.join(__dirname, videoName);

const framesDir = path.join(outputFolder, 'frames');
if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
}

ffmpeg(inputVideo)
    .outputOptions('-vf fps=1/1') // NOTE: change this to something more reasonable for longer videos
    .output(path.join(framesDir, 'frame_%04d.png'))
    .on('end', async () => {
        console.log('Frames extracted');

        fs.readdir(framesDir, async (err, files) => {
            if (err) throw err;

            if (files.length === 0) {
                console.log('No frames were extracted');
                return;
            }

            const rows = Math.ceil(files.length / columns);
            const imagePromises = files.map(file => sharp(path.join(framesDir, file)).resize(320, 240).toBuffer());

            try {
                const images = await Promise.all(imagePromises);

                // Join all the images together into a sprite sheet
                await sharp({
                    create: {
                        width: 320 * columns,
                        height: 240 * rows,
                        channels: 4,
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    }
                })
                    .composite(images.map((image, i) => ({
                        input: image,
                        top: Math.floor(i / columns) * 240,
                        left: (i % columns) * 320
                    })))
                    .toFile(path.join(outputFolder, `${videoName}-sheet.jpg`));

                console.log('Tile image created successfully');

                // Create a VTT file
                const vttFile = fs.createWriteStream(path.join(outputFolder, `${videoName}-sheet.vtt`));
                vttFile.write('WEBVTT\n\n');

                for (let i = 0; i < files.length; i++) {
                    const startTime = new Date(i * 1000).toISOString().substr(11, 12);
                    const endTime = new Date((i + 1) * 1000).toISOString().substr(11, 12);
                    const position = {
                        x: (i % columns) * 320,
                        y: Math.floor(i / columns) * 240
                    };

                    vttFile.write(`${startTime} --> ${endTime}\n`);
                    vttFile.write(`/${videoName}-sheet.jpg#xywh=${position.x},${position.y},320,240\n\n`);
                }

                vttFile.end();
                console.log('VTT file created successfully');
            } catch (err) {
                console.log(`Error creating tile image: ${err.message}`);
            } finally {
                // Remove the frames directory
                fs.rmSync(framesDir, { recursive: true });
            }
        });
    })
    .run();
