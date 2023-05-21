const gulp = require("gulp");
const tsMorph = require("ts-morph");
const fs = require("fs");
const path = require("path");

const getImportFilePaths = (project, filePath, filePaths = []) => {
  // Skip if the file has already been processed
  if (filePaths.includes(filePath)) {
    console.warn(`Warning: Circular import detected at ${filePath}`);
    return filePaths;
  }

  const sourceFile = project.addSourceFileAtPath(filePath);

  sourceFile.getImportDeclarations().forEach((importDeclaration) => {
    const importFilePath = path.join(
      path.dirname(filePath),
      importDeclaration.getModuleSpecifierValue() + ".ts"
    );
    getImportFilePaths(project, importFilePath, filePaths);
  });

  filePaths.push(filePath);

  return filePaths;
};

const concatTS = function (done) {
  const project = new tsMorph.Project({ tsConfigFilePath: "tsconfig.json" });
  const entryFilePath = "src/index.ts";
  const outputFile = path.join("dist", "output.js");

  let outputText = "";

  // Recursively resolve the imports starting from the entry file
  const inputFilePaths = getImportFilePaths(project, entryFilePath);

  for (const inputFilePath of inputFilePaths) {
    const sourceFile = project.addSourceFileAtPath(inputFilePath);

    // Remove all import declarations
    sourceFile.getImportDeclarations().forEach((id) => id.remove());

    // Remove 'export' keyword from classes, functions, variables etc.
    sourceFile.getClasses().forEach((c) => {
      if (c.isExported()) {
        c.setIsDefaultExport(false);
        c.setIsExported(false);
      }
    });

    // Save the updated source file text in memory
    outputText += sourceFile.getFullText() + "\n";
  }

  // Transpile the TypeScript code to JavaScript
  const outputJS = tsMorph.ts.transpileModule(outputText, {
    compilerOptions: project.getCompilerOptions(),
  });

  // Write the transpiled JavaScript code to the output file
  fs.writeFileSync(outputFile, outputJS.outputText);

  done();
};

gulp.task("concatTS", concatTS);
