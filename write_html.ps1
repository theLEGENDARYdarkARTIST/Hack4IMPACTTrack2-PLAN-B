# Read first 4 bytes to detect BOM
$bytes = [System.IO.File]::ReadAllBytes('C:\Users\KIIT0001\Desktop\HACK\frontend\specialist-routing.html')
$firstBytes = $bytes[0..3]
Write-Host "First 4 bytes: $($firstBytes -join ', ')"
Write-Host "File size bytes: $($bytes.Length)"

# Try UTF-16 BE (big endian, no BOM common)
# Try UTF-8 with BOM
# UTF-16 LE BOM: 0xFF 0xFE
# UTF-16 BE BOM: 0xFE 0xFF
# UTF-8 BOM: 0xEF 0xBB 0xBF

if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
    Write-Host "Detected: UTF-16 LE with BOM"
} elseif ($bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
    Write-Host "Detected: UTF-16 BE with BOM"
} elseif ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    Write-Host "Detected: UTF-8 with BOM"
} else {
    Write-Host "No BOM detected"
    # Check if it looks like UTF-16 LE (every other byte is 0 for ASCII content)
    $nullCount = 0
    for ($i = 1; $i -lt [Math]::Min(200, $bytes.Length); $i += 2) {
        if ($bytes[$i] -eq 0) { $nullCount++ }
    }
    Write-Host "Null bytes at odd positions (UTF-16 LE indicator): $nullCount out of $([Math]::Min(100, $bytes.Length/2))"
}
