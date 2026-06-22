use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('welcome');
})->name('home');

/*
|----------------------------------------
| AUTH ROUTES (LOGIN PAGE)
|----------------------------------------
*/

// Show login page (THIS IS WHAT YOU WERE MISSING)
Route::get('/login', function () {
    return inertia('auth/Login');
})->name('login');

/*
|----------------------------------------
| AUTHENTICATED AREA
|----------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('/dashboard', 'dashboard')->name('dashboard');
    Route::inertia('/visa-ai', 'VisaAi')->name('visa-ai');
});