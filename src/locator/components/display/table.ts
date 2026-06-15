import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../baseComponent';

export interface GridRow {
  [column: string]: string;
}

export class Table extends BaseComponent {
  constructor(page: Page, tableSelector = 'table') {
    super(page, tableSelector);
  }

  async getHeaders(): Promise<string[]> {
    const headers = await this.root.locator('thead th').allTextContents();
    return headers.map((h) => h.trim());
  }

  async getRowCount(): Promise<number> {
    return this.root.locator('tbody tr').count();
  }

  async getRow(index: number): Promise<string[]> {
    const cells = await this.root.locator(`tbody tr:nth-child(${index + 1}) td`).allTextContents();
    return cells.map((c) => c.trim());
  }

  async getAllRows(): Promise<GridRow[]> {
    const headers = await this.getHeaders();
    const rowCount = await this.getRowCount();
    const rows: GridRow[] = [];
    for (let i = 0; i < rowCount; i++) {
      const cells = await this.getRow(i);
      const row: GridRow = {};
      headers.forEach((h, j) => {
        row[h] = cells[j] || '';
      });
      rows.push(row);
    }
    return rows;
  }

  async findRowByColumn(column: string, value: string): Promise<GridRow | undefined> {
    const rows = await this.getAllRows();
    return rows.find((r) => r[column] === value);
  }

  getCell(row: number, col: number): Locator {
    return this.root.locator(`tbody tr:nth-child(${row}) td:nth-child(${col})`);
  }

  async sortByColumn(column: string): Promise<void> {
    const headers = await this.getHeaders();
    const idx = headers.indexOf(column);
    if (idx === -1) throw new Error(`Column "${column}" not found in grid headers`);
    await this.root.locator(`thead th:nth-child(${idx + 1})`).click();
  }

  async getSortedRows(column: string, direction: 'asc' | 'desc' = 'asc'): Promise<GridRow[]> {
    const rows = await this.getAllRows();
    return rows.sort((a, b) => {
      const av = a[column] ?? '';
      const bv = b[column] ?? '';
      return direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }

  async goToPage(pageNumber: number): Promise<void> {
    const pager = this.page.locator(`.pagination a, nav[aria-label="pagination"] a`);
    const items = await pager.allTextContents();
    const idx = items.findIndex((t) => t.trim() === String(pageNumber));
    if (idx === -1) throw new Error(`Page ${pageNumber} not found in paginator`);
    await pager.nth(idx).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertRowExists(column: string, value: string): Promise<void> {
    const row = await this.findRowByColumn(column, value);
    if (!row) throw new Error(`No row found where ${column} = "${value}"`);
  }
}
