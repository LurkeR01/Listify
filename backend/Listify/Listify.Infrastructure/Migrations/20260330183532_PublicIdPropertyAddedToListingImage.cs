using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Listify.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PublicIdPropertyAddedToListingImage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublicId",
                table: "ListingImages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicId",
                table: "ListingImages");
        }
    }
}
