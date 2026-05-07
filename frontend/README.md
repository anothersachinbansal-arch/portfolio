# Portfolio Website

A modern, responsive portfolio website built with React and Vite, showcasing achievements, skills, and testimonials.

## 🚀 Features

- **Responsive Design**: Works on all device sizes
- **Interactive UI**: Smooth animations and transitions
- **Admin Dashboard**: Secure admin panel for content management
- **Testimonials**: User review system with ratings
- **Achievements Showcase**: Display success stories and achievements
- **Contact Form**: Easy way for visitors to get in touch

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: React Toastify

## 📦 Prerequisites

- Node.js (v14 or later)
- npm or yarn

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```

## 🚀 Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized production build in the `dist` directory.

## 🎨 Project Structure

```
portfolio/
├── public/          # Static files
├── src/
│   ├── assets/      # Images, fonts, etc.
│   ├── components/  # Reusable UI components
│   │   ├── Admin/   # Admin panel components
│   │   ├── Hero/    # Hero section components
│   │   ├── Navbar/  # Navigation components
│   │   └── ...
│   ├── context/     # React context providers
│   ├── pages/       # Page components
│   ├── App.jsx      # Main application component
│   └── main.jsx     # Application entry point
├── .env             # Environment variables
├── .gitignore       # Git ignore file
├── package.json     # Project dependencies
└── vite.config.js   # Vite configuration
```

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🔗 Backend Integration

This frontend works with the backend API. Make sure to set up and run the backend server for full functionality.

## 📄 License

This project is licensed under the MIT License.
