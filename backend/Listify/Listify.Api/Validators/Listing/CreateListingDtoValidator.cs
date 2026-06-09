using FluentValidation;
using Listify.Api.DTOs.Listing;

namespace Listify.Api.Validators.Listing;

public class CreateListingDtoValidator : AbstractValidator<CreateListingDto>
{
    public CreateListingDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .Length(3, 90);

        RuleFor(x => x.Price)
            .GreaterThan(0);

        RuleFor(x => x.Description)
            .NotEmpty()
            .MaximumLength(4000);
    }
}
