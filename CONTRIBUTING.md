# Contributing to Borrow It

Thank you for considering contributing to Borrow It! Your contributions are what make this project better.

## How to Contribute

1. **Fork the repository**: Click the "Fork" button at the top right of the repository page.
2. **Clone your fork**: Clone your forked repository to your local machine. `git clone [https://github.com/your-username/borrow_it.git](https://github.com/your-username/borrow_it.git)`
3. **Create a branch**: Create a new branch for your feature or bug fix. `git checkout -b feature-name`

## Setting Up the Project Locally

To contribute effectively, you need to set up the project on your local machine. This involves setting up the frontend, backend, and database. We recommend using a tool such as [XAMPP](https://www.apachefriends.org/index.html) to set up the required environment.

### Prerequisites

Ensure you have the following installed:

- Node.js (tested with version 22.4.1)
- PHP (tested with version 22.4.1)
- MySQL
- Composer (tested with version 2.7.7)

### Frontend Setup

1. Navigate to the `frontend` folder: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `frontend` folder with the following variables:

```
REACT_APP_API_BASEURL=http://localhost:8080
REACT_APP_PUSH_KEY=
```

4. Generate push keys with `npx web-push generate-vapid-keys` and add the public key to `REACT_APP_PUSH_KEY`.
5. Start the frontend development server: `npm run start`

The frontend will be accessible at `http://localhost:3000`.

### Backend Setup

1. Create a new database named `borrow_it` using your MySQL client.
2. Import the `database.sql` file from the repository into this database.
3. Navigate to the `backend` folder: `cd backend`
4. Create a `.env` file with the following variables:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=borrow_it
SECRET=your_secret_key
PUSH_PRIVATE_KEY=your_push_private_key
PUSH_PUBLIC_KEY=your_push_public_key
FRONTEND_URL=http://localhost:3000
```

5. Fill in the database details and keys. Generate a secret key from [this website](https://randomkeygen.com/). Use the generated key from before for the PUSH_PRIVTE_KEY and PUSH_PUBLIC_KEY. Use the URL of your frontend for the FRONTEND_URL variable. In most cases its http://localhost:3000
6. Install PHP dependencies: `composer install`
7. Create a `uploads` folder in the backend directory if it not already exists.
8. Start the PHP server: `php -S localhost:8080 -t .`

The backend will be accessible at `http://localhost:8080`.

### Running the App

Once both the frontend and backend are running, you can access the app at `http://localhost:3000`. The frontend will communicate with the backend running on `http://localhost:8080`.

#### Getting Started

1. Create an admin account by navigating to `http://localhost:3000/admin/login` in your browser on your desktop.
2. Add new users from the admin dashboard.
3. Users can install the app on their smartphones by navigating to `http://localhost:3000` and following the install prompt. For more details, check [this guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable#installation_from_the_web).

## Making Changes

1. **Make your changes**: Implement your feature or bug fix.
2. **Commit your changes**: Commit your changes with a meaningful commit message.
   `git commit -m "Add feature X"`
3. **Push to your fork**: Push your changes to your forked repository.
   `git push origin feature-name`
4. **Create a Pull Request**: Go to the original repository and create a pull request from your fork. Provide a clear description of your changes and the problem they solve.

## Code Style

Please ensure your code adheres to the following guidelines:

- Follow the existing code style and conventions.

- Use meaningful variable and function names.

- Write comments where the code is complex or not self-explanatory.

- Ensure your code is properly formatted.

## Testing

Before submitting your pull request, make sure your changes do not break any existing functionality.

## Reporting Issues

If you find a bug or have a feature request, please open an issue on the GitHub Issues page. Provide as much detail as possible, including steps to reproduce the bug or a clear description of the feature request.

## Getting Help

If you need help with anything related to the project, please reach out via the contact information on the GitHub repository.

Thank you for your contributions! Your help is greatly appreciated.

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on our code of conduct.
