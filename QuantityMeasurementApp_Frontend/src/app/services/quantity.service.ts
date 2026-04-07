import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class QuantityService {
  private readonly BASE = '/api';

  constructor(private http: HttpClient) {}

  private getMeasurementType(unit: string): string {
    const lengthUnits = ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'];
    const weightUnits = ['KILOGRAM', 'GRAM', 'POUND'];
    const volumeUnits = ['LITRE', 'MILLILITRE', 'GALLON'];
    const tempUnits = ['CELSIUS', 'FAHRENHEIT'];
    
    if (lengthUnits.includes(unit)) return 'length';
    if (weightUnits.includes(unit)) return 'weight';
    if (volumeUnits.includes(unit)) return 'volume';
    if (tempUnits.includes(unit)) return 'temperature';
    return 'length';
  }

  compare(body: { value1: number; unit1: string; value2: number; unit2: string }) {
    const requestBody = {
      ThisQuantityDTO: { value: body.value1, unit: body.unit1, measurementType: this.getMeasurementType(body.unit1) },
      ThatQuantityDTO: { value: body.value2, unit: body.unit2, measurementType: this.getMeasurementType(body.unit2) }
    };
    return this.http.post<any>(`${this.BASE}/v1/quantities/compare`, requestBody);
  }

  add(body: { value1: number; unit1: string; value2: number; unit2: string }) {
    const requestBody = {
      ThisQuantityDTO: { value: body.value1, unit: body.unit1, measurementType: this.getMeasurementType(body.unit1) },
      ThatQuantityDTO: { value: body.value2, unit: body.unit2, measurementType: this.getMeasurementType(body.unit2) }
    };
    return this.http.post<any>(`${this.BASE}/v1/quantities/add`, requestBody);
  }

  subtract(body: { value1: number; unit1: string; value2: number; unit2: string }) {
    const requestBody = {
      ThisQuantityDTO: { value: body.value1, unit: body.unit1, measurementType: this.getMeasurementType(body.unit1) },
      ThatQuantityDTO: { value: body.value2, unit: body.unit2, measurementType: this.getMeasurementType(body.unit2) }
    };
    return this.http.post<any>(`${this.BASE}/v1/quantities/subtract`, requestBody);
  }

  divide(body: { value1: number; unit1: string; value2: number; unit2: string }) {
    const requestBody = {
      ThisQuantityDTO: { value: body.value1, unit: body.unit1, measurementType: this.getMeasurementType(body.unit1) },
      ThatQuantityDTO: { value: body.value2, unit: body.unit2, measurementType: this.getMeasurementType(body.unit2) }
    };
    return this.http.post<any>(`${this.BASE}/v1/quantities/divide`, requestBody);
  }

  convert(body: { value: number; fromUnit: string; toUnit: string }) {
    const requestBody = {
      QuantityDTO: { value: body.value, unit: body.fromUnit, measurementType: this.getMeasurementType(body.fromUnit) },
      TargetUnit: body.toUnit
    };
    return this.http.post<any>(`${this.BASE}/v1/quantities/convert`, requestBody);
  }

  getHistory() {
    return this.http.get<any>(`${this.BASE}/v1/quantities/history/all`);
  }

  getErroredHistory() {
    return this.http.get<any[]>(`${this.BASE}/v1/quantities/history/errored`);
  }

  getCount(operationType: string) {
    return this.http.get<any>(`${this.BASE}/v1/quantities/count/${operationType}`);
  }
}
