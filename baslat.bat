@echo off
title Overload Pro - Fitness Sunucusu
cls
echo ======================================================
echo    OVERLOAD PRO - FITNESS TAKIP UYGULAMASI
echo ======================================================
echo.

:: IP adresini otomatik bul
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found_ip
)

:found_ip
:: Bosluklari temizle
set IP=%IP: =%

echo Bilgisayarinizdaki sunucu baslatildi!
echo.
echo Telefonunuz ile ayni agda (Wi-Fi / Hotspot) oldugunuzdan emin olun.
echo.
echo 1) Telefonunuzda Safari veya Chrome'u acin.
echo 2) Adres cubuguna su adresi yazin:
echo.
echo    http://%IP%:8000
echo.
echo 3) Sayfa acilinca 'Ana Ekrana Ekle' diyerek telefonunuza kalici yukleyin!
echo.
echo ======================================================
echo Bu pencere acik kaldigi surece sunucu hic kapanmaz.
echo ======================================================
echo.

cd /d "%~dp0"
python -m http.server 8000
pause
