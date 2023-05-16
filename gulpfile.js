const gulp = require("gulp");
const tsMorph = require("ts-morph");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const concatTS = function (done) {
  const project = new tsMorph.Project({ tsConfigFilePath: "tsconfig.json" });
  const inputFilePathsPatterns = ["src/components/**/*.ts", "src/index.ts"];
  const outputFile = path.join("dist", "output.js");

  let outputText = "";

  // Use glob.sync() to get an array of file paths that match each glob pattern
  let inputFilePaths = [];
  for (const pattern of inputFilePathsPatterns) {
    inputFilePaths = [...inputFilePaths, ...glob.sync(pattern)];
  }

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
