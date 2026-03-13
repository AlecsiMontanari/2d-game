# 2D Android Game Project

## Setup Instructions

Since the automated setup encountered issues finding `npm`, please follow these steps manually:

1.  **Install Dependencies**:
    Open a terminal in this folder and run:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    To see the game in your browser:
    ```bash
    npm run dev
    ```

3.  **Build for Android**:
    To create an Android APK (requires Android Studio):
    ```bash
    npm run build
    npm run android
    ```

## Project Structure
-   `src/main.ts`: Entry point.
-   `src/scenes/`: Game scenes (Boot, Game).
-   `src/assets/`: Place your images and sounds here.

## Revisão e roadmap
- Consulte `PROJECT_REVIEW_PTBR.md` para uma análise completa do estado atual e um plano de execução em 6 semanas para publicar uma demo em loja de aplicativos.

## Backlog no Linear (projeto `2d-game`)
- Arquivo fonte das tarefas faseadas: `linear/phased_tasks.json`.
- Script para criar issues no Linear: `scripts/create-linear-issues.mjs`.
- Exemplo de uso:
  - `LINEAR_API_KEY=... LINEAR_TEAM_KEY=... node scripts/create-linear-issues.mjs` (dry-run)
  - `LINEAR_API_KEY=... LINEAR_TEAM_KEY=... node scripts/create-linear-issues.mjs --apply` (cria issues)
