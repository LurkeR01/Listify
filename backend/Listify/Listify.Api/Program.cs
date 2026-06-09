using Listify.Api.Authentication;
using Listify.Api.MIddleware;
using Listify.Application.Common.Interfaces;
using Listify.Application.Common.Interfaces.Category;
using Listify.Application.Common.Options;
using Listify.Application.Interfaces;
using Listify.Application.Interfaces.Listing;
using Listify.Application.Services;
using Listify.Infrastructure.Persistence;
using Listify.Infrastructure.Repositories;
using Listify.Infrastructure.Repositories.Category;
using Listify.Infrastructure.Repositories.Listing;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using DotNetEnv;
using Listify.Api.Hubs;
using Listify.Application.Common.Interfaces.Chat;
using Listify.Infrastructure.Repositories.Chat;
using FluentValidation;
using FluentValidation.AspNetCore;
using Listify.Api.Validators.Auth;

var builder = WebApplication.CreateBuilder(args);

Env.Load(Path.Combine(builder.Environment.ContentRootPath, ".env"));
builder.Configuration.AddEnvironmentVariables();

builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .Validate(options => !string.IsNullOrWhiteSpace(options.Key), "Jwt:Key is required.")
    .Validate(options => options.Key.Length >= 32, "Jwt:Key must contain at least 32 characters.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.Issuer), "Jwt:Issuer is required.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.Audience), "Jwt:Audience is required.")
    .Validate(options => options.AccessTokenMinutes > 0, "Jwt:AccessTokenMinutes must be greater than 0.")
    .ValidateOnStart();

builder.Services
    .AddOptions<CloudinaryOptions>()
    .Bind(builder.Configuration.GetSection(CloudinaryOptions.SectionName))
    .Validate(options => !string.IsNullOrWhiteSpace(options.CloudName), "Cloudinary:Cloud_Name is required.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.ApiKey), "Cloudinary:Api_Key is required.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.ApiSecret), "Cloudinary:Api_Secret is required.")
    .ValidateOnStart();

builder.Services
    .AddOptions<NovaPoshtaOptions>()
    .Bind(builder.Configuration.GetSection(NovaPoshtaOptions.SectionName))
    .Validate(options => !string.IsNullOrWhiteSpace(options.ApiKey), "NovaPoshta:Api_Key is required.")
    .ValidateOnStart();

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<UserLoginRequestDtoValidator>();

builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IListingRepository, ListingRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IChatRepository, ChatRepository>();
builder.Services.AddScoped<IAppDbContext, AppDbContext>();

builder.Services.AddScoped<AuthService>(); 
builder.Services.AddScoped<ListingService>();
builder.Services.AddScoped<ListingQueryService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<CloudinaryService>();
builder.Services.AddScoped<LocationService>();
builder.Services.AddScoped<ChatService>();
builder.Services.AddHttpClient("NovaPoshta", client =>
{
    client.BaseAddress = new Uri("https://api.novaposhta.ua/");
    client.DefaultRequestHeaders.Add("Accept", "application/json");
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services.ConfigureOptions<ConfigureJwtBearerOptions>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.MapControllers();
app.MapHub<ChatHub>("/chat");

app.Run();
