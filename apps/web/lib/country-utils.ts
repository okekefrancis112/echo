import * as ct from "countries-and-timezones";

// Get country code (ISO 3166-1 alpha-2) from timezone
export function getCountryFromTimezone(timezone?: string) {
    if (!timezone) return null;

    const timezoneInfo = ct.getTimezone(timezone);
    if (!timezoneInfo?.countries?.length) return null;

    const countryCode = timezoneInfo.countries[0];
    const country = ct.getCountry(countryCode as string);

    return {
        code: countryCode,
        name: country?.name || countryCode,
    }
}

export function getCountryFlagUrl(countryCode: string) {
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

export function getCountryFlagEmoji(countryCode: string) {
    // Convert ISO 3166-1 alpha-2 to regional indicator symbols
    // A = 65, Z = 90
    // Regional Indicator Symbol Letter A = 127462, Regional Indicator Symbol Letter Z = 127487
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}