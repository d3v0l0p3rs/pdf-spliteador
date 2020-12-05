import './index.css'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import { shell } from 'electron';
import { PDFDocument } from 'pdf-lib'
import { writeFileSync, existsSync, mkdirSync } from 'fs'

const numberLinesText = document.getElementById('number-lines') as HTMLTextAreaElement
const nameLinesText = document.getElementById('name-lines') as HTMLTextAreaElement
const uploadPDFButton = document.getElementById('upload-pdf')
const uploadPDFInput = document.getElementById('upload-pdf-input') as HTMLInputElement
const goDeftButtons = document.getElementsByClassName('go-deft-button') as HTMLCollection
const deleteTextButton = document.getElementById('delete-text')
const copyTextButton = document.getElementById('copy-text')
const pasteTextButton = document.getElementById('paste-text')
// const chooseFolderButton = document.getElementById('choose-folder')
const exportPDFButton = document.getElementById('export-pdf') as HTMLButtonElement
const uploadFileWarning = document.getElementById('upload-file-warning')
const notLineMatchWarning = document.getElementById('not-line-match-warning')
const blankLinesWarning = document.getElementById('blank-lines-warning')
const everythingReadySuccess = document.getElementById('everything-ready-success')
const generatingPDFsInfo = document.getElementById('generating-pdfs-info')
const generatingPDFsError = document.getElementById('generating-pdfs-error')
const openError = document.getElementById('open-error')
const generatingPDFsSuccess = document.getElementById('generating-pdfs-success')
let pdf: PDFDocument = undefined

const pdfFolder = 'pdf'
const pdfExtension = 'pdf'
const deftURL = 'https://deftsoluciones.com/'

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

const exportPDF = async() => {
    updateMessages('work')
    try {
        createPDFFiles(await getPDFDictionary())
    } catch (e) {
        updateMessages('fail_generate')
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
    createPDFDirectory()
    for (const [pdfName, pdfFile] of Object.entries(pdfDictionary)) {
        const filePath = `${pdfFolder}/${pdfName}.${pdfExtension}`
        if (!existsSync(filePath)) {
            writeFileSync(filePath, Buffer.from(await pdfFile.save()))
        } else {
            let counter = 1
            let newPath = `${pdfFolder}/${pdfName} (${counter}).${pdfExtension}`
            while (existsSync(newPath)) {
                counter++
                newPath = `${pdfFolder}/${pdfName} (${counter}).${pdfExtension}`
            }
            writeFileSync(newPath, Buffer.from(await pdfFile.save()))
        }
    }
    updateMessages('done')
}

const getPDFDictionary = async (): Promise<{ [pdfName: string]: PDFDocument} > => {
    const guideDictionary: {[pdfName: string]: number[] } = {}
    const pdfDictionary: {[pdfName: string]: PDFDocument } = {}

    getCurrentLines().forEach((line, i) => {
        if (!guideDictionary[line]) { guideDictionary[line] = [] }
        guideDictionary[line].push(i)
    })
    for (const [pdfName, pageNumbers] of Object.entries(guideDictionary)) {
        if (!pdfDictionary[pdfName]) { pdfDictionary[pdfName] = await PDFDocument.create() }
        const copiedPages = await pdfDictionary[pdfName].copyPages(pdf, pageNumbers)
        copiedPages.forEach(copiedPage => { pdfDictionary[pdfName].addPage(copiedPage) })
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
    pdf = undefined
    try {
        pdf = await PDFDocument.load(await uploadPDFInput.files[0].arrayBuffer())
        uploadPDFInput.value = ''
        exportPDFButton.disabled = false
        setTentativeNames()
        updateMessages()
    } catch (e) {
        updateMessages('fail_open')
    }
}

const updateMessages = (state?: 'work' | 'done' | 'fail_open' | 'fail_generate') => {
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
    everythingReadySuccess.style.display = ready && !state ? 'block' : 'none'
    exportPDFButton.disabled = !ready
    generatingPDFsInfo.style.display = state && state === 'work' ? 'block' : 'none'
    generatingPDFsSuccess.style.display = state && state === 'done' ? 'block' : 'none'
    generatingPDFsError.style.display = state && state === 'fail_generate' ? 'block' : 'none'
    openError.style.display = state && state === 'fail_open' ? 'block' : 'none'
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
Array.from(goDeftButtons).forEach((goDeftButton: HTMLLinkElement) => goDeftButton.addEventListener('click', () => shell.openExternal(deftURL)))