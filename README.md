# weather-app
## Introduction
This is a sample React application that showcases a user-friendly interface to display weather information. It's designed to demonstrate my skills in building React applications and working with external APIs.
## Features
- Weather data display.
- Search functionality for different locations.
- Interactive UI with responsive design.
## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.
### Prerequisites
Make sure you have Node.js installed on your system (preferably the latest version). You can download it from [Node.js official website](https://nodejs.org/).

### Installing
1. **Clone the Repository**
    ```bash
    git clone https://github.com/BenLim5878/weather-app.git
    cd weather-app
    ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3. **Setting Up Environment Variables**
    - Add your API keys and other sensitive data in `.env.local` (you have to create this folder).
    - API Key Required:
      ```env
      NEXT_PUBLIC_GOOGLE_MAP_API_KEY=your_api_key_here
      NEXT_PUBLIC_OPEN_WEATHER_MAP_API_KEY=your_api_key_here
      ```

4. **Running the Application**
    ```bash
    npm start
    ```
    This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production
To build the app for production, run:
```bash
npm run build
