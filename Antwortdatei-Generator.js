/**
 * Generates a Windows unattend.xml file based on the given input.
 * @param {string} architecture - The architecture of the Windows installation.
 * @param {string} usernameInput - The username to create a local account with.
 * @param {string} passwordInput - The password for the local account.
 * @param {string} language - The language to set as the default language for the Windows installation.
 * @param {string} computerNameInput - The name of the computer to set during the Windows installation.
 * @param {string} productKeyInput - The product key to use during the Windows installation.
 * @param {boolean} disableDiagnostics - Whether to disable diagnostics during the Windows installation.
 * @param {boolean} disableAds - Whether to disable ads during the Windows installation.
 * @param {boolean} disconnectNetwork - Whether to disconnect the network during the Windows installation.
 */
function generateFile() {
	const architecture = document.getElementById('architecture').value;
	const usernameInput = document.getElementById('username').value;
	const passwordInput = document.getElementById('password').value;
	const language = document.getElementById('language').value;
	const computerNameInput = document.getElementById('computerName').value;
	const productKeyInput = document.getElementById('productKey').value;
	const disableDiagnostics = document.getElementById('disable-diagnostics').checked;
	const disableAds = document.getElementById('disable-ads').checked;
	const disconnectNetwork = document.getElementById('disconnect-network').checked;


	let protectYourPCValue = 1; // Standard
	if (disableDiagnostics || disableAds) {
		protectYourPCValue = 3; // Wert zum Deaktivieren von Diagnosedaten und Werbe-ID
	}

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

	let productKeyXml = `<Key/>`;
	if (productKeyInput) {
		productKeyXml = `<Key>${productKeyInput}</Key>`;
	}

	let computerNameXml = '';
	if (computerNameInput) {
		computerNameXml = `<ComputerName>${computerNameInput}</ComputerName>`;
	}


	const networkComponentsXml = disconnectNetwork ? 
	`<settings pass="offlineServicing">
		<component name="Microsoft-Windows-PnpCustomizationsWinPE" processorArchitecture="${architecture}" publicKeyToken="31bf3856ad364e35" language="neutral" versionScope="nonSxS" xmlns:wcm="http://schemas.microsoft.com/WMIConfig/2002/State" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
			<DisableWLANUI>true</DisableWLANUI>
			<DisableWiredNetwork>true</DisableWiredNetwork>
		</component>
	</settings>` : '';

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

	document.getElementById('output').value = xmlTemplate.trim();
	document.getElementById('output-container').style.display = 'block';
	document.getElementById('output').style.height = '16rem';
}

/**
 * Copies the generated XML to the clipboard.
 * If the copy operation fails, an error message will be logged to the console.
 * After the copy operation, the selection will be removed from the output textarea.
 * @throws {Error} If the copy operation fails.
 */
function copyToClipboard() {
	const outputTextarea = document.getElementById('output');
	outputTextarea.select();
	try {
		navigator.clipboard.writeText(outputTextarea.value)
			.then(showCopySuccessMessage)
			.catch(err => {
				console.error('Fehler: Konnte den Text nicht kopieren.', err);
			});
	} catch (err) {
		console.error('Fehler: Konnte den Text nicht kopieren.', err);
	}
	if (window.getSelection) {
		window.getSelection().removeAllRanges();
	}
}

/**
 * Displays a temporary success message after copying text to the clipboard and hides the copy button.
 * The success message is shown for 2 seconds, after which the copy button is shown again and the message is hidden.
 * This function is called after a successful copy operation in the copyToClipboard function.
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