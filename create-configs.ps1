$portals = @("admin", "member", "superadmin")

foreach ($portal in $portals) {
    Write-Host "Scaffolding root config files for frontend/$portal..."
    $dir = "c:/Users/nares/OneDrive/Desktop/Family/frontend/$portal"
    
    # Create package.json
    $packageJson = @"
{
  "name": "$portal-portal",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "axios": "^1.7.2",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.3.17",
    "lucide-react": "^0.407.0",
    "react": "^18.3.1",
    "react-big-calendar": "^1.13.0",
    "react-dom": "^18.3.1",
    "react-dropzone": "^14.2.3",
    "react-hook-form": "^7.52.1",
    "react-hot-toast": "^2.4.1",
    "react-player": "^2.16.0",
    "react-query": "^3.39.3",
    "react-router-dom": "^6.25.1",
    "reactflow": "^11.11.4",
    "recharts": "^2.12.7",
    "tailwind-merge": "^2.4.0",
    "zod": "^3.23.8",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.6",
    "vite": "^5.3.4"
  }
}
"@
    Set-Content -Path "$dir/package.json" -Value $packageJson
    
    # Create vite.config.js
    $viteConfig = @"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
"@
    Set-Content -Path "$dir/vite.config.js" -Value $viteConfig
    
    # Create index.html
    $indexHtml = @"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FamilyHub OS - $($portal.ToUpper())</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
"@
    Set-Content -Path "$dir/index.html" -Value $indexHtml
    
    # Create tailwind.config.js
    $tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: `calc(var(--radius) - 4px)`,
      },
    },
  },
  plugins: [],
}
"@
    Set-Content -Path "$dir/tailwind.config.js" -Value $tailwindConfig

    # Create postcss.config.js
    $postcssConfig = @"
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
"@
    Set-Content -Path "$dir/postcss.config.js" -Value $postcssConfig

    # Src folder
    $srcDir = "$dir/src"
    New-Item -ItemType Directory -Force -Path $srcDir | Out-Null

    # Create main.jsx
    $mainJsx = @"
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
"@
    Set-Content -Path "$srcDir/main.jsx" -Value $mainJsx

    # Create index.css
    $indexCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}
"@
    Set-Content -Path "$srcDir/index.css" -Value $indexCss

    # utils/cn.js for shadcn
    New-Item -ItemType Directory -Force -Path "$srcDir/utils" | Out-Null
    $cnJs = @"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
"@
    Set-Content -Path "$srcDir/utils/cn.js" -Value $cnJs
}

Write-Host "Done setting up root scripts and configs."
