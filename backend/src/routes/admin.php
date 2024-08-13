<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use \Firebase\JWT\JWT;


// Routes about admin data
// Check if an admin user exists
$group->get('', function (Request $request, Response $response, $args) use ($conn) {
    $sql = "SELECT COUNT(*) AS adminCount FROM users WHERE role = 'admin'";
    $result = $conn->query($sql);

    if ($result) {
        $row = $result->fetch_assoc();
        $adminExists = $row['adminCount'] > 0;

        if ($adminExists) {
            $responseBody = [
                'success' => true,
                'message' => 'Admin user exists',
                'data' => null
            ];
        } else {
            $responseBody = [
                'success' => false,
                'message' => 'No admin user found',
                'data' => null
            ];
        }

        $response = $response->withStatus(200); // OK status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'Database query error',
            'data' => null
        ];

        $response = $response->withStatus(500); // Internal Server Error status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Admin login
$group->post('/login', function (Request $request, Response $response, $args) use ($conn) {
    $data = $request->getParsedBody();
    $email = $data['email'];
    $password = $data['password'];

    $sql = "SELECT * FROM users WHERE email = ? AND role = 'admin'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $secretKey = $_ENV["SECRET"];
            $issuedAt = time();
            $expirationTime = null; // Token has no expiration date
            $payload = [
                'iat' => $issuedAt,
                'exp' => $expirationTime,
                'user_id' => $user['user_id'],
            ];
            $token = JWT::encode($payload, $secretKey, 'HS256');

            $responseBody = [
                'success' => true,
                'message' => 'Login successful',
                'data' => $token
            ];

            $response = $response->withStatus(200); // OK status code
        } else {
            $responseBody = [
                'success' => false,
                'message' => 'Login failed: Invalid credentials',
                'data' => null
            ];

            $response = $response->withStatus(401); // Unauthorized status code
        }
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'User not found',
            'data' => null
        ];

        $response = $response->withStatus(404); // Not Found status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Admin registration
$group->post('/register', function (Request $request, Response $response, $args) use ($conn) {
    $sql = "SELECT COUNT(*) AS adminCount FROM users WHERE role = 'admin'";
    $result = $conn->query($sql);

    if ($result) {
        $row = $result->fetch_assoc();
        $adminExists = $row['adminCount'] > 0;

        if ($adminExists) {
            $responseBody = [
                'success' => false,
                'message' => 'Admin already exists',
                'data' => null
            ];
            $response = $response->withStatus(403); // Forbidden status code
        } else {
            $data = $request->getParsedBody();
            $firstname = $data['firstname'];
            $lastname = $data['lastname'];
            $email = $data['email'];
            $password = $data['password'];
            $hashed_password = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $conn->prepare("INSERT INTO users (firstname, lastname, email, password, role) VALUES (?, ?, ?, ?, 'admin')");
            $stmt->bind_param("ssss", $firstname, $lastname, $email, $hashed_password);
            $stmt->execute();

            $responseBody = [
                'success' => true,
                'message' => 'User created',
                'data' => null
            ];
            $response = $response->withStatus(201); // Created status code
        }
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'Database query error',
            'data' => null
        ];
        $response = $response->withStatus(500); // Internal Server Error status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Routes for users data
// Get all users
$group->get('/users', function (Request $request, Response $response, $args) use ($conn) {

    $isValid = validateToken($request);

    if (!$isValid) {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Invalid token',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json'); // Unauthorized status code
    }

    $getRole = getRole($request, $conn);

    if ($getRole !== 'admin') {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Admin access required',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json'); // Forbidden status code
    }

    $sql = "SELECT * FROM users";
    $result = $conn->query($sql);

    $users = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
    }

    $responseBody = [
        'success' => true,
        'message' => 'Users retrieved successfully',
        'data' => $users
    ];

    $response = $response->withStatus(200); // OK status code
    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Get a user by id
$group->get('/users/{id}', function (Request $request, Response $response, $args) use ($conn) {

    $isValid = validateToken($request);

    if (!$isValid) {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Invalid token',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json'); // Unauthorized status code
    }

    $getRole = getRole($request, $conn);

    if ($getRole !== 'admin') {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Admin access required',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json'); // Forbidden status code
    }

    $id = $args['id'];
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $responseBody = [
            'success' => true,
            'message' => 'User retrieved successfully',
            'data' => $user
        ];
        $response = $response->withStatus(200); // OK status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'User not found',
            'data' => null
        ];
        $response = $response->withStatus(404); // Not Found status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Create a user
$group->post('/users', function (Request $request, Response $response, $args) use ($conn) {

    $isValid = validateToken($request);

    if (!$isValid) {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Invalid token',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json'); // Unauthorized status code
    }

    $getRole = getRole($request, $conn);

    if ($getRole !== 'admin') {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Admin access required',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json'); // Forbidden status code
    }

    $data = $request->getParsedBody();
    $firstname = $data['firstname'];
    $lastname = $data['lastname'];
    $email = $data['email'];
    $password = $data['password'];
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Check if the email already exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $responseBody = [
            'success' => false,
            'message' => 'Email already exists',
            'data' => null
        ];
        $response = $response->withStatus(409); // Conflict status code
    } else {
        $stmt = $conn->prepare("INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $firstname, $lastname, $email, $hashed_password);

        if ($stmt->execute()) {
            $responseBody = [
                'success' => true,
                'message' => 'User created successfully',
                'data' => null
            ];
            $response = $response->withStatus(201); // Created status code
        } else {
            $responseBody = [
                'success' => false,
                'message' => 'Failed to create user',
                'data' => null
            ];
            $response = $response->withStatus(500); // Internal Server Error status code
        }
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Delete a user
$group->delete('/users/{id}', function (Request $request, Response $response, $args) use ($conn) {

    $isValid = validateToken($request);

    if (!$isValid) {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Invalid token',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json'); // Unauthorized status code
    }

    $getRole = getRole($request, $conn);

    if ($getRole !== 'admin') {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Admin access required',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json'); // Forbidden status code
    }

    $id = $args['id'];
    $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $responseBody = [
            'success' => true,
            'message' => 'User deleted successfully',
            'data' => null
        ];
        $response = $response->withStatus(200); // OK status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'User not found',
            'data' => null
        ];
        $response = $response->withStatus(404); // Not Found status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Update a user
$group->put('/users/{id}', function (Request $request, Response $response, $args) use ($conn) {

    $isValid = validateToken($request);

    if (!$isValid) {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Invalid token',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json'); // Unauthorized status code
    }

    $getRole = getRole($request, $conn);

    if ($getRole !== 'admin') {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Admin access required',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json'); // Forbidden status code
    }

    $id = $args['id'];
    $data = $request->getParsedBody();
    $firstname = $data['firstname'];
    $lastname = $data['lastname'];
    $email = $data['email'];
    $password = $data['password'];
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Check if the user exists
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $responseBody = [
            'success' => false,
            'message' => 'User not found',
            'data' => null
        ];
        $response = $response->withStatus(404); // Not Found status code
    } else {
        // Check if the email is already used by another user
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND user_id != ?");
        $stmt->bind_param("si", $email, $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $responseBody = [
                'success' => false,
                'message' => 'Email already exists',
                'data' => null
            ];
            $response = $response->withStatus(409); // Conflict status code
        } else {
            $stmt = $conn->prepare("UPDATE users SET firstname = ?, lastname = ?, email = ?, password = ? WHERE user_id = ?");
            $stmt->bind_param("ssssi", $firstname, $lastname, $email, $hashed_password, $id);

            if ($stmt->execute()) {
                $responseBody = [
                    'success' => true,
                    'message' => 'User updated successfully',
                    'data' => null
                ];
                $response = $response->withStatus(200); // OK status code
            } else {
                $responseBody = [
                    'success' => false,
                    'message' => 'Failed to update user',
                    'data' => null
                ];
                $response = $response->withStatus(500); // Internal Server Error status code
            }
        }
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});
