using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Listify.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedUserRating : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserRatings_ListingId_FromUserId_ToUserId",
                table: "UserRatings");

            migrationBuilder.AlterColumn<Guid>(
                name: "ListingId",
                table: "UserRatings",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.CreateIndex(
                name: "IX_UserRatings_ListingId_FromUserId_ToUserId",
                table: "UserRatings",
                columns: new[] { "ListingId", "FromUserId", "ToUserId" },
                unique: true,
                filter: "[ListingId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserRatings_ListingId_FromUserId_ToUserId",
                table: "UserRatings");

            migrationBuilder.AlterColumn<Guid>(
                name: "ListingId",
                table: "UserRatings",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserRatings_ListingId_FromUserId_ToUserId",
                table: "UserRatings",
                columns: new[] { "ListingId", "FromUserId", "ToUserId" },
                unique: true);
        }
    }
}
