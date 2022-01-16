/*
    God please help me.
    Zyrn made me do this. please cancel him on twitter.
*/

// deps
const fs = require("fs");
const path = require("path")
const fetch = require("node-fetch");
const { posts } = require("./e621.json");
const { createFFmpeg, fetchFile } = require("@ffmpeg/ffmpeg");

// main function
async function main() {
	console.log("WELCOME TO THE YIFF SAMPLER 3000");
    // make dirs if they don't exist
    if (!fs.existsSync(path.join(__dirname, "sources/"))) {
        fs.mkdirSync(path.join(__dirname, "sources/"));
    }
    if (!fs.existsSync(path.join(__dirname, "samples/"))) {
        fs.mkdirSync(path.join(__dirname, "samples/"));
    }
    let downloadedFiles = [];
    // for each post
    for (let i = 0; i < posts.length; i++) {
        // LET'S DOWNLOAD THE FUCKING POST FFS
        let post = posts[i];
        if (post.file.url === null || post.file.url.endsWith("swf")) continue; // WHY IS MY IDE LAGGING SO HARD IM TWEAKING RN FR FR
        let fileUrl = post.sample.alternates["480p"] !== undefined ? post.sample.alternates["480p"].urls[1] : post.sample.alternates.original.urls[1];
        console.log(`Downloading file number ${i}...`);
        let file = new Uint8Array(await fetch(fileUrl).then(body => body.arrayBuffer()));
        fs.writeFileSync(path.join(__dirname, "sources", i.toString()), file);
        console.log(`File downloaded!`);
        downloadedFiles.push(i);
    }
    // load in ffmpeg
    console.log("Loading in ffmpeg...");
    const ffmpeg = createFFmpeg();
    await ffmpeg.load();
    console.log("ffmpeg loaded!");
    // for each DOWNLOADED post
    for (let fileIndex of downloadedFiles) {
    	console.log(`Converting file number ${fileIndex} to mp3...`);
    	ffmpeg.FS("writeFile", `${fileIndex}.mp4`, await fetchFile(path.join(__dirname, "sources", fileIndex.toString())));
    	await ffmpeg.run("-i", `${fileIndex}.mp4`, `${fileIndex}.mp3`);
    	fs.writeFileSync(path.join(__dirname, "samples", `${fileIndex}.mp3`), ffmpeg.FS("readFile", `${fileIndex}.mp3`));
    	console.log(`File converted!`);
    }
    console.log("go use your samples you sick fuck");
}

// call main
main();
