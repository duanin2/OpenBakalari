import fs from "node:fs/promises";
import path from "node:path";

async function readUsers(dataPath, filename) {
		try {
				await fs.mkdir(dataPath, {
						recursive: true,
						mode: 0o700
				});
		} catch (err) {
				throw err;
		}

		try {
				return JSON.parse(await fs.readFile(path.join(dataPath, filename), { encoding: "utf-8" }));
		} catch (err) {
				throw err;
		}
}

async function writeUsers(dataPath, filename, users) {
		try {
				await fs.writeFile(path.join(dataPath, filename), JSON.stringify(users), { mode: 0o600 });
		} catch (err) {
				throw err;
		}
}

export { readUsers, writeUsers };
