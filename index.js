const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv))
    .command('$0 <input>', 'the main command', (yargs) => {
        yargs.positional('input', {
            describe: 'The input video file',
            type: 'string'
        })
    })
    .option('fps', {
        alias: 'f',
        description: 'The frame rate to extract thumbnails',
        type: 'number',
        default: 1
    })
    .option('width', {
        alias: 'w',
        description: 'The width of the thumbnails',
        type: 'number',
        default: 320
    })
    .help()
    .argv;

const columns = 5;
const inputVideo = argv.input;
const fps = argv.fps;
const width = argv.width;

const videoName = path.basename(inputVideo, path.extname(inputVideo));
const outputFolder = path.join(__dirname, videoName);

const framesDir = path.join(outputFolder, 'frames');
if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
}

ffmpeg(inputVideo)
    .outputOptions(`-vf fps=${fps}`)
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
            const imagePromises = files.map(file => sharp(path.join(framesDir, file)).resize(width).toBuffer());

            try {
                // probably don't have to do this...
                const images = await Promise.all(imagePromises);
                const imageHeights = images.map((image) => sharp(image).metadata().then((metadata) => metadata.height));
                const imageHeightsResolved = await Promise.all(imageHeights);
                const height = Math.max(...imageHeightsResolved);

                await sharp({
                    create: {
                        width: width * columns,
                        height: height * rows,
                        channels: 4,
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    }
                })
                    .composite(images.map((image, i) => ({
                        input: image,
                        top: Math.floor(i / columns) * height,
                        left: (i % columns) * width
                    })))
                    .toFile(path.join(outputFolder, `${videoName}-sheet.jpg`));

                console.log('Tile image created successfully');

                const vttFile = fs.createWriteStream(path.join(outputFolder, `${videoName}-sheet.vtt`));
                vttFile.write('WEBVTT\n\n');

                for (let i = 0; i < files.length; i++) {
                    const startTime = new Date(i * 1000).toISOString().substr(11, 12);
                    const endTime = new Date((i + 1) * 1000).toISOString().substr(11, 12);
                    const position = {
                        x: (i % columns) * width,
                        y: Math.floor(i / columns) * height
                    };

                    vttFile.write(`${startTime} --> ${endTime}\n`);
                    vttFile.write(`/${videoName}-sheet.jpg#xywh=${position.x},${position.y},${width},${height}\n\n`);
                }

                vttFile.end();
                console.log('VTT file created successfully');
            } catch (err) {
                console.log(`Error creating tile image: ${err.message}`);
            } finally {
                fs.rmSync(framesDir, { recursive: true });
            }
        });
    })
    .run();
