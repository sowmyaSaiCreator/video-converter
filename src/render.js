const ipc = require("electron").ipcRenderer;
const fs = require("fs");
const newProject = document.getElementById("newProject");
var responseDanger = document.getElementById("responseDanger");
var selectMp4 = document.getElementById("selectMp4");
var dirPath = "./media";

if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
}

// Empty folder
newProject.addEventListener("click", function (event) {
    selectMp4.style.display = "none";
    responseDanger.style.display = "none";

    //show dialog box so need interprocess communication
    ipc.send("close-sub-window");
    ipc.send("open-dialog-for-folder");
})

//Empty folder event receiving...
ipc.on("selected-folder", function (event, folderPath) {
    console.log(event);
    console.log(folderPath);

    if (folderPath === "withFiles") {
        responseDanger.innerText = `Please select empty folder`;
        responseDanger.style.display = "block";
        return;
    }
    else {
        //show next button to choose mp4 file
        selectMp4.style.display = "block";
        ipc.send("selFolder",folderPath);
        //folderPath should move to the next window...
    }
})

//Select mp4 folder 
selectMp4.addEventListener("click", function (event) {
    //show dialog box so need interprocess communication
    responseDanger.style.display = "none";
    ipc.send("close-sub-window");
    ipc.send("open-dialog-for-selecting-file");
})


//Selected mp4 file event receiving... 
ipc.on("selected-video-file-to-send",function (event, filePath) {
    console.log(event);
    console.log(filePath);
    //should move to the next window...
    if(filePath){
        selectMp4.style.display="none";
        ipc.send("open-sub-window");
        ipc.send("selFile",filePath);
    }
    else return;
    
});
