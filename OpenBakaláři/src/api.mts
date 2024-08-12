import { fetch } from "@tauri-apps/plugin-http";

interface dailyAbsence {
	unsolved: number,
	ok: number,
	missed: number,
	late: number,
	soon: number,
	school: number,
	distance: number
}
interface subjectAbsence {
	lessons: number,
	base: number,
	late: number,
	soon: number,
	school: number,
	distance: number
}

type APIObject = Map<string, {
	abbreviation: string,
	name: string
}>;

interface EventTime {
	wholeDay: boolean,
	start: number,
	end: number
}
interface event {
	title: string,
	description: string,
	times: Array<EventTime>,
	type: APIObject,
	classes: APIObject,
	classSets: APIObject,
	teachers: APIObject,
	teacherSets: APIObject,
	rooms: APIObject,
	roomSets: APIObject,
	students: APIObject,
	note: string,
	changed: number
};

interface Message {
	type: {
		machine: string,
		human: string
	},
	title: string,
	text: string,
	sent: number,
	sender: Map<string, {
		type: string,
		name: string
	}>,
	attachments: Map<string, Attachment>,
	read: boolean,
	lifetime: string,
	from: number | null,
	to: number | null,
	confirmed: boolean,
	canConfirm: boolean,
	canAnswer: boolean,
	hidden: boolean,
	canHide: boolean,
	relevantName: string,
	relevantPeresonType: string
}
interface Attachment {
	name: string,
	type: string,
	size: number
}

interface Mark {
	creation: number,
	edit: number,
	caption: string,
	theme: string,
	text: string,
	teacherId: string,
	type: {
		machine: string,
		human: string
	},
	weight: number,
	new: boolean,
	points: {
		text: string,
		use: boolean,
		max: number
	},
	calculatedText: string,
	classRank: string | null
}
interface MarksSubject {
	abbreviation: string,
	name: string,
	average: number,
	temporary: {
		text: string,
		note: string
	},
	note: string,
	pointsOnly: boolean,
	markPrediction: boolean,
	marks: Map<string, Mark>
}

class APIError extends Error {
	public cause: any;

	constructor(message: string, cause: any) {
		super(message);
		this.cause = cause;
		this.name = 'APIError';
	}

	public toString() {
		return `${this.name}: ${this.message} because of ${this.cause}`;
	}
}
class HTTPError extends Error {
	public cause: any;

	constructor(code: number, text: string, cause: any) {
		super(`${code}: ${text}`);
		this.cause = cause;
		this.name = 'HTTPError';
	}

	public toString() {
		return `${this.name}: ${this.message} because of ${this.cause}`;
	}
}

class Bakaláři {
	private instance: URL;
	private accessToken: string;

	constructor(instance: URL) {
		this.instance = instance;
	}

	public static toAPIObject(arr: Array<{
		Id: string,
		Abbrev: string,
		Name: string
	}>): APIObject {
		let res = new Map<string, {
			abbreviation: string,
			name: string
		}>();
		for (let obj of arr) {
			res.set(obj.Id, {
				abbreviation: obj.Abbrev.trim(),
				name: obj.Name
			});
		}

		return res;
	}

