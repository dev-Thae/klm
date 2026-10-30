/**
 * Minimal GitHub REST client for the admin page (/yonetim).
 *
 * The site is static, so it cannot hold a password or check one. Instead,
 * every change is an ordinary git commit to REPO.branch made with the admin's
 * own fine-grained access token: GitHub — not this site — decides who may
 * write. The token lives only in the admin's browser and is sent only to
 * api.github.com. The push then triggers the Pages deploy workflow, which
 * rebuilds the site from the updated database/ folder.
 */
import { REPO } from '$lib/data/site.js';

const API = 'https://api.github.com';
const REPO_PATH = `/repos/${REPO.owner}/${REPO.name}`;

export class GitHubError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

/** A Turkish, actionable message for anything a client call can throw. */
export function describeError(err) {
	if (err instanceof GitHubError) {
		if (err.status === 401) return 'Anahtar geçersiz veya süresi dolmuş. Yeni bir anahtarla giriş yapın.';
		if (err.status === 403)
			return 'Bu anahtarın depoya yazma izni yok. Anahtarda "Contents: Read and write" izni olmalı.';
		if (err.status === 404) return `${REPO.owner}/${REPO.name} deposu bulunamadı veya anahtarın bu depoya erişimi yok.`;
		if (err.status === 409 || err.status === 422)
			return 'Depo bu sırada başka bir değişiklikle güncellendi. Lütfen tekrar deneyin.';
		return `GitHub hatası (${err.status}): ${err.message}`;
	}
	if (err instanceof TypeError) return 'GitHub’a ulaşılamadı. İnternet bağlantınızı kontrol edin.';
	return err?.message ?? String(err);
}

export function createRepoClient(token) {
	async function request(method, path, body) {
		const res = await fetch(API + path, {
			method,
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${token}`,
				'X-GitHub-Api-Version': '2022-11-28',
				...(body ? { 'Content-Type': 'application/json' } : {})
			},
			body: body ? JSON.stringify(body) : undefined,
			// listings must reflect the commit we just made, not a cached copy
			cache: 'no-store'
		});
		if (!res.ok) {
			let message = res.statusText;
			try {
				message = (await res.json()).message ?? message;
			} catch (e) {
				/* non-JSON error body: keep the status text */
			}
			throw new GitHubError(res.status, message);
		}
		return res.status === 204 ? null : res.json();
	}

	const ref = `ref=${encodeURIComponent(REPO.branch)}`;

	return {
		/** The signed-in account, and whether it may push to the repository. */
		async verify() {
			const [user, repo] = await Promise.all([request('GET', '/user'), request('GET', REPO_PATH)]);
			return { login: user.login, canPush: repo.permissions?.push === true };
		},

		/** Entries ({ name, path, type }) of a directory on the branch; [] if it doesn't exist. */
		async listDir(dir) {
			try {
				return await request('GET', `${REPO_PATH}/contents/${dir}?${ref}`);
			} catch (err) {
				if (err instanceof GitHubError && err.status === 404) return [];
				throw err;
			}
		},

		async exists(path) {
			try {
				await request('GET', `${REPO_PATH}/contents/${path}?${ref}`);
				return true;
			} catch (err) {
				if (err instanceof GitHubError && err.status === 404) return false;
				throw err;
			}
		},

		/**
		 * One commit that writes `files` ([{ path, content, encoding: 'utf-8' | 'base64' }])
		 * and deletes `deletions` (paths). Fails with 422 instead of overwriting
		 * if the branch moved in the meantime.
		 */
		async commit({ files = [], deletions = [], message }) {
			const head = await request('GET', `${REPO_PATH}/git/ref/heads/${REPO.branch}`);
			const parent = await request('GET', `${REPO_PATH}/git/commits/${head.object.sha}`);

			const tree = [];
			for (const file of files) {
				const blob = await request('POST', `${REPO_PATH}/git/blobs`, {
					content: file.content,
					encoding: file.encoding
				});
				tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
			}
			for (const path of deletions) tree.push({ path, mode: '100644', type: 'blob', sha: null });

			const newTree = await request('POST', `${REPO_PATH}/git/trees`, {
				base_tree: parent.tree.sha,
				tree
			});
			const commit = await request('POST', `${REPO_PATH}/git/commits`, {
				message,
				tree: newTree.sha,
				parents: [head.object.sha]
			});
			await request('PATCH', `${REPO_PATH}/git/refs/heads/${REPO.branch}`, { sha: commit.sha });
			return commit;
		}
	};
}
