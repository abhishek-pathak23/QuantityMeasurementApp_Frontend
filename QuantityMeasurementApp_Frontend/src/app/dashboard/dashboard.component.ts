import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { QuantityService } from '../services/quantity.service';

type Tab = 'convert' | 'compare' | 'add' | 'subtract' | 'divide' | 'history';

// Categorized units by measurement type - must match backend enums exactly
const LENGTH_UNITS = ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'];
const WEIGHT_UNITS = ['KILOGRAM', 'GRAM', 'POUND'];
const VOLUME_UNITS = ['LITRE', 'MILLILITRE', 'GALLON'];
const TEMPERATURE_UNITS = ['CELSIUS', 'FAHRENHEIT'];

const UNIT_CATEGORIES = {
  length: LENGTH_UNITS,
  weight: WEIGHT_UNITS,
  volume: VOLUME_UNITS,
  temperature: TEMPERATURE_UNITS
};

type UnitCategory = keyof typeof UNIT_CATEGORIES;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  activeTab: Tab = 'convert';
  unitCategories = UNIT_CATEGORIES;
  allUnits = [...LENGTH_UNITS, ...WEIGHT_UNITS, ...VOLUME_UNITS, ...TEMPERATURE_UNITS];
  isGuest = false;

  // Convert
  convertValue = 0;
  convertFromCategory: UnitCategory = 'length';
  convertToCategory: UnitCategory = 'length';
  convertFrom = 'FEET';
  convertTo = 'INCHES';
  convertResult: any = null;
  convertError = '';
  convertErrorType: 'auth' | 'other' | null = null;

  // Compare
  compareValue1 = 0;
  compareValue2 = 0;
  compareUnit1Category: UnitCategory = 'length';
  compareUnit2Category: UnitCategory = 'length';
  compareUnit1 = 'FEET';
  compareUnit2 = 'INCHES';
  compareResult: any = null;
  compareError = '';

  // Add
  addValue1 = 0;
  addValue2 = 0;
  addUnit1Category: UnitCategory = 'length';
  addUnit2Category: UnitCategory = 'length';
  addUnit1 = 'FEET';
  addUnit2 = 'INCHES';
  addResult: any = null;
  addError = '';

  // Subtract
  subtractValue1 = 0;
  subtractValue2 = 0;
  subtractUnit1Category: UnitCategory = 'length';
  subtractUnit2Category: UnitCategory = 'length';
  subtractUnit1 = 'FEET';
  subtractUnit2 = 'INCHES';
  subtractResult: any = null;
  subtractError = '';

  // Divide
  divideValue1 = 0;
  divideValue2 = 0;
  divideUnit1Category: UnitCategory = 'length';
  divideUnit2Category: UnitCategory = 'length';
  divideUnit1 = 'FEET';
  divideUnit2 = 'INCHES';
  divideResult: any = null;
  divideError = '';

  // History
  history: any[] = [];
  erroredHistory: any[] = [];
  historyView: 'all' | 'errored' = 'all';
  historyLoading = false;

  // Stats - removed as requested
  // statsOp = 'convert';
  // statsResult: any = null;
  // statsError = '';

  showGuestMenu = false;
  loading = false;

  constructor(private auth: AuthService, private qty: QuantityService, private router: Router) {}

  ngOnInit() {
    this.isGuest = this.auth.isGuest();
  }

  // Helper methods for category changes
  onConvertFromCategoryChange() {
    this.convertFrom = this.unitCategories[this.convertFromCategory][0];
  }

  onConvertToCategoryChange() {
    this.convertTo = this.unitCategories[this.convertToCategory][0];
  }

  onCompareUnit1CategoryChange() {
    this.compareUnit1 = this.unitCategories[this.compareUnit1Category][0];
  }

  onCompareUnit2CategoryChange() {
    this.compareUnit2 = this.unitCategories[this.compareUnit2Category][0];
  }

  onAddUnit1CategoryChange() {
    this.addUnit1 = this.unitCategories[this.addUnit1Category][0];
  }

  onAddUnit2CategoryChange() {
    this.addUnit2 = this.unitCategories[this.addUnit2Category][0];
  }

  onSubtractUnit1CategoryChange() {
    this.subtractUnit1 = this.unitCategories[this.subtractUnit1Category][0];
  }

  onSubtractUnit2CategoryChange() {
    this.subtractUnit2 = this.unitCategories[this.subtractUnit2Category][0];
  }

  onDivideUnit1CategoryChange() {
    this.divideUnit1 = this.unitCategories[this.divideUnit1Category][0];
  }

  onDivideUnit2CategoryChange() {
    this.divideUnit2 = this.unitCategories[this.divideUnit2Category][0];
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
    this.resetResults();
    if (tab === 'history') this.loadHistory();
  }

  resetResults() {
    this.convertResult = null;
    this.convertError = '';
    this.convertErrorType = null;
    this.compareResult = null;
    this.compareError = '';
    this.addResult = null;
    this.addError = '';
    this.subtractResult = null;
    this.subtractError = '';
    this.divideResult = null;
    this.divideError = '';
  }

  // ---- Convert ----
  onConvert() {
    this.convertError = '';
    this.convertErrorType = null;
    this.convertResult = null;
    this.loading = true;
    this.qty.convert({ value: this.convertValue, fromUnit: this.convertFrom, toUnit: this.convertTo }).subscribe({
      next: (res) => { this.convertResult = res; this.loading = false; },
      error: (err) => { 
        if (err?.status === 403) {
          this.convertError = 'Authentication failed. Please try logging in again.';
          this.convertErrorType = 'auth';
          // Don't automatically logout - let user decide
        } else {
          this.convertError = err?.error?.message || 'Conversion failed.';
          this.convertErrorType = 'other';
        }
        this.loading = false; 
      }
    });
  }

  // ---- Compare ----
  onCompare() {
    this.compareError = '';
    this.compareResult = null;
    this.loading = true;
    const body = { value1: this.compareValue1, unit1: this.compareUnit1, value2: this.compareValue2, unit2: this.compareUnit2 };
    this.qty.compare(body).subscribe({
      next: (res) => { this.compareResult = res; this.loading = false; },
      error: (err) => { 
        if (err?.status === 403) {
          this.compareError = 'Authentication failed. Please try logging in again.';
        } else {
          this.compareError = err?.error?.message || 'Comparison failed.';
        }
        this.loading = false; 
      }
    });
  }

  // ---- Add ----
  onAdd() {
    this.addError = '';
    this.addResult = null;
    this.loading = true;
    const body = { value1: this.addValue1, unit1: this.addUnit1, value2: this.addValue2, unit2: this.addUnit2 };
    this.qty.add(body).subscribe({
      next: (res) => { this.addResult = res; this.loading = false; },
      error: (err) => { 
        if (err?.status === 403) {
          this.addError = 'Authentication failed. Please try logging in again.';
        } else {
          this.addError = err?.error?.message || 'Addition failed.';
        }
        this.loading = false; 
      }
    });
  }

  // ---- Subtract ----
  onSubtract() {
    this.subtractError = '';
    this.subtractResult = null;
    this.loading = true;
    const body = { value1: this.subtractValue1, unit1: this.subtractUnit1, value2: this.subtractValue2, unit2: this.subtractUnit2 };
    this.qty.subtract(body).subscribe({
      next: (res) => { this.subtractResult = res; this.loading = false; },
      error: (err) => { 
        if (err?.status === 403) {
          this.subtractError = 'Authentication failed. Please try logging in again.';
        } else {
          this.subtractError = err?.error?.message || 'Subtraction failed.';
        }
        this.loading = false; 
      }
    });
  }

  // ---- Divide ----
  onDivide() {
    this.divideError = '';
    this.divideResult = null;
    this.loading = true;
    const body = { value1: this.divideValue1, unit1: this.divideUnit1, value2: this.divideValue2, unit2: this.divideUnit2 };
    this.qty.divide(body).subscribe({
      next: (res) => { this.divideResult = res; this.loading = false; },
      error: (err) => { 
        if (err?.status === 403) {
          this.divideError = 'Authentication failed. Please try logging in again.';
        } else {
          this.divideError = err?.error?.message || 'Division failed.';
        }
        this.loading = false; 
      }
    });
  }

  // ---- History ----
  loadHistory() {
    this.historyLoading = true;
    console.log('📋 Loading history...');
    console.log('🔑 Current token:', this.auth.getToken()?.substring(0, 20) + '...');
    
    if (this.historyView === 'all') {
      this.qty.getHistory().subscribe({
        next: (res) => { 
          console.log('✅ History loaded:', res);
          this.history = res.data || res.Data || res || []; 
          this.historyLoading = false; 
        },
        error: (err) => { 
          console.error('❌ History load error:', err);
          console.error('Status:', err?.status);
          console.error('Token present:', !!this.auth.getToken());
          this.history = []; 
          this.historyLoading = false; 
        }
      });
    } else {
      this.qty.getErroredHistory().subscribe({
        next: (res) => { 
          console.log('✅ Errored history loaded:', res);
          this.erroredHistory = res; 
          this.historyLoading = false; 
        },
        error: (err) => { 
          console.error('❌ Errored history load error:', err);
          this.erroredHistory = []; 
          this.historyLoading = false; 
        }
      });
    }
  }

  switchHistory(view: 'all' | 'errored') {
    this.historyView = view;
    this.loadHistory();
  }

  // ---- Stats ---- removed as requested
  // onGetCount() {
  //   this.statsError = '';
  //   this.statsResult = null;
  //   this.qty.getCount(this.statsOp).subscribe({
  //     next: (res) => { this.statsResult = res; },
  //     error: (err) => { this.statsError = err?.error?.message || 'Could not fetch count.'; }
  //   });
  // }

  resultEntries(obj: any): { key: string; value: any }[] {
    if (!obj || typeof obj !== 'object') return [];
    return Object.entries(obj).map(([key, value]) => ({ key, value }));
  }

  logout() { this.auth.logout(); }

  toggleGuestMenu() { this.showGuestMenu = !this.showGuestMenu; }

  goToLogin() { this.router.navigate(['/login']); }

  goToSignup() { this.router.navigate(['/signup']); }

  get currentTabLabel(): string {
    const labels: Record<Tab, string> = {
      convert: '🔄 Convert', compare: '⚖️ Compare',
      add: '➕ Add', subtract: '➖ Subtract',
      divide: '➗ Divide', history: '📋 History'
    };
    return labels[this.activeTab];
  }
}
