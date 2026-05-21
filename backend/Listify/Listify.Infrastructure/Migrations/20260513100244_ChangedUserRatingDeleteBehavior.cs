using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Listify.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangedUserRatingDeleteBehavior : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRatings_Listings_ListingId",
                table: "UserRatings");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRatings_Listings_ListingId",
                table: "UserRatings",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRatings_Listings_ListingId",
                table: "UserRatings");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRatings_Listings_ListingId",
                table: "UserRatings",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
