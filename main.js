const qt = require("@nodegui/nodegui");
const https = require("https");

const qApp = qt.QApplication.instance();
const win = new qt.QMainWindow();

const centralWidget = new qt.QWidget();
centralWidget.setObjectName("root");
centralWidget.setInlineStyle("margin: auto; padding: 4px;");
const rootLayout = new qt.FlexLayout();
centralWidget.setLayout(rootLayout);

const label = new qt.QLabel();
label.setInlineStyle("font-size: 16px;");
label.setText("Login");

const errorMessage = new qt.QLabel();
errorMessage.setInlineStyle("color: red;");
errorMessage.setDisabled(true);

const instanceField = new qt.QLineEdit();
instanceField.setPlaceholderText("Instance URL");

const userField = new qt.QLineEdit();
userField.setPlaceholderText("Username");

const passField = new qt.QLineEdit();
passField.setPlaceholderText("Password");

const loginButton = new qt.QPushButton();
loginButton.setText("Login");
loginButton.addEventListener('clicked', () => {
		const instance = instanceField.text();
		const username = userField.text();
		const password = passField.text();

		if (!instance || !username || !password) {
				errorMessage.setText("A required field is missing.");
				errorMessage.setEnabled(true);
				return;
		}

		errorMessage.setText("");
		errorMessage.setDisabled(true);

		let accessToken;
		let refreshToken;

		const loginReq = https.request({
				hostname: instance,
				path: "/api/login",
				method: 'POST',
				headers: {
						'Content-Type': "application/x-www-form-urlencoded"
				}
		}, (res) => {
				let json = "";
				
				res.on('data', (chunk) => {
						json += chunk;
				});

				res.on('end', () => {
						json = JSON.parse(json);

						if (res.statusCode == 400) {
								errorMessage.setText(json.error_description);
								errorMessage.setEnabled(true);
								return;
						}
						
						accessToken = json.access_token;
						refreshToken = json.refresh_token;
						
						qApp.quit();
				});
		});

		loginReq.on('error', (err) => {
				errorMessage.setText(err);
				errorMessage.setEnabled(true);
				return;
		});

		loginReq.write(`client_id=ANDR&grant_type=password&username=${username}&password=${password}`);
		loginReq.end();
});

rootLayout.addWidget(label);
rootLayout.addWidget(errorMessage);
rootLayout.addWidget(instanceField);
rootLayout.addWidget(userField);
rootLayout.addWidget(passField);
rootLayout.addWidget(loginButton);
win.setCentralWidget(centralWidget);
win.show();

global.win = win;
