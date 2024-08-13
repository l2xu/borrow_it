<?php

use DI\ContainerBuilder;
use Slim\Factory\AppFactory;
use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Response as SlimResponse;

require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/src/utils.php';

// ENV VARIABLES
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Create container for file upload
$containerBuilder = new ContainerBuilder();
$container = $containerBuilder->build();
$container->set('upload_directory', __DIR__ . '/uploads');
AppFactory::setContainer($container);

// Create Slim app
$app = AppFactory::create();

// Enable CORS
$app->add(function (Request $request, $handler) {

    if ($request->getMethod() === 'OPTIONS') {
        $response = new SlimResponse();
        return $response
            ->withHeader('Access-Control-Allow-Origin', $_ENV["FRONTEND_URL"])
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, OwnItems')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
            ->withStatus(200);
    }

    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', $_ENV["FRONTEND_URL"])
        ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization, OwnItems')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// Add Slim routing middleware
$app->addBodyParsingMiddleware();

// Create connection

$conn = new mysqli($_ENV["DB_HOST"], $_ENV["DB_USER"], $_ENV["DB_PASSWORD"], $_ENV["DB_NAME"]);
//check if connection is successful
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8");


// Default route
$app->get('/', function ($request, $response, $args) {
    $response->getBody()->write("Welcome to the Borrow It API!");
    return $response;
});

// Routes for users
$app->group('/user', function (RouteCollectorProxy $group) use ($conn) {
    require __DIR__ . '/src/routes/user.php';
});

// Routes for admin
$app->group('/admin', function (RouteCollectorProxy $group) use ($conn) {
    require __DIR__ . '/src/routes/admin.php';
});

$app->run();
