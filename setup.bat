@echo off
echo Setting up Pixify AI project...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js and try again.
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm is not installed. Please install npm and try again.
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

REM Install additional required packages
echo Installing additional packages...
call npm install three vanta lucide-react @radix-ui/react-slot

REM Setup Tailwind CSS
echo Setting up Tailwind CSS...
npx tailwindcss init -p

REM Create necessary directories
echo Creating necessary directories...
mkdir src\components\ui

REM Create button component
echo Creating button component...
(
echo import * as React from "react"
echo import { Slot } from "@radix-ui/react-slot"
echo import { cva, type VariantProps } from "class-variance-authority"
echo import { cn } from "@/lib/utils"
echo.
echo const buttonVariants = cva(
echo   "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
echo   {
echo     variants: {
echo       variant: {
echo         default: "bg-primary text-primary-foreground hover:bg-primary/90",
echo         destructive:
echo           "bg-destructive text-destructive-foreground hover:bg-destructive/90",
echo         outline:
echo           "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
echo         secondary:
echo           "bg-secondary text-secondary-foreground hover:bg-secondary/80",
echo         ghost: "hover:bg-accent hover:text-accent-foreground",
echo         link: "text-primary underline-offset-4 hover:underline",
echo       },
echo       size: {
echo         default: "h-10 px-4 py-2",
echo         sm: "h-9 rounded-md px-3",
echo         lg: "h-11 rounded-md px-8",
echo         icon: "h-10 w-10",
echo       },
echo     },
echo     defaultVariants: {
echo       variant: "default",
echo       size: "default",
echo     },
echo   }
echo )
echo.
echo export interface ButtonProps
echo   extends React.ButtonHTMLAttributes<HTMLButtonElement>,
echo     VariantProps<typeof buttonVariants> {
echo   asChild?: boolean
echo }
echo.
echo const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
echo   ({ className, variant, size, asChild = false, ...props }, ref) => {
echo     const Comp = asChild ? Slot : "button"
echo     return (
echo       ^<Comp
echo         className={cn(buttonVariants({ variant, size, className }))}
echo         ref={ref}
echo         {...props}
echo       /^>
echo     )
echo   }
echo )
echo Button.displayName = "Button"
echo.
echo export { Button, buttonVariants }
) > src\components\ui\button.tsx

REM Create card component
echo Creating card component...
(
echo import * as React from "react"
echo import { cn } from "@/lib/utils"
echo.
echo const Card = React.forwardRef<
echo   HTMLDivElement,
echo   React.HTMLAttributes<HTMLDivElement>
echo >(({ className, ...props }, ref) => (
echo   ^<div
echo     ref={ref}
echo     className={cn(
echo       "rounded-lg border bg-card text-card-foreground shadow-sm",
echo       className
echo     )}
echo     {...props}
echo   /^>
echo ))
echo Card.displayName = "Card"
echo.
echo const CardHeader = React.forwardRef<
echo   HTMLDivElement,
echo   React.HTMLAttributes<HTMLDivElement>
echo >(({ className, ...props }, ref) => (
echo   ^<div
echo     ref={ref}
echo     className={cn("flex flex-col space-y-1.5 p-6", className)}
echo     {...props}
echo   /^>
echo ))
echo CardHeader.displayName = "CardHeader"
echo.
echo const CardTitle = React.forwardRef<
echo   HTMLParagraphElement,
echo   React.HTMLAttributes<HTMLHeadingElement>
echo >(({ className, ...props }, ref) => (
echo   ^<h3
echo     ref={ref}
echo     className={cn(
echo       "text-2xl font-semibold leading-none tracking-tight",
echo       className
echo     )}
echo     {...props}
echo   /^>
echo ))
echo CardTitle.displayName = "CardTitle"
echo.
echo const CardDescription = React.forwardRef<
echo   HTMLParagraphElement,
echo   React.HTMLAttributes<HTMLParagraphElement>
echo >(({ className, ...props }, ref) => (
echo   ^<p
echo     ref={ref}
echo     className={cn("text-sm text-muted-foreground", className)}
echo     {...props}
echo   /^>
echo ))
echo CardDescription.displayName = "CardDescription"
echo.
echo const CardContent = React.forwardRef<
echo   HTMLDivElement,
echo   React.HTMLAttributes<HTMLDivElement>
echo >(({ className, ...props }, ref) => (
echo   ^<div ref={ref} className={cn("p-6 pt-0", className)} {...props} /^>
echo ))
echo CardContent.displayName = "CardContent"
echo.
echo const CardFooter = React.forwardRef<
echo   HTMLDivElement,
echo   React.HTMLAttributes<HTMLDivElement>
echo >(({ className, ...props }, ref) => (
echo   ^<div
echo     ref={ref}
echo     className={cn("flex items-center p-6 pt-0", className)}
echo     {...props}
echo   /^>
echo ))
echo CardFooter.displayName = "CardFooter"
echo.
echo export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
) > src\components\ui\card.tsx

