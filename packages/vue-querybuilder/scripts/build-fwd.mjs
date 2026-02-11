import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');
const fwdDir = resolve(distDir, 'fwd');

// 确保目录存在
mkdirSync(fwdDir, { recursive: true });

const fwdFiles = [
  'formatQuery',
  'parseCEL',
  'parseJSONata',
  'parseJsonLogic',
  'parseMongoDB',
  'parseSpEL',
  'parseSQL',
  'transformQuery',
];

// 生成 ES 模块文件
for (const file of fwdFiles) {
  const esContent = `export * from '@react-querybuilder/core/${file}';`;
  writeFileSync(resolve(fwdDir, `${file}.js`), esContent);
}

// 生成 CommonJS 文件（与 React 版本保持一致）
for (const file of fwdFiles) {
  // React 版本使用驼峰命名：formatQuery -> _react_querybuilder_core_formatQuery
  const varName = `_react_querybuilder_core_${file}`;
  const cjsContent = `var ${varName} = require("@react-querybuilder/core/${file}");
Object.keys(${varName}).forEach(function (k) {
  if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: function () { return ${varName}[k]; }
  });
});`;
  writeFileSync(resolve(fwdDir, `${file}.cjs`), cjsContent);
}

console.log('✓ Built fwd files');
