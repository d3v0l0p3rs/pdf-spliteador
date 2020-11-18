import './index.css'
import $ from "jquery"
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { PDFDocument } from 'pdf-lib'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

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

console.log("TEST", (<any>$('#generating-pdfs-modal')).modal('hide'))

const pdfFolder = 'pdf'
const pdfExtension = 'pdf'

const getCurrentLines = () => nameLinesText.value.split(/\r\n|\r|\n/)
const setLines = (lines: string[]) => nameLinesText.value = lines.join('\r\n')

const copyText = () => {
    nameLinesText.select()
    document.execCommand('copy')
}

const pasteText = async() => {
    nameLinesText.select()
    document.execCommand('paste')
    nameLinesTextChange()
}

const deleteText = () => {
    nameLinesText.value = ''
    nameLinesTextChange()
}

const showErrorMessage = (message: string) => {
    errorMessageModal.innerHTML = message;
    // (<any>$('#error-modal')).modal('show')
}

// const showSuccessModal = () => (<any>$('#success-modal')).modal('show')
const showSuccessModal = () => {}

const toggleGeneratingPDFMessage = (toggle: boolean) => {
    if (toggle) {
        setProgressBar(0);
        // (<any>$('#generating-pdfs-modal')).modal('show')
    } else {
        setTimeout(_ => {
            // (<any>$('#generating-pdfs-modal')).modal('hide')
            setProgressBar(0)
        }, 500)
    }
}

const setProgressBar = (percentage: number) => {
    const currentValue = parseInt((<any>$('.progress-bar')).attr('aria-valuenow'))
    if (currentValue !== undefined && currentValue !== null && currentValue !== percentage) {
        // (<any>$('#progress-bar')).css('width', percentage+'%').attr('aria-valuenow', percentage)
    }
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

const createPDFDirectory = () => {
    if (!existsSync(pdfFolder)) {
        mkdirSync(pdfFolder, {
            recursive: true
        })
    }
}

const createPDFFiles = async(pdfDictionary: {[pdfName: string]: PDFDocument }) => {
    let counter = 0
    createPDFDirectory()
    for (const [pdfName, pdfFile] of Object.entries(pdfDictionary)) {
        counter++
        const filePath = `${pdfFolder}/${pdfName}.${pdfExtension}`
        if (!existsSync(filePath)) {
            writeFileSync(filePath, Buffer.from(await pdfFile.save()))
        } else {
            let number = 1
            let newPath = `${pdfFolder}/${pdfName} (${number}).${pdfExtension}`
            while (existsSync(newPath)) {
                number++
                newPath = `${pdfFolder}/${pdfName} (${number}).${pdfExtension}`
            }
            writeFileSync(newPath, Buffer.from(await pdfFile.save()))
        }
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
    })
    let counter = 0
    for (const [pdfName, pageNumbers] of Object.entries(guideDictionary)) {
        counter++
        if (!pdfDictionary.hasOwnProperty(pdfName)) { pdfDictionary[pdfName] = await PDFDocument.create() }
        const copiedPages = await pdfDictionary[pdfName].copyPages(pdf, pageNumbers)
        copiedPages.forEach(copiedPage => { pdfDictionary[pdfName].addPage(copiedPage) })
        setProgressBar(Math.round((counter/Object.keys(guideDictionary).length)*15)+5)
    }

    return pdfDictionary
}

const checkValidCharacters = () => { setLines(getCurrentLines().map(line => line.replace(/[^\w*\s_´¨áéíóúäëïöü]/gi, ''))) }

const nameLinesTextChange = () => {
    checkValidCharacters()
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
        uploadPDFInput.value = ''
        exportPDFButton.disabled = false
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
    exportPDFButton.disabled = !ready
}

const setTentativeNames = () => {
    deleteText()
    let tentativeNames = ''
    for (let i = 0; i < pdf?.getPages().length; i++) {
        const brakeLine = i+1 !== pdf?.getPages().length ? '\n' : ''
        tentativeNames += `Página #${i+1}${brakeLine}`
    }
    nameLinesText.value = tentativeNames
    nameLinesText.innerHTML = tentativeNames
    nameLinesTextChange()
}

nameLinesText.addEventListener('scroll', () => { numberLinesText.scrollTop = nameLinesText.scrollTop }, false)
numberLinesText.addEventListener('scroll', () => { nameLinesText.scrollTop = numberLinesText.scrollTop }, false)
uploadPDFButton.addEventListener('click', () => uploadPDFInput.click())
uploadPDFInput.addEventListener('input', onUploadFile)
nameLinesText.addEventListener('input', nameLinesTextChange)
copyTextButton.addEventListener('click', copyText)
pasteTextButton.addEventListener('click', pasteText)
deleteTextButton.addEventListener('click', deleteText)
exportPDFButton.addEventListener('click', exportPDF)
