import qt from "@nodegui/nodegui";
import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import https from "node:https";
import envPaths from "env-paths";

import { loginWin, loginLayout } from "./loginWin.mjs";
import { readUsers, writeUsers } from "./usersDB.mjs";

const paths = envPaths("OpenBakalari", { suffix: "" });

const usersDBFilename = "usersDB";

let accessToken;
let refreshToken;
let users = {};

try {
		users = await readUsers(paths.data, usersDBFilename);
} catch (err) {
		console.log("No usersDB found");
		console.error(err);
}

const loginTypePassword = 0;
const loginTypeRefreshToken = 1;

const qApp = qt.QApplication.instance();
const win = new qt.QMainWindow();

const mainWin = new qt.QWidget();

loginLayout.getValueOf("loginType").addEventListener('currentIndexChanged', (index) => {
		if (index == loginTypePassword) {
				loginLayout.getValueOf("password").setPlaceholderText("Password");
				loginLayout.getValueOf("password").setText("");
		} else if (index == loginTypeRefreshToken) {
				loginLayout.getValueOf("password").setPlaceholderText("Refresh Token");
				loginLayout.getValueOf("password").setText("");
		}
});

for (const instance in users) {
		for (const user in users[instance]) {
				loginLayout.getValueOf("userSelector").addItem(undefined, `${instance}:${user}`);
		}
}

loginLayout.getValueOf("userSelector").addEventListener('currentTextChanged', (text) => {
		if (text == "None") {
				loginLayout.getValueOf("instance").setText("");
				loginLayout.getValueOf("username").setText("");
				loginLayout.getValueOf("password").setText("");
				return;
		}
		
		const instance = text.split(":")[0];
		const username = text.split(":")[1];
		const refreshToken = users[instance][username];

		loginLayout.getValueOf("loginType").setCurrentIndex(loginTypeRefreshToken);

		loginLayout.getValueOf("instance").setText(instance);
		loginLayout.getValueOf("username").setText(username);
		loginLayout.getValueOf("password").setText(refreshToken);
});

loginLayout.getValueOf("login").addEventListener('clicked', () => {
		const instance = loginLayout.getValueOf("instance").text();
		const username = loginLayout.getValueOf("username").text();
		const password = loginLayout.getValueOf("password").text();

		if (!instance || !username || !password) {
				loginLayout.getValueOf("errorMessage").setText("A required field is missing.");
				loginLayout.getValueOf("errorMessage").setEnabled(true);
				return;
		}

		loginLayout.getValueOf("errorMessage").setText("");
		loginLayout.getValueOf("errorMessage").setDisabled(true);

		const req = https.request({
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
								loginLayout.getValueOf("errorMessage").setText(json.error_description);
								loginLayout.getValueOf("errorMessage").setEnabled(true);
								return;
						}
						
						accessToken = json.access_token;
						refreshToken = json.refresh_token;
						
						if (users[instance] == undefined) {
								users[instance] = {};
						}
						
						users[instance][username] = refreshToken;

						writeUsers(paths.data, usersDBFilename, users);
						
						loginWin.hide();
						win.show();
				});
		});

		req.on('error', (err) => {
				loginLayout.getValueOf("errorMessage").setText(err);
				loginLayout.getValueOf("errorMessage").setEnabled(true);
				return;
		});

		if (loginLayout.getValueOf("loginType").currentIndex() == loginTypePassword) {
				req.write(`client_id=ANDR&grant_type=password&username=${username}&password=${password}`);
		} else if (loginLayout.getValueOf("loginType").currentIndex() == loginTypeRefreshToken) {
				req.write(`client_id=ANDR&grant_type=refresh_token&username=${username}&refresh_token=${password}`);
		}
		req.end();
});

loginLayout.getValueOf("cancel").addEventListener('clicked', () => {
		qApp.quit();
});

loginWin.show();

global.win = win;
