<?php
require 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\UploadedFileInterface;

// This function validates the token in the Authorization header
// It returns true if the token is valid, false otherwise
function validateToken(Request $request)
{
    $authHeader = $request->getHeader('Authorization');
    if (empty($authHeader)) {
        return false;
    }
    $token = str_replace('Bearer ', '', $authHeader[0]);
    try {
        JWT::decode($token, new Key($_ENV["SECRET"], 'HS256'));
        return true;
    } catch (Exception $e) {
        return false;
    }
}

// This function returns the user_id from the token in the Authorization header
function getUserID(Request $request)
{
    $authHeader = $request->getHeader('Authorization');
    $token = str_replace('Bearer ', '', $authHeader[0]);
    $decoded = JWT::decode($token, new Key($_ENV["SECRET"], 'HS256'));
    $user_id = $decoded->user_id;
    return (int) $user_id; // cast to int
}

// This function returns the role of the user from the token in the Authorization header
function getRole(Request $request, $conn)
{
    $user_id = getUserID($request);
    $sql = "SELECT role FROM users WHERE user_id = $user_id";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    $role = $row['role'];
    return $role;
}

// This function moves the uploaded file to the specified directory
function moveUploadedFile(string $directory, UploadedFileInterface $uploadedFile)
{
    $extension = pathinfo($uploadedFile->getClientFilename(), PATHINFO_EXTENSION);

    $basename = bin2hex(random_bytes(8));
    $filename = sprintf('%s.%0.8s', $basename, $extension);

    $uploadedFile->moveTo($directory . DIRECTORY_SEPARATOR . $filename);

    return $filename;
}
