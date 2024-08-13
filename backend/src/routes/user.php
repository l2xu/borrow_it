<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;
use \Firebase\JWT\JWT;


// Routes for Push Notifications

// Check if a user is subscribed
$group->get('/subscribed', function (Request $request, Response $response) use ($conn) {

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

    $user_id = getUserID($request);

    $sql = "SELECT * FROM subscriptions WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $responseBody = [
            'success' => true,
            'message' => 'User is subscribed',
            'data' => null
        ];
        $response = $response->withStatus(200); // OK status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'User is not subscribed',
            'data' => null
        ];
        $response = $response->withStatus(200); // Not Found status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Subscribe to push notifications
$group->post('/subscribe', function (Request $request, Response $response) use ($conn) {

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

    $user_id = getUserID($request);

    $body = $request->getParsedBody();

    $subscriptions[] = $body;

    $subscription = json_encode($body);
    error_log("New subscription received: " . print_r($subscription, true));


    $subscription = $body['subscription'];
    $endpoint = $subscription['endpoint'];
    $p256dh = $subscription['keys']['p256dh'];
    $auth = $subscription['keys']['auth'];
    $expirationTime = isset($subscription['expirationTime']) ? $subscription['expirationTime'] : null;


    $sql = "INSERT INTO subscriptions (user_id, endpoint, p256dh, auth, expiration_time) VALUES (?,?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sssss', $user_id, $endpoint, $p256dh, $auth, $expirationTime);
    $stmt->execute();

    $responseBody = [
        'success' => true,
        'message' => 'subscription added successfully',
        'data' => null
    ];
    $response = $response->withStatus(200); // Not Found status code

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Unsubscribe from push notifications
$group->post('/unsubscribe', function (Request $request, Response $response) use ($conn) {

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

    $user_id = getUserID($request);


    $body = $request->getParsedBody();

    $subscriptions[] = $body;
    $subscription = $body['subscription'];
    $endpoint = $subscription['endpoint'];



    $sql = "DELETE FROM subscriptions WHERE user_id = ? AND endpoint = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ss', $user_id, $endpoint);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $responseBody = [
            'success' => true,
            'message' => 'Subscription deleted successfully',
            'data' => null
        ];
        $response = $response->withStatus(200); // OK status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'Subscription not found',
            'data' => null
        ];
        $response = $response->withStatus(404); // Not Found status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Send a push notification to all subscribed users
$group->post('/notify/new_message', function (Request $request, Response $response) use ($conn) {

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


    $body = $request->getParsedBody();
    $title = $body['title'];
    $message = $body['message'];
    $user_id = $body['user_id']; // Assuming the user ID is sent in the request body

    $auth = [
        'VAPID' => [
            'subject' => 'mailto:your-email@example.com',
            'publicKey' => $_ENV["PUSH_PUBLIC_KEY"],
            'privateKey' => $_ENV["PUSH_PRIVATE_KEY"],
        ],
    ];

    $webPush = new WebPush($auth);

    // Fetch subscriptions for the specified user from the database
    $sql = "SELECT endpoint, p256dh, auth FROM subscriptions WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $subscription = Subscription::create([
                'endpoint' => $row['endpoint'],
                'keys' => [
                    'p256dh' => $row['p256dh'],
                    'auth' => $row['auth'],
                ],
            ]);
            $payload = json_encode(['title' => $title, 'message' => $message]);

            $webPush->queueNotification($subscription, $payload);
        }

        // Send all notifications
        foreach ($webPush->flush() as $report) {
            $report->getRequest()->getUri()->__toString();

            if ($report->isSuccess()) {
                error_log("[v] Message sent successfully for subscription");
                $responseBody = [
                    'success' => true,
                    'message' => 'Notifications sent successfully',
                    'data' => null
                ];
                $response = $response->withStatus(200);
            } else {
                error_log("[x] Message failed to send for subscription {$report->getReason()}");
                $responseBody = [
                    'success' => false,
                    'message' => "Message failed to send. {$report->getReason()}",
                    'data' => null
                ];
                $response = $response->withStatus(404);
            }
        }
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'No subscriptions found for the user',
            'data' => null
        ];
        $response = $response->withStatus(404); // Not Found status code

    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});



