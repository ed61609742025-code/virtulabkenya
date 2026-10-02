$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$docxPath = Join-Path $scriptDir "VirtuLab_Kenya_Capstone_Proposal_V10_Resolved.docx"
$pdfPath = Join-Path $scriptDir "VirtuLab_Kenya_Capstone_Proposal_V10_Resolved.pdf"

Write-Host "Opening Word application..."
try {
    $word = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Word.Application")
    Write-Host "Connected to active Word instance."
} catch {
    $word = New-Object -ComObject Word.Application
    Write-Host "Created new Word instance."
}

$word.Visible = $false
$word.DisplayAlerts = 0

Write-Host "Opening document: $docxPath"
# Open(FileName, ConfirmConversions, ReadOnly, AddToRecentFiles, PasswordDocument, PasswordTemplate, Revert, WritePasswordDocument, WritePasswordTemplate, Format, Encoding, Visible, OpenConflictDocument, OpenAndRepair, DocumentDirection, NoEncodingDialog)
$doc = $word.Documents.Open($docxPath, [Type]::Missing, $true)

Write-Host "Updating document fields and Table of Contents..."
try {
    foreach ($field in $doc.Fields) {
        $field.Update() | Out-Null
    }
} catch {
    Write-Host "Field update notice: $_"
}

Write-Host "Exporting to PDF: $pdfPath"
# 17 = wdExportFormatPDF
$doc.ExportAsFixedFormat(
    $pdfPath,
    17,                  # wdExportFormatPDF
    $false,              # OpenAfterExport
    0,                   # wdExportOptimizeForPrint
    0,                   # wdExportAllDocument
    1,                   # From
    1,                   # To
    0,                   # wdExportDocumentContent
    $true,               # IncludeDocProps
    $true,               # KeepIRM
    1,                   # wdExportCreateHeadingBookmarks (creates PDF bookmarks from headings!)
    $true,               # DocStructureTags
    $true,               # BitmapMissingFonts
    $false               # UseISO19005_1 (PDF/A)
)

Write-Host "Closing document..."
$doc.Close([ref]$false)

# If we created the instance and no other docs are open, quit; otherwise leave open
if ($word.Documents.Count -eq 0) {
    $word.Quit()
}

Write-Host "PDF successfully created at: $pdfPath"