REM Create utils.ts file
echo Creating utils.ts file...
(
echo import { type ClassValue, clsx } from "clsx"
echo import { twMerge } from "tailwind-merge"
echo.
echo export function cn(...inputs: ClassValue[]) {
echo   return twMerge(clsx(inputs))
echo }
) > src\lib\utils.ts

REM Update tailwind.config.js
echo Updating tailwind.config.js...
(
echo /** @type {import('tailwindcss').Config} */
echo module.exports = {
echo   darkMode: ["class"],
echo   content: [
echo     './pages/**/*.{ts,tsx}',
echo     './components/**/*.{ts,tsx}',
echo     './app/**/*.{ts,tsx}',
echo     './src/**/*.{ts,tsx}',
echo   ],
echo   theme: {
echo     container: {
echo       center: true,
echo       padding: "2rem",
echo       screens: {
echo         "2xl": "1400px",
echo       },
echo     },
echo     extend: {
echo       colors: {
echo         border: "hsl(var(--border))",
echo         input: "hsl(var(--input))",
echo         ring: "hsl(var(--ring))",
echo         background: "hsl(var(--background))",
echo         foreground: "hsl(var(--foreground))",
echo         primary: {
echo           DEFAULT: "hsl(var(--primary))",
echo           foreground: "hsl(var(--primary-foreground))",
echo         },
echo         secondary: {
echo           DEFAULT: "hsl(var(--secondary))",
echo           foreground: "hsl(var(--secondary-foreground))",
echo         },
echo         destructive: {
echo           DEFAULT: "hsl(var(--destructive))",
echo           foreground: "hsl(var(--destructive-foreground))",
echo         },
echo         muted: {
echo           DEFAULT: "hsl(var(--muted))",
echo           foreground: "hsl(var(--muted-foreground))",
echo         },
echo         accent: {
echo           DEFAULT: "hsl(var(--accent))",
echo           foreground: "hsl(var(--accent-foreground))",
echo         },
echo         popover: {
echo           DEFAULT: "hsl(var(--popover))",
echo           foreground: "hsl(var(--popover-foreground))",
echo         },
echo         card: {
echo           DEFAULT: "hsl(var(--card))",
echo           foreground: "hsl(var(--card-foreground))",
echo         },
echo       },
echo       borderRadius: {
echo         lg: "var(--radius)",
echo         md: "calc(var(--radius) - 2px)",
echo         sm: "calc(var(--radius) - 4px)",
echo       },
echo       keyframes: {
echo         "accordion-down": {
echo           from: { height: 0 },
echo           to: { height: "var(--radix-accordion-content-height)" },
echo         },
echo         "accordion-up": {
echo           from: { height: "var(--radix-accordion-content-height)" },
echo           to: { height: 0 },
echo         },
echo       },
echo       animation: {
echo         "accordion-down": "accordion-down 0.2s ease-out",
echo         "accordion-up": "accordion-up 0.2s ease-out",
echo       },
echo     },
echo   },
echo   plugins: [require("tailwindcss-animate")],
echo }
) > tailwind.config.js

REM Update globals.css
echo Updating globals.css...
(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
echo.
echo @layer base {
echo   :root {
echo     --background: 224 71%% 4%%;
echo     --foreground: 213 31%% 91%%;
echo.
echo     --muted: 223 47%% 11%%;
echo     --muted-foreground: 215.4 16.3%% 56.9%%;
echo.
echo     --popover: 224 71%% 4%%;
echo     --popover-foreground: 215 20.2%% 65.1%%;
echo.
echo     --card: 224 71%% 4%%;
echo     --card-foreground: 213 31%% 91%%;
echo.
echo     --border: 216 34%% 17%%;
echo     --input: 216 34%% 17%%;
echo.
echo     --primary: 210 40%% 98%%;
echo     --primary-foreground: 222.2 47.4%% 1.2%%;
echo.
echo     --secondary: 222.2 47.4%% 11.2%%;
echo     --secondary-foreground: 210 40%% 98%%;
echo.
echo     --accent: 216 34%% 17%%;
echo     --accent-foreground: 210 40%% 98%%;
echo.
echo     --destructive: 0 63%% 31%%;
echo     --destructive-foreground: 210 40%% 98%%;
echo.
echo     --ring: 216 34%% 17%%;
echo.
echo     --radius: 0.5rem;
echo   }
echo }
echo.
echo @layer base {
echo   * {
echo     @apply border-border;
echo   }
echo   body {
echo     @apply bg-background text-foreground;
echo     font-feature-settings: "rlig" 1, "calt" 1;
echo   }
echo }
) > src\app\globals.css

echo Setup complete. You can now run 'npm run dev' to start the development server.

pause