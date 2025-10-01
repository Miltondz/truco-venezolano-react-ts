# Script para verificar recursos responsive
# Verifica que existan todas las versiones de video e imagen para desktop y mobile

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN DE RECURSOS RESPONSIVE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$imagesPath = ".\public\images"
$requiredFiles = @(
    "cover.mp4",
    "cover.jpg",
    "cover-mobile.mp4",
    "cover-mobile.jpg"
)

$allExist = $true
$totalSize = 0

foreach ($file in $requiredFiles) {
    $filePath = Join-Path $imagesPath $file
    
    if (Test-Path $filePath) {
        $fileInfo = Get-Item $filePath
        $sizeKB = [math]::Round($fileInfo.Length / 1KB, 2)
        $sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        
        $totalSize += $fileInfo.Length
        
        Write-Host "✅ " -ForegroundColor Green -NoNewline
        Write-Host "$file" -ForegroundColor White -NoNewline
        
        if ($sizeMB -ge 1) {
            Write-Host " ($sizeMB MB)" -ForegroundColor Yellow
        } else {
            Write-Host " ($sizeKB KB)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ " -ForegroundColor Red -NoNewline
        Write-Host "$file" -ForegroundColor White -NoNewline
        Write-Host " - NO ENCONTRADO" -ForegroundColor Red
        $allExist = $false
    }
}

Write-Host ""
Write-Host "----------------------------------------" -ForegroundColor Cyan

if ($allExist) {
    $totalMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host "✅ Todos los recursos existen" -ForegroundColor Green
    Write-Host "📦 Tamaño total: $totalMB MB" -ForegroundColor Yellow
    
    # Verificar ratio de compresión mobile vs desktop
    Write-Host ""
    Write-Host "Comparación Desktop vs Mobile:" -ForegroundColor Cyan
    
    $desktopVideoPath = Join-Path $imagesPath "cover.mp4"
    $mobileVideoPath = Join-Path $imagesPath "cover-mobile.mp4"
    
    if ((Test-Path $desktopVideoPath) -and (Test-Path $mobileVideoPath)) {
        $desktopVideo = Get-Item $desktopVideoPath
        $mobileVideo = Get-Item $mobileVideoPath
        
        $desktopMB = [math]::Round($desktopVideo.Length / 1MB, 2)
        $mobileMB = [math]::Round($mobileVideo.Length / 1MB, 2)
        $ratio = [math]::Round(($mobileVideo.Length / $desktopVideo.Length) * 100, 2)
        
        Write-Host "  Video Desktop: $desktopMB MB" -ForegroundColor White
        Write-Host "  Video Mobile:  $mobileMB MB" -ForegroundColor White
        Write-Host "  Compresión:    $ratio%" -ForegroundColor $(if ($ratio -lt 50) { "Green" } else { "Yellow" })
        
        if ($ratio -gt 60) {
            Write-Host "  ⚠️  Considera comprimir más el video mobile" -ForegroundColor Yellow
        }
    }
    
    $desktopImagePath = Join-Path $imagesPath "cover.jpg"
    $mobileImagePath = Join-Path $imagesPath "cover-mobile.jpg"
    
    if ((Test-Path $desktopImagePath) -and (Test-Path $mobileImagePath)) {
        $desktopImage = Get-Item $desktopImagePath
        $mobileImage = Get-Item $mobileImagePath
        
        $desktopKB = [math]::Round($desktopImage.Length / 1KB, 2)
        $mobileKB = [math]::Round($mobileImage.Length / 1KB, 2)
        $ratio = [math]::Round(($mobileImage.Length / $desktopImage.Length) * 100, 2)
        
        Write-Host ""
        Write-Host "  Imagen Desktop: $desktopKB KB" -ForegroundColor White
        Write-Host "  Imagen Mobile:  $mobileKB KB" -ForegroundColor White
        Write-Host "  Compresión:     $ratio%" -ForegroundColor $(if ($ratio -lt 50) { "Green" } else { "Yellow" })
        
        if ($ratio -gt 60) {
            Write-Host "  ⚠️  Considera comprimir más la imagen mobile" -ForegroundColor Yellow
        }
    }
    
} else {
    Write-Host "❌ Faltan recursos" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para crear versiones mobile optimizadas, usa ffmpeg:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  # Comprimir video" -ForegroundColor Gray
    Write-Host '  ffmpeg -i cover.mp4 -vf "scale=-1:1280" -b:v 1.5M -c:v libx264 -preset slow cover-mobile.mp4' -ForegroundColor White
    Write-Host ""
    Write-Host "  # Comprimir imagen" -ForegroundColor Gray
    Write-Host '  ffmpeg -i cover.jpg -vf "scale=-1:1280" -q:v 3 cover-mobile.jpg' -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan