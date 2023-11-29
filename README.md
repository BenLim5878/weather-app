## Introduction
<img src="https://github-production-user-asset-6210df.s3.amazonaws.com/77265089/286743055-6464f102-65d7-49e2-afc0-a5ab98a76cb4.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIWNJYAX4CSVEH53A%2F20231129%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231129T211001Z&X-Amz-Expires=300&X-Amz-Signature=3587ba36f619f6bee34f19febc75a9c73c0d54ef228c33e856f81df27bc46073&X-Amz-SignedHeaders=host&actor_id=77265089&key_id=0&repo_id=725283277"/>
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
