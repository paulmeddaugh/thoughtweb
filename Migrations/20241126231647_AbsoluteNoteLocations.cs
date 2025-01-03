using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AbsoluteNoteLocations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "color",
                table: "notes",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "x",
                table: "notes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "y",
                table: "notes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "color",
                table: "notebooks",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "x",
                table: "notebooks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "y",
                table: "notebooks",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "mid_x",
                table: "connections",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "mid_y",
                table: "connections",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "color",
                table: "notes");

            migrationBuilder.DropColumn(
                name: "x",
                table: "notes");

            migrationBuilder.DropColumn(
                name: "y",
                table: "notes");

            migrationBuilder.DropColumn(
                name: "color",
                table: "notebooks");

            migrationBuilder.DropColumn(
                name: "x",
                table: "notebooks");

            migrationBuilder.DropColumn(
                name: "y",
                table: "notebooks");

            migrationBuilder.DropColumn(
                name: "mid_x",
                table: "connections");

            migrationBuilder.DropColumn(
                name: "mid_y",
                table: "connections");
        }
    }
}
