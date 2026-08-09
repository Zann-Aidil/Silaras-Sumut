Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\OJAN\Desktop\Helpdesk\silaras_brand_logo.png"
$dstPath = "C:\Users\OJAN\Desktop\Helpdesk\frontend\public\logo.png"

$img = [System.Drawing.Bitmap]::FromFile($srcPath)

# Make pure white transparent
$img.MakeTransparent([System.Drawing.Color]::White)

$minX = $img.Width
$minY = $img.Height
$maxX = 0
$maxY = 0

for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $c = $img.GetPixel($x, $y)
        # If pixel is near white (R>235 and G>235 and B>235), force transparent
        if ($c.R -gt 235 -and $c.G -gt 235 -and $c.B -gt 235) {
            $img.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

# Crop rectangle with 10px padding
$padding = 10
$cropX = [Math]::Max(0, $minX - $padding)
$cropY = [Math]::Max(0, $minY - $padding)
$cropW = [Math]::Min($img.Width - $cropX, ($maxX - $minX + 1 + ($padding * 2)))
$cropH = [Math]::Min($img.Height - $cropY, ($maxY - $minY + 1 + ($padding * 2)))

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$cropped = $img.Clone($rect, $img.PixelFormat)

$cropped.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)

$img.Dispose()
$cropped.Dispose()

Write-Host "Logo successfully processed to transparent PNG!"
