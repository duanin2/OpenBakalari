import { Store } from '@tauri-apps/plugin-store';
import { Bakaláři } from "./api.mts";

interface Account {
	customName?: string,
	instance: string,
	username: string,
	password: string,
	refreshToken?: string
}

const store = new Store('store.bin');

let form = document.getElementById("loginForm") as HTMLFormElement | null;
let span = document.getElementById("login") as HTMLSpanElement | null;
let accountSelect = document.getElementById("selAcc") as HTMLSelectElement | null;

const url = new URL(location.href);

let accounts: Array<Account>;
try {
	accounts = (await store.get("accounts")) ?? [];
} catch (err) {
	accounts = [];
}

if (accountSelect !== null) {
	for (let i = 0; i < accounts.length; i++) {
		const acc = accounts[i];

		let option = document.createElement("option");
		option.text = acc.customName ?? `${acc.username}@${acc.instance}`;
		option.value = i.toString();
		accountSelect.add(option);
	}
}

let account: Account = {
	instance: "",
	username: "",
	password: "",
	refreshToken: ""
};
let accessToken = "";
