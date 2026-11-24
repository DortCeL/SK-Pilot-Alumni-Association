# Alumni registration

Bengali site for alumni to register, log in, and edit their own profile. An admin can list, edit, and delete alumni.

## Setup

1. Copy `.env.example` to `.env` and fill in MongoDB Atlas, Cloudinary, and `AUTH_SECRET`.
2. `npm install`
3. `npm run dev`
4. Open http://localhost:3000

The admin account is created from `ADMIN_PHONE` and `ADMIN_PASSWORD` on the first database connection. Log in with that phone number, then open `/admin`.

Alumni log in with the email or mobile number they registered, plus their password.

## Routes

- `/register` — registration
- `/login` — login
- `/dashboard` — your profile
- `/admin` — all alumni (admin only)
