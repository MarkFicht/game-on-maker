# Android Emulator — debugowanie

Apka testowana lokalnie na emulatorze Android (Pixel 6, API 35) przez `npx expo run:android`.

## Podstawowe komendy ADB

```powershell
# Lista podłączonych urządzeń (emulator powinien być widoczny)
adb devices

# Wymuś połączenie po WiFi (gdy USB)
adb tcpip 5555
adb connect 192.168.x.x:5555
```

## Śledzenie logów (logcat)

Gdy apka crashuje bez widocznego błędu (silent crash — wraca do pulpitu bez red screen):

```powershell
# Wszystkie fatalne błędy + crash apki
adb logcat | Select-String -Pattern "FATAL|AndroidRuntime|com.wordrushmf"

# Pełny logcat tylko błędów (poziom E)
adb logcat *:E

# Dump logu po crashu i wyjście
adb logcat -d | Select-String -Pattern "FATAL|Exception" | Select-Object -Last 50
```

## Kiedy używać

- Apka pada na "keeps stopping" bez żadnego komunikatu w Metro
- Red screen nie pojawia się — crash jest natywny (Java/Kotlin), nie JS
- Metro bundluje bez błędów ale apka nie startuje

## Przykład błędu (expo-av crash)

```
E AndroidRuntime: FATAL EXCEPTION: pool-3-thread-1
E AndroidRuntime: java.lang.NoClassDefFoundError: Failed resolution of: Lexpo/modules/kotlin/types/LazyKType
E AndroidRuntime:   at expo.modules.av.video.VideoViewModule.definition(VideoViewModule.kt:118)
```

Taki błąd oznacza konflikt wersji natywnych zależności — widoczny tylko przez logcat, Metro nic nie pokazuje.

## Przeładowanie JS bez rebuilda

```
# W terminalu Metro — wymusza świeży bundle
r
```

Potrzebne po każdej zmianie gdy Fast Refresh nie działa automatycznie (zrywa połączenie gdy apka idzie w tło).
