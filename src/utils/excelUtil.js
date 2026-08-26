const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Excel 工具类
 */
class ExcelUtil {
  /**
   * 导出数据到 Excel
   * @param {Array} data - 数据数组
   * @param {Array} columns - 列配置 [{header: '标题', key: 'field', width: 20}]
   * @param {String} sheetName - 工作表名称
   * @returns {Buffer} Excel 文件 Buffer
   */
  exportToExcel(data, columns, sheetName = 'Sheet1') {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 准备表头和数据
    const headers = columns.map(col => col.header);
    const keys = columns.map(col => col.key);

    // 转换数据
    const excelData = [
      headers,
      ...data.map(row => keys.map(key => this.formatCellValue(row, key)))
    ];

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // 设置列宽
    worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }));

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 生成 Buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  }

  /**
   * 从 Excel 导入数据
   * @param {Buffer} buffer - Excel 文件 Buffer
   * @param {Array} columns - 列配置 [{header: '标题', key: 'field'}]
   * @returns {Array} 数据数组
   */
  importFromExcel(buffer, columns) {
    // 读取工作簿
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // 读取第一个工作表
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 转换为 JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    // 映射列名
    const headerMap = {};
    columns.forEach(col => {
      headerMap[col.header] = col.key;
    });

    // 转换数据
    const data = jsonData.map(row => {
      const newRow = {};
      Object.keys(row).forEach(header => {
        const key = headerMap[header];
        if (key) {
          newRow[key] = row[header];
        }
      });
      return newRow;
    });

    return data;
  }

  /**
   * 格式化单元格值
   */
  formatCellValue(row, key) {
    const keys = key.split('.');
    let value = row;

    // 支持嵌套属性，如 'creator.username'
    for (const k of keys) {
      value = value?.[k];
    }

    // 格式化特殊值
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleString('zh-CN');
    }

    return value;
  }

  /**
   * 生成 Excel 模板（带下拉选择）
   */
  generateTemplate(columns, sheetName = 'Sheet1', options = {}) {
    const workbook = XLSX.utils.book_new();
    const headers = columns.map(col => col.header);

    // 添加示例数据行
    const sampleData = options.sampleData || [];
    const data = [headers, ...sampleData.map(row =>
      columns.map(col => row[col.key] || '')
    )];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // 设置列宽
    worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }));

    // 添加数据验证（下拉列表）
    if (options.validations) {
      const validations = [];

      options.validations.forEach(validation => {
        const colIndex = columns.findIndex(col => col.key === validation.column);
        if (colIndex === -1) return;

        const colLetter = this.getColumnLetter(colIndex);

        // 为该列的所有行（从第2行开始，最多100行）添加验证
        for (let row = 2; row <= 100; row++) {
          const cellRef = `${colLetter}${row}`;

          // 创建下拉列表
          if (!worksheet[cellRef]) {
            worksheet[cellRef] = { t: 's', v: '' };
          }

          // 添加数据验证信息（注释形式，供用户参考）
          worksheet[cellRef].c = worksheet[cellRef].c || [];
          worksheet[cellRef].c.push({
            a: '系统',
            t: `请选择: ${validation.options.join('、')}`
          });
        }
      });
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  /**
   * 获取列字母（A, B, C, ...）
   */
  getColumnLetter(index) {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  }
}

module.exports = new ExcelUtil();
