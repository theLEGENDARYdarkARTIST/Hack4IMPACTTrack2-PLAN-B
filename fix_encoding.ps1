$path = 'C:\Users\KIIT0001\Desktop\HACK\frontend\specialist-routing.html'
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::Unicode)
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done. Character count: $($content.Length)"
