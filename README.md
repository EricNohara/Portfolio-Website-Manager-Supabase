# Portfolio Website Manager

### Contributors: Eric Nohara-LeClair

---

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Supabase Backend Setup](#supabase-backend-setup)
- [How to Install and Run](#how-to-install-and-run)
- [Known Issues](#known-issues)

## Project Description

- All in one platform for managing software engineer/general portfolio websites
- Allows updating user information in a single place without having to interface with portfolio website's source code
- Provides an easy to navigate user interface for updating, adding, or deleting user information
- Provides an easy to use API to access all user's information, all in one place
- Easy integration into user's preexisting portfolios, with the ability to get all user data with one fetch
- Eliminate any need for manual updates to the source code of portfolio websites
- Changes made on this application are seamlessly pushed to connected websites via the API
- Built with **Supabase** and **Next.js** for scalability, performance, security, and ease of development

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) - Used for building a fast, responsive, user-friendly interface
- **Backend**: [Supabase](https://supabase.com/) + [Next.js](https://nextjs.org) - Open-source alternative to Firebase for authentication, hosted database management, and file storage
- **Hosting**: [Vercel](https://vercel.com/) - Optimized to be hosted on vercel for cheap and easy deployment

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Supabase Backend Setup

1. Follow [these steps](https://supabase.com/docs/guides/getting-started) to sign into supabase and create a new project
2. Add database tables with the [schema](./doc/assets/schema.pdf) provided
3. Create storage buckets for portraits, resumes, transcripts, and project thumbnails
4. Follow [these steps](https://supabase.com/docs/guides/database/postgres/row-level-security) to add RLS policies to every table, only allowing users to access and mutate their own data when they are signed in
5. Set a minimum password length in the auth dashboard
6. Copy the following information for .env.local file:
   - The public url of the project
   - The ANON key for the project
   - The service role key for the project

## How to Install and Run

1. Clone the repository

```bash
git clone https://github.com/your-username/portfolio-manager.git
```

2. Enter root directory

```bash
cd portfolio-manager
```

3. Create a valid .env.local file in the root of the project

```bash
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
NEXT_SUPABASE_SERVICE_ROLE_KEY=""
API_ENCRYPTION_KEY="64 character key"
MIN_PASSWORD_LEN=6
```

4. Run the application

```bash
npm run dev
```

## Known Issues

No known issues.