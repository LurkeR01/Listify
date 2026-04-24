using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Listify.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedLocationProperyToUserEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LocationArea",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LocationName",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LocationRef",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LocationArea",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LocationName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LocationRef",
                table: "Users");
        }
    }
}
