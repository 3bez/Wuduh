// This file is no longer used.
//
// PDF generation was originally prototyped with Puppeteer (@sparticuz/chromium +
// puppeteer-core). The production export route (/api/studies/[studyId]/export/route.ts)
// now calls PDFShift (a hosted Chromium API) directly and only imports buildPdfHtml
// from ./template.ts.
//
// @sparticuz/chromium and puppeteer-core have been removed from package.json.
// This file can be safely deleted.
export {}
