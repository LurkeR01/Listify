using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Listify.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ChangedLocationLogic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Location",
                table: "Listings",
                newName: "LocationRef");

            migrationBuilder.AddColumn<string>(
                name: "LocationArea",
                table: "Listings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "LocationId",
                table: "Listings",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "LocationName",
                table: "Listings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "Location_Id",
                table: "Listings",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LocationArea",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "LocationId",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "LocationName",
                table: "Listings");

            migrationBuilder.DropColumn(
                name: "Location_Id",
                table: "Listings");

            migrationBuilder.RenameColumn(
                name: "LocationRef",
                table: "Listings",
                newName: "Location");
        }
    }
}