// Route for Login
$group->post('/login', function (Request $request, Response $response, $args) use ($conn) {
    $data = $request->getParsedBody();
    $email = $data['email'];
    $password = $data['password'];

    $sql = "SELECT * FROM users WHERE email = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $secretKey = $_ENV["SECRET"];
            $issuedAt = time();
            $expirationTime = null; // Token has no expiration date
            $payload = [
                'iat' => $issuedAt,
                'exp' => $expirationTime,
                'user_id' => $user['user_id'], // The user will be identified by their user_id for specific routes
            ];
            $token = JWT::encode($payload, $secretKey, 'HS256');
            $responseBody = [
                'success' => true,
                'message' => "Login successful",
                'data' => $token
            ];
            $response = $response->withStatus(200); // OK status code
        } else {
            $responseBody = [
                'success' => false,
                'message' => 'Login failed: Incorrect password',
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

// Routes about user data
// Get user data
$group->get('', function (Request $request, Response $response, $args) use ($conn) {
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

    $user_id = getUserID($request);

    $sql = "SELECT user_id, firstname, lastname, email FROM users WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $responseBody = [
            'success' => true,
            'message' => 'User data retrieved successfully',
            'data' => $user
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json'); // OK status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'User not found',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json'); // Not Found status code
    }
});

// Update user data
$group->put('', function (Request $request, Response $response, $args) use ($conn) {
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

    $user_id = getUserID($request);
    $data = $request->getParsedBody();

    $email = $data['email'];
    $password = $data['password'];
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    $sql = "UPDATE users SET email = ?, password = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssi', $email, $hashed_password, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $responseBody = [
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => null
        ];
        $response = $response->withStatus(200); // OK status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'Profile update failed or no changes made',
            'data' => null
        ];
        $response = $response->withStatus(400); // Bad Request status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});

// Delete user account
$group->delete('', function (Request $request, Response $response, $args) use ($conn) {
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

    $user_id = getUserID($request);

    // Begin transaction
    $conn->begin_transaction();

    try {
        $stmt = $conn->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();

        $conn->commit();

        $responseBody = [
            'success' => true,
            'message' => 'User account deleted successfully',
            'data' => null
        ];

        $response = $response->withStatus(200)->withHeader('Content-Type', 'application/json'); // OK status code
        $response->getBody()->write(json_encode($responseBody));
    } catch (Exception $e) {
        $conn->rollback();

        $responseBody = [
            'success' => false,
            'message' => 'Failed to delete user account',
            'data' => ['error' => $e->getMessage()]
        ];

        $response = $response->withStatus(500)->withHeader('Content-Type', 'application/json'); // Internal Server Error status code
        $response->getBody()->write(json_encode($responseBody));
    }

    return $response;
});



// Routes for items
// Get all items
$group->get('/items', function (Request $request, Response $response, $args) use ($conn) {
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

    try {
        $user_id = getUserID($request);

        $queryParams = $request->getQueryParams();
        $excludeUserItems = isset($queryParams['excludeUserItems']);
        $userItems = isset($queryParams['userItems']);

        if ($excludeUserItems) {
            $condition = '!=';
        } elseif ($userItems) {
            $condition = '=';
        } else {
            // If neither parameter is set, return all items
            $stmt = $conn->prepare("
                SELECT i.*, u.firstname, u.lastname
                FROM items i
                JOIN users u ON i.user_id = u.user_id
            ");
            $stmt->execute();
            $result = $stmt->get_result();

            $items = [];
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $items[] = $row;
                }
            }

            $responseBody = [
                'success' => true,
                'message' => 'Items retrieved successfully',
                'data' => $items
            ];
            $response = $response->withStatus(200)->withHeader('Content-Type', 'application/json'); // OK status code
            $response->getBody()->write(json_encode($responseBody));
            return $response;
        }

        $stmt = $conn->prepare("
            SELECT i.*, u.firstname, u.lastname
            FROM items i
            JOIN users u ON i.user_id = u.user_id
            WHERE i.user_id $condition ?
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $items = [];
        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $items[] = $row;
            }
        }

        $responseBody = [
            'success' => true,
            'message' => 'Items retrieved successfully',
            'data' => $items
        ];
        $response = $response->withStatus(200)->withHeader('Content-Type', 'application/json'); // OK status code
        $response->getBody()->write(json_encode($responseBody));
    } catch (Exception $e) {
        $responseBody = [
            'success' => false,
            'message' => 'Token invalid or user ID not found',
            'data' => null,
            'error' => $e->getMessage()
        ];
        $response->getBody()->write(json_encode($responseBody));
        $response = $response->withStatus(401)->withHeader('Content-Type', 'application/json'); // Unauthorized status code
    }

    return $response;
});


