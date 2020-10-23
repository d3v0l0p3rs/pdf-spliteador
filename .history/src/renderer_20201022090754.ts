import './index.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { PDFDocument } from 'pdf-lib'

// HTML elements
const numberLinesText = document.getElementById('number-lines') as HTMLTextAreaElement
const nameLinesText = document.getElementById('name-lines') as HTMLTextAreaElement
const uploadPDFButton = document.getElementById('upload-pdf')
const uploadPDFInput = document.getElementById('upload-pdf-input') as HTMLInputElement
const deleteTextButton = document.getElementById('delete-text')
const copyTextButton = document.getElementById('copy-text')
const pasteTextButton = document.getElementById('paste-names')
const chooseFolderButton = document.getElementById('choose-folder')
const exportPDFButton = document.getElementById('export-pdf')
const uploadFileWarning = document.getElementById('upload-file-warning')
const notLineMatchWarning = document.getElementById('not-line-match-warning')
const blankLinesWarning = document.getElementById('blank-lines-warning')
const everythingReadySuccess = document.getElementById('everything-ready-success')
let pdf: PDFDocument = undefined

const getCurrentLines = () => nameLinesText.value.split(/\r\n|\r|\n/)

const copyText = () => {
    nameLinesText.select()
    document.execCommand("copy");
}

const updateNumberLines = () => {
    const lines = getCurrentLines().length
    let enumeratedLinesText = ''
    for (let i = 0; i < lines; i++) {
        const zeroFilled = ('0000'+(i+1)).slice(-4)
        enumeratedLinesText += `#${zeroFilled}\n`
    }
    numberLinesText.value = enumeratedLinesText
    updateMessages()
}

const onUploadFile = async() => {
    try {
        pdf = await PDFDocument.load(await uploadPDFInput.files[0].arrayBuffer())
        setTentativeNames()
        updateMessages()
    } catch (e) {}
}

const updateMessages = () => {
    const linesDiff = getCurrentLines().length - pdf.getPages().length
    const blankLinesCheck = getCurrentLines().reduce((a, c) => a &&!!c, true)
    uploadFileWarning.style.display = pdf ? 'none' : 'block'
    blankLinesWarning.style.display = blankLinesCheck ? 'none' : 'block'
    if (linesDiff !== 0) {
        notLineMatchWarning.style.display = 'block'
        if (linesDiff > 0) {
            notLineMatchWarning.innerHTML = `Te has excedido por ${linesDiff} nombres`
        } else {
            notLineMatchWarning.innerHTML = `Te faltan ${Math.abs(linesDiff)} nombres`
        }
    } else {
        notLineMatchWarning.style.display = 'none'
    }
    const ready = [uploadFileWarning, blankLinesWarning, notLineMatchWarning].every(v => v.style.display === 'none')
    everythingReadySuccess.style.display = ready ? 'block' : 'none'
}

const setTentativeNames = () => {
    nameLinesText.innerHTML = ''
    let tentativeNames = ''
    for (let i = 0; i < pdf.getPages().length; i++) {
        const brakeLine = i+1 !== pdf.getPages().length ? '\n' : ''
        tentativeNames += `Página #${i+1}${brakeLine}`;
    }
    nameLinesText.innerHTML = tentativeNames
    updateNumberLines()
}

nameLinesText.addEventListener('scroll', () => { numberLinesText.scrollTop = nameLinesText.scrollTop }, false)
numberLinesText.addEventListener('scroll', () => { nameLinesText.scrollTop = numberLinesText.scrollTop }, false)

uploadPDFButton.addEventListener('click', () => uploadPDFInput.click())
uploadPDFInput.addEventListener('input', onUploadFile, false)

copyTextButton.addEventListener('click', copyText)


nameLinesText.addEventListener('input', updateNumberLines)













// import {remote} from 'electron'
// import path from 'path'

// const app = remote.app
// const browserWindow = remote.BrowserWindow
// const dialog = remote.dialog


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
//                 console.log(file.canceled) 
//                 if (!file.canceled) { 
//                   // Updating the GLOBAL filepath variable  
//                   // to user-selected file. 
//                   filepath = file.filePaths[0].toString() 
//                   console.log(filepath) 
//                 }   
//             }).catch(err => { 
//                 console.log(err) 
//             }) 
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
//                 console.log(file.canceled) 
//                 if (!file.canceled) { 
//                   filepath = file.filePaths[0].toString() 
//                   console.log(filepath) 
//                 }   
//             }).catch(err => { 
//                 console.log(err) 
//             }) 
//         } 
//     }) 