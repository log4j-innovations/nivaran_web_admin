import { Issue, User, Area, GeographicArea, LocationPoint } from './types';

export class GeographicFilterService {
  // Earth's radius in kilometers
  private static readonly EARTH_RADIUS = 6371;

  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(point1: LocationPoint, point2: LocationPoint): number {
    const lat1 = this.deg2rad(point1.latitude);
    const lon1 = this.deg2rad(point1.longitude);
    const lat2 = this.deg2rad(point2.latitude);
    const lon2 = this.deg2rad(point2.longitude);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1) * Math.cos(lat2) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return this.EARTH_RADIUS * c;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Check if a point is within a circular area
   */
  static isPointInArea(point: LocationPoint, area: GeographicArea): boolean {
    const distance = this.calculateDistance(point, area.center);
    return distance <= area.radius;
  }

  /**
   * Check if a point is within polygon boundaries
   */
  static isPointInPolygon(point: LocationPoint, boundaries: LocationPoint[]): boolean {
    if (boundaries.length < 3) return false;

    let inside = false;
    for (let i = 0, j = boundaries.length - 1; i < boundaries.length; j = i++) {
      const xi = boundaries[i].longitude;
      const yi = boundaries[i].latitude;
      const xj = boundaries[j].longitude;
      const yj = boundaries[j].latitude;

      if (((yi > point.latitude) !== (yj > point.latitude)) &&
          (point.longitude < (xj - xi) * (point.latitude - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  /**
   * Filter issues based on user's geographic areas
   */
  static filterIssuesByUserAreas(
    issues: Issue[], 
    user: User, 
    areas: Area[]
  ): Issue[] {
    if (!user.geographicAreas || user.geographicAreas.length === 0) {
      // If no geographic areas assigned, return all issues (for SuperAdmin)
      return user.role === 'SuperAdmin' ? issues : [];
    }

    return issues.filter(issue => {
      const issueLocation: LocationPoint = {
        latitude: issue.location.latitude,
        longitude: issue.location.longitude
      };

      // Check if issue is within any of user's geographic areas
      return user.geographicAreas!.some(geoArea => {
        // First check if it's within the circular area
        if (this.isPointInArea(issueLocation, geoArea)) {
          return true;
        }

        // If boundaries are defined, also check polygon
        if (geoArea.boundaries && geoArea.boundaries.length > 0) {
          return this.isPointInPolygon(issueLocation, geoArea.boundaries);
        }

        return false;
      });
    });
  }

  /**
   * Filter issues based on proximity to user's location (for Department Heads)
   */
  static filterIssuesByProximity(issues: Issue[], user: User): Issue[] {
    // Default radius for Department Head proximity (in kilometers)
    const DEFAULT_PROXIMITY_RADIUS = 50; // 50km radius

    // If user has a location, use it; otherwise return all issues
    if (!user.location || !user.location.latitude || !user.location.longitude) {
      return issues; // Return all issues if no user location
    }

    const userLocation: LocationPoint = {
      latitude: user.location.latitude,
      longitude: user.location.longitude
    };

    return issues.filter(issue => {
      const issueLocation: LocationPoint = {
        latitude: issue.location.latitude,
        longitude: issue.location.longitude
      };

      const distance = this.calculateDistance(userLocation, issueLocation);
      return distance <= DEFAULT_PROXIMITY_RADIUS;
    });
  }

  /**
   * Get issues within a specific radius of a point
   */
  static getIssuesWithinRadius(
    issues: Issue[],
    center: LocationPoint,
    radius: number
  ): Issue[] {
    return issues.filter(issue => {
      const issueLocation: LocationPoint = {
        latitude: issue.location.latitude,
        longitude: issue.location.longitude
      };
      const distance = this.calculateDistance(center, issueLocation);
      return distance <= radius;
    });
  }

  /**
   * Get the closest area to a point
   */
  static getClosestArea(point: LocationPoint, areas: Area[]): Area | null {
    if (areas.length === 0) return null;

    let closestArea = areas[0];
    let minDistance = Infinity;

    for (const area of areas) {
      const distance = this.calculateDistance(point, area.center);
      if (distance < minDistance) {
        minDistance = distance;
        closestArea = area;
      }
    }

    return closestArea;
  }

  /**
   * Calculate the center point of multiple locations
   */
  static calculateCenterPoint(points: LocationPoint[]): LocationPoint {
    if (points.length === 0) {
      return { latitude: 0, longitude: 0 };
    }

    const sumLat = points.reduce((sum, point) => sum + point.latitude, 0);
    const sumLon = points.reduce((sum, point) => sum + point.longitude, 0);

    return {
      latitude: sumLat / points.length,
      longitude: sumLon / points.length
    };
  }

  /**
   * Get geographic statistics for a user's assigned areas
   */
  static getGeographicStats(
    issues: Issue[],
    user: User,
    areas: Area[]
  ): {
    totalIssues: number;
    issuesInRange: number;
    averageDistance: number;
    coverageArea: number;
  } {
    if (!user.geographicAreas || user.geographicAreas.length === 0) {
      return {
        totalIssues: issues.length,
        issuesInRange: 0,
        averageDistance: 0,
        coverageArea: 0
      };
    }

    const filteredIssues = this.filterIssuesByUserAreas(issues, user, areas);
    
    let totalDistance = 0;
    let validDistances = 0;

    filteredIssues.forEach(issue => {
      const issueLocation: LocationPoint = {
        latitude: issue.location.latitude,
        longitude: issue.location.longitude
      };

      // Find the closest geographic area
      const closestArea = user.geographicAreas!.reduce((closest, area) => {
        const distance = this.calculateDistance(issueLocation, area.center);
        if (!closest || distance < closest.distance) {
          return { area, distance };
        }
        return closest;
      }, null as { area: GeographicArea; distance: number } | null);

      if (closestArea) {
        totalDistance += closestArea.distance;
        validDistances++;
      }
    });

    const averageDistance = validDistances > 0 ? totalDistance / validDistances : 0;
    
    // Calculate total coverage area (sum of all assigned areas)
    const coverageArea = user.geographicAreas!.reduce((total, area) => {
      return total + (Math.PI * area.radius * area.radius);
    }, 0);

    return {
      totalIssues: issues.length,
      issuesInRange: filteredIssues.length,
      averageDistance: Math.round(averageDistance * 100) / 100,
      coverageArea: Math.round(coverageArea * 100) / 100
    };
  }

  /**
   * Validate geographic area data
   */
  static validateGeographicArea(area: GeographicArea): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!area.name || area.name.trim() === '') {
      errors.push('Area name is required');
    }

    if (area.radius <= 0) {
      errors.push('Radius must be greater than 0');
    }

    if (area.center.latitude < -90 || area.center.latitude > 90) {
      errors.push('Invalid latitude value');
    }

    if (area.center.longitude < -180 || area.center.longitude > 180) {
      errors.push('Invalid longitude value');
    }

    if (area.boundaries && area.boundaries.length < 3) {
      errors.push('Polygon boundaries must have at least 3 points');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
