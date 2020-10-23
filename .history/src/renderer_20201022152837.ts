import './index.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { PDFDocument } from 'pdf-lib'
import { writeFileSync } from 'fs'

// HTML elements
const numberLinesText = document.getElementById('number-lines') as HTMLTextAreaElement
const nameLinesText = document.getElementById('name-lines') as HTMLTextAreaElement
const uploadPDFButton = document.getElementById('upload-pdf')
const uploadPDFInput = document.getElementById('upload-pdf-input') as HTMLInputElement
const deleteTextButton = document.getElementById('delete-text')
const copyTextButton = document.getElementById('copy-text')
const pasteTextButton = document.getElementById('paste-text')
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
    document.execCommand('copy')
}

const pasteText = async() => {
    nameLinesText.select()
    document.execCommand('paste')
    updateNumberLines()
}

const deleteText = () => {
    nameLinesText.value = ''
    updateNumberLines()
}

const asd = () => {
    try { writeFileSync('myfile.txt', 'the text to write in the file', 'utf-8'); }
    catch(e) { alert('Failed to save the file !'); }
}
const exportPDF = async() => {
    // const pdfBytes = await pdf.save()
    asd()
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
    const linesDiff = getCurrentLines().length - pdf?.getPages().length
    const blankLinesCheck = getCurrentLines().reduce((a, c) => a &&!!c, true)
    uploadFileWarning.style.display = pdf ? 'none' : 'block'
    blankLinesWarning.style.display = blankLinesCheck ? 'none' : 'block'
    if (linesDiff) {
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
    for (let i = 0; i < pdf?.getPages().length; i++) {
        const brakeLine = i+1 !== pdf?.getPages().length ? '\n' : ''
        tentativeNames += `Página #${i+1}${brakeLine}`;
    }
    nameLinesText.innerHTML = tentativeNames
    updateNumberLines()
}

nameLinesText.addEventListener('scroll', () => { numberLinesText.scrollTop = nameLinesText.scrollTop }, false)
numberLinesText.addEventListener('scroll', () => { nameLinesText.scrollTop = numberLinesText.scrollTop }, false)

uploadPDFButton.addEventListener('click', () => uploadPDFInput.click())
uploadPDFInput.addEventListener('input', onUploadFile, false)

nameLinesText.addEventListener('input', updateNumberLines)


copyTextButton.addEventListener('click', copyText)
pasteTextButton.addEventListener('click', pasteText)
deleteTextButton.addEventListener('click', deleteText)
exportPDFButton.addEventListener('click', exportPDF)
