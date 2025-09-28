/**
 * Generiert die XML-Antwortdatei (autounattend.xml) basierend auf den Benutzereingaben.
 */
function generateFile() {
    // Eingabewerte aus den DOM-Elementen abrufen
    const architecture = document.getElementById('architecture').value;
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const language = document.getElementById('language').value;
    const computerNameInput = document.getElementById('computerName').value;
    const productKeyInput = document.getElementById('productKey').value;
    const disableDiagnostics = document.getElementById('disable-diagnostics').checked;
    const disableAds = document.getElementById('disable-ads').checked;
    const disconnectNetwork = document.getElementById('disconnect-network').checked;

    
    // Logik für ProtectYourPC-Wert (Datenschutz & Telemetrie)
    let protectYourPCValue = 1; // Standard (Standard-Telemetrie)
    if (disableDiagnostics || disableAds) {
        protectYourPCValue = 3; // Deaktiviert Diagnosedaten und Werbe-ID
    }

    // Erstellen des XML-Blocks für das lokale Benutzerkonto
    let userAccountXml = '';
    if (usernameInput) {
        userAccountXml = 
    `<UserAccounts>
        <LocalAccounts>
            <LocalAccount wcm:action="add">
                <Name>${usernameInput}</Name>
                <Group>Administrators</Group>
                <Password>
                    <Value>${passwordInput}</Value>
                    <PlainText>true</PlainText>
                </Password>
            </LocalAccount>
        </LocalAccounts>
    </UserAccounts>`;
    }

    // Erstellen des XML-Blocks für den Product Key
    let productKeyXml = `<Key/>`;
    if (productKeyInput) {
        productKeyXml = `<Key>${productKeyInput}</Key>`;
    }

    // Erstellen des XML-Blocks für den Computer-Namen
    let computerNameXml = '';
    if (computerNameInput) {
        computerNameXml = `<ComputerName>${computerNameInput}</ComputerName>`;
    }

    // Erstellen des XML-Blocks zur Deaktivierung der Netzwerkverbindung (Offline-Kontozwang-Umgehung)
    const networkComponentsXml = disconnectNetwork ? 
`<settings pass="offlineServicing">
    <component name="Microsoft-Windows-PnpCustomizationsWinPE" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
        <DisableWLANUI>true</DisableWLANUI>
        <DisableWiredNetwork>true</DisableWiredNetwork>
    </component>
</settings>` : '';

    // Die komplette XML-Vorlage
    const xmlTemplate = `

<?xml version="1.0" encoding="utf-8"?>
<unattend xmlns="urn:schemas-microsoft-com:unattend" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <settings pass="windowsPE">
        <component name="Microsoft-Windows-International-Core-WinPE" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <UILanguage>${language}</UILanguage>
        </component>
        <component name="Microsoft-Windows-Setup" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <UserData>
                <ProductKey>
                    ${productKeyXml}
                </ProductKey>
            </UserData>
        </component>
    </settings>
    <settings pass="specialize">
        <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            ${computerNameXml}
        </component>
        <!-- Führt den BypassNRO-Registry-Eintrag aus, um den Online-Kontenzwang zu umgehen -->
        <component name="Microsoft-Windows-Deployment" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <RunSynchronous>
                <RunSynchronousCommand wcm:action="add">
                    <Order>1</Order>
                    <Path>reg add HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\OOBE /v BypassNRO /t REG_DWORD /d 1 /f</Path>
                </RunSynchronousCommand>
            </RunSynchronous>
        </component>
    </settings>
    <settings pass="oobeSystem">
        <component name="Microsoft-Windows-International-Core" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <InputLocale>${language}</InputLocale>
            <SystemLocale>${language}</SystemLocale>
            <UILanguage>${language}</UILanguage>
            <UserLocale>${language}</UserLocale>
        </component>
        <component name="Microsoft-Windows-Shell-Setup" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
            <OOBE>
                <HideEULAPage>true</HideEULAPage>
                <HideOnlineAccountScreens>true</HideOnlineAccountScreens>
                <HideWirelessSetupInOOBE>true</HideWirelessSetupInOOBE>
                <ProtectYourPC>${protectYourPCValue}</ProtectYourPC>
            </OOBE>
            ${userAccountXml}
        </component>
    </settings>
    ${networkComponentsXml}
</unattend>`;

    // Ausgabe in der Textarea anzeigen
    document.getElementById('output').value = xmlTemplate.trim();
    document.getElementById('output-container').style.display = 'block';
    document.getElementById('output').style.height = '16rem';
}

/**
 * Zeigt die Erfolgsmeldung für das Kopieren an und blendet sie nach 2 Sekunden wieder aus.
 */
function showCopySuccessMessage() {
    const copyButton = document.getElementById('copy-button');
    const successMessage = document.getElementById('copy-success');
    copyButton.style.display = 'none';
    successMessage.style.display = 'block';
    setTimeout(() => {
        copyButton.style.display = 'block';
        successMessage.style.display = 'none';
    }, 2000);
}

/**
 * Kopiert den Inhalt der generierten XML-Datei in die Zwischenablage.
 */
function copyToClipboard() {
    const outputTextarea = document.getElementById('output');
    // Textarea auswählen, um den Inhalt kopieren zu können
    outputTextarea.select();
    try {
        // document.execCommand('copy') wird verwendet, da navigator.clipboard
        // in bestimmten Sandbox-Umgebungen möglicherweise nicht funktioniert.
        document.execCommand('copy'); 
        showCopySuccessMessage();
    } catch (err) {
        console.error('Fehler: Konnte den Text nicht kopieren.', err);
    }
    // Auswahl des Texts aufheben
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}


/**
 * Event-Listener anhängen, nachdem das DOM vollständig geladen wurde.
 * Dies ist notwendig, da das Skript mit 'defer' geladen wird.
 */
document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    const copyButton = document.getElementById('copy-button');

    if (generateButton) {
        generateButton.addEventListener('click', generateFile);
    }

    // Der Kopier-Button ist anfangs nicht sichtbar, aber wir binden den Listener trotzdem.
    if (copyButton) {
        copyButton.addEventListener('click', copyToClipboard);
    }
});
