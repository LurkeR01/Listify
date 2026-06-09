using FluentValidation;
using Listify.Api.DTOs.Chat;

namespace Listify.Api.Validators.Chat;

public class SendMessageRequestDtoValidator : AbstractValidator<SendMessageRequestDto>
{
    public SendMessageRequestDtoValidator()
    {
        RuleFor(x => x.ConversationId)
            .NotEmpty()
            .Must(id => Guid.TryParse(id, out _))
            .WithMessage("Conversation id is invalid.");

        RuleFor(x => x.Text)
            .NotEmpty()
            .MaximumLength(2000);
    }
}
