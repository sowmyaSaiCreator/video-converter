const ipc = require("electron").ipcRenderer;
const { exec } = require('child_process');
const randomString = require("random-string");
var selOutFolder = document.getElementById("selOutFolder");
var selOutFile = document.getElementById("selOutFile");
var convert = document.getElementById("convert");
var responseSuccess = document.getElementById("responseSuccess");


ipc.on('selFile-subWindow', function (event, arg) {
    selOutFile.innerHTML = arg;
});

ipc.on('selFolder-subWindow', function (event, arg) {
    selOutFolder.innerHTML = arg;
});


convert.addEventListener("click", function (event) {

    let selectedFolder = selOutFolder.innerText;
    let selectedFile = selOutFile.innerText;

    convert.classList.add("disabled");
    responseSuccess.innerText = `Please wait your ${selectedFile} is converting!!!`;
    responseSuccess.style.display = "block";

    //converting file
    exec(`ffmpeg -i "${selectedFile}" -profile:v baseline -level 3.0 -s 640x360 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls "${selectedFolder}"/${randomString()}_newVideo.m3u8`,
        function (error, stdout, stderr) {
            console.log(stdout);
            responseSuccess.innerText = "";
            responseSuccess.style.display = "none";

            const myNotification = new Notification('Conversion done', {
                body: `Your file was successfully converted!!! /n
                Please check in this ${selectedFolder} folder`
            })
            convert.classList.remove("disabled");
             ipc.send("close-sub-window");

            //hide mp4 button from main window..
            //close second window
            if (error) {
                console.log(err);
            }
        })
})


