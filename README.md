# DevNest

**DevNest** is a collaborative coding extension for Visual Studio Code that reimagines how developers share and work together on codebases. Unlike VS Code Live Share, DevNest does **not** force everyone into a single host repo. Instead, each developer keeps their **own local codebase**, while still being able to **see, preview, and copy from others' code in real time**.

---

## 🚀 Why DevNest?

* **Live Share is host-bound**: if the host disconnects, the session dies, and guests can’t keep their own repo.
* **DevNest is repo-first**: each person works in their own repo but can view and borrow from others live.
* **Google Docs for code, but parallel**: no chaos of multiple people typing in the same file — everyone codes independently while still staying connected.

---

## ✨ Features

### Core (MVP)

* **Presence panel**: see who’s online and what file they’re editing.
* **Live read-only previews**: open a teammate’s file in real time without leaving your workspace.
* **Follow mode**: mirror another person’s active file/view.
* **Selective sharing**: mark files/folders as shareable; nothing is exposed by default.
* **Copy/Import**: grab snippets or entire files directly into your repo.

### Advanced (Future)

* **Cross-sync requests**: request code from teammates, approve/deny like lightweight PRs.
* **Side-by-side comparison**: diff your file against someone else’s live version.
* **Inline comments & chat**: annotate shared files and discuss changes.
* **Git integration**: commits, branches, and merges baked into the live workflow.

---

## 🏗️ How It Works

### Architecture

* **VS Code Extension (client)**

  * Publishes presence + file previews.
  * Displays teammates’ presence, previews, and allows copy/import.
* **Presence Server (Node.js + WebSocket)**

  * Tracks connected users and relays metadata.
  * Handles file offer/preview/import requests.
* **Future P2P/WebRTC support** to reduce reliance on a central relay.

### Protocol (simplified)

```json
// Client → Server
{ "type": "hello", "user": {"id": "u1", "displayName": "Alice"} }
{ "type": "presence_update", "userId": "u1", "activeFile": "src/index.js" }
{ "type": "file_request", "from":"u2", "to":"u1", "filePath":"src/utils.js" }

// Server → Clients
{ "type": "presence_list", "users": [...] }
{ "type": "file_offer", "from":"u1", "filePath":"src/utils.js", "preview":"..." }
```

---

## 📌 Roadmap

1. ✅ Presence system with online users and active file indicators.
2. 🛠️ Live file preview streaming.
3. 🛠️ Import flow (copy file/snippet to local repo).
4. 🔒 Permissions & file exposure controls.
5. 💬 Inline comments and chat.
6. 🌐 Git integration & persistent sessions.

---

## 💡 Use Cases

* **Hackathons & teams**: see progress live without stepping on each other’s toes.
* **Teaching/mentoring**: students work independently but teachers can peek and copy solutions.
* **Distributed teams**: replace constant screen-sharing with lightweight live previews.

---

## ⚡ Vision

DevNest aims to become **Figma for repos** — a world where developers stay in their own nests (repos) but can still collaborate, borrow, and sync in real time without friction.
