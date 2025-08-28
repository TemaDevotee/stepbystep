# get.3xtr.im Frontend

## Run

```bash
npm install
npm run dev
```

The front‑end application uses a mock API server for data persistence.
To run the project locally you will need two terminal sessions:

1. **Front‑end** – from the repository root, install dependencies and start
   the development server:

   ```bash
   npm install
   npm run dev
   ```

   This compiles the Vue application using Vite and serves it at
   <http://localhost:5173> (the exact port may vary and will be printed in
   the terminal).

2. **Mock backend** – in a separate terminal navigate to the `mock_backend`
   directory, install its dependencies and start the Express server:

   ```bash
   cd mock_backend
   npm install
   npm start
   ```

   The mock API will listen on port `3001` by default.  The front‑end
   proxies its requests to this server during development.

Build for production:

```bash
npm run build
```

The application previously included a standalone sign‑in page that required a
username and password.  That authentication layer has been removed, so
after installing dependencies and starting the development server you can
open `index.html` (or navigate to the served root) and use the app
immediately.

## Workspaces

- On first use a default workspace is created which cannot be deleted.
- Use the workspace switcher in the sidebar or account page to change, rename or delete workspaces.
- The sidebar shows the workspace switcher only when more than one workspace exists and it sits below the navigation list.
- On the account page, a dedicated "Add workspace" button (under Team management) allows creating additional workspaces. Creation and deletion require confirmation dialogs.
- Data is stored in `localStorage["app.state.v2"]`. Clear localStorage to reset.

## Tests & Lint

```bash
npm run lint
npm test
```
