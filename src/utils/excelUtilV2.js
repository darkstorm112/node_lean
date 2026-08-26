const ExcelJS = require('exceljs');

/**
 * ExcelJS 工具类 - 增强版
 */
class ExcelUtilV2 {
  /**
   * 导出数据到 Excel
   * @param {Array} data - 数据数组
   * @param {Array} columns - 列配置 [{header: '标题', key: 'field', width: 20}]
   * @param {String} sheetName - 工作表名称
   * @returns {Buffer} Excel 文件 Buffer
   */
  async exportToExcel(data, columns, sheetName = 'Sheet1') {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // 设置列
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 15
    }));

    // 添加数据
    data.forEach(item => {
      const row = {};
      columns.forEach(col => {
        row[col.key] = this.formatCellValue(item, col.key);
      });
      worksheet.addRow(row);
    });

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // 添加边框
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // 生成 Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * 从 Excel 导入数据
   * @param {Buffer} buffer - Excel 文件 Buffer
   * @param {Array} columns - 列配置 [{header: '标题', key: 'field'}]
   * @returns {Array} 数据数组
   */
  async importFromExcel(buffer, columns) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    const data = [];

    // 创建表头映射
    const headerMap = {};
    columns.forEach(col => {
      headerMap[col.header] = col.key;
    });

    // 获取表头行
    const headerRow = worksheet.getRow(1);
    const headers = [];
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value;
    });

    // 读取数据行
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // 跳过表头

      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        const key = headerMap[header];
        if (key) {
          rowData[key] = cell.value;
        }
      });

      // 只添加非空行
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    });

    return data;
  }

  /**
   * 生成 Excel 模板（带下拉列表和样式）
   * @param {Array} columns - 列配置
   * @param {String} sheetName - 工作表名称
   * @param {Object} options - 选项（示例数据、数据验证）
   * @returns {Buffer} Excel 文件 Buffer
   */
  async generateTemplate(columns, sheetName = 'Sheet1', options = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // 设置列
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 15
    }));

    // 设置表头样式
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // 添加示例数据
    if (options.sampleData && options.sampleData.length > 0) {
      options.sampleData.forEach(data => {
        worksheet.addRow(data);
      });

      // 示例数据行样式（浅黄色背景）
      for (let i = 2; i <= options.sampleData.length + 1; i++) {
        worksheet.getRow(i).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF2CC' }
        };
      }
    }

    // 添加数据验证（下拉列表）
    if (options.validations) {
      options.validations.forEach(validation => {
        const colIndex = columns.findIndex(col => col.key === validation.column);
        if (colIndex === -1) return;

        const colLetter = this.getColumnLetter(colIndex);

        // 为该列的所有行（从第2行到第500行）添加下拉列表
        for (let row = 2; row <= 500; row++) {
          const cellRef = `${colLetter}${row}`;
          worksheet.getCell(cellRef).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: [`"${validation.options.join(',')}"`],
            showErrorMessage: true,
            errorStyle: 'error',
            errorTitle: '输入错误',
            error: `请从下拉列表中选择：${validation.options.join('、')}`
          };
        }
      });
    }

    // 添加边框
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
          right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
        };
      });
    });

    // 冻结首行
    worksheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 1 }
    ];

    // 生成 Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * 格式化单元格值
   */
  formatCellValue(row, key) {
    const keys = key.split('.');
    let value = row;

    for (const k of keys) {
      value = value?.[k];
    }

    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleString('zh-CN');
    }

    return value;
  }

  /**
   * 获取列字母（A, B, C, ... Z, AA, AB, ...）
   */
  getColumnLetter(index) {
    let letter = '';
    let num = index + 1;
    while (num > 0) {
      const mod = (num - 1) % 26;
      letter = String.fromCharCode(65 + mod) + letter;
      num = Math.floor((num - mod) / 26);
    }
    return letter;
  }
}

module.exports = new ExcelUtilV2();
