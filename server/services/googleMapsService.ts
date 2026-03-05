/**
 * Google Maps Service - Distance Matrix API Integration
 * Calculates travel time and distance between two coordinates
 */

import { ENV } from "../_core/env";

export interface DistanceResult {
  distanciaKm: number;
  tempoMinutos: number;
  tempoTexto: string;
}

/**
 * Calculate distance and time between two coordinates using Google Maps Distance Matrix API
 * Considers real-time traffic conditions
 */
export async function calcularDistanciaETempo(
  origemLat: number,
  origemLng: number,
  destLat: number,
  destLng: number,
  horario?: Date
): Promise<DistanceResult> {
  try {
    // Get API key from environment
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("[GoogleMaps] API key not configured");
      // Fallback: estimate based on Haversine formula
      return estimarDistancia(origemLat, origemLng, destLat, destLng);
    }

    const origem = `${origemLat},${origemLng}`;
    const destino = `${destLat},${destLng}`;

    // Build query parameters
    const params = new URLSearchParams({
      origins: origem,
      destinations: destino,
      key: apiKey,
      units: "metric",
    });

    // Add departure time if provided (for traffic-aware routing)
    if (horario) {
      const departureTime = Math.floor(horario.getTime() / 1000);
      params.append("departure_time", departureTime.toString());
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.statusText}`);
    }

    const data = (await response.json()) as any;

    if (data.status !== "OK") {
      console.warn(`[GoogleMaps] API returned status: ${data.status}`);
      // Fallback to estimation
      return estimarDistancia(origemLat, origemLng, destLat, destLng);
    }

    if (!data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0]) {
      throw new Error("Invalid response from Google Maps API");
    }

    const element = data.rows[0].elements[0];

    if (element.status !== "OK") {
      console.warn(`[GoogleMaps] Route element status: ${element.status}`);
      return estimarDistancia(origemLat, origemLng, destLat, destLng);
    }

    const distanciaMetros = element.distance.value;
    const tempoSegundos = element.duration.value;

    return {
      distanciaKm: distanciaMetros / 1000,
      tempoMinutos: Math.ceil(tempoSegundos / 60),
      tempoTexto: element.duration.text,
    };
  } catch (error) {
    console.error("[GoogleMaps] Error calculating distance:", error);
    // Fallback to estimation
    return estimarDistancia(origemLat, origemLng, destLat, destLng);
  }
}

/**
 * Estimate distance using Haversine formula (fallback when API is unavailable)
 * Returns approximate distance in km and estimated time (assuming 40 km/h average speed)
 */
function estimarDistancia(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): DistanceResult {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanciaKm = R * c;

  // Estimate time: 40 km/h average speed + 5 min buffer for urban areas
  const tempoMinutos = Math.ceil((distanciaKm / 40) * 60 + 5);

  return {
    distanciaKm: Math.round(distanciaKm * 100) / 100,
    tempoMinutos,
    tempoTexto: `${tempoMinutos} min`,
  };
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
