/**
 * Constants for cell dimensions
 * These values define the size and spacing of cells in the heatmap grid
 */
export const CELL_DIMENSIONS = {
  cellWidth: 14,
  cellMargin: 3,
  get weekColWidth() {
    return this.cellWidth + this.cellMargin;
  }
}; 