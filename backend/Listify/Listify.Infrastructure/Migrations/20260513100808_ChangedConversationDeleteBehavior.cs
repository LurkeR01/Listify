using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Listify.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangedConversationDeleteBehavior : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Listings_ListingId",
                table: "Conversations");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Listings_ListingId",
                table: "Conversations",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Conversations_Listings_ListingId",
                table: "Conversations");

            migrationBuilder.AddForeignKey(
                name: "FK_Conversations_Listings_ListingId",
                table: "Conversations",
                column: "ListingId",
                principalTable: "Listings",
                principalColumn: "Id");
        }
    }
}
