import './index.css';
// import {remote} from 'electron';
// import path from 'path';

// const app = remote.app;
// const browserWindow = remote.BrowserWindow;
// const dialog = remote.dialog;

const numberLinesText = document.getElementById("number-lines")
const nameLinesText = document.getElementById("name-lines")
const uploadPDFButton = document.getElementById("upload-pdf")
const uploadPDFInput = document.getElementById("upload-pdf-input") as HTMLInputElement
const deleteTextButton = document.getElementById("delete-text")
const copyTextButton = document.getElementById("copy-text")
const pasteTextButton = document.getElementById("paste-names")
const chooseFolderButton = document.getElementById("choose-folder")
const exportPDFButton = document.getElementById("export-pdf")


nameLinesText.addEventListener('scroll', ()=>{numberLinesText.scrollTop = nameLinesText.scrollTop;}, false);
numberLinesText.addEventListener('scroll', ()=>{nameLinesText.scrollTop = numberLinesText.scrollTop;}, false);

// const alertFunction = () => {confirm("Diste click")}


const handleUploadPDF = () => {
    console.log(uploadPDFInput.files[0])
}

const callUploadPDFInput = () => {
    uploadPDFInput.click();
}

// const test = () => {
//     child.loadURL('https://github.com')
// child.once('ready-to-show', () => {
//   child.show()
// })
// }
uploadPDFButton.addEventListener("change", callUploadPDFInput);
uploadPDFInput.addEventListener("change", handleUploadPDF);
// uploadPDFButton.addEventListener("onchange", ()=>{uploadPDFButton.files[0]});
// deleteTextButton.addEventListener("click", test);


let filepath = "";

// uploadPDFButton.addEventListener('click', () => { 
//     // If the platform is 'win32' or 'Linux' 
//         if (process.platform !== 'darwin') { 
//             // Resolves to a Promise<Object> 
//             dialog.showOpenDialog({ 
//                 title: 'Select the File to be uploaded', 
//                 defaultPath: path.join(__dirname, '../assets/'), 
//                 buttonLabel: 'Upload', 
//                 // Restricting the user to only Text Files. 
//                 filters: [ 
//                     { 
//                         name: 'Text Files', 
//                         extensions: ['txt', 'docx'] 
//                     }, ], 
//                 // Specifying the File Selector Property 
//                 properties: ['openFile'] 
//             }).then(file => { 
//                 // Stating whether dialog operation was 
//                 // cancelled or not. 
//                 console.log(file.canceled); 
//                 if (!file.canceled) { 
//                   // Updating the GLOBAL filepath variable  
//                   // to user-selected file. 
//                   filepath = file.filePaths[0].toString(); 
//                   console.log(filepath); 
//                 }   
//             }).catch(err => { 
//                 console.log(err) 
//             }); 
//         } 
//         else { 
//             // If the platform is 'darwin' (macOS) 
//             dialog.showOpenDialog({ 
//                 title: 'Select the File to be uploaded', 
//                 defaultPath: path.join(__dirname, '../assets/'), 
//                 buttonLabel: 'Upload', 
//                 filters: [ 
//                     { 
//                         name: 'Text Files', 
//                         extensions: ['txt', 'docx'] 
//                     }, ], 
//                 // Specifying the File Selector and Directory  
//                 // Selector Property In macOS 
//                 properties: ['openFile', 'openDirectory'] 
//             }).then(file => { 
//                 console.log(file.canceled); 
//                 if (!file.canceled) { 
//                   filepath = file.filePaths[0].toString(); 
//                   console.log(filepath); 
//                 }   
//             }).catch(err => { 
//                 console.log(err) 
//             }); 
//         } 
//     }); 