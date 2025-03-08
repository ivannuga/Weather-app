# Angular Weather App

## Overview

This is an **Angular-based weather application** that allows users to:

- Search for cities and fetch their **current weather**.
- Save cities as **favorites**.
- View **hourly weather forecasts (24 hours)**.
- View **weekly forecasts (7-day min/max temperatures)** (Still in progress since the API seems not to accept this kind or request).

The application follows a **component-based architecture**, using **Angular Signals** for state management.

---

## Architecture Overview

### **Component-Based Architecture**

The app follows a **component-based architecture**, ensuring modularity and reusability.

- **`WeatherComponent`** → Main UI and logic handler.
- **State Management**: Uses **Angular Signals** (`signal<>`) for reactivity.
- **API Calls**: Fetches data from OpenWeatherMap **inside the component** (suggested improvement: move to a service).

### **MVVM Pattern**

The app follows a **lightweight MVVM (Model-View-ViewModel) pattern**:

| Layer         | Responsibility                                                       |
| ------------- | -------------------------------------------------------------------- |
| **Model**     | Holds `weatherResults`, `favoriteCities`, etc.                       |
| **View**      | `weather.component.html` (UI Presentation)                           |
| **ViewModel** | `WeatherComponent` (Handles API calls, state, and user interactions) |

---

## Key Features & Architecture

### **Component Structure**

| Component              | Responsibility                           |
| ---------------------- | ---------------------------------------- |
| **`WeatherComponent`** | Manages UI, state, and API interactions. |

### **State Management**

- **Uses Angular Signals (`signal<>`)** for reactive data updates.
- Tracks:
  - `cityControl` → Stores user input.
  - `favoriteCities` → Stores favorite locations.
  - `selectedCity` → Stores the currently selected city.

### **API Handling**

- **Current:** API calls (`fetchWeather()`, `fetchHourlyForecast()`, `fetchWeeklyForecast()`) are made inside the `WeatherComponent`.
- **Suggested Improvement:** Move API calls to a `WeatherService` for better separation of concerns.

### **Data Flow**

- **Unidirectional Data Flow:** Ensures predictable state updates and separation of concerns.

---

## Suggested Improvements

| Improvement                               | Benefit                                                          |
| ----------------------------------------- | ---------------------------------------------------------------- |
| **Create `WeatherService`**               | Moves API logic out of the component, improving maintainability. |
| **Use Angular DI (Dependency Injection)** | Allows reusability of weather fetching logic.                    |
| **Modularize UI Components**              | Separate search, favorites, and details into sub-components.     |
| **Use SignalStore (if scaling)**          | More structured state management for larger apps.                |

---

## How to Run the Project

### **Prerequisites**

- **Node.js** installed (`v18+` recommended).
- **Angular CLI** installed (`npm install -g @angular/cli`).

### **Steps to Run**

```bash
# Clone the repository
git clone https://github.com/ivannuga/Weather-app.git

# Navigate to the project folder
cd weather-app

# Install dependencies
npm install

# Start the development server
ng serve
```

