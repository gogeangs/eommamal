// Firebase implementation of the app's server (loaded on demand from backend.ts).
// Data layout (security rules: firestore.rules):
//   families/{uid}                       { firstUse: 'YYYY-MM-DD', createdAt }
//   families/{uid}/children/{childId}    { name, avatar, position, progress, updatedAt }
//   families/{uid}/reads/{YYYY-MM-DD}    { ids: [storyId…] }
//   subscriptions/{uid}                  { active, expiresAt }      (written only by the server, later)
//   admins/{uid}                         {}                          (added in the console)
//   reviewers/{uid}                      { langs: ['vi', …] }        (added in the console)
//   content/main                         the published content pack (stories, words, text, review, updated)
import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider, deleteUser, getAuth, isSignInWithEmailLink, onAuthStateChanged, sendSignInLinkToEmail,
  signInWithEmailLink, signInWithPopup, signInWithRedirect, signOut,
} from 'firebase/auth';
import {
  FieldPath, arrayUnion, deleteDoc, deleteField, doc, getDoc, getDocs, collection, getFirestore, runTransaction,
  serverTimestamp, setDoc, updateDoc, writeBatch,
} from 'firebase/firestore';
import type { Backend, ChildRow } from './backend';
import type { Pack } from '../content/pack';

const EMAIL_KEY = 'emb-signin-email';

export function create(config: { apiKey: string; authDomain: string; projectId: string; appId?: string }): Backend {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const fam = (uid: string) => doc(db, 'families', uid);

  return {
    onAuth: (cb) => onAuthStateChanged(auth, (u) => cb(u ? { uid: u.uid, email: u.email } : null)),

    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try { await signInWithPopup(auth, provider); }
      catch (e) {
        const code = (e as { code?: string }).code ?? '';
        // Installed apps and some phones block pop-ups: go to Google and come back.
        if (/popup-blocked|operation-not-supported|cancelled-popup/.test(code)) await signInWithRedirect(auth, provider);
        else throw e;
      }
    },

    async sendSignInLink(email) {
      const url = location.origin + location.pathname + '#settings';
      await sendSignInLinkToEmail(auth, email, { url, handleCodeInApp: true });
      try { localStorage.setItem(EMAIL_KEY, email); } catch { /* ignore */ }
    },

    async completeSignInLink() {
      if (!isSignInWithEmailLink(auth, location.href)) return false;
      let email = '';
      try { email = localStorage.getItem(EMAIL_KEY) ?? ''; } catch { /* ignore */ }
      // Opened on another device or browser: ask which address the link was sent to.
      if (!email) email = window.prompt('로그인 링크를 받은 이메일 주소 · Email address') ?? '';
      if (!email) return false;
      await signInWithEmailLink(auth, email, location.href);
      try { localStorage.removeItem(EMAIL_KEY); } catch { /* ignore */ }
      history.replaceState(null, '', location.pathname + location.hash); // drop the one-time code from the address
      return true;
    },

    signOut: () => signOut(auth),

    async deleteAccount() {
      const u = auth.currentUser;
      if (!u) return;
      const batch = writeBatch(db);
      for (const sub of ['children', 'reads']) (await getDocs(collection(db, 'families', u.uid, sub))).forEach((d) => batch.delete(d.ref));
      batch.delete(fam(u.uid));
      await batch.commit();
      try { await deleteUser(u); }
      catch (e) {
        if ((e as { code?: string }).code === 'auth/requires-recent-login') throw new Error('보안을 위해 로그아웃 후 다시 로그인한 뒤 지워 주세요.');
        throw e;
      }
    },

    isAdmin: async (uid) => { try { return (await getDoc(doc(db, 'admins', uid))).exists(); } catch { return false; } },
    reviewLangs: async (uid) => { try { return ((await getDoc(doc(db, 'reviewers', uid))).data()?.langs as string[] | undefined) ?? []; } catch { return []; } },

    async ensureFamily(uid, localFirst) {
      const t = today();
      const local = localFirst && localFirst < t ? localFirst : t;
      return runTransaction(db, async (tx) => {
        const snap = await tx.get(fam(uid));
        const cur = snap.data()?.firstUse as string | undefined;
        const first = cur && cur < local ? cur : local;
        if (!snap.exists()) tx.set(fam(uid), { firstUse: first, createdAt: serverTimestamp() });
        else if (first !== cur) tx.update(fam(uid), { firstUse: first });
        return first;
      });
    },

    async getChildren(uid) {
      const snap = await getDocs(collection(db, 'families', uid, 'children'));
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChildRow, 'id'>) }));
    },

    async putChildren(uid, rows) {
      const batch = writeBatch(db);
      for (const r of rows) batch.set(doc(db, 'families', uid, 'children', r.id), { name: r.name, avatar: r.avatar, position: r.position, progress: r.progress, updatedAt: serverTimestamp() });
      await batch.commit();
    },

    async deleteChildren(uid, ids) {
      await Promise.all(ids.map((id) => deleteDoc(doc(db, 'families', uid, 'children', id))));
    },

    async markReads(uid, day, ids) {
      const ref = doc(db, 'families', uid, 'reads', day);
      if (ids.length) await setDoc(ref, { ids: arrayUnion(...ids) }, { merge: true });
      return ((await getDoc(ref)).data()?.ids as string[] | undefined) ?? [];
    },

    async getSubscription(uid) {
      try {
        const d = (await getDoc(doc(db, 'subscriptions', uid))).data();
        if (!d) return null;
        const until = d.expiresAt?.toDate?.()?.toISOString?.() ?? (typeof d.expiresAt === 'string' ? d.expiresAt : undefined);
        return { active: !!d.active, until };
      } catch { return null; }
    },

    async loadContent() {
      const d = (await getDoc(doc(db, 'content', 'main'))).data() as Pack | undefined;
      return d && d.version === 1 ? d : null;
    },

    async publishContent(pack, uid) {
      const ref = doc(db, 'content', 'main');
      await runTransaction(db, async (tx) => {
        const cur = (await tx.get(ref)).data() as Pack | undefined;
        const out: Pack = JSON.parse(JSON.stringify(pack));
        // Reviewers may have saved fixes since this draft started: theirs first, then the draft's.
        for (const f of ['text', 'review'] as const) {
          const merged: Record<string, Record<string, unknown>> = {};
          for (const src of [cur?.[f], out[f]]) for (const [l, m] of Object.entries(src ?? {})) merged[l] = { ...(merged[l] ?? {}), ...(m ?? {}) };
          (out as unknown as Record<string, unknown>)[f] = merged;
        }
        tx.set(ref, { ...out, updatedBy: uid });
      });
    },

    async saveReview(lang, texts, marks) {
      const ref = doc(db, 'content', 'main');
      if (!(await getDoc(ref)).exists()) await setDoc(ref, { version: 1, stories: [], words: [], text: {}, review: {} }, { merge: true });
      // Field paths per key ("story.star.p1" contains dots, so each key is one path segment).
      const args: unknown[] = [];
      for (const [k, v] of Object.entries(texts)) args.push(new FieldPath('text', lang, k), v == null ? deleteField() : v);
      for (const [k, v] of Object.entries(marks)) args.push(new FieldPath('review', lang, k), v == null ? deleteField() : v);
      args.push('updated', new Date().toISOString());
      const [first, firstVal, ...rest] = args;
      await updateDoc(ref, first as FieldPath, firstVal, ...rest);
    },
  };
}
