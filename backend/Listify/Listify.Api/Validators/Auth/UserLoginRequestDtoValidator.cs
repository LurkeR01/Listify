using FluentValidation;
using Listify.Api.DTOs.User;

namespace Listify.Api.Validators.Auth;

public class UserLoginRequestDtoValidator : AbstractValidator<UserLoginRequestDto>
{
    public UserLoginRequestDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(254);

        RuleFor(x => x.Password)
            .NotEmpty()
            .Length(6, 100);
    }
}
