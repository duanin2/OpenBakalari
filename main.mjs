import qt from "@nodegui/nodegui";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";
import envPaths from "env-paths";

const paths = envPaths("OpenBakalari", { suffix: "" });

const usersDBFilename = "usersDB";

const loginWidgets = {};

loginWidgets["userSelector"] = new qt.QComboBox();

let accessToken;
let refreshToken;
let users = {};

const loginTypePassword = 0;
const loginTypeRefreshToken = 1;
let loginType = loginTypePassword;

const createDataDir = fs.mkdir(paths.data, {
		recursive: true,
		mode: 0o700
});

createDataDir.then(() => {
		const usersDB = fs.readFile(path.join(paths.data, usersDBFilename), {
				encoding: "utf-8"
		});

		usersDB.then((json) => {
				users = JSON.parse(json);

				loginWidgets["userSelector"].addItem(undefined, "None");
				for (const instance in users) {
						for (const user in users[instance]) {
								loginWidgets["userSelector"].addItem(undefined, `${instance}:${user}`);
						}
				}
		}).catch((err) => {
				if (err.code = 'ENOENT') {
						console.error("Nonexistent usersDB file.");
				}
		});
}).catch((err) => {
		console.error(err);
});

const qApp = qt.QApplication.instance();
const win = new qt.QMainWindow();

const loginWin = new qt.QWidget();
loginWin.setObjectName("root");
loginWin.setInlineStyle("margin: auto; padding: 4px;");
loginWin.setMinimumSize(200, 150);
const loginLayout = new qt.FlexLayout();
loginWin.setLayout(loginLayout);

const mainWin = new qt.QWidget();

loginWidgets["label"] = new qt.QLabel();
loginWidgets["label"].setInlineStyle("font-size: 16px;");
loginWidgets["label"].setText("Login");

loginWidgets["errorMessage"] = new qt.QLabel();
loginWidgets["errorMessage"].setInlineStyle("color: red;");
loginWidgets["errorMessage"].setDisabled(true);

loginWidgets["instance"] = new qt.QLineEdit();
loginWidgets["instance"].setPlaceholderText("Instance URL");

loginWidgets["username"] = new qt.QLineEdit();
loginWidgets["username"].setPlaceholderText("Username");

loginWidgets["password"] = new qt.QLineEdit();
loginWidgets["password"].setPlaceholderText("Password");

loginWidgets["loginType"] = new qt.QComboBox();
loginWidgets["loginType"].addItem(undefined, "Password");
loginWidgets["loginType"].addItem(undefined, "Refresh Token");
loginWidgets["loginType"].addEventListener('currentIndexChanged', (index) => {
		loginType = index;

		if (loginType == loginTypePassword) {
				loginWidgets["password"].setPlaceholderText("Password");
				loginWidgets["password"].setText("");
		} else if (loginType == loginTypeRefreshToken) {
				loginWidgets["password"].setPlaceholderText("Refresh Token");
				loginWidgets["password"].setText("");
		}
});

loginWidgets["userSelector"].addEventListener('currentTextChanged', (text) => {
		if (text == "None") {
				loginWidgets["instance"].setText("");
				loginWidgets["username"].setText("");
				loginWidgets["password"].setText("");
		}
		
		const instance = text.split(":")[0];
		const username = text.split(":")[1];
		const refreshToken = users[instance][username];

		loginWidgets["loginType"].setCurrentIndex(loginTypeRefreshToken);

		loginWidgets["instance"].setText(instance);
		loginWidgets["username"].setText(username);
		loginWidgets["password"].setText(refreshToken);
});

loginWidgets["login"] = new qt.QPushButton();
loginWidgets["login"].setInlineStyle("width: 50%;");
loginWidgets["login"].setText("Login");
loginWidgets["login"].addEventListener('clicked', () => {
		const instance = loginWidgets["instance"].text();
		const username = loginWidgets["username"].text();
		const password = loginWidgets["password"].text();

		if (!instance || !username || !password) {
				loginWidgets["errorMessage"].setText("A required field is missing.");
				loginWidgets["errorMessage"].setEnabled(true);
				return;
		}

		loginWidgets["errorMessage"].setText("");
		loginWidgets["errorMessage"].setDisabled(true);

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
								login["errorMessage"].setText(json.error_description);
								login["errorMessage"].setEnabled(true);
								return;
						}
						
						accessToken = json.access_token;
						refreshToken = json.refresh_token;
						
						if (users[instance] == undefined) {
								users[instance] = {};
						}
						
						users[instance][username] = refreshToken;
						
						const usersDBwrite = fs.writeFile(path.join(paths.data, usersDBFilename), JSON.stringify(users), { mode: 0o600 });
						
				loginWin.hide();
				});
		});

		loginReq.on('error', (err) => {
				loginWidgets["errorMessage"].setText(err);
				loginWidgets["errorMessage"].setEnabled(true);
				return;
		});

		if (loginType == loginTypePassword) {
				loginReq.write(`client_id=ANDR&grant_type=password&username=${username}&password=${password}`);
		} else if (loginType == loginTypeRefreshToken) {
				loginReq.write(`client_id=ANDR&grant_type=refresh_token&username=${username}&refresh_token=${password}`);
		}
		loginReq.end();
});
loginWidgets["cancel"] = new qt.QPushButton();
loginWidgets["cancel"].setInlineStyle("width: 50%;");
loginWidgets["cancel"].setText("Cancel");
loginWidgets["cancel"].addEventListener('clicked', () => {
		qApp.quit();
});

loginWidgets.order = [
		"label",
		"errorMessage",
		"userSelector",
		"loginType",
		"instance",
		"username",
		"password",
		"login",
		"cancel"
];
let orderedLoginWidgets = [];
for (const name in loginWidgets) {
		if (name == "order") {
				continue;
		}
		for (let i = 0; i < loginWidgets.order.length; i++) {
				if (loginWidgets.order[i] != name) {
						continue;
				}

				orderedLoginWidgets[i] = loginWidgets[name];
		}
}
for (const widget of orderedLoginWidgets) {
		loginLayout.addWidget(widget);
}

loginWin.show();

global.win = win;
