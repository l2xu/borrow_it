# Borrow It - An App for Borrowing Items Within a Community

Borrow It is an open-source app designed to facilitate the borrowing of items among community members. It allows users to lend items they don't use daily to others, reducing the need for users to purchase items they may need only occasionally.

The app is primarily designed for mobile use as a [Progressive Web App (PWA)](https://web.dev/explore/progressive-web-apps). The installation process is covered in the Installation section. Additionally, the admin panel, used for managing community users, can be accessed via a standard web browser.

## Features

- **Manage Items**: Insert, update, and delete items you want to lend to other community members.
- **Search Items**: Search for items to borrow from other community members.
- **In-App Messaging**: Contact members directly within the app using text messages.
- **Community Security**: Secure access to the app is restricted and managed by your community admin.
- **Cost-Effective**: Designed to be as cheap and accessible as possible for your community.

## Requirements

Borrow It is designed to be as affordable and accessible as possible, leveraging the capabilities of a standard shared web hosting plan.

You will need:

- A domain to host the app
- A subdomain to host the backend
- A web server that runs PHP (the app is only tested with php version 8.x and a nginx version 1.26.1)
- A MySQL database to store app data

The app uses React for the frontend and a MySQL database with the Slim PHP framework for the backend.

To set up and modify the app on your machine, you will need Node.js (tested with version 22.4.1), PHP (tested with version 22.4.1), and Composer (tested with version 2.7.7) installed.
The app might work with lower versions as well, but is only tested with the versionns mentioned above.
For more details on how to run the app locally, referr to the [CONTRIBUTING.md](CONTRIBUTING.md).

## App Structure and Philosophy

The app is divided into two parts: the Admin View and the Mobile App View.

- **Admin View**: The community admin manages members by adding, updating, and deleting them. Members can only access the app once their admin creates an account. This ensures community protection and allows the admin to handle disputes. The Admin View is best accessed via a web browser on a desktop computer at "yourdomain.com/admin". More details in the Setup and Installation section.

- **Mobile App View**: Functions as a PWA and can be installed on community members' smartphones. Once members receive their account from the admin, they can log in and use the app on their devices. Using a PWA makes the app accessible on various devices, regardless of the operating system.

## Setup and Installation

### Domain and Subdomain Setup

Set up a domain for the PWA and a subdomain for the backend. Example:

- Domain: your-community.com
- Subdomain: backend.your-community.com

### Frontend Setup

1. Clone or download this repository and open it with your IDE.
2. Navigate to the `frontend` folder and run `npm install`.
3. Create a `.env` file in the `frontend` folder with the following variables:
   ```
   REACT_APP_API_BASEURL=https://backend.yourdomain.com
   REACT_APP_PUSH_KEY=
   ```
4. Generate push keys with `npx web-push generate-vapid-keys` and add the public key to `REACT_APP_PUSH_KEY`.
5. Run `npm run build` to generate a `build` folder.
6. Create a `.htaccess` file in the `build` folder with the following content:
   ```
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```
7. Upload the `build` folder to your domain's directory on your web host.

### Backend Setup

1. Create a new database on your web host and import the `database.sql` file from the repository.
2. Navigate to the `backend` folder and create a `.env` file with the following variables:
   ```
   DB_HOST=
   DB_USER=
   DB_PASSWORD=
   DB_NAME=
   SECRET=
   PUSH_PRIVATE_KEY=
   PUSH_PUBLIC_KEY=
   FRONTEND_URL=
   ```
3. Fill in the database details and keys. Generate a secret key from [this website](https://randomkeygen.com/). Use the generated key from before for the PUSH_PRIVTE_KEY and PUSH_PUBLIC_KEY. Use the URL of your frontend for the FRONTEND_URL variable. This ensures, that only request from your domain are allowed.
4. Create a `.htaccess` file in the `backend` folder with the following content:

   ```
   RewriteEngine on
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule . index.php [L]

   SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=\$1
   ```

5. Upload the `backend` folder to your subdomain's directory on your web host.
6. Create a `uploads` folder in the backend directory if it not already exists.
7. Run `composer install` on your web host. If not supported, run it locally and upload the folder again.

### Getting Started

1. Create an admin account by navigating to `your-domain.com/admin/login` in your browser on your desktop.
2. Add new users from the admin dashboard.
3. Users can install the app on their smartphones by navigating to your domain and following the install prompt. For more details, check [this guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable#installation_from_the_web).

## Participate, Feedback, and Help

- **Contribute**: Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the process for submitting pull requests to us.
- **Code of Conduct**: Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our code of conduct.
- **Questions or Help**: Contact me via the information on my GitHub account.
- **Share Your Story**: I'd love to hear how you use the app in your community. Reach out via my GitHub contact info.

---

This app is proudly presented by Lukas Weihrauch, as part of his bachelor thesis in media and computer science @hs-harz.
