import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from "./Redux/authstore.jsx";
import { Provider } from "react-redux";
import React from 'react';
import { ThemeProvider } from "./context/ThemeContext.jsx"; 

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ThemeProvider> 
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ThemeProvider>
  </Provider>
)
