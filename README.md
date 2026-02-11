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
