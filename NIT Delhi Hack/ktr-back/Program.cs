using ktr_back.Services;
using Supabase;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Allow the Vite dev server (and anything else listed in config) to call
// this API directly. The Vite dev proxy makes this unnecessary for local
// `npm run dev`, but CORS still matters for `vite preview`, other tools
// hitting the API, or a future deployment where frontend and backend
// aren't served from the same origin.
const string FrontendCorsPolicy = "FrontendCors";
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173", "http://127.0.0.1:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register Supabase client. Url/Key should come from environment variables
// or `dotnet user-secrets` (Supabase__Url / Supabase__Key) - never commit
// real credentials to appsettings.json.
var supabaseUrl = builder.Configuration["Supabase:Url"];
var supabaseKey = builder.Configuration["Supabase:Key"];
var supabaseConfigured = !string.IsNullOrWhiteSpace(supabaseUrl) && !string.IsNullOrWhiteSpace(supabaseKey);

if (!supabaseConfigured)
{
    // Don't crash - the app should still start so /api/health can explain
    // what's wrong instead of the process just refusing to run. But every
    // real data call will fail until this is set, so make it loud.
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine(
        "[startup warning] Supabase:Url / Supabase:Key are not configured. " +
        "All /api/* data endpoints will fail until you set them, e.g.:\n" +
        "  dotnet user-secrets set \"Supabase:Url\" \"https://<project-ref>.supabase.co\"\n" +
        "  dotnet user-secrets set \"Supabase:Key\" \"<anon-or-service-key>\"\n" +
        "or the Supabase__Url / Supabase__Key environment variables.");
    Console.ResetColor();
}

var supabaseOptions = new SupabaseOptions { AutoConnectRealtime = true };
builder.Services.AddSingleton(new Supabase.Client(
    supabaseUrl ?? "https://not-configured.supabase.co",
    supabaseKey ?? "not-configured",
    supabaseOptions));
builder.Services.AddScoped(typeof(IGenericSupabaseService<>), typeof(GenericSupabaseService<>));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    // Only force HTTPS outside Development. In dev, the Vite proxy talks to
    // the plain-http profile (localhost:5072); redirecting those requests
    // to https breaks the proxy since it doesn't follow the redirect to a
    // self-signed dev cert.
    app.UseHttpsRedirection();
}

app.UseCors(FrontendCorsPolicy);

app.UseAuthorization();

app.MapControllers();

// Lightweight diagnostics endpoint - lets the frontend team (or you, in a
// browser tab) check "is the backend actually reachable and configured?"
// without exposing the key itself.
app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    supabaseConfigured,
}));

app.Run();