	public async loginPassword(username: string, password: string): Promise<string> {
		let instance = structuredClone(this.instance);

		instance.pathname = "/api/login";
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded"
		});

		try {
			const res = await fetch(instance.href, {
				headers,
				method: "POST",
				body: `client_id=ANDR&grant_type=password&username=${username}&password=${password}`
			});
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();
			this.accessToken = data.access_token;
			return data.refresh_token;
		} catch (err: any) {
			throw new APIError("Couldn't successfully login", err);
		}
	}

	public async loginRefreshToken(refreshToken: string): Promise<string> {
		let instance = structuredClone(this.instance);

		instance.pathname = "/api/login";
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded"
		});

		try {
			const res = await fetch(instance.href, {
				headers,
				method: "POST",
				body: `client_id=ANDR&grant_type=refresh_token&refresh_token=${refreshToken}`
			});
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();
			this.accessToken = data.access_token;
			return data.refresh_token;
		} catch (err: any) {
			throw new APIError("Couldn't successfully login", err);
		}
	}

	public async info(): Promise<{
		APIVersion: string,
		appVersion: string
	}> {
		let instance = structuredClone(this.instance);

		instance.pathname = "/api/3";

		try {
			const res = await fetch(instance.href);
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();
			return {
				APIVersion: data.ApiVersion,
				appVersion: data.ApplicationVersion
			};
		} catch (err: any) {
			throw new APIError("Couldn't fetch version information", err);
		}
	}

	public async absence(): Promise<{
		threshold: number,
		daily: Map<number, dailyAbsence>,
		perSubject: Map<string, subjectAbsence>
	}> {
		let instance = structuredClone(this.instance);

		instance.pathname = "/api/3/absence/student";
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, {
				headers
			});
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();

			let daily = new Map<number, dailyAbsence>();
			for (let day of data.Absences) {
				daily.set(Date.parse(day.Date), {
					unsolved: day.Unsolved,
					ok: day.Ok,
					missed: day.Missed,
					late: day.Late,
					soon: day.Soon,
					school: day.School,
					distance: day.DistanceTeaching
				});
			}

			let perSubject = new Map<string, subjectAbsence>();
			for (let subject of data.AbsencesPerSubject) {
				perSubject.set(subject.SubjectName, {
					lessons: subject.LessonsCount,
					base: subject.Base,
					late: subject.Late,
					soon: subject.Soon,
					school: subject.School,
					distance: subject.DistanceTeaching
				});
			}

			return {
				threshold: data.PercentageThreshold,
				daily,
				perSubject
			};
		} catch (err: any) {
			throw new APIError("Couldn't fetch absence information", err);
		}
	}

	public async events(type: "all" | "my" | "public" = "all", from?: number): Promise<Map<string, event>> {
		let instance = structuredClone(this.instance);

		switch (type) {
			case "all":
				instance.pathname = "/api/3/events";
				break;
			case "my":
				instance.pathname = "/api/3/events/my";
				break;
			case "public":
				instance.pathname = "/api/3/events/public";
				break;
		}
		if (from !== undefined) {
			let fromDate = new Date(from);
			instance.searchParams.set("from", fromDate.toISOString().split("T")[0]);
		}
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, {
				headers
			});
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();

			let events = new Map<string, event>();
			for (let event of data.Events) {
				let res: event = {
					title: event.Title,
					description: event.Description,
					times: [],
					type: Bakaláři.toAPIObject([event.EventType]),
					classes: Bakaláři.toAPIObject(event.Classes),
					classSets: Bakaláři.toAPIObject(event.ClassSets),
					teachers: Bakaláři.toAPIObject(event.Teachers),
					teacherSets: Bakaláři.toAPIObject(event.TeacherSets),
					rooms: Bakaláři.toAPIObject(event.Rooms),
					roomSets: Bakaláři.toAPIObject(event.RoomSets),
					students: Bakaláři.toAPIObject(event.Students),
					note: event.Note,
					changed: Date.parse(event.DateChanged)
				};
				for (let eventTime of event.EventTimes) {
					res.times.push({
						wholeDay: eventTime.WholeDay,
						start: Date.parse(eventTime.StartTime),
						end: Date.parse(eventTime.EndTime)
					});
				}
				events.set(event.Id, res);
			}

			return events;
		} catch (err: any) {
			throw new APIError("Couldn't fetch event information", err);
		}
	}

	public async commissioners(): Promise<{
		id: string,
		name: string,
		phoneNumber: {
			mobile: string,
			landline: string
		},
		email: string,
		web: string,
		dataBox: string
	}> {
		let instance = structuredClone(this.instance);

		instance.pathname = "/api/3/gdpr/commissioners";
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, { headers });
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();
			return {
				id: data.Id,
				name: data.Name,
				phoneNumber: {
					mobile: data.Mobile,
					landline: data.Phone
				},
				email: data.Email,
				web: data.Web,
				dataBox: data.dataBox
			};
		} catch (err: any) {
			throw new APIError("Couldn't fetch information about commissioners", err);
		}
	}

	public async homeworks(from?: number, to?: number): Promise<Map<string, {
		date: {
			start: number,
			end: number
		},
		content: string,
		notice: string,
		done: boolean,
		closed: boolean,
		electronic: boolean,
		hour: number,
		class: APIObject,
		group: APIObject,
		subject: APIObject,
		teacher: APIObject,
		attachments: Map<string, {
			name: string,
			type: string,
			size: number
		}>,
		finished: boolean
	}>> {
		let instance = structuredClone(this.instance);

		instance.pathname = "/api/3/homework";
		if (from !== undefined) {
			let fromDate = new Date(from);
			instance.searchParams.set("from", fromDate.toISOString().split("T")[0]);
		}
		if (to !== undefined) {
			let toDate = new Date(to);
			instance.searchParams.set("to", toDate.toISOString().split("T")[0]);
		}
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, { headers });
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();

			let result = new Map<string, {
				date: {
					start: number,
					end: number
				},
				content: string,
				notice: string,
				done: boolean,
				closed: boolean,
				electronic: boolean,
				hour: number,
				class: APIObject,
				group: APIObject,
				subject: APIObject,
				teacher: APIObject,
				attachments: Map<string, {
					name: string,
					type: string,
					size: number
				}>,
				finished: boolean
			}>();
			for (let homework of data.Homeworks) {
				let hw = {
					date: {
						start: Date.parse(homework.DateStart),
						end: Date.parse(homework.DateEnd)
					},
					content: homework.Content,
					notice: homework.Notice,
					done: homework.Done,
					closed: homework.Closed,
					electronic: homework.Electronic,
					hour: homework.Hour,
					class: Bakaláři.toAPIObject([homework.Class]),
					group: Bakaláři.toAPIObject([homework.Group]),
					subject: Bakaláři.toAPIObject([homework.Subject]),
					teacher: Bakaláři.toAPIObject([homework.Teacher]),
					attachments: new Map<string, Attachment>(),
					finished: homework.Finished
				};
				for (let attachment of homework.Attachments) {
					hw.attachments.set(attachment.Id, {
						name: attachment.Name,
						type: attachment.Type,
						size: attachment.Size
					});
				}
				result.set(homework.ID, hw);
			}

			return result;
		} catch (err: any) {
			throw new APIError("Couldn't fetch homework information", err);
		}
	}

	public async homeworkCount(): Promise<number> {
		let instance = structuredClone(this.instance);

		instance.pathname = "/api/3/homework/count-actual";
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, { headers });
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.text();

			return parseInt(data, 10);
		} catch (err: any) {
			throw new APIError("Couldn't fetch homework information", err);
		}
	}

	public async attachmentDownload(id: string): Promise<{
		name: string,
		data: ArrayBuffer
	}> {
		let instance = structuredClone(this.instance);

		instance.pathname = `/api/3/komens/attachment/${id}`;
		let headers = new Headers({
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, { headers });
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.arrayBuffer();
			if (data.byteLength != parseInt(res.headers.get("Content-Length") ?? "0", 10)) throw new TypeError("Content-Length doesn't match length of data buffer");

			let name: string = "";
			for (let param of (res.headers.get("Content-Disposition") ?? "").split(";")) {
				let p = param.split("=");
				if (p[0] !== "filename*") continue;

				let encName = p[1].replace(/^utf-8''/, "");
				name = decodeURIComponent(encName);
			}
			if (typeof name !== "string" || name.length === 0) throw new TypeError("Filename must be at least 1 character long string");

			return {
				name,
				data
			};
		} catch (err: any) {
			throw new APIError("Couldn't fetch the attachment", err);
		}
	}

	public async komens(type: "all" | "noticeboard" = "all"): Promise<Map<string, Message>> {
		let instance = structuredClone(this.instance);

		switch (type) {
			case "all":
				instance.pathname = `/api/3/komens/messages/received`;
				break;
			case "noticeboard":
				instance.pathname = `/api/3/komens/messages/noticeboard`;
				break;
		}
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, { headers });
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();

			let result = new Map<string, Message>();
			for (let message of data.Messages) {
				let msg = {
					type: {
						machine: message.$type,
						human: message.Type
					},
					title: message.Title,
					text: message.Text,
					sent: Date.parse(message.Sent),
					sender: new Map<string, {
						type: string,
						name: string
					}>(),
					attachments: new Map<string, Attachment>(),
					read: message.Read,
					lifetime: message.LifeTime,
					from: message.DateFrom !== null ? Date.parse(message.DateFrom) : null,
					to: message.DateTo !== null ? Date.parse(message.DateTo) : null,
					confirmed: message.Confirmed,
					canConfirm: message.CanConfirm,
					canAnswer: message.CanAnswer,
					hidden: message.Hidden,
					canHide: message.CanHide,
					relevantName: message.RelevantName,
					relevantPeresonType: message.RelevantPersonType
				};
				msg.sender.set(message.Sender.Id, {
					type: message.Sender.Type,
					name: message.Sender.Name
				});
				result.set(message.Id, msg);
			}

			return result;
		} catch (err: any) {
			throw new APIError("Couldn't fetch homework information", err);
		}
	}

	public async komensUnread(type: "all" | "noticeboard" = "all"): Promise<number> {
		let instance = structuredClone(this.instance);

		switch (type) {
			case "all":
				instance.pathname = `/api/3/komens/messages/received/unread`;
				break;
			case "noticeboard":
				instance.pathname = `/api/3/komens/messages/noticeboard/unread`;
				break;
		}
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, { headers });
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.text();

			return parseInt(data, 10);
		} catch (err: any) {
			throw new APIError("Couldn't fetch homework information", err);
		}
	}

	public async capabilities(): Promise<Map<string, {
		iconId: string | null,
		submenu: string | null,
		name: string | null
	}>> {
		let instance = structuredClone(this.instance);

		instance.pathname = `/api/3/webmodule`;
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, { headers });
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();

			let result = new Map<string, {
				iconId: string | null,
				submenu: string | null,
				name: string | null
			}>();
			for (let webModule of data.WebModules) {
				result.set(webModule.Url, {
					iconId: webModule.IconId,
					submenu: webModule.SubMenu,
					name: webModule.Name
				});
			}
			result.set(data.Dashboard.Url, {
				iconId: data.Dashboard.IconId,
				submenu: data.Dashboard.SubMenu,
				name: data.Dashboard.Name ?? "Dashboard"
			});

			return result;
		} catch (err: any) {
			throw new APIError("Couldn't fetch homework information", err);
		}
	}

	public async browserToken(): Promise<string> {
		let instance = structuredClone(this.instance);

		instance.pathname = `/api/3/logintoken`;
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, { headers });
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.text();

			return data;
		} catch (err: any) {
			throw new APIError("Couldn't fetch homework information", err);
		}
	}

	public async marks(): Promise<Map<string, MarksSubject>> {
		let instance = structuredClone(this.instance);

		instance.pathname = `/api/3/marks`;
		let headers = new Headers({
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": `Bearer ${this.accessToken}`
		});

		try {
			const res = await fetch(instance.href, { headers });
			if (!res.ok) throw new HTTPError(res.status, res.statusText, await res.json());

			let data = await res.json();

			let result = new Map<string, MarksSubject>();
			for (let subject of data.Subjects) {
				let marks = new Map<string, Mark>();
				for (let mark of subject.Marks) {
					marks.set(mark.Id, {
						creation: Date.parse(mark.MarkDate),
						edit: Date.parse(mark.MarkEdit),
						caption: mark.Caption,
						theme: mark.Theme,
						text: mark.Text,
						teacherId: mark.TeacherId,
						type: {
							machine: mark.Type,
							human: mark.TypeNote
						},
						weight: mark.Weight,
						new: mark.IsNew,
						points: mark.IsPoints,
						calculatedText: mark.CalculatedMarkText,
						classRank: mark.ClassRankText
					});
				}

				result.set(subject.Subject.Id, {
					abbreviation: subject.Subject.Abbrev.trim(),
					name: subject.Subject.Name,
					average: parseFloat(subject.AverageText),
					temporary: {
						text: subject.TemporaryMark,
						note: subject.TemporaryMarkNote
					},
					note: subject.SubjectNote,
					pointsOnly: subject.PointsOnly,
					markPrediction: subject.MarkPredictionEnabled,
					marks
				});
			}

			return result;
		} catch (err: any) {
			throw new APIError("Couldn't fetch homework information", err);
		}
	}
}

export { Bakaláři };
