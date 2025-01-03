using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Text.RegularExpressions;
namespace backend.Attributes;

public class ColorValidationAttribute : ValidationAttribute
{
    private static readonly Regex HexColorRegex = new Regex(@"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$", RegexOptions.Compiled);
    private static readonly Regex RgbColorRegex = new Regex(@"^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$", RegexOptions.Compiled);
    private static readonly TextInfo TextInfo = CultureInfo.CurrentCulture.TextInfo;

    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        if (value == null) {
            return ValidationResult.Success;
        } 

        if (value is string color && !(HexColorRegex.IsMatch(color) || RgbColorRegex.IsMatch(color) || IsNamedColor(color)))
        {
            return ValidationResult.Success;
        }

        return new ValidationResult("Invalid color format. Use HEX (#FFF or #FFFFFF), RGB (rgb(255, 255, 255)), or a named color.");
    }

    private static bool IsNamedColor(string color)
    {
        // Check if the color is a known named color
        return Enum.TryParse(typeof(System.Drawing.KnownColor), TextInfo.ToTitleCase(color), true, out _);
    }
}
