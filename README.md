# Habit Tracker

A full-stack habit tracking application built with React, TypeScript, Vite, and Supabase.

## Features

- **Authentication**: Sign up and sign in with email/password
- **Habit Management**: Create, read, update, and delete habits
- **Daily Tracking**: Track habit completion for specific dates
- **Row Level Security**: All data is secured with Supabase RLS policies
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js and npm installed
- A Supabase account (free tier works fine)

## Setup Instructions

### 1. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor**
3. Copy and run the SQL commands from `supabase-setup.sql` file
4. This will create:
   - `habits` table with proper constraints
   - `daily_logs` table with foreign key to habits
   - Row Level Security (RLS) policies
   - Performance indexes

### 2. Environment Variables

The `.env` file is already configured with your Supabase credentials:

```
VITE_SUPABASE_URL=https://qhutifthdmtcpuzqulb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

⚠️ **Important**: The `.env` file is gitignored for security. Never commit your credentials.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Sign Up**: Create a new account at `/signup`
2. **Sign In**: Log in at `/login`  
3. **Track Habits**: 
   - Add new habits with the "Add Habit" button
   - Mark habits as complete by clicking the checkbox
   - Edit habits by clicking the pencil icon
   - Delete habits by clicking the trash icon
   - Change the date to track habits for different days

## Database Schema

### Habits Table
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `name`: TEXT (habit name)
- `description`: TEXT (optional description)
- `target_frequency`: INTEGER (how many times per period)
- `frequency_type`: TEXT ('daily' or 'weekly')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Daily Logs Table
- `id`: UUID (primary key)
- `habit_id`: UUID (foreign key to habits, ON DELETE CASCADE)
- `log_date`: DATE
- `completed`: BOOLEAN
- `notes`: TEXT (optional)
- `created_at`: TIMESTAMP

## Security Features

All database operations are protected by Row Level Security (RLS):

- Users can only SELECT their own habits
- Users can only INSERT habits with their own user_id
- Users can only UPDATE their own habits
- Users can only DELETE their own habits
- Daily logs are automatically scoped to the user's habits
- Cascade delete ensures logs are removed when habits are deleted

## Key Implementation Details

### Authentication
- Uses Supabase Auth for user management
- Session tracking with `onAuthStateChange`
- Protected routes redirect unauthenticated users to login

### Database Queries
All queries are properly scoped to the authenticated user:

```typescript
// Example: Only fetch user's own habits
supabase
  .from('habits')
  .select('*')
  .eq('user_id', user.id)  // Critical: scopes to current user
```

### Error Handling
- Loading states for all async operations
- Error messages displayed to users
- Graceful degradation on failures

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Styling**: CSS3 with modern features

## License

MIT# habit-tracker
