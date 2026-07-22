# Habit Tracker

A React Native habit tracking app built with Expo. Habit Tracker helps users create, track, and maintain daily habits with progress charts, reminders, widgets, and automatic backups.

## Key Features

- Create, edit, and delete habits
- Track daily completion and streaks
- Habit progress charts and insights
- Local SQLite storage with encrypted backup support
- Tablet and phone support via Expo
- Android home screen widget for today's progress
- Push notifications and notification history
- Dark/light theme support
- Internationalization support with `i18next`

## Tech Stack

- Expo SDK 52
- React Native 0.76
- TypeScript
- Zustand for state management
- Expo SQLite for local storage
- Expo Notifications for reminders
- React Navigation for app routing
- React Native Paper for UI components
- Victory Native for charts
- `react-native-android-widget` for Android widget support

## Project Structure

- `App.tsx` - Root app entry point and initialization logic
- `src/navigation/` - App navigator and screen routing
- `src/pages/` - Main app screens
- `src/components/` - Shared UI components
- `src/store/` - Zustand store for habit management
- `src/assets/data/` - Local database and backup utilities
- `src/lib/` - Notifications, widget service, localization, and helpers
- `src/context/` - Theme provider and context
- `src/widgets/` - Android widget implementation

## Notes

- The app uses Expo modules such as `expo-sqlite`, `expo-notifications`, and `expo-localization`.
- The Android widget is configured using `react-native-android-widget` and defined in `app.json`.
- Localization resources are stored under `src/lib/i18n/translations/`.
