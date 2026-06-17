# EEP Student Website Showcase

Public showcase for approved student-built Google Sites projects. Students can submit projects without logging in; teacher/admin users review submissions with Firebase Auth and Firestore.

## Local Setup

Use `npm.cmd` on this Windows machine:

```bash
npm.cmd install
npm.cmd run dev
```

Before shipping changes, run:

```bash
npm.cmd run lint
npm.cmd run build
```

## Firebase Project

Use a dedicated Firebase project for this app:

```text
eep-student-showcase
```

Do not use the GradeFlow Firebase project.

Use `firebase.cmd` on this Windows machine because PowerShell blocks the `firebase.ps1` shim by default.

Current hosting sites in the Firebase project:

```text
Production target: ied-hub
Production URL: https://ied-hub.web.app
Legacy/default URL: https://eep-student-showcase.web.app
```

## Environment Variables

Create a local `.env` file in the project root. Do not commit it.

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=eep-student-showcase.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=eep-student-showcase
VITE_FIREBASE_APP_ID=your_web_app_id
VITE_FIREBASE_STORAGE_BUCKET=eep-student-showcase.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
```

These values come from Firebase Console > Project settings > General > Your apps > Web app > SDK setup and configuration.

## Firebase Connection Checklist

1. Create/open Firebase project `eep-student-showcase`.
2. Add a Web app in Firebase Project settings.
3. Copy the web app config values into local `.env`.
4. Enable Authentication > Sign-in method > Email/Password.
5. Add the teacher account in Authentication > Users.
6. Create a Firestore database.
7. Publish the rules from `firestore.rules`.
8. Restart the Vite dev server after changing `.env`.
9. Open `/login` and sign in with the teacher account.
10. Use the admin dashboard seed button or submit a project, then approve it.

Deploy rules and hosting:

```bash
firebase.cmd deploy --only firestore:rules --project eep-student-showcase
firebase.cmd deploy --only hosting:iedhub --project eep-student-showcase
```

## Firestore Collection

Collection: `projects`

Fields:

```text
title: string
groupName: string
className: string
members: string
category: string
description: string
audience: string
impact: string
googleSitesUrl: string
imageUrl: string
status: pending | approved | rejected | hidden
featured: boolean
studentPick: boolean
createdAt: timestamp
updatedAt: timestamp
```

## Security Rules

The app includes `firestore.rules`.

Security goals:

- Anyone can read approved projects only.
- Anyone can create a project only with `status: "pending"`, approved categories, bounded text lengths, a Google Sites URL, optional HTTPS image URL, and server timestamps.
- Public users cannot create approved, featured, or student-pick projects.
- Authenticated Firebase users are treated as teacher/admin users.
- Authenticated users can approve, reject, hide, edit, feature, student-pick, and delete projects.

## Demo Preview

If Firebase is not configured, or if there are no approved projects yet, the public homepage shows clearly labelled demo preview projects for classroom presentation. Once approved Firestore projects exist, the public gallery uses real approved projects only.

## Build

```bash
npm.cmd run build
```
