//#region src/lib/api.ts
async function request(path, init = {}) {
	try {
		const response = await fetch(path, {
			credentials: "same-origin",
			headers: init.body ? { "content-type": "application/json" } : void 0,
			...init
		});
		const text = await response.text();
		let payload = null;
		try {
			payload = text ? JSON.parse(text) : null;
		} catch {
			payload = null;
		}
		if (!response.ok) {
			const body = payload;
			return {
				ok: false,
				error: body?.error ? body.hint ? `${body.error} ${body.hint}` : body.error : response.status >= 500 ? `Server error (${response.status}). Check the server logs.` : `Request failed (${response.status})`
			};
		}
		return {
			ok: true,
			data: payload
		};
	} catch {
		return {
			ok: false,
			error: "Network error. Check your connection."
		};
	}
}
function signUp(email, name, password) {
	return request("/api/auth/signup", {
		method: "POST",
		body: JSON.stringify({
			email,
			name,
			password
		})
	});
}
function signIn(email, password) {
	return request("/api/auth/login", {
		method: "POST",
		body: JSON.stringify({
			email,
			password
		})
	});
}
function signOut() {
	return request("/api/auth/logout", { method: "POST" });
}
async function getCurrentUser() {
	const result = await request("/api/auth/me");
	return result.ok ? result.data.user : null;
}
function updateProfile(updates) {
	return request("/api/profile", {
		method: "PATCH",
		body: JSON.stringify(updates)
	});
}
function changePassword(currentPassword, newPassword) {
	return request("/api/profile", {
		method: "PUT",
		body: JSON.stringify({
			currentPassword,
			newPassword
		})
	});
}
var BATCH_SIZE = 500;
/**
* Adds entries, chunked so a huge paste never exceeds the server's
* per-request cap. Chunks run sequentially to avoid hammering the pool.
*/
async function addExpenses(entries) {
	let inserted = 0;
	for (let i = 0; i < entries.length; i += BATCH_SIZE) {
		const chunk = entries.slice(i, i + BATCH_SIZE);
		const result = await request("/api/expenses", {
			method: "POST",
			body: JSON.stringify({ entries: chunk })
		});
		if (!result.ok) return result;
		inserted += result.data.inserted;
	}
	return {
		ok: true,
		data: { inserted }
	};
}
function listExpenses(cursor, limit = 50) {
	const params = new URLSearchParams({ limit: String(limit) });
	if (cursor) params.set("cursor", cursor);
	return request(`/api/expenses?${params}`);
}
function clearExpenses() {
	return request("/api/expenses", { method: "DELETE" });
}
function updateExpense(id, updates) {
	return request(`/api/expenses/${encodeURIComponent(id)}`, {
		method: "PATCH",
		body: JSON.stringify(updates)
	});
}
function deleteExpense(id) {
	return request(`/api/expenses/${encodeURIComponent(id)}`, { method: "DELETE" });
}
/**
* Shrinks a photo before upload.
*
* Phone cameras produce 5-12MB images. Sending those raw is slow on mobile
* data and often exceeds the request cap, so we downscale to a width the
* model can still read text from and re-encode as JPEG.
*/
function compressImage(file, maxDimension = 1600, quality = .8) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read that file."));
		reader.onload = () => {
			const img = new Image();
			img.onerror = () => reject(/* @__PURE__ */ new Error("That file is not a readable image."));
			img.onload = () => {
				let { width, height } = img;
				if (width > maxDimension || height > maxDimension) {
					const scale = maxDimension / Math.max(width, height);
					width = Math.round(width * scale);
					height = Math.round(height * scale);
				}
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(/* @__PURE__ */ new Error("Could not process that image."));
					return;
				}
				ctx.drawImage(img, 0, 0, width, height);
				resolve(canvas.toDataURL("image/jpeg", quality));
			};
			img.src = reader.result;
		};
		reader.readAsDataURL(file);
	});
}
function scanReceipt(imageDataUrl) {
	return request("/api/receipt", {
		method: "POST",
		body: JSON.stringify({ image: imageDataUrl })
	});
}
function getBilling() {
	return request("/api/billing");
}
function setPlan(plan) {
	return request("/api/billing", {
		method: "POST",
		body: JSON.stringify({ plan })
	});
}
async function getStats() {
	const result = await request("/api/stats");
	return result.ok ? result.data : {
		totalSpent: 0,
		weekSpent: 0,
		monthSpent: 0,
		totalIncome: 0,
		expenseCount: 0,
		byCategory: []
	};
}
async function getChatHistory() {
	const result = await request("/api/chat-history");
	return result.ok && Array.isArray(result.data.messages) ? result.data.messages : [];
}
function saveChatHistory(messages) {
	return request("/api/chat-history", {
		method: "PUT",
		body: JSON.stringify({ messages })
	});
}
function clearChatHistory() {
	return request("/api/chat-history", { method: "DELETE" });
}
//#endregion
export { signUp as _, compressImage as a, getChatHistory as c, listExpenses as d, saveChatHistory as f, signOut as g, signIn as h, clearExpenses as i, getCurrentUser as l, setPlan as m, changePassword as n, deleteExpense as o, scanReceipt as p, clearChatHistory as r, getBilling as s, addExpenses as t, getStats as u, updateExpense as v, updateProfile as y };