// Get a single item
$group->get('/items/{id}', function (Request $request, Response $response, $args) use ($conn) {
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

    $id = $args['id'];

    // Prepare the SQL statement to join items and users tables
    $stmt = $conn->prepare("
        SELECT i.*, u.firstname, u.lastname
        FROM items i
        JOIN users u ON i.user_id = u.user_id
        WHERE i.item_id = ?
    ");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $item = $result->fetch_assoc();
        $responseBody = [
            'success' => true,
            'message' => 'Item retrieved successfully',
            'data' => $item
        ];
        $response->getBody()->write(json_encode($responseBody));
        $response = $response->withStatus(200)->withHeader('Content-Type', 'application/json'); // OK status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'Item not found',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        $response = $response->withStatus(404)->withHeader('Content-Type', 'application/json'); // Not Found status code
    }

    return $response;
});

// Create a new item
$group->post('/items', function (Request $request, Response $response, $args) use ($conn) {
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

    $directory = $this->get('upload_directory');
    $uploadedFiles = $request->getUploadedFiles();

    if (!isset($uploadedFiles['image'])) {
        $responseBody = [
            'success' => false,
            'message' => 'No image uploaded',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json'); // Bad Request status code
    }

    $uploadedFile = $uploadedFiles['image'];
    if ($uploadedFile->getError() === UPLOAD_ERR_INI_SIZE) {
        $responseBody = [
            'success' => false,
            'message' => 'Uploaded file size exceeds the maximum allowed size.',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json'); // Bad Request status code
    } elseif ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
        $responseBody = [
            'success' => false,
            'message' => 'An error occurred during file upload.',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json'); // Bad Request status code
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    $fileType = $uploadedFile->getClientMediaType();
    if (!in_array($fileType, $allowedTypes)) {
        $responseBody = [
            'success' => false,
            'message' => 'Invalid image type. Only JPEG, JPG and PNG are allowed.',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json'); // Bad Request status code
    }

    // Move the uploaded file
    $filename = moveUploadedFile($directory, $uploadedFile);

    $data = $request->getParsedBody();
    $user_id = getUserID($request);
    $title = $data['title'];
    $description = $data['description'];
    $imagePath = $filename;

    $stmt = $conn->prepare("INSERT INTO items (title, description, image_path, user_id) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("sssi", $title, $description, $imagePath, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $responseBody = [
            'success' => true,
            'message' => 'Item created successfully',
            'data' => null
        ];
        $response = $response->withStatus(201); // Created status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'Failed to create item',
            'data' => null
        ];
        $response = $response->withStatus(500); // Internal Server Error status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});


// Update an item (title and description)
$group->put('/items/{id}', function (Request $request, Response $response, $args) use ($conn) {
    if (!validateToken($request)) {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Invalid token',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }

    $id = $args['id'];
    $data = $request->getParsedBody();
    $title = $data['title'];
    $description = $data['description'];

    if (empty($title) || empty($description)) {
        $responseBody = [
            'success' => false,
            'message' => 'Title and description are required',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $stmt = $conn->prepare("UPDATE items SET title = ?, description = ? WHERE item_id = ?");
    $stmt->bind_param("ssi", $title, $description, $id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $responseBody = [
            'success' => true,
            'message' => 'Item updated successfully',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'No changes made or item not found',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
});

// Update an item image
$group->post('/items/{id}/image', function (Request $request, Response $response, $args) use ($conn) {
    if (!validateToken($request)) {
        $responseBody = [
            'success' => false,
            'message' => 'Unauthorized: Invalid token',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }

    $id = $args['id'];
    $directory = $this->get('upload_directory');
    $uploadedFiles = $request->getUploadedFiles();

    if (!isset($uploadedFiles['image'])) {
        $responseBody = [
            'success' => false,
            'message' => 'No image uploaded',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $uploadedFile = $uploadedFiles['image'];
    if ($uploadedFile->getError() !== UPLOAD_ERR_OK) {
        $errorMessage = $uploadedFile->getError() === UPLOAD_ERR_INI_SIZE
            ? 'Uploaded file size exceeds the maximum allowed size.'
            : 'An error occurred during file upload.';
        $responseBody = [
            'success' => false,
            'message' => $errorMessage,
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!in_array($uploadedFile->getClientMediaType(), $allowedTypes)) {
        $responseBody = [
            'success' => false,
            'message' => 'Invalid image type. Only JPEG, JPG, and PNG are allowed.',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    $filename = moveUploadedFile($directory, $uploadedFile);

    // Delete the old image
    $stmt = $conn->prepare("SELECT image_path FROM items WHERE item_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $item = $result->fetch_assoc();
    if ($item && file_exists($directory . DIRECTORY_SEPARATOR . $item['image_path'])) {
        unlink($directory . DIRECTORY_SEPARATOR . $item['image_path']);
    }

    $stmt = $conn->prepare("UPDATE items SET image_path = ? WHERE item_id = ?");
    $stmt->bind_param("si", $filename, $id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $responseBody = [
            'success' => true,
            'message' => 'Item image updated successfully',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'Failed to update item image',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
    }
});

// Delete an item
$group->delete('/items/{id}', function (Request $request, Response $response, $args) use ($conn) {
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

    $id = $args['id'];

    // Fetch the image path from the database
    $stmt = $conn->prepare("SELECT image_path FROM items WHERE item_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $item = $result->fetch_assoc();

    // Check if item exists
    if (!$item) {
        $responseBody = [
            'success' => false,
            'message' => 'Item not found',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json'); // Not Found status code
    }

    $imagePath = $item['image_path'];

    // Delete the item from the database
    $stmt = $conn->prepare("DELETE FROM items WHERE item_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        // Also delete the image file from the upload directory
        if ($imagePath) {
            $directory = $this->get('upload_directory');
            $fullImagePath = $directory . DIRECTORY_SEPARATOR . $imagePath;
            if (file_exists($fullImagePath)) {
                unlink($fullImagePath);
            }
        }

        $responseBody = [
            'success' => true,
            'message' => 'Item deleted successfully',
            'data' => null
        ];
        $response = $response->withStatus(200); // OK status code
    } else {
        $responseBody = [
            'success' => false,
            'message' => 'Failed to delete item',
            'data' => null
        ];
        $response = $response->withStatus(500); // Internal Server Error status code
    }

    $response->getBody()->write(json_encode($responseBody));
    return $response->withHeader('Content-Type', 'application/json');
});



// Routes for chats
// Create a new chat
$group->post('/chats', function ($request, $response, $args) use ($conn) {

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

    $data = $request->getParsedBody();
    $item_id = $data['item_id'];
    $user1_id = getUserID($request);
    $user2_id = $data['user_id'];

    // Check if a chat already exists between these users for this item
    $stmt = $conn->prepare("
        SELECT chat_id 
        FROM chats 
        WHERE item_id = ? AND ((user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?))
    ");
    $stmt->bind_param("iiiii", $item_id, $user1_id, $user2_id, $user2_id, $user1_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $responseBody = [
            'success' => false,
            'message' => 'Chat already exists',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(409)->withHeader('Content-Type', 'application/json'); // Conflict status code
    }

    // No existing chat found, create a new chat
    $stmt = $conn->prepare("INSERT INTO chats (item_id, user1_id, user2_id) VALUES (?, ?, ?)");
    $stmt->bind_param("iii", $item_id, $user1_id, $user2_id); // "iii" for three integers
    $stmt->execute();

    $chat_id = $conn->insert_id; // Get the last inserted ID

    $responseBody = [
        'success' => true,
        'message' => 'Chat created successfully',
        'data' => $chat_id
    ];
    $response->getBody()->write(json_encode($responseBody));
    return $response->withStatus(201)->withHeader('Content-Type', 'application/json'); // Created status code
});

// Send a message
$group->post('/messages', function ($request, $response, $args) use ($conn) {

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

    $data = $request->getParsedBody();
    $chat_id = $data['chat_id'];
    $content = $data['content'];
    $sender_id = getUserID($request);

    // Check if the user is part of the chat
    $stmt = $conn->prepare("SELECT * FROM chats WHERE chat_id = ? AND (user1_id = ? OR user2_id = ?)");
    $stmt->bind_param("iii", $chat_id, $sender_id, $sender_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $responseBody = [
            'success' => false,
            'message' => 'You are not part of this chat',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json'); // Forbidden status code
    }

    $stmt = $conn->prepare("INSERT INTO messages (chat_id, sender_id, content) VALUES (?, ?, ?)");
    $stmt->bind_param("iis", $chat_id, $sender_id, $content);
    $stmt->execute();

    $message_id = $conn->insert_id; // Get the last inserted ID

    $responseBody = [
        'success' => true,
        'message' => 'Message sent successfully',
        'data' => ['message_id' => $message_id]
    ];

    $response = $response->withStatus(201)->withHeader('Content-Type', 'application/json'); // Created status code
    $response->getBody()->write(json_encode($responseBody));
    return $response;
});

// Get all messages of a chat
$group->get('/chats/{chat_id}/messages', function ($request, $response, $args) use ($conn) {

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

    // Get the current user ID
    $current_user_id = (int)getUserID($request); // Ensure current_user_id is an integer
    $chat_id = $args['chat_id'];

    // Check if the user is part of the chat
    $stmt = $conn->prepare("SELECT * FROM chats WHERE chat_id = ? AND (user1_id = ? OR user2_id = ?)");
    $stmt->bind_param("iii", $chat_id, $current_user_id, $current_user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $responseBody = [
            'success' => false,
            'message' => 'You are not part of this chat',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json'); // Forbidden status code
    }

    // Fetch chat details including item name, owner's name, and requester's name
    $chatDetailsStmt = $conn->prepare("
        SELECT c.item_id,
               i.title AS item_name,
               u1.user_id AS owner_id,
               u1.firstname AS owner_firstname,
               u1.lastname AS owner_lastname,
               u2.user_id AS requester_id,
               u2.firstname AS requester_firstname,
               u2.lastname AS requester_lastname
        FROM chats c
        JOIN items i ON c.item_id = i.item_id
        JOIN users u1 ON i.user_id = u1.user_id
        JOIN users u2 ON (c.user1_id = u2.user_id OR c.user2_id = u2.user_id) AND u2.user_id != u1.user_id
        WHERE c.chat_id = ?
    ");
    $chatDetailsStmt->bind_param("i", $chat_id);
    $chatDetailsStmt->execute();
    $chatDetailsResult = $chatDetailsStmt->get_result();
    $chatDetails = $chatDetailsResult->fetch_assoc();

    if (!$chatDetails) {
        $responseBody = [
            'success' => false,
            'message' => 'Chat details not found',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json'); // Not Found status code
    }

    // Fetch chat messages
    $stmt = $conn->prepare("SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at ASC");
    $stmt->bind_param("i", $chat_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $messages = $result->fetch_all(MYSQLI_ASSOC);

    // Mark all unread messages as read for the current user
    $markReadStmt = $conn->prepare("UPDATE messages SET read_status = 1 WHERE chat_id = ? AND sender_id != ?");
    $markReadStmt->bind_param("ii", $chat_id, $current_user_id);
    $markReadStmt->execute();

    // Combine chat details and messages
    $responseData = [
        'success' => true,
        'message' => 'Chat details and messages retrieved successfully',
        'data' => [
            'current_user_id' => $current_user_id,
            'other_user_id' => $chatDetails['requester_id'] === $current_user_id ? $chatDetails['owner_id'] : $chatDetails['requester_id'],
            'other_user_name' => $chatDetails['requester_id'] === $current_user_id ? $chatDetails['owner_firstname'] . ' ' . $chatDetails['owner_lastname'] : $chatDetails['requester_firstname'] . ' ' . $chatDetails['requester_lastname'],
            'item_name' => $chatDetails['item_name'],
            'item_id' => (int)$chatDetails['item_id'],
            'messages' => $messages
        ]
    ];

    $response = $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    $response->getBody()->write(json_encode($responseData));
    return $response;
});

// Get all chats of the current user
$group->get('/chats', function ($request, $response, $args) use ($conn) {

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

    $user_id = getUserID($request);

    $stmt = $conn->prepare("
        SELECT c.chat_id,
               IF(c.user1_id = ?, c.user2_id, c.user1_id) AS other_user_id,
               u.firstname,
               u.lastname,
               i.title AS item_name,
               i.image_path AS item_image,
               (SELECT COUNT(*) 
                FROM messages 
                WHERE chat_id = c.chat_id 
                  AND read_status = 0 
                  AND sender_id != ?) AS unread_count,
               (SELECT m.content 
                FROM messages m 
                WHERE m.chat_id = c.chat_id 
                ORDER BY m.created_at DESC 
                LIMIT 1) AS latest_message,
                (SELECT m.created_at 
                FROM messages m 
                WHERE m.chat_id = c.chat_id 
                ORDER BY m.created_at DESC 
                LIMIT 1) AS created_at
        FROM chats c
        JOIN users u ON u.user_id = IF(c.user1_id = ?, c.user2_id, c.user1_id)
        JOIN items i ON i.item_id = c.item_id
        WHERE c.user1_id = ? OR c.user2_id = ?
    ");
    $stmt->bind_param("iiiii", $user_id, $user_id, $user_id, $user_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $chats = [];
    while ($row = $result->fetch_assoc()) {
        $chats[] = [
            'chat_id' => $row['chat_id'],
            'user_id' => $row['other_user_id'],
            'name' => $row['firstname'] . ' ' . $row['lastname'],
            'item_name' => $row['item_name'],
            'item_image' => $row['item_image'],
            'unread_count' => (int)$row['unread_count'], // Ensure unread_count is an integer
            'latest_message' => $row['latest_message'],
            'created_at' => $row['created_at']
        ];
    }

    $responseBody = [
        'success' => true,
        'message' => 'Chats retrieved successfully',
        'data' => $chats
    ];

    $response = $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    $response->getBody()->write(json_encode($responseBody));
    return $response;
});

// Delete a chat
$group->delete('/chats/{chat_id}', function ($request, $response, $args) use ($conn) {

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

    $user_id = getUserID($request);
    $chat_id = $args['chat_id'];

    // Check if the user is part of the chat
    $stmt = $conn->prepare("SELECT * FROM chats WHERE chat_id = ? AND (user1_id = ? OR user2_id = ?)");
    $stmt->bind_param("iii", $chat_id, $user_id, $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $responseBody = [
            'success' => false,
            'message' => 'You are not part of this chat',
            'data' => null
        ];
        $response->getBody()->write(json_encode($responseBody));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json'); // Forbidden status code
    }

    // Begin transaction
    $conn->begin_transaction();


    // Delete the chat
    $stmt = $conn->prepare("DELETE FROM chats WHERE chat_id = ?");
    $stmt->bind_param("i", $chat_id);
    $stmt->execute();

    // Commit transaction
    $conn->commit();

    $responseBody = [
        'success' => true,
        'message' => 'Chat deleted successfully',
        'data' => null
    ];

    $response = $response->withStatus(200)->withHeader('Content-Type', 'application/json'); // OK status code
    $response->getBody()->write(json_encode($responseBody));
    return $response;
});
