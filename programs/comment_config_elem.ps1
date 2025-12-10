# Script to comment out CONFIG_ELEM commands in .tab files
param(
    [string]$Path = "C:\Users\waveg\VsCodeProjects\jac-v1\SDI"
)

$tabFiles = Get-ChildItem -Path $Path -Filter "*.tab" -File

foreach ($file in $tabFiles) {
    $content = Get-Content -Path $file.FullName -Raw

    # Check if file contains CONFIG_ELEM (not already commented)
    if ($content -match '(?m)^(\s*)(?<![!].*)(CONFIG_ELEM)') {
        # Replace CONFIG_ELEM with ! CONFIG_ELEM (only if not already commented)
        $newContent = $content -replace '(?m)^(\t*)CONFIG_ELEM', '$1! CONFIG_ELEM'

        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}

Write-Host "Done!"
