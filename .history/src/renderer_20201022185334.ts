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
const exportPDFButton = document.getElementById('export-pdf') as HTMLButtonElement
const uploadFileWarning = document.getElementById('upload-file-warning')
const notLineMatchWarning = document.getElementById('not-line-match-warning')
const blankLinesWarning = document.getElementById('blank-lines-warning')
const everythingReadySuccess = document.getElementById('everything-ready-success')
const errorMessageModal = document.getElementById('error-message-modal') as HTMLParagraphElement
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

const showErrorMessage = (message: string) => {
    errorMessageModal.innerHTML = message;
    (<any>$('#error-modal')).modal('show')
}

const showSuccessModal = () => (<any>$('#success-modal')).modal('show')

const toggleGeneratingPDFMessage = (toggle: boolean) => {
    if (toggle) {
        setProgressBar(0);
        (<any>$('#generating-pdfs-modal')).modal('show')
    } else {
        setTimeout(_ => (<any>$('#generating-pdfs-modal')).modal('hide'), 500)
        setProgressBar(0);
    }
}

const setProgressBar = (percentage: number) => {
    const currentValue = parseInt((<any>$('.progress-bar')).attr('aria-valuenow'));
    console.log("width", (<any>$('.progress-bar')).css('width'))
    console.log("fix width", (<any>$('.progress-bar')).css('width').slice(0, -1))
    console.log("currentValue", currentValue)
    console.log("percentage", percentage)
    if (currentValue !== undefined && currentValue !== null && currentValue !== percentage) {
        console.log("CHANGED", percentage);
        (<any>$('.progress-bar')).css('width', percentage+'%').attr('aria-valuenow', percentage);
    }
    console.log("-----------------------")

}

const exportPDF = async() => {
    toggleGeneratingPDFMessage(true)
    try {
        createPDFFiles(await getPDFDictionary())
    } catch (e) {
        toggleGeneratingPDFMessage(false)
        showErrorMessage('Se han encontrado problemas al momento de generar sus archivos, por favor, intente de nuevo.')
    }
}

const createPDFFiles = async(pdfDictionary: {[pdfName: string]: PDFDocument }) => {
    let counter = 0
    for (const [pdfName, pdfFile] of Object.entries(pdfDictionary)) {
        counter++
        writeFileSync('pdf/' + pdfName, Buffer.from(await pdfFile.save()))
        setProgressBar(Math.round((counter/Object.keys(pdfDictionary).length)*80)+20)
    }
    toggleGeneratingPDFMessage(false)
    showSuccessModal()
}

const getPDFDictionary = async (): Promise<{ [pdfName: string]: PDFDocument} > => {
    let guideDictionary: {[pdfName: string]: number[] } = {}
    let pdfDictionary: {[pdfName: string]: PDFDocument } = {}

    getCurrentLines().forEach((line, i) => {
        if (!guideDictionary.hasOwnProperty(line)) { guideDictionary[line] = [] }
        guideDictionary[line].push(i)
        setProgressBar(Math.round((i/getCurrentLines().length)*5)+0)
    });
    let counter = 0
    for (const [pdfName, pageNumbers] of Object.entries(guideDictionary)) {
        counter++
        if (!pdfDictionary.hasOwnProperty(pdfName)) { pdfDictionary[pdfName] = await PDFDocument.create() }
        const copiedPages = await pdfDictionary[pdfName].copyPages(pdf, pageNumbers)
        copiedPages.forEach(copiedPage => { pdfDictionary[pdfName].addPage(copiedPage) });
        setProgressBar(Math.round((counter/Object.keys(guideDictionary).length)*15)+5)
    }

    return pdfDictionary
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
        exportPDFButton.disabled = false;
        setTentativeNames()
        updateMessages()
    } catch (e) {
        showErrorMessage('Se han encontrado problemas al momento de cargar su PDF, por favor, intente de nuevo.')
    }
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
    exportPDFButton.disabled = !ready;
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
